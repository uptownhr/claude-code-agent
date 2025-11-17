# Commit Changes

Stage and commit your changes with properly formatted commit messages following Haven project conventions.

## Usage

```
/commit
```

No arguments needed - the command will guide you through the commit process interactively.

## Purpose

This command helps you save your work without needing to understand git staging or commit message conventions. It will:
- Show you what files have changed
- Help you select which changes to include
- Guide you to write a clear commit message
- Follow the project's commit format automatically
- Confirm your changes are saved

## Process

1. **Check current status**
   - Run `git status` to see all changed files
   - Categorize changes:
     - Staged (ready to commit)
     - Unstaged (modified but not staged)
     - Untracked (new files)

2. **Review and stage changes**
   - Show summary of all changes
   - If no files are staged, ask which files to include:
     - Stage all changes (most common)
     - Stage specific files
     - Stage by pattern (e.g., all .ts files)
   - Exclude sensitive files automatically (.env, credentials, etc.)

3. **Prompt for commit message**
   - Ask for brief, descriptive message
   - Show examples of good commit messages:
     - "Added user authentication flow"
     - "Fixed dropdown menu positioning bug"
     - "Updated API endpoint for search feature"
   - Validate message quality (not too vague like "updates" or "fixes")

4. **Format commit message**
   - Follow Haven convention: "Description"
   - Do NOT include "Claude Code" mentions (per CLAUDE.md)
   - Keep it concise (50-70 chars ideally)
   - Start with capital letter

5. **Create commit**
   - Run `git commit -m "message"`
   - Capture commit hash

6. **Confirm success**
   - Show commit hash
   - Display committed files summary
   - Suggest next steps (continue working, sync, or create PR)

## Commit Message Guidelines

### Good Examples
✅ "Added user authentication with Google OAuth"
✅ "Fixed null reference error in search results"
✅ "Updated opportunity card design with new layout"
✅ "Refactored database query performance"
✅ "Added validation for certification form"

### Bad Examples (Will prompt for improvement)
❌ "Updates" - Too vague
❌ "Fixed stuff" - Not descriptive
❌ "WIP" - Should describe what you worked on
❌ "asdf" - Not meaningful
❌ "Updated files with Claude Code" - No Claude Code mentions

### Format Rules
- **Start with a verb**: Added, Fixed, Updated, Refactored, Removed, etc.
- **Be specific**: What did you actually change?
- **Keep it concise**: Aim for 50-70 characters
- **Use present tense**: "Add feature" not "Added feature"
- **No period at the end**: Keep it clean
- **No Claude Code mentions**: Per project guidelines

## File Exclusion

These files will be **automatically excluded** from commits:
- `.env*` - Environment files with secrets
- `*.key`, `*.pem` - Private keys
- `credentials.json` - Credential files
- `node_modules/` - Dependencies (should be in .gitignore anyway)
- `.DS_Store` - Mac system files
- `*.log` - Log files

If you try to commit these, I'll warn you and ask for confirmation.

## Example Interactions

### Scenario 1: First commit with unstaged changes

```
User: /commit

Claude:
📋 Current changes in your working directory:

Modified files (not staged):
  ✏️  src/components/Header.tsx
  ✏️  src/styles/global.css
  ✏️  README.md

New files (untracked):
  ✨ src/components/NewFeature.tsx
  ✨ src/utils/helper.ts

Would you like to:
1. Stage all changes (recommended)
2. Select specific files to stage
3. Cancel

Please choose (1-3):

User: 1

Claude:
✓ Staged 5 files

Now, let's create your commit message.

Examples of good commit messages:
- "Added user authentication flow"
- "Fixed dropdown menu positioning"
- "Updated search results layout"

What should the commit message be?

User: Added new header component with navigation

Claude:
📝 Commit message: "Added new header component with navigation"

Looks good! Creating commit...

✅ Commit created successfully!

Commit: a1b2c3d
Files: 5 changed
- src/components/Header.tsx
- src/components/NewFeature.tsx
- src/styles/global.css
- src/utils/helper.ts
- README.md

Next steps:
- Continue working and commit again as needed
- Use /sync to get latest changes from main
- Use /pr when ready to submit for review
```

### Scenario 2: Commit with already staged files

