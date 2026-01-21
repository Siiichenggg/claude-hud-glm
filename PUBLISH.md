# claude-hud-glm 发布指南

## 发布准备

### 1. 确保项目已构建
```bash
npm run build
```

### 2. 验证必要文件
项目应包含以下结构：
```
claude-hud-glm/
├── .claude-plugin/
│   └── plugin.json          # 插件元数据
├── commands/
│   ├── configure.md         # 配置命令
│   └── setup.md             # 设置命令
├── dist/                    # 编译后的代码
│   ├── index.js
│   ├── glm-usage-api.js     # GLM API 集成
│   ├── usage-api.js         # Anthropic API 回退
│   └── ...                  # 其他模块
├── src/                     # 源代码（开发用）
├── package.json             # npm 包配置
├── README.md                # 用户文档
├── GLM_INTEGRATION.md       # GLM 集成文档
└── LICENSE                  # MIT 许可证
```

## 发布方式

### 方式 1: 通过 GitHub Marketplace 发布（推荐）

1. **将代码推送到 GitHub**
   ```bash
   git add .
   git commit -m "Release claude-hud-glm v0.0.7"
   git push origin main
   ```

2. **创建 GitHub Release**
   - 访问 https://github.com/your-username/claude-hud-glm/releases
   - 点击 "Create a new release"
   - 标签版本：`v0.0.7`
   - 发布标题：`claude-hud-glm v0.0.7 - GLM API Support`
   - 发布说明：
     ```markdown
     ## Features
     - ✅ GLM API balance tracking
     - ✅ Automatic GLM/Anthropic detection
     - ✅ Token bundle aggregation
     - ✅ Expiration date display
     - ✅ 60-second caching

     ## Installation
     /plugin marketplace add your-username/claude-hud-glm
     /plugin install claude-hud-glm
     /claude-hud-glm:setup
     ```

3. **用户安装**
   在 Claude Code 中运行：
   ```
   /plugin marketplace add your-username/claude-hud-glm
   /plugin install claude-hud-glm
   /claude-hud-glm:setup
   ```

### 方式 2: 本地安装

用户可以直接从本地文件系统安装：

```bash
# 在 Claude Code 中
/plugin install /path/to/claude-hud-glm
/claude-hud-glm:setup
```

### 方式 3: npm 发布（可选）

如果你想发布到 npm：

1. **更新 package.json**
   ```json
   {
     "name": "claude-hud-glm",
     "version": "0.0.7",
     "files": [
       "dist/",
       "commands/",
       ".claude-plugin/",
       "README.md",
       "GLM_INTEGRATION.md",
       "LICENSE"
     ]
   }
   ```

2. **发布到 npm**
   ```bash
   npm login
   npm publish
   ```

3. **用户通过 npm 安装**
   ```bash
   npm install claude-hud-glm -g
   ```

## 验证发布

发布后，用户应该能够：

1. **安装插件**
   ```
   /plugin marketplace add your-username/claude-hud-glm
   /plugin install claude-hud-glm
   ```

2. **配置状态栏**
   ```
   /claude-hud-glm:setup
   ```

3. **查看效果**
   状态栏应显示：
   ```
   [glm-4.7 | GLM] █████░░░░ 45% | my-project git:(main) | GLM: expires 61d | ⏱️ 5m
   ```

## 故障排除

### 问题：插件安装失败

**Linux 用户**可能会遇到 `EXDEV: cross-device link not permitted` 错误。

**解决方案**：
```bash
mkdir -p ~/.cache/tmp
TMPDIR=~/.cache/tmp claude
```

### 问题：GLM 余额不显示

1. 确认配置正确：
   ```bash
   cat ~/.claude/settings.json | grep bigmodel
   ```

2. 清除缓存重试：
   ```bash
   rm -f ~/.claude/plugins/claude-hud/.glm-usage-cache.json
   ```

3. 启用调试：
   ```bash
   DEBUG=claude-hud:glm-usage:* claude
   ```

### 问题：显示 Anthropic 格式而非 GLM 格式

确认 `ANTHROPIC_BASE_URL` 包含 `bigmodel.cn`：
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic"
  }
}
```

## 版本更新

发布新版本时：

1. **更新版本号**
   ```bash
   npm version patch  # 0.0.7 -> 0.0.8
   npm version minor  # 0.0.7 -> 0.1.0
   npm version major  # 0.0.7 -> 1.0.0
   ```

2. **更新 CHANGELOG.md**

3. **构建和发布**
   ```bash
   npm run build
   git add .
   git commit -m "Bump version to 0.0.8"
   git tag v0.0.8
   git push && git push --tags
   ```

## 许可证

本项目使用 MIT 许可证，允许自由使用、修改和分发。
