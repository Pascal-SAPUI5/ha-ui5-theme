# Release Process

This document describes how to create a new release of the Home Assistant UI5 Theme.

## Prerequisites

- All changes merged to `main` or `develop` branch
- CI workflow passing on the target branch
- Version number decided (follow [Semantic Versioning](https://semver.org/))

## Creating a Release

### 1. Update Version

Update the version in `package.json`:

```json
{
  "version": "X.Y.Z"
}
```

Commit this change:

```bash
git add package.json
git commit -m "Bump version to X.Y.Z"
git push
```

### 2. Create and Push Tag

Create a Git tag with the version number (prefixed with `v`):

```bash
# For stable releases
git tag v1.0.0

# For pre-releases (beta, rc, alpha)
git tag v1.0.0-beta.1
git tag v1.0.0-rc.1

# Push the tag
git push origin v1.0.0
```

### 3. Automated Release Process

Once the tag is pushed, GitHub Actions will automatically:

1. ✅ Run linter (`npm run lint`)
2. ✅ Run type check (`npx tsc --noEmit`)
3. ✅ Build the project (`npm run build`)
4. ✅ Verify build output exists
5. ✅ Extract version from tag
6. ✅ Generate release notes
7. ✅ Create GitHub Release with:
   - Release title: "Release X.Y.Z"
   - Auto-generated changelog
   - Custom release notes with installation instructions
   - Attached assets:
     - `ha-ui5-theme.js` (main build artifact)
     - `hacs.json` (HACS metadata)
     - `README.md` (documentation)
8. ✅ Upload build artifacts (90-day retention)

### 4. Verify Release

After the workflow completes:

1. Check the [Releases page](../../releases)
2. Verify all assets are attached
3. Test download and installation

## Release Types

### Stable Release

Tag format: `vX.Y.Z` (e.g., `v1.0.0`)

- Creates a **stable release** (not marked as prerelease)
- Appears as "Latest" on GitHub

### Pre-release

Tag format: `vX.Y.Z-suffix` (e.g., `v1.0.0-beta.1`, `v2.0.0-rc.1`)

- Creates a **pre-release** (marked as prerelease)
- Does NOT appear as "Latest" on GitHub
- Useful for beta testing

## Versioning Guide

Follow [Semantic Versioning](https://semver.org/):

- **Major version** (X.0.0): Breaking changes
- **Minor version** (0.Y.0): New features, backwards compatible
- **Patch version** (0.0.Z): Bug fixes, backwards compatible

### Examples

- `v0.1.0` - Initial release
- `v0.1.1` - Bug fix
- `v0.2.0` - New UI5 components added
- `v1.0.0` - First stable release
- `v1.0.0-beta.1` - Beta release before 1.0.0
- `v1.0.0-rc.1` - Release candidate

## Troubleshooting

### Workflow Failed

1. Check the workflow run in the Actions tab
2. Review error logs
3. Fix issues and create a new tag (e.g., `v1.0.1`)

### Wrong Tag Pushed

Delete the tag locally and remotely:

```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push --delete origin v1.0.0
```

Then create the correct tag.

### Release Assets Missing

The workflow expects these files to exist:
- `dist/ha-ui5-theme.js` - Created by `npm run build`
- `hacs.json` - HACS metadata file
- `README.md` - Documentation

Ensure all files exist before creating a release.

## Manual Release (Fallback)

If the automated workflow fails, you can create a release manually:

1. Build the project: `npm run build`
2. Go to [Releases](../../releases/new)
3. Create a new tag or select an existing one
4. Fill in release title and notes
5. Upload `dist/ha-ui5-theme.js` as an asset
6. Publish release

## Post-Release

After a successful release:

1. Update HACS if needed
2. Announce in discussions/community channels
3. Update documentation if breaking changes
4. Monitor issues for bug reports
