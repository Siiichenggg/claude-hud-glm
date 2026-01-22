import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as https from 'https';
import { createDebug } from './debug.js';
const debug = createDebug('glm-usage');
// File-based cache (HUD runs as new process each render, so in-memory cache won't persist)
const CACHE_TTL_MS = 60_000; // 60 seconds
const CACHE_FAILURE_TTL_MS = 15_000; // 15 seconds for failed requests
function getCachePath(homeDir) {
    return path.join(homeDir, '.claude', 'plugins', 'claude-hud', '.glm-usage-cache.json');
}
function readCache(homeDir, now) {
    try {
        const cachePath = getCachePath(homeDir);
        if (!fs.existsSync(cachePath))
            return null;
        const content = fs.readFileSync(cachePath, 'utf8');
        const cache = JSON.parse(content);
        // Check TTL - use shorter TTL for failure results
        const ttl = cache.data.apiUnavailable ? CACHE_FAILURE_TTL_MS : CACHE_TTL_MS;
        if (now - cache.timestamp >= ttl)
            return null;
        // JSON.stringify converts Date to ISO string, so we need to reconvert on read.
        const data = cache.data;
        if (data.fiveHourResetAt) {
            data.fiveHourResetAt = new Date(data.fiveHourResetAt);
        }
        if (data.sevenDayResetAt) {
            data.sevenDayResetAt = new Date(data.sevenDayResetAt);
        }
        return data;
    }
    catch {
        return null;
    }
}
function writeCache(homeDir, data, timestamp) {
    try {
        const cachePath = getCachePath(homeDir);
        const cacheDir = path.dirname(cachePath);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        const cache = { data, timestamp };
        fs.writeFileSync(cachePath, JSON.stringify(cache), 'utf8');
    }
    catch {
        // Ignore cache write failures
    }
}
const defaultDeps = {
    homeDir: () => os.homedir(),
    fetchApi: fetchGlmUsageApi,
    now: () => Date.now(),
    readSettings: readClaudeSettings,
};
/**
 * Get GLM usage data from GLM API (open.bigmodel.cn).
 * Returns null if not configured for GLM or API key is missing.
 * Returns { apiUnavailable: true, ... } if API call fails.
 *
 * Uses file-based cache since HUD runs as a new process each render (~300ms).
 * Cache TTL: 60s for success, 15s for failures.
 */
export async function getGlmUsage(overrides = {}) {
    const deps = { ...defaultDeps, ...overrides };
    const now = deps.now();
    const homeDir = deps.homeDir();
    // Check file-based cache first
    const cached = readCache(homeDir, now);
    if (cached) {
        return cached;
    }
    try {
        // Read Claude Code settings to get API key and base URL
        const settings = deps.readSettings();
        if (!settings?.env) {
            debug('No settings.env found');
            return null;
        }
        const apiKey = settings.env.ANTHROPIC_AUTH_TOKEN;
        const baseUrl = settings.env.ANTHROPIC_BASE_URL;
        // Check if configured for GLM (open.bigmodel.cn)
        if (!apiKey || !baseUrl) {
            debug('No API key or base URL configured');
            return null;
        }
        if (!baseUrl.includes('bigmodel.cn')) {
            debug('Not configured for GLM API (bigmodel.cn not found in base URL)');
            return null;
        }
        // Extract token ID from API key (format: id.secret)
        const tokenId = apiKey.split('.')[0];
        if (!tokenId) {
            debug('Invalid API key format');
            return null;
        }
        // Fetch usage from GLM API
        const apiResponse = await deps.fetchApi(apiKey, baseUrl);
        if (!apiResponse) {
            // API call failed, cache the failure to prevent retry storms
            const failureResult = {
                planName: 'GLM',
                fiveHour: null,
                sevenDay: null,
                fiveHourResetAt: null,
                sevenDayResetAt: null,
                apiUnavailable: true,
            };
            writeCache(homeDir, failureResult, now);
            return failureResult;
        }
        // Parse GLM API response
        // GLM returns rows of token bundles, we need to aggregate them
        const rows = apiResponse.rows || [];
        // Aggregate all token balances
        let totalGranted = 0; // Total tokens granted
        let remainingBalance = 0; // Remaining balance
        let earliestExpiry = null;
        for (const row of rows) {
            const tokenBalance = row.tokenBalance || 0;
            // totalAmount may not be in the response, so we track remaining balance
            remainingBalance += tokenBalance;
            // Try to get total amount if available
            if (row.totalAmount) {
                totalGranted += row.totalAmount;
            }
            // Track earliest expiration date (support both field names)
            const expiryStr = row.expirationTime || row.validDate;
            if (expiryStr) {
                const expiryDate = new Date(expiryStr);
                if (!isNaN(expiryDate.getTime())) {
                    if (!earliestExpiry || expiryDate < earliestExpiry) {
                        earliestExpiry = expiryDate;
                    }
                }
            }
        }
        // Calculate usage percentage
        // If we don't have totalGranted, we'll show remaining tokens instead
        let usagePercentage = null;
        if (totalGranted > 0) {
            const used = totalGranted - remainingBalance;
            usagePercentage = Math.round((used / totalGranted) * 100);
            // Clamp to 0-100
            usagePercentage = Math.max(0, Math.min(100, usagePercentage));
        }
        const result = {
            planName: 'GLM',
            fiveHour: usagePercentage,
            sevenDay: null, // GLM doesn't have separate 5h/7d windows
            fiveHourResetAt: earliestExpiry,
            sevenDayResetAt: null,
        };
        // Write to file cache
        writeCache(homeDir, result, now);
        return result;
    }
    catch (error) {
        debug('getGlmUsage failed:', error);
        return null;
    }
}
/**
 * Read Claude Code settings from ~/.claude/settings.json
 */
function readClaudeSettings() {
    try {
        const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
        if (!fs.existsSync(settingsPath)) {
            return null;
        }
        const content = fs.readFileSync(settingsPath, 'utf8');
        const settings = JSON.parse(content);
        return settings;
    }
    catch (error) {
        debug('Failed to read Claude settings:', error);
        return null;
    }
}
/**
 * Fetch usage data from GLM API.
 * GLM API endpoint: https://bigmodel.cn/api/biz/tokenAccounts/list/my
 */
function fetchGlmUsageApi(apiKey, baseUrl) {
    return new Promise((resolve) => {
        // Use the correct GLM balance query API endpoint
        const apiUrl = 'bigmodel.cn';
        const apiPath = '/api/biz/tokenAccounts/list/my';
        const options = {
            hostname: apiUrl,
            path: apiPath,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'User-Agent': 'claude-hud-glm/1.0',
            },
            timeout: 5000,
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk.toString();
            });
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    debug('GLM API returned non-200 status:', res.statusCode);
                    resolve(null);
                    return;
                }
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                }
                catch (error) {
                    debug('Failed to parse GLM API response:', error);
                    resolve(null);
                }
            });
        });
        req.on('error', (error) => {
            debug('GLM API request error:', error);
            resolve(null);
        });
        req.on('timeout', () => {
            debug('GLM API request timeout');
            req.destroy();
            resolve(null);
        });
        req.end();
    });
}
// Export for testing
export function clearGlmCache(homeDir) {
    if (homeDir) {
        try {
            const cachePath = getCachePath(homeDir);
            if (fs.existsSync(cachePath)) {
                fs.unlinkSync(cachePath);
            }
        }
        catch {
            // Ignore
        }
    }
}
//# sourceMappingURL=glm-usage-api.js.map