scripts/# UI5 Components Development & Testing Workflow

## Übersicht

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT CYCLE                                 │
│                                                                      │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐         │
│   │  PLAN   │───▶│  CODE   │───▶│  TEST   │───▶│ VERIFY  │         │
│   └─────────┘    └─────────┘    └─────────┘    └─────────┘         │
│        │                                             │              │
│        │              ┌─────────┐                    │              │
│        └──────────────│ RELEASE │◀───────────────────┘              │
│                       └─────────┘                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Setup (Einmalig)

```bash
# 1. Merge-Konflikte lösen (PR #15)
git checkout claude/issue-13-20251222-1623
git fetch origin
git merge origin/main -X theirs -m "fix: resolve merge conflicts"
git push

# 2. PR mergen (GitHub UI oder CLI)
gh pr merge 15 --squash

# 3. Zurück auf main
git checkout main
git pull

# 4. Dependencies prüfen
npm ci
npm run build
```

---

## Workflow Commands

### Command 1: `/project:roadmap-next`

Nächste Komponente aus der Roadmap implementieren:

```bash
# In Claude Code eingeben:
/project:roadmap-next
```

**Was passiert:**

1. Liest `docs/components/IMPLEMENTATION-CHECKLIST.md`
2. Findet nächste `⬜` Komponente
3. Führt `/project:add-component <name>` aus
4. Führt `/project:add-tests <name>` aus
5. Aktualisiert Checklist auf `✅`

---

### Command 2: `/project:test-cycle`

Vollständiger Test-Zyklus:

```bash
/project:test-cycle
```

**Was passiert:**

```
1. npm run lint          → ESLint
2. npm run typecheck     → TypeScript
3. npm test              → Vitest Unit Tests
4. npm run build         → Vite Build
5. npm run test:hacs     → HACS Validation
```

---

### Command 3: `/project:hacs-validate`

HACS-spezifische Validierung:

```bash
/project:hacs-validate
```

**Was passiert:**

```
1. Prüft hacs.json Konfiguration
2. Prüft dist/ Output existiert
3. Validiert Dateinamen
4. Simuliert HACS Install
```

---

## Schritt-für-Schritt Workflow

### Sprint-Start: Komponenten auswählen

```bash
# Übersicht der ausstehenden Komponenten
cat docs/components/IMPLEMENTATION-CHECKLIST.md | grep "⬜"

# Beispiel Output:
# | 1 | List | `ui5-list-card` | ⬜ | ⬜ | ⬜ | ⬜ |
# | 2 | Table | `ui5-table-card` | ⬜ | ⬜ | ⬜ | ⬜ |
```

### Pro Komponente: TDD Cycle

```bash
# ══════════════════════════════════════════════════════════════
# KOMPONENTE: ui5-list-card
# ══════════════════════════════════════════════════════════════

# 1. Feature Branch erstellen
git checkout -b feat/ui5-list-card

# 2. Import prüfen (KRITISCH!)
ls node_modules/@ui5/webcomponents/dist/ | grep -i list
# Output: List.js, ListItemStandard.js, ...

# 3. Test ZUERST schreiben (TDD)
# Erstelle: src/cards/ui5-list-card.test.ts

# 4. Test ausführen (sollte fehlschlagen)
npm test -- --filter="ui5-list-card"

# 5. Komponente implementieren
# - ui5-loader.ts: Import hinzufügen
# - src/cards/ui5-list-card.ts: Card erstellen
# - src/index.ts: Registrieren

# 6. Test erneut ausführen (sollte grün sein)
npm test -- --filter="ui5-list-card"

# 7. Vollständige Validierung
npm run lint
npm run typecheck
npm run build

# 8. HACS testen
npm run test:hacs

# 9. Commit
git add .
git commit -m "feat: add ui5-list-card with tests"

# 10. Push & PR
git push -u origin feat/ui5-list-card
gh pr create --title "feat: ui5-list-card" --body "Closes #XX"
```

---

## NPM Scripts (package.json)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",

    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",

    "test:hacs": "node scripts/validate-hacs.js",
    "test:all": "npm run lint && npm run typecheck && npm test && npm run build && npm run test:hacs",

    "validate": "npm run test:all",
    "release": "npm run validate && node scripts/release.js"
  }
}
```

---

## HACS Validation Script

Erstelle `scripts/validate-hacs.js`:

```javascript
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 HACS Validation Starting...\n");

let errors = 0;
let warnings = 0;

// 1. Check hacs.json exists
const hacsPath = path.join(__dirname, "..", "hacs.json");
if (!fs.existsSync(hacsPath)) {
  console.error("❌ hacs.json not found");
  errors++;
} else {
  const hacs = JSON.parse(fs.readFileSync(hacsPath, "utf8"));
  console.log("✅ hacs.json found");
  console.log(`   Name: ${hacs.name}`);
  console.log(`   Filename: ${hacs.filename}`);

  // 2. Check dist file exists
  const distPath = path.join(__dirname, "..", "dist", hacs.filename);
  if (!fs.existsSync(distPath)) {
    console.error(`❌ Dist file not found: dist/${hacs.filename}`);
    errors++;
  } else {
    const stats = fs.statSync(distPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`✅ Dist file exists: ${sizeKB} KB`);

    // Warn if bundle is too large
    if (stats.size > 1024 * 1024) {
      console.warn("⚠️  Bundle size > 1MB - consider code splitting");
      warnings++;
    }
  }
}

