#!/usr/bin/env bash
# Test claude-code-agent locally with Docker before k3s deployment

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
AGENT_DIR="$PROJECT_ROOT/packages/claude-code-agent"

echo "========================================="
echo "  Testing Claude Code Agent Locally"
echo "========================================="
echo ""

# Check if Claude credentials exist
echo "🔐 Checking Claude credentials..."
if [ ! -f "$HOME/.claude/.credentials.json" ]; then
    echo "❌ Claude credentials not found at ~/.claude/.credentials.json"
    echo "   Please create this file first with your Claude API credentials"
    exit 1
fi
echo "✅ Claude credentials found"
echo ""

# Build Docker image
echo "📦 Building Docker image..."
cd "$AGENT_DIR"
docker build -t claude-code-agent:test .
echo "✅ Docker image built successfully"
echo ""

# Run container with mounted credentials
echo "🚀 Running container..."
echo ""
echo "========================================="
echo "  Container Output:"
echo "========================================="
# For local testing, create a temporary readable copy
TEMP_CREDS=$(mktemp)
cp "$HOME/.claude/.credentials.json" "$TEMP_CREDS"
chmod 644 "$TEMP_CREDS"

docker run --rm \
    -v "$TEMP_CREDS:/workspace/.claude/.credentials.json:ro" \
    claude-code-agent:test

rm -f "$TEMP_CREDS"
echo "========================================="
echo ""

echo "✅ Test complete!"
echo ""
echo "Next steps:"
echo "  1. Review the output above"
echo "  2. If successful, deploy to k3s: ./deploy.sh"
echo ""
