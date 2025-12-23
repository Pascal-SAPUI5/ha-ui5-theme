# Roadmap Next Command

Implementiert automatisch die nächste Komponente aus der Roadmap.

## Verwendung

```
/project:roadmap-next
```

## Workflow

### Step 1: Nächste Komponente finden

```bash
# Checklist lesen
NEXT=$(grep -m1 "⬜" docs/components/IMPLEMENTATION-CHECKLIST.md | grep -oP 'ui5-\w+-card' | head -1)

if [ -z "$NEXT" ]; then
  echo "🎉 Roadmap komplett! Alle Komponenten implementiert."
  exit 0
fi

echo "📦 Nächste Komponente: $NEXT"
```

### Step 2: Branch erstellen

```bash
COMPONENT=$(echo $NEXT | sed 's/ui5-//' | sed 's/-card//')
BRANCH="feat/$NEXT"

git checkout main
git pull origin main
git checkout -b $BRANCH

echo "🌿 Branch erstellt: $BRANCH"
```

### Step 3: Import verifizieren

```bash
# Prüfe in welchem Package die Komponente ist
COMPONENT_UPPER=$(echo $COMPONENT | sed 's/.*/\u&/' | sed 's/-./\U&/g' | sed 's/-//g')

# Suche in allen UI5 Packages
FOUND=""
for PKG in webcomponents webcomponents-fiori webcomponents-ai; do
  if ls node_modules/@ui5/$PKG/dist/ 2>/dev/null | grep -qi "^${COMPONENT_UPPER}"; then
    FOUND="@ui5/$PKG"
    IMPORT_PATH=$(ls node_modules/@ui5/$PKG/dist/ | grep -i "^${COMPONENT_UPPER}" | head -1)
    break
  fi
done

if [ -z "$FOUND" ]; then
  echo "❌ Komponente nicht gefunden in node_modules!"
  echo "   Bitte manuell prüfen: ls node_modules/@ui5/*/dist/ | grep -i $COMPONENT"
  exit 1
fi

echo "✅ Gefunden: $FOUND/dist/$IMPORT_PATH"
```

### Step 4: Test-First (TDD)

Erstelle Test-Datei BEVOR die Komponente implementiert wird:

```typescript
// src/cards/${NEXT}.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "./${NEXT}";
import { createMockHass, tick } from "../test-setup";

describe("${NEXT}", () => {
  let element: HTMLElement;
  let mockHass: any;

  beforeEach(() => {
    mockHass = createMockHass();
    element = document.createElement("${NEXT}");
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should be defined as custom element", () => {
      expect(customElements.get("${NEXT}")).toBeDefined();
    });

    it("should have shadow root", () => {
      expect(element.shadowRoot).not.toBeNull();
    });
  });

  describe("Configuration", () => {
    it("should accept valid config", () => {
      const card = element as any;
      expect(() => {
        card.setConfig({ type: "custom:${NEXT}" });
      }).not.toThrow();
    });
  });

  describe("Rendering", () => {
    it("should render UI5 component", async () => {
      const card = element as any;
      card.setConfig({ type: "custom:${NEXT}", entity: "light.test" });
      card.hass = mockHass;

      await tick();

      const shadowRoot = element.shadowRoot!;
      const ui5Element = shadowRoot.querySelector("ui5-${COMPONENT}");
      expect(ui5Element).not.toBeNull();
    });
  });
});
```

### Step 5: Implementierung

→ Ruft intern `/project:add-component $COMPONENT` auf

### Step 6: Tests ausführen

```bash
npm test -- --filter="$NEXT"
```

### Step 7: Validierung

```bash
npm run lint
npm run typecheck
npm run build
npm run test:hacs
```

### Step 8: Commit & PR

```bash
git add .
git commit -m "feat: add $NEXT with tests

- Add $NEXT component
- Add unit tests
- Register in card picker
- Update roadmap checklist"

git push -u origin $BRANCH

# PR erstellen
gh pr create \
  --title "feat: $NEXT" \
  --body "## Summary
Adds $NEXT component.

## Checklist
- [x] Import verified
- [x] Tests written
- [x] Component implemented
- [x] Registered in index.ts
- [x] All checks passing

## Testing
\`\`\`yaml
type: custom:$NEXT
entity: light.test
\`\`\`"
```

### Step 9: Checklist aktualisieren

```bash
# In docs/components/IMPLEMENTATION-CHECKLIST.md
# Ersetze ⬜ mit ✅ für diese Komponente
sed -i "s/| $NEXT | ⬜/| $NEXT | ✅/g" docs/components/IMPLEMENTATION-CHECKLIST.md
git add docs/components/IMPLEMENTATION-CHECKLIST.md
git commit --amend --no-edit
git push --force-with-lease
```

## Output

```markdown
## 🚀 Komponente implementiert: ui5-list-card

### Dateien
- ✅ src/ui5-loader.ts (Import)
- ✅ src/cards/ui5-list-card.ts (Card)
- ✅ src/cards/ui5-list-card.test.ts (Tests)
- ✅ src/index.ts (Registrierung)

### Validierung
- ✅ Lint passed
- ✅ TypeCheck passed
- ✅ Tests passed (5/5)
- ✅ Build succeeded
- ✅ HACS valid

### PR
https://github.com/user/repo/pull/XX

### Nächste Komponente
→ ui5-table-card
```

## Agent-Zuweisung

Dieser Command orchestriert:
1. `ui5-ha-component-engineer` für Implementierung
2. `ui5-ha-test-engineer` für Tests
