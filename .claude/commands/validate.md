# Validate Command

Führt die komplette CI-Pipeline lokal aus, bevor committed wird.

## Verwendung

```
/project:validate
/project:validate --fix    # Auto-fix wo möglich
```

## Pipeline-Schritte

### Step 1: Lint

```bash
echo "📋 Step 1/4: Linting..."
npm run lint

# Bei --fix Flag
# npm run lint -- --fix
```

**Bei Fehler:** Zeige Fehler, stoppe Pipeline.

### Step 2: Type Check

```bash
echo "🔍 Step 2/4: Type Checking..."
npx tsc --noEmit
```

**Bei Fehler:** Zeige Type-Fehler mit Datei:Zeile.

### Step 3: Tests

```bash
echo "🧪 Step 3/4: Running Tests..."
npm test
```

**Bei Fehler:** Zeige fehlgeschlagene Tests.

### Step 4: Build

```bash
echo "📦 Step 4/4: Building..."
npm run build

# Verify output exists
if [ -f "dist/ui5-webcomponents-ha.js" ]; then
  echo "✅ Bundle created: $(ls -lh dist/ui5-webcomponents-ha.js)"
else
  echo "❌ Bundle missing!"
  exit 1
fi
```

### Step 5: Bundle Analysis (optional)

```bash
echo "📊 Bundle Analysis..."
# Größe prüfen
du -h dist/ui5-webcomponents-ha.js

# Enthaltene Cards auflisten
grep -o 'ui5-[a-z]*-card' dist/ui5-webcomponents-ha.js | sort -u
```

## Output Format

### Bei Erfolg

```markdown
## ✅ Validation Passed

| Step | Status | Details |
|------|--------|---------|
| Lint | ✅ | No errors |
| TypeCheck | ✅ | No type errors |
| Tests | ✅ | 24 passed |
| Build | ✅ | 245 KB |

### Bundle enthält
- ui5-button-card
- ui5-switch-card
- ui5-slider-card
- ui5-progress-card
- ui5-timeline-card

### Ready to commit! 🚀
```

### Bei Fehler

```markdown
## ❌ Validation Failed

| Step | Status |
|------|--------|
| Lint | ✅ |
| TypeCheck | ❌ |

### Fehler in TypeCheck

```
src/cards/ui5-timeline-card.ts:42:5
  error TS2322: Type 'string' is not assignable to type 'number'.
```

### Fix Required
Behebe Type-Fehler und führe `/project:validate` erneut aus.
```

## Fehler-Kategorien

| Kategorie | Typische Ursache | Schnellfix |
|-----------|------------------|------------|
| Lint: no-unused-vars | Import nicht verwendet | Entfernen |
| Lint: @typescript-eslint | Typ-Annotation fehlt | Typ hinzufügen |
| Type: TS2322 | Falscher Typ | Cast oder Fix |
| Type: TS2307 | Modul nicht gefunden | Import-Pfad prüfen |
| Test: Assertion | Erwartung falsch | Test oder Code fixen |
| Build: Module not found | Import existiert nicht | node_modules prüfen |

## Pre-Commit Hook

Für automatische Validierung vor jedem Commit:

```bash
# .husky/pre-commit
#!/bin/sh
npm run lint
npm run typecheck
npm test
```

Installation:

```bash
npm install -D husky
npx husky init
echo "npm run lint && npm run typecheck && npm test" > .husky/pre-commit
```

## Agent-Zuweisung

Dieser Command benötigt keinen speziellen Agent - kann direkt ausgeführt werden.
