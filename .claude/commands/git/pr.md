# Create Pull Request

Create a GitHub pull request from your current branch with a well-formatted title and description.

## Usage

```
/pr
```

No arguments needed - the command will analyze your branch and commits to generate the PR automatically.

## Purpose

This command helps you submit your work for review without needing to understand GitHub pull request workflows. It will:
- Ensure all your changes are committed
- Push your branch to GitHub
- Generate a meaningful PR title and description
- Create the pull request targeting the main branch
- Provide you with the PR link to share with reviewers

## Process

1. **Validate current state**
   - Check for uncommitted changes (must commit everything first)
   - Verify you're not on the main branch
   - Confirm branch has commits to submit
   - Check if branch exists on remote (will create if needed)

2. **Sync recommendation**
   - Check if your branch is behind main
   - If behind, strongly recommend running `/sync` first
   - Explain why syncing prevents merge conflicts later

3. **Push branch to remote**
   - Push your feature branch to origin
   - Set upstream tracking if first time pushing
   - Confirm push successful

4. **Generate PR title**
   - Extract from most recent commits
   - Or derive from branch name
   - Format: Clear, concise description of changes
   - Examples:
     - "Add user authentication with Google OAuth"
     - "Fix null reference error in search results"
     - "Update opportunity card design"

5. **Generate PR description**
   - **Summary section**: What changed and why
   - **Changes section**: Bullet list of key modifications
   - **Test Plan section**: How to test the changes
   - Include relevant issue references (#123)

6. **Create pull request**
   - Use `gh pr create` with generated content
   - Target `main` as base branch
   - Add appropriate labels if needed
   - Request reviewers if configured

7. **Confirm success**
   - Display PR URL
   - Show PR number
   - Provide next steps (await review, make changes if needed)

## PR Title Guidelines

### Good Examples
✅ "Add JWT authentication for API routes"
✅ "Fix dropdown menu positioning on mobile"
✅ "Update search algorithm for better relevance"
✅ "Refactor database queries for performance"
✅ "Add custom Claude Code slash commands for git workflows"

### Format Rules
- **Start with a verb**: Add, Fix, Update, Refactor, Remove, etc.
- **Be specific but concise**: What changed?
- **Use present tense**: "Add feature" not "Added feature"
- **No issue numbers**: Issue refs go in description
- **50-70 characters ideal**: Keep it readable

## PR Description Format

```markdown
## Summary
Brief overview of what this PR does and why it's needed.

## Changes
- List of key changes made
- Important files or components modified
- New features or fixes included

## Related Issues
Closes #123

## Test Plan
- [ ] Step 1 to test
- [ ] Step 2 to test
- [ ] Verify expected behavior

## Screenshots (if applicable)
[Screenshots of UI changes if relevant]
```

## Example Interactions

### Scenario 1: Create PR for completed feature

```
User: /pr

Claude:
🔍 Analyzing your branch: feature/136-custom-slash-commands

📋 Current status:
✓ All changes committed
✓ 4 commits ready to submit
✓ Branch is up to date with main

📊 Commits to include:
  1. a1b2c3d "Add /new command for branch creation"
  2. b2c3d4e "Add /sync command for pulling changes"
  3. c3d4e5f "Add /commit command for saving work"
  4. d4e5f6g "Add /pr command for creating PRs"

🚀 Pushing branch to GitHub...
✓ Branch pushed successfully

📝 Generating PR...

Title: "Add custom Claude Code slash commands for git workflows"

Description:
## Summary
Implements four custom slash commands (/new, /sync, /commit, /pr) to enable non-engineers to manage git workflows without technical knowledge.

## Changes
- Added /new command for creating feature branches from GitHub issues
- Added /sync command for pulling and integrating changes from main
- Added /commit command for staging and committing with proper formatting
- Added /pr command for creating pull requests

## Related Issues
Closes #136

## Test Plan
- [ ] Test /new with a GitHub issue URL
- [ ] Test /sync on a feature branch
- [ ] Test /commit with various file changes
- [ ] Test /pr to create this pull request

✅ Pull request created!

🔗 PR #137: https://github.com/havenproject-io/haven/pull/137

Next steps:
1. Share the PR link with your team
2. Address any review comments if requested
3. Merge when approved!
```

### Scenario 2: PR with uncommitted changes

```
User: /pr

Claude:
⚠️  Cannot create PR - you have uncommitted changes

Modified files:
  ✏️  src/components/Header.tsx
  ✏️  README.md

You must commit all changes before creating a PR.

Please:
1. Use /commit to save your changes
2. Then try /pr again

Would you like me to run /commit for you now? (yes/no)
```

### Scenario 3: Branch behind main

```
User: /pr

Claude:
⚠️  Your branch is behind main

📊 Status:
- Your branch: 4 commits
- Main branch: 7 commits (3 ahead of you)

This means other changes were merged to main since you branched off.

Strongly recommended:
1. Use /sync to pull latest changes from main
2. Resolve any conflicts if they occur
3. Then create your PR

This prevents merge conflicts when your PR is reviewed.

What would you like to do?
1. Sync first (recommended)
2. Create PR anyway (might have conflicts)
3. Cancel

Please choose (1-3):
```

### Scenario 4: On main branch

```
User: /pr

Claude:
❌ Cannot create PR from main branch

You're currently on the 'main' branch. PRs must be created from feature branches.

To create a PR:
1. First, create a feature branch: /new #[issue-number]
2. Make your changes and commit them: /commit
3. Then create PR: /pr

Or if you meant to switch to an existing feature branch:
- git checkout [branch-name]

Need help? Let me know what you're trying to do.
```

### Scenario 5: Branch already has a PR

```
User: /pr

Claude:
ℹ️  This branch already has an open PR

🔗 PR #137: "Add custom Claude Code slash commands for git workflows"
   https://github.com/havenproject-io/haven/pull/137
   Status: Open

If you've made new commits since creating the PR:
1. Just push them: git push
2. They'll automatically be added to the existing PR

If you want to update the PR description:
- Visit the PR link above
- Click "Edit" near the title
- Update as needed

No need to create a new PR!
```

### Scenario 6: First push of branch

```
User: /pr

Claude:
🔍 Analyzing your branch: feature/142-new-feature

📋 Current status:
✓ All changes committed
✓ 2 commits ready to submit
⚠️  Branch not yet pushed to GitHub

📊 Commits to include:
  1. e5f6g7h "Add new feature component"
  2. f6g7h8i "Add tests for new feature"

🚀 Pushing branch to GitHub for the first time...
✓ Branch pushed successfully
✓ Upstream tracking set

📝 Creating PR...

[Creates PR as normal]
```

## Safety Features

- **Validates all changes committed** - Prevents losing work
- **Checks branch is not main** - Prevents accidental main branch PRs
- **Warns if behind main** - Recommends syncing first
- **Confirms push success** - Ensures code is on GitHub
- **Detects existing PRs** - Prevents duplicate PRs
- **Provides PR link immediately** - Easy to share with team

## Error Handling

### Uncommitted changes
```
❌ Cannot create PR with uncommitted changes

Please commit all changes first:
1. Use /commit to save your work
2. Then try /pr again
```

### No commits to submit
```
❌ No new commits to submit

Your branch has no commits that aren't already in main.

To create a PR, you need to:
1. Make some changes to your code
2. Commit them: /commit
3. Then create PR: /pr
```

### GitHub authentication issue
```
❌ Not authenticated with GitHub

Please run: gh auth login
Then try /pr again.

This grants permission to create PRs on your behalf.
```

### Network error
```
❌ Failed to push branch to GitHub

Error: Could not connect to GitHub

Please check:
- Your internet connection
- GitHub status: https://githubstatus.com
- Repository access permissions

Try /pr again once connected.
```

### Push rejected (out of sync)
```
❌ Push rejected - remote has changes you don't have

This means someone else pushed changes to your branch.

To fix:
1. Pull their changes: git pull origin [your-branch]
2. Resolve any conflicts if needed
3. Try /pr again

Need help? Let me know.
```

## When to Use /pr

**Create a PR when**:
- Your feature or fix is complete
- All changes are committed
- Tests are passing (if you have tests)
- You've synced with main (recommended)
- You're ready for code review

**Before creating a PR**:
1. ✅ All changes committed (use `/commit`)
2. ✅ Branch synced with main (use `/sync`)
3. ✅ Code is working as expected
4. ✅ Tests pass (if applicable)
5. ✅ You've reviewed your own changes

**Good practice**:
- Create PRs when work is complete, not partially done
- Keep PRs focused on one feature/fix
- Sync with main before creating PR
- Provide clear description and test steps
- Respond to review comments promptly

## Integration Notes

This command completes the full workflow:
1. `/new #123` - Start new work from issue
2. [Make code changes]
3. `/commit` - Save changes (multiple times)
4. `/sync` - Pull updates from main
5. `/commit` - Resolve any conflicts
6. **`/pr`** - Submit for review ← Final step

After PR is created:
- Wait for review
- Make requested changes on same branch
- Commit changes: `/commit`
- Push updates: `git push` (auto-updates PR)
- Merge when approved!

## Advanced Options

### Custom PR Description
If you want to customize the PR description before creating:

```
User: /pr --edit

Claude: [Generates title and description]

Would you like to:
1. Create PR with this description
2. Edit the description first
3. Cancel

[If user chooses edit, provide the description text for them to modify]
```

### Add Reviewers
```
User: /pr

Claude: [After PR created]

Would you like to request reviewers?
1. No, I'll add them later
2. Yes, suggest reviewers from team

[If yes, show team members and allow selection]
```

## Technical Implementation

The command should use:
- `git status --porcelain` - Check for uncommitted changes
- `git branch --show-current` - Get current branch
- `git rev-list --count main..HEAD` - Count commits ahead
- `git rev-list --count HEAD..origin/main` - Count commits behind
- `git push -u origin [branch]` - Push branch (set upstream)
- `git log --oneline main..HEAD` - Get commits for PR
- `gh pr create --title "..." --body "..." --base main` - Create PR
- `gh pr list --head [branch]` - Check for existing PR

PR description generation:
- Parse commits for patterns (Add, Fix, Update, etc.)
- Extract issue numbers from branch or commits
- Generate test plan based on changes
- Format as markdown

All operations should include error handling and clear recovery steps.