// 3. Check README exists
if (!fs.existsSync(path.join(__dirname, "..", "README.md"))) {
  console.error("❌ README.md not found (required for HACS)");
  errors++;
} else {
  console.log("✅ README.md found");
}

// 4. Check version in package.json
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
);
console.log(`✅ Version: ${pkg.version}`);

// 5. Check for required files
const requiredFiles = ["LICENSE", "hacs.json"];
requiredFiles.forEach((file) => {
  if (!fs.existsSync(path.join(__dirname, "..", file))) {
    console.error(`❌ ${file} not found`);
    errors++;
  }
});

// Summary
console.log("\n" + "═".repeat(50));
if (errors > 0) {
  console.error(
    `\n❌ HACS Validation FAILED: ${errors} error(s), ${warnings} warning(s)`,
  );
  process.exit(1);
} else {
  console.log(
    `\n✅ HACS Validation PASSED${warnings > 0 ? ` (${warnings} warning(s))` : ""}`,
  );
  process.exit(0);
}
```

---

## Vitest Konfiguration

Erstelle/Update `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "**/*.test.ts", "scripts/"],
    },
    setupFiles: ["./src/test-setup.ts"],
  },
});
```

Erstelle `src/test-setup.ts`:

```typescript
import { vi } from "vitest";

// Mock Home Assistant globals
Object.defineProperty(window, "customCards", {
  value: [],
  writable: true,
});

// Mock matchMedia for theme detection
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Wait for custom elements to be defined
export async function waitForElement(tagName: string): Promise<void> {
  await customElements.whenDefined(tagName);
}

// Create mock hass object
export function createMockHass(overrides = {}): any {
  return {
    states: {
      "light.test": {
        entity_id: "light.test",
        state: "on",
        attributes: {
          friendly_name: "Test Light",
          brightness: 255,
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: "test", parent_id: null, user_id: null },
      },
      "sensor.temperature": {
        entity_id: "sensor.temperature",
        state: "21.5",
        attributes: {
          friendly_name: "Temperature",
          unit_of_measurement: "°C",
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: "test", parent_id: null, user_id: null },
      },
    },
    callService: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// Helper to wait for next tick
export function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
```

---

## GitHub Actions CI

Erstelle/Update `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type Check
        run: npm run typecheck

      - name: Test
        run: npm test

      - name: Build
        run: npm run build

      - name: HACS Validation
        run: npm run test:hacs

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: github.event_name == 'push'
        with:
          file: ./coverage/coverage-final.json

  hacs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: HACS Action
        uses: hacs/action@main
        with:
          category: plugin
```

---

## Täglicher Workflow

```bash
# ══════════════════════════════════════════════════════════════
# MORGENS: Status Check
# ══════════════════════════════════════════════════════════════

git checkout main
git pull
npm ci

# Fortschritt anzeigen
echo "✅ Implementiert: $(grep -c '✅' docs/components/IMPLEMENTATION-CHECKLIST.md)"
echo "⬜ Ausstehend: $(grep -c '⬜' docs/components/IMPLEMENTATION-CHECKLIST.md)"

# ══════════════════════════════════════════════════════════════
# ARBEITEN: Nächste Komponente
# ══════════════════════════════════════════════════════════════

# Option A: Mit Claude Code
/project:roadmap-next

# Option B: Manuell
COMPONENT="list"
git checkout -b feat/ui5-${COMPONENT}-card

# ... implementieren ...

npm run validate
git add . && git commit -m "feat: add ui5-${COMPONENT}-card"
git push -u origin feat/ui5-${COMPONENT}-card
gh pr create

# ══════════════════════════════════════════════════════════════
# ABENDS: Cleanup
# ══════════════════════════════════════════════════════════════

# PRs reviewen
gh pr list

# Merged branches löschen
git branch --merged | grep -v main | xargs git branch -d
```

---

## Quick Reference

| Befehl                             | Beschreibung                 |
| ---------------------------------- | ---------------------------- |
| `npm run validate`                 | Vollständiger CI-Check lokal |
| `npm test -- --filter="card-name"` | Einzelne Card testen         |
| `npm run test:watch`               | Tests im Watch-Modus         |
| `npm run test:hacs`                | HACS Validation              |
| `gh pr create`                     | PR erstellen                 |
| `gh pr merge --squash`             | PR mergen                    |

---

## Checkliste pro Komponente

```
□ Branch erstellt: feat/ui5-<name>-card
□ Import verifiziert: ls node_modules/@ui5/...
□ Test geschrieben: src/cards/ui5-<name>-card.test.ts
□ Card implementiert: src/cards/ui5-<name>-card.ts
□ Import in ui5-loader.ts
□ Registrierung in index.ts
□ npm run lint ✓
□ npm run typecheck ✓
□ npm test ✓
□ npm run build ✓
□ npm run test:hacs ✓
□ PR erstellt
□ CI grün
□ PR gemerged
□ Checklist aktualisiert
```
