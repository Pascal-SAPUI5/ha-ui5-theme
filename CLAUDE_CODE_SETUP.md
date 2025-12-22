# Claude Code GitHub Actions Setup

This document explains how to set up and use Claude Code GitHub Actions in this repository.

## Overview

This repository has two Claude Code workflows:

1. **`claude-code-review.yml`** - Automatically reviews PRs when opened or synchronized
2. **`claude.yml`** - Responds to `@claude` mentions in issues and PR comments

## Setup Instructions

### 1. Get Claude Code OAuth Token

You need a Claude Code OAuth token to enable these workflows.

**Option A: Using Claude Code CLI**

```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Login and get OAuth token
claude-code login
claude-code oauth-token
```

**Option B: Using GitHub OAuth App**

1. Go to https://code.claude.com
2. Sign in with your GitHub account
3. Navigate to Settings → GitHub Integration
4. Generate an OAuth token

### 2. Add Token to GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `CLAUDE_CODE_OAUTH_TOKEN`
5. Value: Paste your OAuth token
6. Click **Add secret**

### 3. Verify Setup

Once the secret is added, the workflows will automatically activate.

## Usage

### Automatic PR Reviews

When you create or update a pull request, Claude will automatically:

1. Review the code changes
2. Check for:
   - Code quality and TypeScript best practices
   - Home Assistant integration compatibility
   - UI5 Web Components usage
   - Security and performance issues
   - Build and CI/CD compatibility
3. Post a review comment on the PR

**Triggered by:**
- Opening a new pull request
- Pushing new commits to a PR

**Workflow:** `.github/workflows/claude-code-review.yml`

### Interactive Claude Support

Tag `@claude` in any issue or PR comment to get help.

**Examples:**

**In a Pull Request comment:**
```
@claude can you explain how the proof element drag-and-drop works?
```

**In an Issue:**
```
@claude help me debug why the build is failing
```

**In a PR review comment:**
```
@claude suggest improvements for this function's error handling
```

**Triggered by:**
- Comments containing `@claude` in issues
- Comments containing `@claude` in PR discussions
- Comments containing `@claude` in PR reviews

**Workflow:** `.github/workflows/claude.yml`

## Claude Code Review Focus Areas

Claude will review PRs focusing on:

### Code Quality
- TypeScript best practices and type safety
- UI5 Web Components usage patterns
- Error handling and defensive programming
- Code organization and maintainability

### Home Assistant Integration
- Won't break Home Assistant UI (defensive code)
- Proper event listener cleanup (no memory leaks)
- Single ESM bundle compatibility (no code splitting)
- CSS variable usage (avoid fragile selectors)

### UI5 Web Components
- Correct component imports and usage
- Theme compatibility (light/dark mode)
- Component lifecycle management
- Accessibility considerations

### Build & CI/CD
- Build configuration (Vite, TypeScript)
- CI workflow compatibility
- Release process alignment

### Security & Performance
- No XSS, injection vulnerabilities
- Bundle size impact
- Runtime performance

## Permissions

The workflows have these permissions:

**`claude-code-review.yml`:**
- `contents: read` - Read repository files
- `pull-requests: read` - Read PR information
- `issues: read` - Read issue information
- `id-token: write` - GitHub OIDC authentication

**`claude.yml`:**
- `contents: read` - Read repository files
- `pull-requests: read` - Read PR information
- `issues: read` - Read issue information
- `actions: read` - Read CI results on PRs
- `id-token: write` - GitHub OIDC authentication

## Customization

### Disable Automatic Reviews

To disable automatic PR reviews, comment out or remove the workflow file:

```bash
# Rename to disable
mv .github/workflows/claude-code-review.yml .github/workflows/claude-code-review.yml.disabled
```

### Filter by File Paths

Edit `.github/workflows/claude-code-review.yml` and uncomment the `paths` filter:

```yaml
on:
  pull_request:
    types: [opened, synchronize]
    paths:
      - "src/**/*.ts"
      - "src/**/*.tsx"
```

### Filter by PR Author

Edit `.github/workflows/claude-code-review.yml` and uncomment the `if` condition:

```yaml
jobs:
  claude-review:
    if: |
      github.event.pull_request.user.login == 'external-contributor' ||
      github.event.pull_request.author_association == 'FIRST_TIME_CONTRIBUTOR'
```

### Customize Review Prompt

Edit the `prompt` field in `.github/workflows/claude-code-review.yml` to adjust what Claude reviews.

### Customize Allowed Tools

Edit the `claude_args` field to control what tools Claude can use:

```yaml
claude_args: '--allowed-tools "Bash(gh:*),Read,Grep,Glob,Edit"'
```

## Troubleshooting

### Workflow Not Running

**Check:**
1. Is `CLAUDE_CODE_OAUTH_TOKEN` secret set?
2. Is the workflow file in `.github/workflows/`?
3. Are the triggers correct (PR opened, comment created)?
4. Check Actions tab for error logs

### Token Expired

OAuth tokens expire. To refresh:

```bash
claude-code oauth-token --refresh
```

Then update the secret in GitHub.

### Claude Not Responding

**Check:**
1. Did you tag `@claude` correctly?
2. Is the secret configured?
3. Check Actions tab for workflow runs
4. Look for error messages in workflow logs

### Permission Errors

Ensure the workflow has necessary permissions in `.github/workflows/claude*.yml`:

```yaml
permissions:
  contents: read
  pull-requests: read
  issues: read
  id-token: write
```

## Best Practices

1. **Use specific questions**: Instead of "@claude help", use "@claude explain the drag-and-drop implementation in src/main.ts"

2. **Reference CLAUDE.md**: Claude will read project guidelines from `CLAUDE.md`

3. **Review Claude's suggestions**: Always review code suggestions before applying

4. **Provide context**: When asking questions, include relevant context

5. **Monitor workflow runs**: Check the Actions tab to see Claude's work

## Resources

- [Claude Code Documentation](https://code.claude.com/docs)
- [Claude Code Action](https://github.com/anthropics/claude-code-action)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Support

For issues with Claude Code GitHub Actions:
- [Claude Code GitHub Issues](https://github.com/anthropics/claude-code/issues)
- [Anthropic Support](https://support.anthropic.com)
