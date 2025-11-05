#!/usr/bin/env node
/**
 * Claude Agent SDK Interactive Chat
 *
 * This script provides an interactive chat interface using the Claude Agent SDK.
 * Unlike agent.js (which is one-shot), this maintains a conversation context
 * and allows for multi-turn interactions.
 */

import readline from 'readline';
import { query } from '@anthropic-ai/claude-agent-sdk';

// ANSI color codes for better UX
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

async function* userInputGenerator() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${colors.cyan}You: ${colors.reset}`,
  });

  console.log(`${colors.bright}${colors.green}Claude Agent Chat${colors.reset}`);
  console.log(`${colors.dim}Type 'exit' or 'quit' to end the conversation${colors.reset}\n`);

  try {
    for await (const line of rl) {
      const input = line.trim();

      if (input === 'exit' || input === 'quit') {
        rl.close();
        break;
      }

      if (input) {
        yield {
          role: 'user',
          content: input,
        };
      }

      rl.prompt();
    }
  } finally {
    rl.close();
  }
}

async function main() {
  console.log(`${colors.yellow}Initializing agent...${colors.reset}\n`);

  try {
    const result = query({
      prompt: userInputGenerator(),
      options: {
        // Load project-level settings including agents
        settingSources: ['project'],
        // Allow unlimited turns for conversation
        maxTurns: Infinity,
        // Use claude_code system prompt preset
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code'
        }
      }
    });

    // Start the conversation prompt
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `${colors.cyan}You: ${colors.reset}`,
    });

    rl.prompt();

    let isFirstMessage = true;

    for await (const message of result) {
      // Extract and display assistant text responses
      if (message.type === 'assistant' && message.message?.content) {
        // Clear the user prompt line before showing response
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);

        if (isFirstMessage) {
          isFirstMessage = false;
        }

        let hasTextContent = false;

        for (const content of message.message.content) {
          if (content.type === 'text') {
            if (!hasTextContent) {
              process.stdout.write(`${colors.green}Assistant: ${colors.reset}`);
              hasTextContent = true;
            }
            console.log(content.text);
          } else if (content.type === 'tool_use') {
            // Show tool usage for transparency
            process.stdout.write(`${colors.dim}[Using tool: ${content.name}]${colors.reset}\n`);
          }
        }

        if (hasTextContent) {
          console.log(); // Add spacing
        }
      }
      // Show system messages
      else if (message.type === 'system') {
        if (message.subtype === 'init') {
          console.log(`${colors.green}✓ Agent ready${colors.reset}\n`);
        }
      }
      // Show final result
      else if (message.type === 'result') {
        if (message.is_error) {
          console.error(`\n${colors.red}❌ Error: ${message.error_message || 'Unknown error'}${colors.reset}`);
          process.exit(1);
        }
        if (message.errors && message.errors.length > 0) {
          console.warn(`${colors.yellow}⚠️  Warnings:${colors.reset}`, message.errors);
        }
        // Session ended
        break;
      }
    }

    rl.close();
    console.log(`\n${colors.dim}Goodbye!${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}Error in chat session:${colors.reset}`, error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(`\n\n${colors.dim}Chat interrupted. Goodbye!${colors.reset}`);
  process.exit(0);
});

main();
