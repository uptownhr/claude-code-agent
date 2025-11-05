#!/usr/bin/env node
/**
 * Claude Agent SDK Interactive Chat
 *
 * This script provides an interactive chat interface using the Claude Agent SDK.
 * Unlike agent.js (which is one-shot), this maintains a conversation context
 * and allows for multi-turn interactions.
 */

import crypto from 'crypto';
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

let inputQueue = []; // Queue for user inputs
let resolveInput = null; // Promise resolver for next input
let isDone = false;
let buffer = '';

async function* userInputGenerator() {
  console.log(`${colors.bright}${colors.green}Claude Agent Chat${colors.reset}`);
  console.log(`${colors.dim}Type 'exit' or 'quit' to end the conversation${colors.reset}\n`);

  // Use raw stdin events instead of readline to avoid TTY conflicts
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (chunk) => {
    buffer += chunk;

    // Check for newline
    if (buffer.includes('\n')) {
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const input = line.trim();

        if (input === 'exit' || input === 'quit') {
          isDone = true;
          if (resolveInput) {
            resolveInput(null);
            resolveInput = null;
          }
          process.stdin.pause();
          return;
        }

        if (input) {
          inputQueue.push(input);
          if (resolveInput) {
            resolveInput(inputQueue.shift());
            resolveInput = null;
          }
        }
      }
    }
  });

  // Show initial prompt
  process.stdout.write(`${colors.cyan}You: ${colors.reset}`);

  // Yield inputs as they come
  while (!isDone) {
    const input = await new Promise((resolve) => {
      if (inputQueue.length > 0) {
        resolve(inputQueue.shift());
      } else {
        resolveInput = resolve;
      }
    });

    if (input && !isDone) {
      yield {
        type: 'user',
        message: {
          role: 'user',
          content: input,
        },
        parent_tool_use_id: null,
        session_id: crypto.randomUUID(),
      };
    } else if (isDone) {
      break;
    }
  }

  process.stdin.pause();
}

async function main() {
  console.log(`${colors.yellow}Initializing agent...${colors.reset}\n`);

  try {
    const result = query({
      prompt: userInputGenerator(),
      options: {
        // Set working directory to where .claude/ is located
        cwd: process.cwd(),
        // Load project-level settings including agents
        settingSources: ['project'],
        // Allow unlimited turns for conversation
        maxTurns: Infinity,
        // Use claude_code system prompt preset
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code'
        },
        // Enable skill and tool execution without permission prompts
        permissionMode: 'bypassPermissions'
      }
    });

    for await (const message of result) {
      // Extract and display assistant text responses
      if (message.type === 'assistant' && message.message?.content) {
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
          // Show prompt for next input after response
          process.stdout.write(`${colors.cyan}You: ${colors.reset}`);
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
          process.stdin.pause();
          process.exit(1);
        }
        if (message.errors && message.errors.length > 0) {
          console.warn(`${colors.yellow}⚠️  Warnings:${colors.reset}`, message.errors);
        }
        // Session ended
        break;
      }
    }

    process.stdin.pause();
    console.log(`\n${colors.dim}Goodbye!${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}Error in chat session:${colors.reset}`, error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.stdin.pause();
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  process.stdin.pause();
  console.log(`\n\n${colors.dim}Chat interrupted. Goodbye!${colors.reset}`);
  process.exit(0);
});

main();
