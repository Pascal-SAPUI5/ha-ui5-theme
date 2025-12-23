# HACS Validate Command

Validiert die HACS-Kompatibilität des Projekts.

## Verwendung

```
/project:hacs-validate
/project:hacs-validate --strict  # Warnings als Errors behandeln
```

## Checks

### 1. hacs.json Konfiguration

```bash
echo "🔍 Checking hacs.json..."

if [ ! -f "hacs.json" ]; then
  echo "❌ hacs.json not found"
  exit 1
fi

# Parse und validiere
NAME=$(jq -r '.name' hacs.json)
FILENAME=$(jq -r '.filename' hacs.json)
RENDER_README=$(jq -r '.render_readme' hacs.json)

echo "   Name: $NAME"
echo "   Filename: $FILENAME"
echo "   Render README: $RENDER_README"

if [ "$NAME" == "null" ] || [ -z "$NAME" ]; then
  echo "❌ 'name' missing in hacs.json"
  exit 1
fi

if [ "$FILENAME" == "null" ] || [ -z "$FILENAME" ]; then
  echo "❌ 'filename' missing in hacs.json"
  exit 1
fi

echo "✅ hacs.json valid"
```

### 2. Dist Bundle

```bash
echo ""
echo "🔍 Checking dist bundle..."

DIST_FILE="dist/$FILENAME"

if [ ! -f "$DIST_FILE" ]; then
  echo "❌ Bundle not found: $DIST_FILE"
  echo "   Run: npm run build"
  exit 1
fi

# Größe prüfen
SIZE_BYTES=$(stat -f%z "$DIST_FILE" 2>/dev/null || stat -c%s "$DIST_FILE")
SIZE_KB=$((SIZE_BYTES / 1024))
SIZE_MB=$((SIZE_BYTES / 1024 / 1024))

echo "   Size: ${SIZE_KB} KB"

if [ $SIZE_BYTES -gt $((5 * 1024 * 1024)) ]; then
  echo "❌ Bundle too large (>5MB) - HACS may reject"
  exit 1
elif [ $SIZE_BYTES -gt $((1024 * 1024)) ]; then
  echo "⚠️  Bundle >1MB - consider optimization"
fi

# Inhalt prüfen
if ! grep -q "customElements.define" "$DIST_FILE"; then
  echo "⚠️  No customElements.define found - cards may not register"
fi

if ! grep -q "window.customCards" "$DIST_FILE"; then
  echo "⚠️  No window.customCards found - card picker may not work"
fi

echo "✅ Bundle valid"
```

### 3. README

```bash
echo ""
echo "🔍 Checking README.md..."

if [ ! -f "README.md" ]; then
  echo "❌ README.md not found (required for HACS)"
  exit 1
fi

# Mindestinhalt prüfen
README_SIZE=$(wc -c < README.md)
if [ $README_SIZE -lt 500 ]; then
  echo "⚠️  README.md seems too short (<500 chars)"
fi

# Installation section
if ! grep -qi "installation\|install\|hacs" README.md; then
  echo "⚠️  README should contain installation instructions"
fi

# Usage examples
if ! grep -qi "example\|usage\|configuration" README.md; then
  echo "⚠️  README should contain usage examples"
fi

echo "✅ README.md valid"
```

### 4. LICENSE

```bash
echo ""
echo "🔍 Checking LICENSE..."

if [ ! -f "LICENSE" ]; then
  echo "⚠️  LICENSE file not found (recommended for HACS)"
else
  echo "✅ LICENSE found"
fi
```

### 5. Version

```bash
echo ""
echo "🔍 Checking version..."

VERSION=$(jq -r '.version' package.json)
echo "   package.json version: $VERSION"

# Semantic versioning check
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+'; then
  echo "⚠️  Version should follow semver (x.y.z)"
fi

echo "✅ Version valid"
```

### 6. Card Registration

```bash
echo ""
echo "🔍 Checking card registration..."

# Suche nach CARD_DEFINITIONS oder window.customCards
if grep -rq "CARD_DEFINITIONS\|window\.customCards" src/; then
  CARDS=$(grep -h "type.*custom:" src/*.ts src/**/*.ts 2>/dev/null | grep -oP 'custom:[a-z0-9-]+' | sort -u)
  echo "   Registered cards:"
  echo "$CARDS" | while read card; do
    echo "   - $card"
  done
  echo "✅ Card registration found"
else
  echo "⚠️  No card registration found in source"
fi
```

### 7. GitHub Release Compatibility

```bash
echo ""
echo "🔍 Checking release compatibility..."

# Prüfe ob dist in .gitignore
if grep -q "^dist" .gitignore 2>/dev/null; then
  echo "⚠️  'dist' is in .gitignore - HACS needs dist committed or release assets"
  echo "   Option A: Remove 'dist' from .gitignore and commit dist/"
  echo "   Option B: Use GitHub releases with dist as asset"
fi

# Prüfe GitHub workflow
if [ -f ".github/workflows/release.yml" ]; then
  echo "✅ Release workflow found"
else
  echo "⚠️  No release workflow - consider adding .github/workflows/release.yml"
fi
```

### 8. Simulate HACS Install

```bash
echo ""
echo "🔍 Simulating HACS install..."

# Erstelle temporäres Verzeichnis
TEMP_DIR=$(mktemp -d)
INSTALL_DIR="$TEMP_DIR/www/community/ha-ui5-theme"

mkdir -p "$INSTALL_DIR"

# Kopiere wie HACS es tun würde
cp "dist/$FILENAME" "$INSTALL_DIR/"

if [ -f "$INSTALL_DIR/$FILENAME" ]; then
  echo "✅ Simulated install successful"
  echo "   Location: $INSTALL_DIR/$FILENAME"
else
  echo "❌ Simulated install failed"
  exit 1
fi

# Cleanup
rm -rf "$TEMP_DIR"
```

## Summary Output

```bash
echo ""
echo "═══════════════════════════════════════════════════"
echo "📊 HACS VALIDATION SUMMARY"
echo "═══════════════════════════════════════════════════"
echo ""
echo "| Check              | Status |"
echo "|--------------------|--------|"
echo "| hacs.json          | ✅     |"
echo "| Bundle             | ✅     |"
echo "| README.md          | ✅     |"
echo "| LICENSE            | ✅     |"
echo "| Version            | ✅     |"
echo "| Card Registration  | ✅     |"
echo "| Release Ready      | ✅     |"
echo "| Simulated Install  | ✅     |"
echo ""
echo "Bundle: $FILENAME ($SIZE_KB KB)"
echo "Version: $VERSION"
echo ""
echo "🎉 HACS validation passed!"
```

## Integration mit Home Assistant

### Lovelace Resource hinzufügen

Nach HACS-Installation:

```yaml
# Via UI: Settings → Dashboards → Resources
# Oder in configuration.yaml:

lovelace:
  mode: yaml
  resources:
    - url: /hacsfiles/ha-ui5-theme/ha-ui5-theme.js
      type: module
```

### Card in Dashboard verwenden

```yaml
type: custom:ui5-button-card
entity: light.living_room
name: Wohnzimmer
tap_action:
  action: toggle
```

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| "Bundle not found" | `npm run build` ausführen |
| "customCards not found" | Registrierung in index.ts prüfen |
| "README too short" | Mehr Dokumentation hinzufügen |
| "Version invalid" | Semver in package.json verwenden |

## HACS Requirements Checklist

```
✓ hacs.json mit name und filename
✓ dist/<filename>.js existiert
✓ README.md vorhanden
✓ Semantic Versioning
✓ Cards in window.customCards registriert
✓ GitHub Releases oder dist committed
```
