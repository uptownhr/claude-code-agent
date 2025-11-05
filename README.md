# Claude Code Agent

A containerized Claude Code agent setup for running Claude AI agents in headless mode, with support for both Docker Compose and Kubernetes (k3s) deployments.

## Features

- **Minimal Docker image** based on Node.js 20-slim
- **Non-root user** support for `--dangerously-skip-permissions` flag
- **Docker Compose** support for easy local development
- **Kubernetes Job** deployment for production workloads
- **Secret-based** credential management
- **Multiple deployment options** to fit your workflow

## Quick Start

### Prerequisites

**For Docker Compose:**
- Docker and Docker Compose
- Claude Code credentials at `~/.claude/.credentials.json`

**For k3s:**
- Kubernetes cluster (k3s)
- Local Docker registry running at `localhost:5000`

### Option 1: Docker Compose (Recommended for Local Development)

Run the agent with Docker Compose:

```bash
docker compose up
```

This will:
1. Build the Docker image
2. Mount your credentials from `~/.claude/.credentials.json`
3. Execute the default agent prompt

**Run with a custom prompt:**

```bash
docker compose run --rm claude-agent claude --dangerously-skip-permissions -p "your custom prompt"
```

**Customize behavior with override file:**

```bash
# Copy the example override file
cp docker-compose.override.yml.example docker-compose.override.yml

# Edit docker-compose.override.yml with your custom settings
# Then run normally:
docker compose up
```

### Option 2: Test Script (Simple Docker)

Test the agent with a simple Docker run:

```bash
./test-local.sh
```

This will:
1. Build the Docker image
2. Run the container with mounted credentials
3. Execute the agent prompt: "what is the secret"

### Option 3: Deploy to k3s (Production)

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

**Docker Compose:**
Logs are displayed in the terminal automatically.

**k3s:**
Check the logs after deployment:

```bash
kubectl logs -n claude-agents -l app=claude-code-agent
```

## Project Structure

```
.
├── Dockerfile                          # Container image definition
├── .dockerignore                       # Files to exclude from image
├── docker-compose.yml                  # Docker Compose configuration
├── docker-compose.override.yml.example # Example override file for customization
├── docker-entrypoint.sh                # Entrypoint script for credential handling
├── .claude/                            # Claude Code configuration
│   ├── agents/                        # Agent definitions
│   ├── commands/                      # Custom slash commands
│   └── skills/                        # Custom skills
├── k3s/                                # Kubernetes deployment
│   ├── deployment.yaml                # Job definition
│   └── deploy.sh                      # Deployment script
└── test-local.sh                      # Local testing script
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

**With Docker Compose:**

```bash
# Option 1: Command line override
docker compose run --rm claude-agent claude --dangerously-skip-permissions -p "your prompt here"

# Option 2: Create docker-compose.override.yml
cp docker-compose.override.yml.example docker-compose.override.yml
# Edit the file to change the command
```

**With k3s:**

Edit the command in `k3s/deployment.yaml`:

```yaml
command: ["claude", "--dangerously-skip-permissions", "-p", "your prompt here"]
```

**Or modify the Dockerfile CMD:**

```dockerfile
CMD ["claude", "--dangerously-skip-permissions", "-p", "your prompt here"]
```

### Resource Limits

**With Docker Compose:**

Uncomment the deploy section in `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.1'
      memory: 256M
```

**With k3s:**

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

**Docker Compose:**
The deployment mounts your credentials from `~/.claude/.credentials.json`. The entrypoint script copies them to a writable location inside the container with proper permissions for the claude user.

**k3s:**
The deployment uses a Kubernetes Secret to mount your Claude credentials. The secret is automatically created from `~/.claude/.credentials.json` during deployment.

To manually update credentials:

```bash
kubectl create secret generic claude-agent-credentials \
    --from-file=credentials.json="$HOME/.claude/.credentials.json" \
    --namespace=claude-agents \
    --dry-run=client -o yaml | kubectl apply -f -
```

## Troubleshooting

### Docker Compose

**Build issues:**
```bash
docker compose build --no-cache
```

**Permission errors:**
Ensure your `~/.claude/.credentials.json` file exists and is readable.

**View logs:**
```bash
docker compose logs
```

### k3s

**Check Job Status:**

```bash
kubectl get jobs -n claude-agents
kubectl get pods -n claude-agents
```

**View Logs:**

```bash
kubectl logs -n claude-agents -l app=claude-code-agent
```

**Describe Pod for Errors:**

```bash
kubectl describe pod -n claude-agents -l app=claude-code-agent
```

**Delete and Redeploy:**

```bash
kubectl delete job claude-code-agent-test -n claude-agents
cd k3s && ./deploy.sh
```

## License

MIT
