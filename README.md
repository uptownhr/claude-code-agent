# Claude Code Agent

A containerized Claude Code agent setup for running Claude AI agents in headless mode on Kubernetes (k3s).

## Features

- **Minimal Docker image** based on Node.js 20-slim
- **Non-root user** support for `--dangerously-skip-permissions` flag
- **Kubernetes Job** deployment for one-off agent execution
- **Secret-based** credential management
- **Local testing** capability before k3s deployment

## Quick Start

### Prerequisites

- Docker
- Kubernetes cluster (k3s)
- Claude Code credentials at `~/.claude/.credentials.json`
- Local Docker registry running at `localhost:5000` (for k3s)

### Local Testing

Test the agent locally before deploying to k3s:

```bash
./test-local.sh
```

This will:
1. Build the Docker image
2. Run the container with mounted credentials
3. Execute the agent prompt: "what is the secret"

### Deploy to k3s

Deploy the agent as a Kubernetes Job:

```bash
cd k3s
./deploy.sh
```

This will:
1. Build and push the Docker image to your local registry
2. Create the `claude-agents` namespace
3. Create a Secret with your Claude credentials
4. Deploy the Job
5. Wait for completion and show logs

### View Results

Check the logs after deployment:

```bash
kubectl logs -n claude-agents -l app=claude-code-agent
```

## Project Structure

```
.
├── Dockerfile              # Container image definition
├── .dockerignore          # Files to exclude from image
├── .claude/               # Claude Code configuration
│   ├── agents/           # Agent definitions
│   ├── commands/         # Custom slash commands
│   └── skills/           # Custom skills
├── k3s/                   # Kubernetes deployment
│   ├── deployment.yaml   # Job definition
│   └── deploy.sh         # Deployment script
└── test-local.sh         # Local testing script
```

## Agent Configuration

The `.claude/agents/` directory contains agent definitions. By default, it includes:

- **secret-agent.md**: Example agent that protects a secret value

To create your own agent:
1. Add a new `.md` file to `.claude/agents/`
2. Include proper frontmatter with name, description, model, etc.
3. Define the agent's behavior in the markdown content
4. Update the Dockerfile CMD or k3s deployment command to invoke your agent

## Customization

### Change the Agent Prompt

Edit the command in `k3s/deployment.yaml`:

```yaml
command: ["claude", "--dangerously-skip-permissions", "your prompt here"]
```

Or modify the Dockerfile CMD:

```dockerfile
CMD ["claude", "--dangerously-skip-permissions", "your prompt here"]
```

### Resource Limits

Adjust memory and CPU limits in `k3s/deployment.yaml`:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### Credentials

The deployment uses a Kubernetes Secret to mount your Claude credentials. The secret is automatically created from `~/.claude/.credentials.json` during deployment.

To manually update credentials:

```bash
kubectl create secret generic claude-agent-credentials \
    --from-file=credentials.json="$HOME/.claude/.credentials.json" \
    --namespace=claude-agents \
    --dry-run=client -o yaml | kubectl apply -f -
```

## Troubleshooting

### Check Job Status

```bash
kubectl get jobs -n claude-agents
kubectl get pods -n claude-agents
```

### View Logs

```bash
kubectl logs -n claude-agents -l app=claude-code-agent
```

### Describe Pod for Errors

```bash
kubectl describe pod -n claude-agents -l app=claude-code-agent
```

### Delete and Redeploy

```bash
kubectl delete job claude-code-agent-test -n claude-agents
cd k3s && ./deploy.sh
```

## License

MIT
