import type { UsageData } from './types.js';
interface GlmUsageApiResponse {
    success?: boolean;
    code?: number;
    msg?: string;
    rows?: Array<{
        id?: number;
        tokenNo: string;
        tokenBalance: number;
        totalAmount?: number;
        expirationTime?: string;
        validDate?: string;
        purchaseTime?: string;
        resourcePackageName?: string;
    }>;
}
interface ClaudeSettings {
    env?: {
        ANTHROPIC_AUTH_TOKEN?: string;
        ANTHROPIC_BASE_URL?: string;
    };
}
export type GlmUsageApiDeps = {
    homeDir: () => string;
    fetchApi: (apiKey: string, baseUrl: string) => Promise<GlmUsageApiResponse | null>;
    now: () => number;
    readSettings: () => ClaudeSettings | null;
};
/**
 * Get GLM usage data from GLM API (open.bigmodel.cn).
 * Returns null if not configured for GLM or API key is missing.
 * Returns { apiUnavailable: true, ... } if API call fails.
 *
 * Uses file-based cache since HUD runs as a new process each render (~300ms).
 * Cache TTL: 60s for success, 15s for failures.
 */
export declare function getGlmUsage(overrides?: Partial<GlmUsageApiDeps>): Promise<UsageData | null>;
export declare function clearGlmCache(homeDir?: string): void;
export {};
//# sourceMappingURL=glm-usage-api.d.ts.map