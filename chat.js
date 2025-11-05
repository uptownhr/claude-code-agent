#!/usr/bin/env node
/**
 * Claude Agent SDK Interactive Chat
 *
 * This script provides an interactive chat interface using the Claude Agent SDK.
 * Unlike agent.js (which is one-shot), this maintains a conversation context
 * and allows for multi-turn interactions by running multiple query() calls.
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

let sessionId = null; // Track session for resume

async function getUserInput(rl) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}You: ${colors.reset}`, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function processQuery(prompt, isFirstQuery) {
  const options = {
    // Set working directory to where .claude/ is located
    cwd: process.cwd(),
    // Load project-level settings including agents
    settingSources: ['project'],
    // Single turn per query call
    maxTurns: 10,
    // Use claude_code system prompt preset
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code'
    },
    // Enable skill and tool execution without permission prompts
    permissionMode: 'bypassPermissions'
  };

  // Resume from previous session if not first query
  if (!isFirstQuery && sessionId) {
    options.resume = sessionId;
  }

  const result = query({
    prompt,
    options
  });

  let showedInit = false;

  for await (const message of result) {
    // Capture session ID for resuming
    if (message.type === 'system' && message.session_id) {
      sessionId = message.session_id;
    }

    // Show init message only on first query
    if (message.type === 'system' && message.subtype === 'init' && isFirstQuery && !showedInit) {
      console.log(`\n${colors.green}✓ Agent ready${colors.reset}\n`);
      showedInit = true;
    }

    // Extract and display assistant text responses
    if (message.type === 'assistant' && message.message?.content) {
      let hasTextContent = false;

      for (const content of message.message.content) {
        if (content.type === 'text') {
          if (!hasTextContent) {
            process.stdout.write(`\n${colors.green}Assistant: ${colors.reset}`);
            hasTextContent = true;
          }
          console.log(content.text);
        } else if (content.type === 'tool_use') {
          // Show tool usage for transparency
          process.stdout.write(`\n${colors.dim}[Using tool: ${content.name}]${colors.reset}\n`);
        }
      }

      if (hasTextContent) {
        console.log(); // Add spacing
      }
    }

    // Show final result
    if (message.type === 'result') {
      if (message.is_error) {
        console.error(`\n${colors.red}❌ Error: ${message.error_message || 'Unknown error'}${colors.reset}`);
        return false; // Indicate error
      }
      if (message.errors && message.errors.length > 0) {
        console.warn(`${colors.yellow}⚠️  Warnings:${colors.reset}`, message.errors);
      }
      return true; // Success
    }
  }

  return true;
}

async function main() {
  console.log(`${colors.bright}${colors.green}Claude Agent Chat${colors.reset}`);
  console.log(`${colors.dim}Type 'exit' or 'quit' to end the conversation${colors.reset}\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    let isFirstQuery = true;

    while (true) {
      const userInput = await getUserInput(rl);

      if (userInput === 'exit' || userInput === 'quit') {
        break;
      }

      if (!userInput) {
        continue; // Skip empty input
      }

      const success = await processQuery(userInput, isFirstQuery);
      isFirstQuery = false;

      if (!success) {
        // Error occurred, exit
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
    rl.close();
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(`\n\n${colors.dim}Chat interrupted. Goodbye!${colors.reset}`);
  process.exit(0);
});

main();
