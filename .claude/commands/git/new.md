# Start New Work from GitHub Issue

Initialize a new feature branch from a GitHub issue, automatically syncing with main and creating a properly named branch.

## Usage

```
/new <github-issue-link>
```

**Examples**:
- `/new https://github.com/havenproject-io/haven/issues/136`
- `/new #136`
- `/new 136`

## Purpose

This command helps you start new work without needing to understand git branch management. It will:
- Ensure your main branch is up to date
- Create a new branch with a descriptive name from the issue
- Get you ready to start coding immediately

## Process

1. **Check for uncommitted changes**
   - If changes exist on current branch, prompt user to either:
     - Commit them first with `/commit`
     - Stash them (will be saved for later)
     - Discard them (cannot undo)

2. **Sync main branch**
   - Switch to `main` branch
   - Pull latest changes from `origin/main`
   - Confirm main is up to date

3. **Fetch issue details**
   - Extract issue number from URL or reference
   - Use `gh issue view <number>` to get issue title and labels
   - Validate issue exists and is accessible

4. **Generate branch name**
   - Determine branch prefix from issue labels (feature/fix/etc.)
   - Slugify issue title (lowercase, hyphenated, max 50 chars)
   - Format: `feature/{issue-number}-{slugified-title}`
   - Examples:
     - Issue #136 "Feature: Custom slash commands" → `feature/136-custom-slash-commands`
     - Issue #42 "Fix: User auth bug" → `fix/42-user-auth-bug`

5. **Create and checkout branch**
   - Check if branch name already exists locally
   - Create new branch from updated main
   - Switch to new branch automatically

6. **Confirm success**
   - Display issue title and link
   - Show created branch name
   - Provide next steps: make changes → `/commit` → `/pr`

## Branch Naming Convention

**Format**: `{type}/{issue-number}-{slugified-title}`

**Type determination** (based on issue labels):
- `bug`, `fix` labels → `fix/`
- `enhancement`, `feature` labels → `feature/`
- No labels or mixed → `feature/` (default)

**Slugification rules**:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Truncate to ~50 characters max
- Examples:
  - "Custom Claude Code slash commands" → `custom-claude-code-slash-commands`
  - "Fix: User authentication bug!" → `fix-user-authentication-bug`

## Error Handling

### Uncommitted Changes
```
⚠️  You have uncommitted changes on branch 'current-branch'

What would you like to do?
1. Commit them first (recommended) - Use /commit
2. Stash them - Changes will be saved and can be restored later
3. Discard them - Changes will be lost (cannot undo)

Please choose an option (1-3):
```

### Branch Already Exists
```
⚠️  Branch 'feature/136-custom-slash-commands' already exists locally

What would you like to do?
1. Switch to existing branch - Use the existing branch as-is
2. Create with different name - Add suffix like '-v2'
3. Delete and recreate - Delete old branch and create fresh from main

Please choose an option (1-3):
```

### Invalid Issue
```
❌ Could not find issue #999 in havenproject-io/haven

Please check:
- Issue number is correct
- You have access to the repository
- Issue exists and is not deleted

Try again with: /new #[correct-issue-number]
```

### Not Connected to GitHub
```
❌ GitHub CLI not authenticated

Please run: gh auth login
Then try again: /new #136
```

## Example Interaction

**Scenario**: Starting work on issue #136

```
User: /new #136

Claude:
📋 Fetching issue #136 from havenproject-io/haven...
✓ Issue found: "Feature: Custom Claude Code slash commands for non-engineer git workflows"

🔍 Checking current branch status...
✓ No uncommitted changes

📦 Syncing main branch...
✓ Switched to main
✓ Pulled latest changes (3 new commits)
✓ Main branch is up to date

🌿 Creating feature branch...
✓ Branch name: feature/136-custom-slash-commands-for-git-workflows
✓ Created and switched to new branch

✅ Ready to start work on issue #136!

Next steps:
1. Make your code changes
2. Use /commit to save your work
3. Use /sync to pull updates if needed
4. Use /pr when ready for review

Issue link: https://github.com/havenproject-io/haven/issues/136
Current branch: feature/136-custom-slash-commands-for-git-workflows
```

## Safety Features

- **Validates issue exists** before creating branch
- **Checks for uncommitted changes** to prevent losing work
- **Warns if branch already exists** to avoid conflicts
- **Confirms main is synced** before branching
- **Verifies GitHub access** before proceeding

## Integration Notes

This command works as the first step in the complete workflow:
1. **`/new #123`** - Start new work from issue
2. **`/sync`** - Pull updates from main during development
3. **`/commit`** - Save changes with proper formatting
4. **`/pr`** - Submit pull request for review

## Technical Implementation

The command should use:
- `git status` - Check for uncommitted changes
- `git checkout main && git pull origin main` - Sync main
- `gh issue view <number> --json number,title,labels` - Fetch issue details
- `git checkout -b <branch-name>` - Create and switch to new branch
- `git branch --show-current` - Confirm current branch

All git operations should be wrapped with proper error handling and user-friendly messages.