```
User: /commit

Claude:
📋 Changes ready to commit (already staged):

  ✏️  src/api/router.ts
  ✏️  src/api/auth.service.ts
  ✨ src/api/tests/auth.test.ts

3 files staged and ready to commit.

What should the commit message be?

Examples:
- "Added JWT token validation"
- "Fixed authentication middleware bug"
- "Updated user session handling"

User: Added JWT authentication for API routes

Claude:
📝 Commit message: "Added JWT authentication for API routes"

Perfect! Creating commit...

✅ Commit created successfully!

Commit: d4e5f6g
Files: 3 changed
- src/api/router.ts
- src/api/auth.service.ts
- src/api/tests/auth.test.ts

Great job! Your changes are now saved to your branch.

Next: Use /sync before creating a PR to ensure you have latest changes.
```

### Scenario 3: No changes to commit

```
User: /commit

Claude:
ℹ️  Nothing to commit

Your working directory is clean - all changes are already committed.

Current branch: feature/136-custom-slash-commands
Last commit: d4e5f6g "Added JWT authentication for API routes"

Next steps:
- Make more changes if needed
- Use /sync to get updates from main
- Use /pr to submit your work for review
```

### Scenario 4: Attempting to commit sensitive files

```
User: /commit

Claude:
⚠️  Warning: Sensitive files detected

You're about to commit:
  ✏️  src/components/Header.tsx
  ⚠️  .env.local (SENSITIVE - contains secrets)
  ✏️  src/api/router.ts

The file ".env.local" should NOT be committed as it contains sensitive information like API keys and passwords.

Would you like to:
1. Exclude .env.local and commit the rest (recommended)
2. Commit everything anyway (not recommended)
3. Cancel

Please choose (1-3):

User: 1

Claude:
✓ Unstaged .env.local
✓ Proceeding with safe files only

What should the commit message be?
```

### Scenario 5: Vague commit message

```
User: /commit

[Files staged]

Claude: What should the commit message be?

User: updates

Claude:
⚠️  That commit message is too vague

"updates" doesn't tell other developers (or future you!) what actually changed.

Let's try again. Here are some questions to help:
- What feature did you add or update?
- What bug did you fix?
- What component or file did you modify?

Examples based on your changes:
- "Updated Header component with navigation menu"
- "Added search functionality to opportunities page"
- "Fixed dropdown menu positioning bug"

What should the commit message be?
```

## Safety Features

- **Validates commit message quality** - Prevents vague messages
- **Warns about sensitive files** - Prevents committing secrets
- **Shows clear diff summary** - You know exactly what you're committing
- **Confirms before committing** - Review files and message first
- **Provides commit hash** - Can reference or undo if needed

## Error Handling

### Nothing to commit
```
ℹ️  Nothing to commit
Your working directory is clean. All changes are already committed.
```

### Git error during commit
```
❌ Failed to create commit

Error: [git error message]

This might mean:
- Git configuration issue (name/email not set)
- File permissions problem
- Repository state issue

Try: git config --list
Or ask for help if you're unsure how to fix this.
```

### Merge conflict exists
```
❌ Cannot commit during an active merge

You have an unresolved merge conflict. Please:
1. Resolve the conflicts in your files
2. Mark them as resolved: git add [files]
3. Complete the merge: git commit

Or abort the merge: git merge --abort

Need help resolving conflicts? Use /sync for guidance.
```

## When to Use /commit

**Commit frequently when**:
- You've completed a logical unit of work (a feature, bug fix, etc.)
- You're about to switch tasks or branches
- Before taking a break or ending your work session
- After tests pass
- Before syncing with main

**Good practice**:
- Commit small, focused changes rather than huge commits
- Commit working code (don't commit broken code)
- Test before committing when possible
- Write clear messages that explain "why" not just "what"

## Integration Notes

This command fits in the workflow:
1. `/new #123` - Start new work
2. [Make code changes]
3. **`/commit`** - Save changes (use multiple times as you work) ← Use repeatedly
4. `/sync` - Pull updates from main
5. **`/commit`** - Save any conflict resolutions ← May need again after sync
6. `/pr` - Submit for review

## Technical Implementation

The command should use:
- `git status --porcelain` - Get machine-readable status
- `git add [files]` - Stage files for commit
- `git commit -m "message"` - Create commit
- `git log -1 --oneline` - Show latest commit
- `git diff --cached --name-status` - Show staged changes

Should validate:
- Commit message is not empty
- Commit message is descriptive (not just "update", "fix", "wip")
- No sensitive files are staged (or warn if they are)
- Git user.name and user.email are configured

All operations should include helpful error messages and recovery guidance.
