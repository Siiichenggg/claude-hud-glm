# claude-hud-glm 快速安装指南

## 📦 项目已打包完成！

你的 claude-hud-glm 插件已经准备好发布了。

## 🎯 立即安装（本地测试）

在 Claude Code 中运行：

```
/plugin install /Users/lusicheng/Projects/claude-hud-glm
/claude-hud-glm:setup
```

或者使用安装助手：
```bash
./install-plugin.sh
```

## 📂 项目结构

```
claude-hud-glm/
├── .claude-plugin/
│   └── plugin.json          ✅ 插件元数据
├── commands/
│   ├── configure.md         ✅ 配置命令
│   └── setup.md             ✅ 设置命令
├── dist/                    ✅ 编译后的代码
│   ├── index.js             ✅ 主入口
│   ├── glm-usage-api.js     ✅ GLM API 集成
│   └── ...                  ✅ 其他模块
├── src/                     ✅ 源代码
├── package.json             ✅ 包配置
├── README.md                ✅ 用户文档
├── GLM_INTEGRATION.md       ✅ GLM 集成文档
├── PUBLISH.md               ✅ 发布指南
├── PACKAGE_CHECKLIST.md     ✅ 发布清单
├── install-plugin.sh        ✅ 安装助手
└── LICENSE                  ✅ MIT 许可证
```

## 🚀 发布到 GitHub

### 1. 推送到 GitHub

```bash
cd /Users/lusicheng/Projects/claude-hud-glm

# 添加所有文件
git add .

# 提交
git commit -m "Release claude-hud-glm v0.0.7

Features:
- GLM API balance tracking
- Automatic GLM/Anthropic detection
- Token bundle aggregation
- Expiration date display
- Smart caching (60s success, 15s failure)
- Fallback to Anthropic API"

# 创建版本标签
git tag v0.0.7

# 推送到 GitHub
git push origin main
git push origin v0.0.7
```

### 2. 在 GitHub 上创建 Release

1. 访问你的 GitHub 仓库
2. 点击 "Releases" → "Create a new release"
3. 选择标签 `v0.0.7`
4. 添加发布标题：`claude-hud-glm v0.0.7 - GLM API Support`
5. 添加发布说明：

```markdown
## 🎉 claude-hud-glm v0.0.7

Claude Code 状态栏插件，支持 GLM API 余额追踪。

### ✨ 主要功能

- 🔍 **GLM API 余额追踪** - 实时显示 token 余额和使用百分比
- 🔄 **自动检测** - 自动识别 GLM 或 Anthropic API
- 📊 **智能聚合** - 汇总所有 token 包（通用、GLM-4.6、GLM-4.5 等）
- ⏰ **过期提醒** - 显示最近的 token 过期时间
- 💾 **智能缓存** - 60 秒缓存，避免频繁 API 调用
- 🛡️ **优雅降级** - 自动回退到 Anthropic API 格式

### 📦 安装方法

在 Claude Code 中运行：

```
/plugin marketplace add your-username/claude-hud-glm
/plugin install claude-hud-glm
/claude-hud-glm:setup
```

### ⚙️ 配置要求

使用 GLM API 需要在 `~/.claude/settings.json` 中配置：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-glm-api-key",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic"
  }
}
```

### 📚 文档

- [README.md](README.md) - 用户指南
- [GLM_INTEGRATION.md](GLM_INTEGRATION.md) - GLM 集成技术文档
- [PUBLISH.md](PUBLISH.md) - 发布指南

### 🙏 致谢

基于 [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud) 项目修改
```

6. 点击 "Publish release"

### 3. 用户安装

用户可以通过以下方式安装：

**方式 1: 从 GitHub Marketplace**
```
/plugin marketplace add your-username/claude-hud-glm
/plugin install claude-hud-glm
/claude-hud-glm:setup
```

**方式 2: 从本地文件**
```
/plugin install /path/to/claude-hud-glm
/claude-hud-glm:setup
```

## 🎨 预期效果

安装后，状态栏会显示：

```
[glm-4.7 | GLM] █████░░░░ 45% | claude-hud-glm git:(main) | 1 CLAUDE.md | 1 MCPs
GLM: expires 1458h 47m
⏱️ 2m
```

## 🐛 故障排除

### 问题：插件安装失败（Linux）

**错误**: `EXDEV: cross-device link not permitted`

**解决**:
```bash
mkdir -p ~/.cache/tmp
TMPDIR=~/.cache/tmp claude
```

### 问题：GLM 余额不显示

**检查配置**:
```bash
cat ~/.claude/settings.json | grep bigmodel
```

**清除缓存**:
```bash
rm -f ~/.claude/plugins/claude-hud/.glm-usage-cache.json
```

**启用调试**:
```bash
DEBUG=claude-hud:glm-usage:* claude
```

## 📊 测试验证

运行测试脚本验证功能：

```bash
# 测试 GLM API 连接
npx tsx test-glm-api.ts

# 测试 HUD 显示
echo '{"model":{"display_name":"glm-4.7"},"context_window":{"current_usage":{"input_tokens":45000},"context_window_size":200000},"transcript_path":"/tmp/test.jsonl"}' | node dist/index.js
```

## 📝 发布清单

- [x] 代码构建成功
- [x] 插件元数据配置完成
- [x] 命令文档准备就绪
- [x] GLM API 集成测试通过
- [x] HUD 显示验证通过
- [x] 文档更新完成
- [x] 安装脚本准备就绪
- [ ] 推送到 GitHub
- [ ] 创建 GitHub Release
- [ ] 用户测试反馈

## 🎉 完成！

项目已准备好发布。按照上述步骤推送到 GitHub 并创建 Release 即可。

如有问题，请查看：
- `PUBLISH.md` - 详细发布指南
- `PACKAGE_CHECKLIST.md` - 发布清单
- `README.md` - 用户文档
