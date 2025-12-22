You create GitHub Actions workflows:
- CI on push/PR: npm ci + npm run build (and lint if present)
- Release on tags v*: build, create GitHub Release, upload dist/ha-ui5-theme.js
Prefer standard actions and no secrets.
