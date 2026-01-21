# GLM API Integration Details

This document describes how the GLM API integration works in this fork of claude-hud.

## Architecture

The GLM integration is implemented through a new module `glm-usage-api.ts` that works alongside the original `usage-api.ts`:

```
src/
├── index.ts              # Main entry point (modified)
├── usage-api.ts          # Original Anthropic API (unchanged)
├── glm-usage-api.ts      # NEW: GLM API integration
└── render/
    └── session-line.ts   # Display logic (modified)
```

## How It Works

### 1. Automatic Detection

The plugin automatically detects GLM API usage by checking:
- `~/.claude/settings.json` for `env.ANTHROPIC_BASE_URL`
- If the URL contains `bigmodel.cn`, it's recognized as GLM API

```typescript
// glm-usage-api.ts
const baseUrl = settings.env.ANTHROPIC_BASE_URL;
if (!baseUrl.includes('bigmodel.cn')) {
  return null; // Not GLM API
}
```

### 2. API Call

The plugin calls GLM's balance query API:

```
GET https://bigmodel.cn/api/biz/tokenAccounts/list/my
Authorization: Bearer <your-api-key>
```

### 3. Response Format

Expected response from GLM API:

```json
{
  "total": 6,
  "rows": [
    {
      "id": 19350025,
      "tokenNo": "bundle_689",
      "customerId": 76231766462696600,
      "tokenBalance": 20,
      "totalAmount": 100,
      "expirationTime": "2026-03-23T12:04:57Z",
      "purchaseTime": null,
      "resourcePackageName": "【新用户专享】20次图片/视频生成资源包"
    }
  ]
}
```

### 4. Calculation

The plugin aggregates all token bundles and calculates:

```
total_balance = sum of all totalAmount values
used_balance = total_balance - sum of all tokenBalance values
usage_percentage = (used_balance / total_balance) × 100
```

If `totalAmount` is not provided in the response, the plugin shows only the expiration date without percentage.

### 5. Display

The usage is displayed in the HUD as:
```
GLM: 23% (expires 15d)
```

Color coding:
- Green (< 50%)
- Yellow (50-80%)
- Red (> 80%)

## Fallback Behavior

If GLM API is not detected or the call fails, the plugin falls back to the original Anthropic API usage tracking:

```typescript
// index.ts
usageData = await deps.getGlmUsage();
if (!usageData) {
  usageData = await deps.getUsage(); // Fallback to Anthropic
}
```

## Caching

To avoid excessive API calls, results are cached:
- **Success cache**: 60 seconds
- **Failure cache**: 15 seconds
- **Cache location**: `~/.claude/plugins/claude-hud/.glm-usage-cache.json`

## Configuration

No additional configuration is required beyond having GLM API credentials in your Claude settings:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-glm-api-key",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic"
  }
}
```

## Error Handling

The plugin handles various error scenarios:

1. **Missing credentials**: Silently returns null (no usage display)
2. **Invalid API key**: Shows warning icon ⚠️
3. **API timeout**: Shows warning icon ⚠️, caches for 15 seconds
4. **Network error**: Shows warning icon ⚠️, caches for 15 seconds
5. **Invalid response**: Silently returns null

## Testing

To test the GLM integration locally:

```bash
# 1. Build the project
npm run build

# 2. Test with mock data
echo '{"model":{"display_name":"glm-4.7"},"context_window":{"current_usage":{"input_tokens":45000},"context_window_size":200000},"transcript_path":"/tmp/test.jsonl"}' | node dist/index.js

# 3. Install locally
./install.sh
```

## Debugging

Enable debug logging:

```bash
DEBUG=claude-hud:glm-usage:* claude
```

Or for all debugging:

```bash
DEBUG=* claude
```

## Differences from Anthropic API

| Feature | Anthropic API | GLM API |
|---------|--------------|---------|
| **Metric** | 5h/7d rate limits | Token balance |
| **Window** | Rolling windows | Fixed expiration |
| **Display** | "5h: 25% \| 7d: 85%" | "GLM: 23% (expires 15d)" or "GLM: expires 61d" |
| **API** | OAuth Bearer token | API key Bearer token |
| **Endpoint** | api.anthropic.com | bigmodel.cn |
| **Method** | GET /api/oauth/usage | GET /api/biz/tokenAccounts/list/my |

## Future Enhancements

Potential improvements for GLM integration:

1. **Daily usage tracking**: If GLM provides daily usage statistics
2. **Cost estimation**: Convert tokens to estimated cost
3. **Multiple tokens**: Support for multiple token balances
4. **Historical data**: Track usage over time
5. **Alerts**: Notify when balance is low

## Contributing

If you want to improve the GLM integration:

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Test with real GLM API credentials
5. Submit a pull request

Please ensure:
- Code follows TypeScript best practices
- Error handling is robust
- Fallback to Anthropic API still works
- Documentation is updated
