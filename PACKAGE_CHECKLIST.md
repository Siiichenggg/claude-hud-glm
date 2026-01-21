# claude-hud-glm 发布清单

## ✅ 发布前检查

### 核心文件
- [x] `package.json` - npm 包配置
- [x] `.claude-plugin/plugin.json` - Claude Code 插件元数据
- [x] `README.md` - 用户文档
- [x] `GLM_INTEGRATION.md` - GLM 集成技术文档
- [x] `LICENSE` - MIT 许可证

### 源代码和构建
- [x] `src/` - TypeScript 源代码
- [x] `dist/` - 编译后的 JavaScript
- [x] `dist/index.js` - 主入口文件
- [x] `dist/glm-usage-api.js` - GLM API 集成模块
- [x] `dist/usage-api.js` - Anthropic API 回退模块

### 命令文件
- [x] `commands/configure.md` - 配置命令文档
- [x] `commands/setup.md` - 设置命令文档

### 安装和发布
- [x] `install-plugin.sh` - 本地安装助手脚本
- [x] `install.sh` - 原始安装脚本
- [x] `PUBLISH.md` - 发布指南

### 测试文件
- [x] `test-glm-api.ts` - GLM API 测试脚本
- [x] `test-glm-endpoints.ts` - API 端点测试

## 📦 发布内容

### 必须包含的文件（在 .npmignore 中未排除）
```
dist/                    # 编译后的代码
commands/                # 命令文档
.claude-plugin/          # 插件元数据
package.json             # 包配置
README.md                # 用户文档
GLM_INTEGRATION.md       # GLM 集成文档
LICENSE                  # MIT 许可证
```

### 不包含的文件（开发/测试用）
```
src/                    # 源代码（用户不需要）
test-*.ts              # 测试文件
tests/                 # 测试目录
*.png                  # 截图
CHANGELOG.md           # 变更日志（可选）
CONTRIBUTING.md        # 贡献指南（可选）
```

## 🚀 发布步骤

### 1. 最终验证
```bash
# 确保项目构建成功
npm run build

# 验证插件文件存在
ls -la .claude-plugin/plugin.json
ls -la dist/index.js
ls -la dist/glm-usage-api.js

# 测试插件功能
echo '{"model":{"display_name":"glm-4.7"},"context_window":{"current_usage":{"input_tokens":45000},"context_window_size":200000},"transcript_path":"/tmp/test.jsonl"}' | node dist/index.js
```

### 2. Git 操作
```bash
# 添加所有文件
git add .

# 提交
git commit -m "Release claude-hud-glm v0.0.7

- Add GLM API balance tracking
- Support automatic GLM/Anthropic detection
- Add token bundle aggregation
- Add expiration date display
- Add 60-second caching for API calls"

# 创建标签
git tag v0.0.7

# 推送到 GitHub
git push origin main
git push origin v0.0.7
```

### 3. GitHub Release
1. 访问 https://github.com/your-username/claude-hud-glm/releases
2. 点击 "Create a new release"
3. 选择标签 `v0.0.7`
4. 添加发布标题和说明
5. 点击 "Publish release"

### 4. 用户安装
用户可以在 Claude Code 中运行：
```
/plugin marketplace add your-username/claude-hud-glm
/plugin install claude-hud-glm
/claude-hud-glm:setup
```

## 📋 版本信息

- **版本号**: 0.0.7
- **发布日期**: 2025-01-21
- **主要功能**:
  - GLM API 余额查询
  - Token 包聚合
  - 过期日期显示
  - 自动检测 GLM/Anthropic
  - 智能缓存机制

## 🔗 相关链接

- **GitHub**: https://github.com/your-username/claude-hud-glm
- **原始项目**: https://github.com/jarrodwatts/claude-hud
- **GLM API**: https://open.bigmodel.cn/
- **许可证**: MIT

## ⚠️ 注意事项

1. **GLM API 端点**: 使用 `GET https://bigmodel.cn/api/biz/tokenAccounts/list/my`
2. **API 认证**: 使用 Bearer token 格式
3. **缓存策略**: 成功 60 秒，失败 15 秒
4. **降级机制**: 自动回退到 Anthropic API
5. **Linux 用户**: 可能需要设置 `TMPDIR=~/.cache/tmp`

## 📊 测试结果

### GLM API 集成测试
```
✅ API 连接成功
✅ 6 个 token 包发现
✅ 余额聚合正确
✅ 过期日期计算正确
✅ 缓存机制工作正常
```

### 显示测试
```
✅ HUD 显示正确
✅ GLM 格式显示正确
✅ 降级到 Anthropic 正常
```

## 🎯 下一步

1. 推送到 GitHub
2. 创建 GitHub Release
3. 更新 README.md 中的安装链接
4. 考虑发布到 npm
5. 收集用户反馈
