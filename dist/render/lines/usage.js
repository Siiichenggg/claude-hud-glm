import { isLimitReached } from '../../types.js';
import { red, yellow, dim, getContextColor, RESET } from '../colors.js';
export function renderUsageLine(ctx) {
    const display = ctx.config?.display;
    if (display?.showUsage === false) {
        return null;
    }
    if (!ctx.usageData?.planName) {
        return null;
    }
    if (ctx.usageData.apiUnavailable) {
        return yellow(`usage: ⚠`);
    }
    if (isLimitReached(ctx.usageData)) {
        const resetTime = ctx.usageData.fiveHour === 100
            ? formatResetTime(ctx.usageData.fiveHourResetAt)
            : formatResetTime(ctx.usageData.sevenDayResetAt);
        return red(`⚠ Limit reached${resetTime ? ` (resets ${resetTime})` : ''}`);
    }
    // Special handling for GLM (which only uses fiveHour for balance percentage)
    if (ctx.usageData.planName === 'GLM') {
        const fiveHour = ctx.usageData.fiveHour;
        const expireTime = formatResetTime(ctx.usageData.fiveHourResetAt);
        // GLM always shows expiry if available, regardless of threshold
        if (fiveHour !== null) {
            const usageDisplay = formatUsagePercent(fiveHour);
            return expireTime
                ? `GLM: ${usageDisplay} (expires ${expireTime})`
                : `GLM: ${usageDisplay}`;
        }
        else if (expireTime) {
            // GLM but no percentage available - show expiry only
            return `GLM: expires ${expireTime}`;
        }
        return null;
    }
    // Standard Anthropic display with 5h and 7d windows
    const threshold = display?.usageThreshold ?? 0;
    const fiveHour = ctx.usageData.fiveHour;
    const sevenDay = ctx.usageData.sevenDay;
    const effectiveUsage = Math.max(fiveHour ?? 0, sevenDay ?? 0);
    if (effectiveUsage < threshold) {
        return null;
    }
    const fiveHourDisplay = formatUsagePercent(ctx.usageData.fiveHour);
    const fiveHourReset = formatResetTime(ctx.usageData.fiveHourResetAt);
    const fiveHourPart = fiveHourReset
        ? `5h: ${fiveHourDisplay} (${fiveHourReset})`
        : `5h: ${fiveHourDisplay}`;
    if (sevenDay !== null && sevenDay >= 80) {
        const sevenDayDisplay = formatUsagePercent(sevenDay);
        return `${fiveHourPart} | 7d: ${sevenDayDisplay}`;
    }
    return fiveHourPart;
}
function formatUsagePercent(percent) {
    if (percent === null) {
        return dim('--');
    }
    const color = getContextColor(percent);
    return `${color}${percent}%${RESET}`;
}
function formatResetTime(resetAt) {
    if (!resetAt)
        return '';
    const now = new Date();
    const diffMs = resetAt.getTime() - now.getTime();
    if (diffMs <= 0)
        return '';
    const diffMins = Math.ceil(diffMs / 60000);
    if (diffMins < 60)
        return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
//# sourceMappingURL=usage.js.map