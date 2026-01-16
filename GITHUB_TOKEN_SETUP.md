# GitHub Token Setup Guide

## Quick Setup

Your Fractary Core configuration requires a GitHub personal access token to enable:
- Work tracking (GitHub Issues)
- Repository management (pull requests, branches)

## Step-by-Step Instructions

### Step 1: Generate GitHub Token

1. Visit: https://github.com/settings/tokens
2. Click "Generate new token" button (choose "classic" token type)
3. Fill in the form:
   - **Token name**: "Fractary Core"
   - **Expiration**: Choose "90 days" or "No expiration" (recommended for development)
   - **Scopes**: Select these three scopes:
     - [x] `repo` - Full control of private repositories
     - [x] `workflow` - Update GitHub Action workflows
     - [x] `write:packages` - Upload packages to GitHub Package Registry

   Example of required scopes:
   ```
   ✓ repo
     ✓ repo:status
     ✓ repo_deployment
     ✓ public_repo
     ✓ repo:invite
     ✓ security_events
   ✓ workflow
   ✓ write:packages
   ```

4. Scroll down and click "Generate token"
5. **Important**: Copy the token immediately. You won't be able to see it again!

### Step 2: Set Environment Variable

Choose one method:

#### Option A: Temporary (Current Session Only)

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Option B: Permanent (Linux/macOS/WSL)

Add to your shell configuration file (`~/.bashrc`, `~/.zshrc`, or `~/.bash_profile`):

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Then reload:
```bash
source ~/.bashrc
# or
source ~/.zshrc
```

#### Option C: Use GitHub CLI

If you prefer not to manually manage tokens, use GitHub CLI:

```bash
gh auth login
# Follow the prompts to authenticate
# This automatically sets GITHUB_TOKEN
```

### Step 3: Verify Token Setup

Test that your token is working:

```bash
# Check if GITHUB_TOKEN is set
echo $GITHUB_TOKEN

# Test GitHub API access
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

You should see your GitHub user information in the output.

### Step 4: Test Fractary Configuration

Once the token is set, test the Fractary plugins:

```bash
# Test GitHub connection
gh auth status

# Verify Fractary can access GitHub
fractary-work:issue-list
fractary-repo:pr-list
```

## Token Scopes Explanation

### repo (Full control of private repositories)
- **Needed for**: Issue creation, modification, and retrieval
- **Allows**: Read and write access to all private repositories
- **Used by**: Work plugin (GitHub Issues), Repo plugin

### workflow (Update GitHub Action workflows)
- **Needed for**: CI/CD pipeline integration
- **Allows**: Manage GitHub Actions workflows
- **Used by**: Repo plugin for action triggering

### write:packages (Upload packages to GitHub Package Registry)
- **Needed for**: Package management integration
- **Allows**: Publish packages to GitHub Packages
- **Used by**: Optional, for future package management

## Token Security Best Practices

1. **Never commit tokens to version control**
   - Use environment variables, not hardcoded values
   - Add `GITHUB_TOKEN` to `.gitignore` if you create a token file

2. **Use token expiration**
   - Set expiration to 90 days for development
   - Rotate tokens regularly

3. **Use personal access tokens, not OAuth tokens**
   - Personal access tokens are for use in CLI
   - OAuth tokens are for applications

4. **Limit scope to minimum needed**
   - Don't grant unnecessary permissions
   - Review permissions regularly

5. **Revoke compromised tokens immediately**
   - Visit https://github.com/settings/tokens
   - Delete any suspicious tokens

## Troubleshooting

### "401 Unauthorized" Errors

**Problem**: GitHub API returns 401 error

**Solutions**:
1. Verify token is set: `echo $GITHUB_TOKEN`
2. Verify token format: Should start with `ghp_`
3. Check token has correct scopes at https://github.com/settings/tokens
4. Generate a new token if old one is compromised

### "Bad credentials" Errors

**Problem**: Token is invalid or expired

**Solutions**:
1. Check token hasn't expired: https://github.com/settings/tokens
2. Generate a new token if expired
3. Verify you copied the entire token (no extra spaces)

### "Resource not found" Errors

**Problem**: Repository `fractary/core` not found

**Solutions**:
1. Verify repository exists: https://github.com/fractary/core
2. Verify you have access to the repository
3. Check token has `repo` scope
4. Verify token isn't for a different GitHub account

### Can't Access Private Repositories

**Problem**: Getting permission denied for private repos

**Solutions**:
1. Verify token has `repo` scope
2. Verify user has access to the repository
3. Check SSH key is added to GitHub if using SSH

## Using with SSH

If you prefer SSH over HTTPS:

1. Add SSH key to GitHub: https://github.com/settings/keys
2. Test SSH connection:
   ```bash
   ssh -T git@github.com
   ```
3. Update git remote to use SSH:
   ```bash
   git remote set-url origin git@github.com:fractary/core.git
   ```

## Token Locations

Store your token safely:

- **Do NOT store in**: Code, documentation, config files
- **Store in**: Environment variables, password managers, CI/CD secrets
- **Manage at**: https://github.com/settings/tokens

## Next Steps

1. Set your GitHub token: `export GITHUB_TOKEN=your_token_here`
2. Create the AWS S3 bucket (see FRACTARY_SETUP.md)
3. Test the configuration
4. Start using Fractary!

## Additional Resources

- GitHub Docs: https://docs.github.com/en/authentication
- Personal Access Tokens: https://github.com/settings/tokens
- GitHub CLI: https://cli.github.com/
- Fractary Setup Guide: FRACTARY_SETUP.md

---

**Last Updated**: 2026-01-15
**Config File**: /mnt/c/GitHub/fractary/core/.fractary/config.yaml
