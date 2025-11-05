# Claude Code Agent

A containerized Claude Code agent setup for running Claude AI agents in headless mode, with support for both Docker Compose and Kubernetes (k3s) deployments.

## Features

- **Minimal Docker image** based on Node.js 20-slim
- **Four execution methods**: CLI one-shot, SDK one-shot, CLI interactive, and SDK interactive example
- **Non-root user** support for `--dangerously-skip-permissions` flag
- **Docker Compose** support for easy local development
- **Kubernetes Job** deployment for production workloads
- **Secret-based** credential management
- **Multiple deployment options** to fit your workflow

## Execution Methods

The container supports four ways to run Claude Code agents:

### 1. CLI Approach (Default)
Uses the Claude Code CLI with the `-p` flag for headless execution:
```bash
claude --dangerously-skip-permissions -p "your prompt"
```
**Best for:** One-shot commands, scripting, automation

### 2. SDK Approach (One-shot)
Uses the Claude Agent SDK programmatically via Node.js:
```bash
node agent.js "your prompt"
```
**Best for:** Programmatic control, custom integrations

### 3. Interactive Chat (CLI - Recommended)
Uses the Claude CLI in interactive mode (default behavior):
```bash
claude --dangerously-skip-permissions
```
**Best for:** Interactive development, exploration, back-and-forth conversations

The CLI starts in interactive mode by default when you don't use the `-p` flag.

### 4. Custom Interactive Agent (SDK Example)
Example of building a custom interactive agent with the SDK:
```bash
node chat.js
```
**Best for:** Learning how to build custom interactive experiences with the SDK

This demonstrates how to create your own interactive chat interface using the Agent SDK. While the built-in CLI interactive mode is recommended for most use cases, `chat.js` serves as an example of building custom agents with programmatic control over the conversation flow.

All methods use the same agent configurations from `.claude/agents/` directory.

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

**Run with a custom prompt (CLI approach):**

```bash
docker compose run --rm claude-agent claude --dangerously-skip-permissions -p "your custom prompt"
```

**Run with a custom prompt (SDK approach):**

```bash
docker compose run --rm claude-agent node agent.js "your custom prompt"
```

**Run interactive chat (CLI - recommended):**

```bash
docker compose run --rm claude-agent claude --dangerously-skip-permissions
```

This starts the Claude CLI in interactive mode where you can have a back-and-forth conversation with the agent. Use Ctrl+D or type `/exit` to end the session.

**Or try the custom SDK chat example:**

```bash
docker compose run --rm claude-agent node chat.js
```

This demonstrates building a custom interactive agent with the SDK. Note: this example currently has subprocess issues, so the CLI interactive mode above is recommended. The code serves as a reference for building custom agents.

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
├── package.json                        # Node.js dependencies for SDK
├── agent.js                            # SDK one-shot execution script
├── chat.js                             # SDK interactive chat example
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
