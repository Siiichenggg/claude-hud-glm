# Claude HUD GLM

A Claude Code plugin that shows what's happening — context usage, active tools, running agents, todo progress, and **GLM API balance tracking**. Always visible below your input.

This is a fork of [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud) with added support for [Zhipu AI GLM API](https://open.bigmodel.cn/) usage tracking.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node version](https://img.shields.io/node/v/claude-hud-glm.svg)](https://nodejs.org)

## Features

| What You See | Why It Matters |
|--------------|----------------|
| **Project path** | Know which project you're in (configurable 1-3 directory levels) |
| **Context health** | Know exactly how full your context window is before it's too late |
| **Tool activity** | Watch Claude read, edit, and search files as it happens |
| **Agent tracking** | See which subagents are running and what they're doing |
| **Todo progress** | Track task completion in real-time |
| **GLM Balance** | 🆕 Track your GLM API token balance and usage percentage |

## GLM API Support

This version adds support for tracking usage when using the GLM API (Zhipu AI/BigModel):

- **Automatic Detection**: Automatically detects when you're using GLM API via `ANTHROPIC_BASE_URL` containing `bigmodel.cn`
- **Balance Tracking**: Shows your token balance usage as a percentage
- **Expiration Display**: Shows when your token balance expires
- **Fallback Support**: Still works with original Anthropic API if you're not using GLM

### Display Example

```
[glm-4.7 | GLM] █████░░░░ 45% | my-project git:(main) | GLM: 23% (expires 15d) | ⏱️ 5m
```

## Install

Inside a Claude Code instance, run the following commands:

**Step 1: Add the marketplace**
```
/plugin marketplace add your-username/claude-hud-glm
```

**Step 2: Install the plugin**

<details>
<summary><strong>⚠️ Linux users: Click here first</strong></summary>

On Linux, `/tmp` is often a separate filesystem (tmpfs), which causes plugin installation to fail with:
```
EXDEV: cross-device link not permitted
```

**Fix**: Set TMPDIR before installing:
```bash
mkdir -p ~/.cache/tmp && TMPDIR=~/.cache/tmp claude
```

Then run the install command below in that session. This is a [Claude Code platform limitation](https://github.com/anthropics/claude-code/issues/14799).

</details>

```
/plugin install claude-hud-glm
```

**Step 3: Configure the statusline**
```
/claude-hud-glm:setup
```

Done! The HUD appears immediately — no restart needed.

---

## What Each Line Shows

### Session Info
```
[glm-4.7 | GLM] █████░░░░ 45% | my-project git:(main) | 2 CLAUDE.md | GLM: 23% (expires 15d) | ⏱️ 5m
```
- **Model** — Current model in use (shown first)
- **Plan name** — GLM when using GLM API, or Pro/Max/Team for Anthropic
- **Context bar** — Visual meter with color coding (green → yellow → red as it fills)
- **Project path** — Configurable 1-3 directory levels (default: 1)
- **Git branch** — Current branch name (configurable on/off)
- **Config counts** — CLAUDE.md files, rules, MCPs, and hooks loaded
- **Usage/Balance** — GLM token usage % (or Anthropic 5h/7d for Pro/Max/Team)
- **Duration** — How long the session has been running

### Tool Activity
```
✓ TaskOutput ×2 | ✓ mcp_context7 ×1 | ✓ Glob ×1 | ✓ Skill ×1
```
- **Running tools** show a spinner with the target file
- **Completed tools** aggregate by type with counts

### Agent Status
```
✓ Explore: Explore home directory structure (5s)
✓ open-source-librarian: Research React hooks patterns (2s)
```
- **Agent type** and what it's working on
- **Elapsed time** for each agent

### Todo Progress
```
✓ All todos complete (5/5)
```
- **Current task** or completion status
- **Progress counter** (completed/total)

---

## Configuration

Customize your HUD anytime:

```
/claude-hud-glm:configure
```

The guided flow walks you through customization — no manual editing needed.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lineLayout` | string | `expanded` | Layout style: `compact` or `expanded` |
| `pathLevels` | 1-3 | 1 | Directory levels to show in project path |
| `gitStatus.enabled` | boolean | true | Show git branch in HUD |
| `gitStatus.showDirty` | boolean | true | Show `*` for uncommitted changes |
| `gitStatus.showAheadBehind` | boolean | false | Show `↑N ↓N` for ahead/behind remote |
| `gitStatus.showFileStats` | boolean | false | Show file change counts `!M +A ✘D ?U` |
| `display.showModel` | boolean | true | Show model name `[glm-4.7]` |
| `display.showContextBar` | boolean | true | Show visual context bar `████░░░░░░` |
| `display.showConfigCounts` | boolean | true | Show CLAUDE.md, rules, MCPs, hooks counts |
| `display.showDuration` | boolean | true | Show session duration `⏱️ 5m` |
| `display.showUsage` | boolean | true | Show GLM balance or Anthropic usage limits |
| `display.usageThreshold` | number | 0 | Only show usage when above this % |
| `display.showTokenBreakdown` | boolean | true | Show token details at high context (85%+) |
| `display.showTools` | boolean | true | Show tools activity line |
| `display.showAgents` | boolean | true | Show agents activity line |
| `display.showTodos` | boolean | true | Show todos progress line |

### Example Configuration

```json
{
  "lineLayout": "expanded",
  "pathLevels": 2,
  "gitStatus": {
    "enabled": true,
    "showDirty": true,
    "showAheadBehind": true,
    "showFileStats": true
  },
  "display": {
    "showModel": true,
    "showContextBar": true,
    "showConfigCounts": true,
    "showDuration": true,
    "showUsage": true,
    "usageThreshold": 10,
    "showTokenBreakdown": true,
    "showTools": true,
    "showAgents": true,
    "showTodos": true
  }
}
```

---

## How GLM Usage Tracking Works

1. **Reads Configuration**: Automatically reads your `~/.claude/settings.json` to detect GLM API configuration
2. **Queries Balance**: Calls GLM's balance query API (`GET /api/biz/tokenAccounts/list/my`)
3. **Aggregates Bundles**: Sums up all token bundles (通用, GLM-4.6, GLM-4.5, etc.)
4. **Calculates Percentage**: Shows used balance as a percentage of total balance (if `totalAmount` is available)
5. **Tracks Expiry**: Finds the earliest expiration date across all bundles
6. **Caches Results**: Caches for 60 seconds to avoid excessive API calls
7. **Falls Back**: Automatically falls back to Anthropic API if GLM is not detected

### GLM API Response Format

The plugin calls GLM's balance API and expects:
```json
{
  "total": 6,
  "rows": [
    {
      "id": 19350025,
      "tokenNo": "bundle_689",
      "tokenBalance": 20,
      "totalAmount": 100,
      "expirationTime": "2026-03-23T12:04:57Z",
      "resourcePackageName": "【新用户专享】20次图片/视频生成资源包"
    }
  ]
}
```

---

## Local Installation (for development)

If you want to install from a local copy:

**Step 1: Clone and build**
```bash
git clone https://github.com/your-username/claude-hud-glm
cd claude-hud-glm
npm ci && npm run build
```

**Step 2: Install in Claude Code**
```
/plugin install /path/to/claude-hud-glm
```

**Step 3: Configure**
```
/claude-hud-glm:setup
```

---

## Requirements

- Claude Code v1.0.80+
- Node.js 18+ or Bun
- For GLM usage tracking: Valid GLM API credentials in your Claude settings

---

## Development

```bash
git clone https://github.com/your-username/claude-hud-glm
cd claude-hud-glm
npm ci && npm run build
npm test
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT License — see [LICENSE](LICENSE)

This is a fork of [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud), which is also licensed under the MIT License.

---

## Acknowledgments

- Original project: [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud)
- Original author: Jarrod Watts
- GLM API integration added for Chinese users and Zhipu AI customers
