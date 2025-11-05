#!/usr/bin/env node
/**
 * Claude Agent SDK example
 *
 * This script demonstrates using the Claude Agent SDK programmatically
 * as an alternative to the CLI approach.
 */

import { query } from '@anthropic-ai/claude-agent-sdk';

async function main() {
  // Get prompt from command line args or use default
  const promptText = process.argv[2] || 'what is the secret';

  console.log(`Querying agent with prompt: "${promptText}"\n`);

  try {
    // Query the agent with the prompt
    // The SDK will automatically use credentials from ~/.claude/.credentials.json
    // and load agent configurations from .claude/agents/

    const result = query({
      prompt: promptText,
      options: {
        // Load project-level settings including agents
        settingSources: ['project'],
        // Limit to single response
        maxTurns: 1,
        // Use claude_code system prompt preset
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code'
        }
      }
    });

    let assistantResponse = '';

    for await (const message of result) {
      // The SDK returns structured JSON messages
      // Extract only assistant text responses for clean output
      if (message.type === 'assistant' && message.message?.content) {
        for (const content of message.message.content) {
          if (content.type === 'text') {
            console.log(content.text);
            assistantResponse += content.text + '\n';
          }
        }
      }
      // Show final result with errors if any
      else if (message.type === 'result') {
        if (message.is_error) {
          console.error('\n❌ Error:', message.error_message || 'Unknown error');
        }
        if (message.errors && message.errors.length > 0) {
          console.error('\n⚠️  Warnings:', JSON.stringify(message.errors, null, 2));
        }
      }
    }

    if (!assistantResponse) {
      console.log('No response received from agent');
    }

  } catch (error) {
    console.error('Error querying agent:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
