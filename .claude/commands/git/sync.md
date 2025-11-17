# Sync with Main Branch

Pull the latest changes from main and integrate them into your current branch safely.

## Usage

```
/sync
```

No arguments needed - the command detects your current branch automatically.

## Purpose

This command helps you stay up to date with the latest changes from the main branch without needing to understand git merge or rebase operations. It will:
- Fetch the latest changes from the remote main branch
- Integrate those changes into your current branch
- Help you resolve any conflicts in a friendly way
- Keep your feature branch in sync with the team's work

## Process

1. **Check current branch status**
   - Detect which branch you're currently on
   - Check if you have any uncommitted changes
   - If uncommitted changes exist, prompt to commit or stash them first

2. **Fetch latest from main**
   - Run `git fetch origin main` to get latest changes
   - Show how many commits ahead/behind you are

3. **Branch-specific behavior**

   **If on `main` branch**:
   - Simply pull latest changes: `git pull origin main`
   - Confirm success with commit summary

   **If on feature branch**:
   - Offer two integration strategies:
     - **Rebase** (recommended): Replays your commits on top of latest main - cleaner history
     - **Merge**: Merges main into your branch - preserves exact history
   - Execute chosen strategy

4. **Handle conflicts (if any)**
   - Detect if conflicts occurred
   - List conflicting files in plain language
   - Provide step-by-step guidance:
     - Open each file and look for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
     - Keep the changes you want, remove the markers
     - Mark files as resolved
   - Allow user to complete or abort the sync

5. **Confirm completion**
   - Show sync summary (commits pulled, files changed)
   - Display current branch status
   - Suggest next steps

## Integration Strategies Explained

### Rebase (Recommended)
**What it does**: Takes your commits and replays them on top of the latest main branch.

**Pros**:
- Clean, linear history
- Easier to review in PRs
- Industry best practice for feature branches

**Cons**:
- May need to resolve conflicts for each of your commits
- Slightly more complex if conflicts arise

**When to use**: Most of the time, especially for feature branches that haven't been pushed yet.

### Merge
**What it does**: Creates a new commit that combines main with your branch.

**Pros**:
- Simpler to understand
- Preserves exact history of when changes happened
- Only resolve conflicts once

**Cons**:
- Creates merge commits (messier history)
- Can make PR review harder

**When to use**: When you've already pushed your branch and others might be working from it.

## Conflict Resolution Guide

When conflicts occur, you'll see something like:

```
⚠️  Conflicts detected in 2 files:
- src/components/Header.tsx
- src/utils/auth.ts

Here's how to resolve them:

1. Open src/components/Header.tsx
2. Look for conflict markers:
   <<<<<<< HEAD (your changes)
   Your code here
   =======
   Main branch code here
   >>>>>>> main

3. Decide which changes to keep (or combine them)
4. Remove the conflict markers (<<<<<<, =======, >>>>>>>)
5. Save the file
6. Tell me when you're done, and I'll mark it as resolved

Would you like me to show you the conflicts in each file?
```

## Example Interactions

### Scenario 1: Simple sync on feature branch (no conflicts)

```
User: /sync

Claude:
🔍 Current branch: feature/136-custom-slash-commands
📡 Fetching latest changes from main...

✓ Fetched successfully
📊 Main branch is 3 commits ahead of your branch

How would you like to integrate these changes?
1. Rebase (recommended) - Replay your commits on top of latest main
2. Merge - Merge main into your feature branch

Please choose (1 or 2):

User: 1

Claude:
🔄 Rebasing your branch on latest main...
✓ Rebase completed successfully!

📝 Changes pulled from main:
- 3 new commits
- 8 files changed

✅ Your branch is now up to date with main!
Current branch: feature/136-custom-slash-commands
Status: Ready to continue working
```

### Scenario 2: Sync with uncommitted changes

```
User: /sync

Claude:
⚠️  You have uncommitted changes in your working directory:
- src/components/NewFeature.tsx (modified)
- src/utils/helper.ts (modified)

Please commit or stash these changes before syncing:
1. Use /commit to commit your changes
2. Or I can stash them temporarily (you can restore later)

What would you like to do?
```

### Scenario 3: Sync with conflicts

```
User: /sync
[User chooses rebase]

Claude:
🔄 Rebasing your branch on latest main...

⚠️  Conflicts detected in 1 file:
- src/components/Header.tsx

This happens when both you and someone else changed the same part of a file.

I can show you the conflict and guide you through resolving it.
Once you fix the conflicts, we'll continue the rebase.

Would you like to:
1. See the conflict and resolve it now
2. Abort the sync and stay on your current version
3. Get more help understanding conflicts

Please choose (1-3):

User: 1

Claude:
📄 Showing conflicts in src/components/Header.tsx:

Lines 45-52 have conflicts:
<<<<<<< HEAD (your changes)
  const title = "New Dashboard";
=======
  const title = "Haven Dashboard";
>>>>>>> main

This means:
- You changed the title to "New Dashboard"
- Someone else changed it to "Haven Dashboard" in main

Please:
1. Open src/components/Header.tsx
2. Decide which title to keep (or combine them)
3. Remove the markers (<<<<<<, =======, >>>>>>>)
4. Save the file
5. Let me know when you're done

Type 'done' when ready, or 'abort' to cancel the sync.
```

### Scenario 4: Already up to date

```
User: /sync

Claude:
🔍 Current branch: feature/136-custom-slash-commands
📡 Checking for updates from main...

✅ Already up to date!
Your branch has all the latest changes from main.

No sync needed - you're good to keep working!
```

## Safety Features

- **Checks for uncommitted changes** before syncing to prevent data loss
- **Confirms strategy choice** (rebase vs merge) before proceeding
- **Provides abort option** if conflicts are too complex
- **Shows clear diff summary** of what will change
- **Validates branch state** before and after sync

## Error Handling

### Cannot sync with uncommitted changes
```
❌ Cannot sync while you have uncommitted changes

Please first:
- Use /commit to save your changes, OR
- Let me stash them temporarily (type 'stash')

Then try /sync again.
```

### Sync aborted by user
```
⏹️  Sync aborted

Your branch remains unchanged. You can try syncing again anytime with /sync.

Note: You may fall behind main if you don't sync regularly.
```

### Failed to fetch from remote
```
❌ Could not connect to GitHub to fetch changes

Please check:
- Your internet connection
- GitHub authentication: gh auth status
- Repository access permissions

Try again once connected.
```

## When to Use /sync

**Use /sync regularly when**:
- Starting a work session on an existing branch
- Before creating a PR (ensures your branch is current)
- When you know teammates have merged changes to main
- If you've been working on a branch for several days

**Good practice**:
- Sync at least once per day when actively working
- Always sync before running `/pr`
- Sync after major features are merged to main

## Integration Notes

This command fits in the workflow at multiple points:
1. `/new #123` - Start new work
2. **`/sync`** - Pull updates regularly during development ← Can use anytime
3. `/commit` - Save changes
4. **`/sync`** - Final sync before PR ← Recommended before PR
5. `/pr` - Submit for review

## Technical Implementation

The command should use:
- `git status` - Check for uncommitted changes
- `git fetch origin main` - Fetch latest remote changes
- `git rev-list --count main..HEAD` - Count commits ahead/behind
- `git branch --show-current` - Detect current branch
- `git pull origin main` - If on main branch
- `git rebase origin/main` OR `git merge origin/main` - If on feature branch
- `git diff --name-only ORIG_HEAD..HEAD` - Show changed files after sync

All operations should include proper error handling and recovery options.
