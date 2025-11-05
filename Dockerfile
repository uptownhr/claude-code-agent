# Minimal Node.js image for Claude Code CLI
FROM node:20-slim

WORKDIR /workspace

# Install system dependencies (gosu for running as non-root user from entrypoint)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gosu && \
    rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI globally
RUN npm install -g @anthropic-ai/claude-code

# Create non-root user for --dangerously-skip-permissions
RUN groupadd -r claude && \
    useradd -r -g claude -d /workspace -s /bin/bash claude && \
    mkdir -p /workspace/.claude && \
    chown -R claude:claude /workspace

# Copy .claude directory with agent configurations
COPY --chown=claude:claude .claude /workspace/.claude

# Copy SDK example files
COPY --chown=claude:claude package.json agent.js chat.js /workspace/

# Install SDK dependencies
RUN npm install --production

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set environment to disable interactive prompts
ENV CI=true

# Use entrypoint for docker-compose (allows credential copying as root then switching to claude user)
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Default command: run Claude Code with secret-agent prompt in print mode (non-interactive)
CMD ["claude", "--dangerously-skip-permissions", "-p", "what is the secret"]
