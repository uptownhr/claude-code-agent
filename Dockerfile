# Minimal Node.js image for Claude Code CLI
FROM node:20-slim

WORKDIR /workspace

# Install Claude Code CLI globally
RUN npm install -g @anthropic-ai/claude-code

# Create non-root user for --dangerously-skip-permissions
RUN groupadd -r claude && \
    useradd -r -g claude -d /workspace -s /bin/bash claude && \
    mkdir -p /workspace/.claude && \
    chown -R claude:claude /workspace

# Copy .claude directory with agent configurations
COPY --chown=claude:claude .claude /workspace/.claude

# Switch to non-root user
USER claude

# Set environment to disable interactive prompts
ENV CI=true

# Default command: run Claude Code with secret-agent prompt
CMD ["claude", "--dangerously-skip-permissions", "what is the secret"]
