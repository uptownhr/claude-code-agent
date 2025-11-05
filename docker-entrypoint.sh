#!/bin/sh
set -e

# Copy credentials from mounted location to writable location
# This allows the claude user to access credentials mounted from the host
if [ -f /tmp/host-credentials/.credentials.json ]; then
    mkdir -p /workspace/.claude
    cp /tmp/host-credentials/.credentials.json /workspace/.claude/.credentials.json
    chmod 600 /workspace/.claude/.credentials.json
    chown claude:claude /workspace/.claude/.credentials.json
fi

# Switch to claude user and execute command
exec gosu claude "$@"
