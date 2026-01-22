#!/bin/bash

# Installation script for claude-hud-glm
# This script helps install the plugin locally for testing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_NAME="claude-hud-glm"
CACHE_DIR="$HOME/.claude/plugins/cache"
PLUGIN_DIR="$CACHE_DIR/$PLUGIN_NAME/$PLUGIN_NAME"
VERSION="0.0.7"

echo "🔧 Installing $PLUGIN_NAME v$VERSION..."

# Ensure build output exists
if [ ! -d "$SCRIPT_DIR/dist" ]; then
  echo "📦 dist/ not found, building..."
  (cd "$SCRIPT_DIR" && npm run build)
fi

# Create the plugin directory structure
mkdir -p "$PLUGIN_DIR"

# Copy built files to the plugin cache directory
echo "📦 Copying files to plugin cache..."
cp -r "$SCRIPT_DIR/dist" "$PLUGIN_DIR/"
cp -r "$SCRIPT_DIR/commands" "$PLUGIN_DIR/" 2>/dev/null || true
cp -r "$SCRIPT_DIR/.claude-plugin" "$PLUGIN_DIR/" 2>/dev/null || true
cp "$SCRIPT_DIR/package.json" "$PLUGIN_DIR/"
cp "$SCRIPT_DIR/CLAUDE.md" "$PLUGIN_DIR/" 2>/dev/null || true

echo "✅ Files copied successfully!"
echo ""
echo "📍 Plugin installed to: $PLUGIN_DIR"
echo ""
echo "📝 Next steps:"
echo "   1. Restart Claude Code"
echo "   2. Run: /plugin marketplace add $SCRIPT_DIR"
echo "      Then: /plugin install $PLUGIN_NAME"
echo "      (If you want to install by name from GitHub, run:"
echo "       /plugin marketplace add Siiichenggg/$PLUGIN_NAME"
echo "       /plugin install $PLUGIN_NAME)"
echo "   3. Run: /$PLUGIN_NAME:setup"
echo ""
echo "Or add to your ~/.claude/settings.json:"
echo "\"statusLine\": {"
echo "  \"command\": \"bash -c '\\\"$SCRIPT_DIR/node\\\" \\\"$PLUGIN_DIR/dist/index.js\\\"'\","
echo "  \"type\": \"command\""
echo "}"
