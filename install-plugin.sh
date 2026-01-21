#!/bin/bash

# claude-hud-glm 快速安装脚本
# 此脚本帮助用户从本地目录安装插件到 Claude Code

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_NAME="claude-hud-glm"

echo "🚀 $PLUGIN_NAME 安装助手"
echo "========================"
echo ""
echo "当前项目目录: $SCRIPT_DIR"
echo ""

# 检查是否已构建
if [ ! -d "$SCRIPT_DIR/dist" ]; then
    echo "📦 项目未构建，正在构建..."
    cd "$SCRIPT_DIR"
    npm run build
    echo "✅ 构建完成"
    echo ""
fi

# 检查 dist 目录
if [ ! -f "$SCRIPT_DIR/dist/index.js" ]; then
    echo "❌ 错误: dist/index.js 不存在"
    echo "请确保项目已正确构建"
    exit 1
fi

echo "✅ 项目已准备好"
echo ""
echo "📋 安装步骤:"
echo ""
echo "1. 在 Claude Code 中运行以下命令安装插件:"
echo ""
echo "   /plugin install $SCRIPT_DIR"
echo ""
echo "2. 配置状态栏:"
echo ""
echo "   /claude-hud-glm:setup"
echo ""
echo "3. 完成！状态栏应该会显示你的 GLM API 使用情况"
echo ""
echo "💡 提示:"
echo "   - 确保 ~/.claude/settings.json 中配置了 GLM API"
echo "   - ANTHROPIC_BASE_URL 应包含 'bigmodel.cn'"
echo "   - ANTHROPIC_AUTH_TOKEN 应是你的 GLM API Key"
echo ""
echo "📚 更多信息请参阅:"
echo "   - README.md: 用户指南"
echo "   - GLM_INTEGRATION.md: GLM 集成详情"
echo "   - PUBLISH.md: 发布指南"
echo ""
