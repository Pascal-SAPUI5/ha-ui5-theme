# Release Command

Erstellt ein neues Release mit Version-Bump, Changelog und Git-Tag.

## Verwendung

```
/project:release patch     # 0.1.0 → 0.1.1 (Bugfixes)
/project:release minor     # 0.1.0 → 0.2.0 (Neue Features)
/project:release major     # 0.1.0 → 1.0.0 (Breaking Changes)
/project:release 0.3.0     # Explizite Version
```

## Voraussetzungen

- Alle Änderungen committed
- `/project:validate` erfolgreich
- Auf main/master Branch

## Workflow

### Step 1: Pre-Flight Check

```bash
# Prüfe sauberen Git-Status
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Uncommitted changes! Commit first."
  exit 1
fi

# Prüfe Branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
  echo "⚠️  Not on main branch: $BRANCH"
fi

# Validation ausführen
npm run lint && npm run typecheck && npm test && npm run build
```

### Step 2: Version Bump

```bash
# Aktuelle Version lesen
CURRENT=$(node -p "require('./package.json').version")
echo "Current: v$CURRENT"

# Neue Version berechnen (basierend auf Argument)
case "$1" in
  patch) NEW=$(npm version patch --no-git-tag-version) ;;
  minor) NEW=$(npm version minor --no-git-tag-version) ;;
  major) NEW=$(npm version major --no-git-tag-version) ;;
  *)     NEW=$(npm version $1 --no-git-tag-version) ;;
esac

echo "New: $NEW"
```

### Step 3: Changelog Update

Generiere Changelog-Eintrag basierend auf Commits seit letztem Tag:

```markdown
## [0.2.0] - 2024-XX-XX

### Added
- ui5-timeline-card: Timeline component for entity history
- ui5-shellbar-card: Navigation header component

### Changed
- Improved action-handler performance

### Fixed
- Shadow DOM style isolation in Safari
```

### Step 4: Commit & Tag

```bash
# Änderungen committen
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: release $NEW"

# Tag erstellen
git tag -a "$NEW" -m "Release $NEW"

# Push mit Tags
git push origin main --tags
```

### Step 5: GitHub Release (automatisch)

Der Tag triggert die GitHub Action, die:
1. Build ausführt
2. `dist/ui5-webcomponents-ha.js` als Asset hochlädt
3. HACS-kompatibles Release erstellt

## Output Format

```markdown
## 🚀 Release v0.2.0

### Änderungen seit v0.1.0
- feat: ui5-timeline-card
- feat: ui5-shellbar-card  
- fix: Safari style isolation
- chore: dependency updates

### Dateien aktualisiert
- package.json: 0.1.0 → 0.2.0
- CHANGELOG.md: Neue Sektion hinzugefügt

### Git
- Commit: abc1234 "chore: release v0.2.0"
- Tag: v0.2.0

### Nächste Schritte
1. ✅ Push erfolgt
2. ⏳ GitHub Action läuft...
3. ⏳ HACS Update in ~1h verfügbar

### Verify
https://github.com/<user>/<repo>/releases/tag/v0.2.0
```

## Changelog-Format

Folgt [Keep a Changelog](https://keepachangelog.com/):

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.2.0] - 2024-01-15

### Added
- New feature

### Changed
- Updated behavior

### Deprecated
- Soon to be removed

### Removed
- Removed feature

### Fixed
- Bug fix

### Security
- Security fix
```

## Rollback

Falls etwas schiefgeht:

```bash
# Lokalen Tag löschen
git tag -d v0.2.0

# Remote Tag löschen
git push origin :refs/tags/v0.2.0

# Letzten Commit rückgängig
git reset --hard HEAD~1
git push --force-with-lease
```

## Agent-Zuweisung

Dieser Command verwendet: `ui5-ha-release-engineer`
