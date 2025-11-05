#!/usr/bin/env bash
# Deploy claude-code-agent test to k3s cluster

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
AGENT_DIR="$PROJECT_ROOT/packages/claude-code-agent"

echo "========================================="
echo "  Deploying Claude Code Agent to k3s"
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
docker build -t claude-code-agent:latest .
echo "✅ Docker image built successfully"
echo ""

# Cleanup dangling images
echo "🧹 Cleaning up dangling Docker images..."
docker image prune -f
echo "✅ Cleanup complete"
echo ""

# Push to registry via port-forward
echo "📤 Pushing image to registry..."
echo "   Setting up port-forward to registry..."

# Check if port-forward is already running
if ! pgrep -f "kubectl port-forward.*docker-registry.*5000:5000" > /dev/null; then
    kubectl port-forward -n docker-registry svc/docker-registry 5000:5000 > /dev/null 2>&1 &
    PORT_FORWARD_PID=$!
    echo "   Started port-forward (PID: $PORT_FORWARD_PID)"
    sleep 2  # Give port-forward time to establish
else
    echo "   Port-forward already running"
fi

docker tag claude-code-agent:latest localhost:5000/claude-code-agent:latest
docker push localhost:5000/claude-code-agent:latest
echo "✅ Image pushed to registry"
echo ""

# Create namespace
echo "🔧 Creating namespace..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: claude-agents
EOF
echo "✅ Namespace created"
echo ""

# Create or update secret with credentials
echo "🔐 Creating/updating credentials secret..."
kubectl create secret generic claude-agent-credentials \
    --from-file=credentials.json="$HOME/.claude/.credentials.json" \
    --namespace=claude-agents \
    --dry-run=client -o yaml | kubectl apply -f -
echo "✅ Secret created"
echo ""

# Delete existing job if it exists (Jobs are immutable)
echo "🧹 Cleaning up previous job if it exists..."
kubectl delete job claude-code-agent-test -n claude-agents --ignore-not-found
echo "✅ Cleanup complete"
echo ""

# Deploy job
echo "🚀 Deploying agent job..."
kubectl apply -f "$SCRIPT_DIR/deployment.yaml"
echo "✅ Job created"
echo ""

# Wait for job to complete
echo "⏳ Waiting for job to complete..."
kubectl wait --for=condition=complete job/claude-code-agent-test -n claude-agents --timeout=60s || {
    echo "⚠️  Job not completed yet. Check status with:"
    echo "   kubectl get jobs -n claude-agents"
    echo "   kubectl logs -n claude-agents -l app=claude-code-agent"
}
echo ""

# Display status and logs
echo "========================================="
echo "  ✅ Deployment Complete!"
echo "========================================="
echo ""
echo "📊 Check status:"
echo "   kubectl get jobs -n claude-agents"
echo "   kubectl get pods -n claude-agents"
echo ""
echo "📝 View logs:"
echo "   kubectl logs -n claude-agents -l app=claude-code-agent"
echo ""
