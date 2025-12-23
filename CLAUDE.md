# UI5 Web Components for Home Assistant

> Claude Code Projektkontext - Diese Datei wird automatisch geladen

## Projektziel

Home Assistant Custom Cards mit SAP UI5 Web Components. Jede Card muss:

- Shadow DOM Isolation haben
- Mit Home Assistant's `hass` Object arbeiten
- Im Card Picker registriert sein
- Tests haben und CI bestehen

## Kritische Pfade

```
src/
├── ui5-loader.ts       # HIER alle UI5 Imports (kritisch!)
├── cards/
│   ├── base-card.ts    # Abstract base - NICHT modifizieren ohne Review
│   └── *.ts            # Konkrete Cards
├── utils/
│   ├── action-handler.ts
│   └── template-processor.ts
└── index.ts            # Card-Registrierung (CARD_DEFINITIONS Array)
```

## Workflow-Befehle

| Befehl                          | Zweck                | Wann nutzen         |
| ------------------------------- | -------------------- | ------------------- |
| `/project:add-component <name>` | Neue Card hinzufügen | Neue UI5 Komponente |
| `/project:validate`             | Lint + Test + Build  | Vor jedem Commit    |
| `/project:release <version>`    | Tag + Release        | Nach PR-Merge       |

## Qualitäts-Checkliste (Definition of Done)

Vor jedem PR MUSS bestanden sein:

```bash
npm run lint          # ESLint ohne Errors
npm run typecheck     # tsc --noEmit erfolgreich
npm test              # Alle Tests grün
npm run build         # dist/ui5-webcomponents-ha.js existiert
```

## UI5 Import-Regeln (KRITISCH)

**IMMER zuerst prüfen** ob das Modul existiert:

```bash
# Korrekt: Exakten Pfad in node_modules prüfen
ls node_modules/@ui5/webcomponents-fiori/dist/ | grep -i timeline

# NIEMALS raten! Falsche Imports = Build-Fehler
```

**Import-Syntax:**

```typescript
// In ui5-loader.ts - NUR side-effect imports
import "@ui5/webcomponents-fiori/dist/Timeline.js";

// In Cards - KEINE direkten UI5 imports, nur HTML nutzen
// <ui5-timeline> wird durch den Loader verfügbar
```

## Test-Patterns

```typescript
// Mock-Setup für jeden Test
const mockHass: Partial<HomeAssistant> = {
  states: {
    "light.test": { state: "on", attributes: { friendly_name: "Test" } },
  },
  callService: vi.fn(),
};

// Shadow DOM Zugriff
const shadowRoot = element.shadowRoot!;
const ui5Element = shadowRoot.querySelector("ui5-button");
```

## Häufige Fehler

| Problem                         | Ursache                   | Lösung                                |
| ------------------------------- | ------------------------- | ------------------------------------- |
| `Cannot find module '@ui5/...'` | Falscher Import-Pfad      | `ls node_modules/@ui5/...` prüfen     |
| Card erscheint nicht im Picker  | Nicht in CARD_DEFINITIONS | `index.ts` prüfen                     |
| Tests hängen                    | UI5 nicht initialisiert   | `await waitForUI5Ready()`             |
| Style-Bleeding                  | Kein Shadow DOM           | `this.attachShadow({ mode: "open" })` |

## Agent-Zuständigkeiten

```
┌─────────────────────────────────────────────────────────┐
│  ui5-ha-component-engineer                              │
│  → Implementiert Cards                                   │
│  → MUSS: Import prüfen, Build testen, registrieren      │
├─────────────────────────────────────────────────────────┤
│  ui5-ha-test-engineer                                   │
│  → Schreibt Tests                                        │
│  → MUSS: Mock-Setup, Shadow DOM, Cleanup                │
├─────────────────────────────────────────────────────────┤
│  ui5-ha-release-engineer                                │
│  → CI/CD Pipeline                                        │
│  → MUSS: Version bumpen, Changelog, Tag                 │
└─────────────────────────────────────────────────────────┘
```

## Kontext für AI

- TypeScript strict mode
- Vite als Bundler
- Vitest + happy-dom für Tests
- HACS-kompatibel (hacs.json vorhanden)
- GitHub Actions für CI/CD
