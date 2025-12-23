# Test Cycle Command

Führt den vollständigen Test- und Validierungszyklus aus.

## Verwendung

```
/project:test-cycle
/project:test-cycle --fix      # Mit Auto-Fix
/project:test-cycle --coverage # Mit Coverage Report
```

## Workflow

### Step 1: Lint

```bash
echo "═══════════════════════════════════════════════════"
echo "📋 Step 1/6: ESLint"
echo "═══════════════════════════════════════════════════"

if [ "$1" == "--fix" ]; then
  npm run lint:fix
else
  npm run lint
fi

LINT_EXIT=$?
if [ $LINT_EXIT -ne 0 ]; then
  echo "❌ Lint failed"
  echo "   Run: npm run lint:fix"
  exit 1
fi
echo "✅ Lint passed"
```

### Step 2: TypeScript

```bash
echo ""
echo "═══════════════════════════════════════════════════"
echo "🔍 Step 2/6: TypeScript"
echo "═══════════════════════════════════════════════════"

npm run typecheck
TS_EXIT=$?
if [ $TS_EXIT -ne 0 ]; then
  echo "❌ TypeScript errors found"
  exit 1
fi
echo "✅ TypeScript passed"
```

### Step 3: Unit Tests

```bash
echo ""
echo "═══════════════════════════════════════════════════"
echo "🧪 Step 3/6: Unit Tests"
echo "═══════════════════════════════════════════════════"

if [ "$1" == "--coverage" ]; then
  npm run test:coverage
else
  npm test
fi

TEST_EXIT=$?
if [ $TEST_EXIT -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi
echo "✅ Tests passed"
```

### Step 4: Build

```bash
echo ""
echo "═══════════════════════════════════════════════════"
echo "📦 Step 4/6: Build"
echo "═══════════════════════════════════════════════════"

npm run build
BUILD_EXIT=$?
if [ $BUILD_EXIT -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

# Bundle-Größe prüfen
BUNDLE_SIZE=$(du -h dist/*.js | cut -f1)
echo "✅ Build passed ($BUNDLE_SIZE)"
```

### Step 5: HACS Validation

```bash
echo ""
echo "═══════════════════════════════════════════════════"
echo "🏠 Step 5/6: HACS Validation"
echo "═══════════════════════════════════════════════════"

npm run test:hacs
HACS_EXIT=$?
if [ $HACS_EXIT -ne 0 ]; then
  echo "❌ HACS validation failed"
  exit 1
fi
echo "✅ HACS validation passed"
```

### Step 6: Format Check

```bash
echo ""
echo "═══════════════════════════════════════════════════"
echo "✨ Step 6/6: Format Check"
echo "═══════════════════════════════════════════════════"

if [ "$1" == "--fix" ]; then
  npm run format
else
  npm run format:check
fi

FORMAT_EXIT=$?
if [ $FORMAT_EXIT -ne 0 ]; then
  echo "⚠️  Format issues found"
  echo "   Run: npm run format"
fi
```

### Summary

```bash
echo ""
echo "═══════════════════════════════════════════════════"
echo "📊 SUMMARY"
echo "═══════════════════════════════════════════════════"

# Sammle Ergebnisse
TESTS_COUNT=$(npm test -- --reporter=json 2>/dev/null | jq '.numPassedTests' 2>/dev/null || echo "?")
COVERAGE=$(cat coverage/coverage-summary.json 2>/dev/null | jq '.total.lines.pct' 2>/dev/null || echo "?")

echo ""
echo "| Check      | Status |"
echo "|------------|--------|"
echo "| Lint       | ✅     |"
echo "| TypeScript | ✅     |"
echo "| Tests      | ✅ ($TESTS_COUNT passed) |"
echo "| Build      | ✅ ($BUNDLE_SIZE) |"
echo "| HACS       | ✅     |"
echo "| Format     | $([ $FORMAT_EXIT -eq 0 ] && echo '✅' || echo '⚠️') |"
echo ""

if [ "$COVERAGE" != "?" ]; then
  echo "Coverage: ${COVERAGE}%"
fi

echo ""
echo "🎉 All checks passed! Ready to commit."
```

## Output Format

```markdown
## ✅ Test Cycle Complete

| Check      | Status | Details |
|------------|--------|---------|
| Lint       | ✅     | 0 errors, 2 warnings |
| TypeScript | ✅     | No errors |
| Tests      | ✅     | 24 passed |
| Build      | ✅     | 245 KB |
| HACS       | ✅     | Valid |
| Format     | ✅     | Clean |

### Coverage
- Statements: 94%
- Branches: 88%
- Functions: 100%
- Lines: 93%

### Ready to commit! 🚀
```

## Bei Fehlern

```markdown
## ❌ Test Cycle Failed

### Failed at: TypeScript

```
src/cards/ui5-list-card.ts:42:5
  error TS2322: Type 'string' is not assignable to type 'number'.
```

### Quick Fix
```bash
npm run lint:fix   # Auto-fix lint
npm run format     # Auto-fix format
```

### Manual Fix Required
- TypeScript errors need manual attention
- See error output above
```

## Flags

| Flag | Beschreibung |
|------|--------------|
| `--fix` | Auto-Fix für Lint und Format |
| `--coverage` | Coverage Report generieren |
| `--verbose` | Detaillierte Ausgabe |
| `--quick` | Nur Lint + TypeScript (schnell) |
