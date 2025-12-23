# Architecture Documentation

> UI5 Web Components for Home Assistant - Technical Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Home Assistant Frontend                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│   │  HA Lovelace │    │  Card Picker │    │  Theme System│         │
│   │   Dashboard  │    │              │    │              │         │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘         │
│          │                   │                   │                  │
│          ▼                   ▼                   ▼                  │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │              UI5 Web Components HA Plugin                │      │
│   │  ┌─────────────────────────────────────────────────────┐│      │
│   │  │                    index.ts                          ││      │
│   │  │  - Card Registration                                 ││      │
│   │  │  - Theme Detection                                   ││      │
│   │  │  - UI5 Initialization                                ││      │
│   │  └─────────────────────────────────────────────────────┘│      │
│   │                          │                               │      │
│   │          ┌───────────────┼───────────────┐              │      │
│   │          ▼               ▼               ▼              │      │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │      │
│   │  │ ButtonCard │  │ SwitchCard │  │ SliderCard │  ...   │      │
│   │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │      │
│   │        │               │               │                │      │
│   │        └───────────────┼───────────────┘                │      │
│   │                        ▼                                │      │
│   │  ┌─────────────────────────────────────────────────────┐│      │
│   │  │                  BaseUI5Card                         ││      │
│   │  │  - Shadow DOM Setup                                  ││      │
│   │  │  - hass/config Setters                              ││      │
│   │  │  - Change Detection                                  ││      │
│   │  │  - Action Handling                                   ││      │
│   │  └─────────────────────────────────────────────────────┘│      │
│   │                          │                               │      │
│   │          ┌───────────────┼───────────────┐              │      │
│   │          ▼               ▼               ▼              │      │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │      │
│   │  │  action-   │  │  template- │  │    ha-     │        │      │
│   │  │  handler   │  │  processor │  │  helpers   │        │      │
│   │  └────────────┘  └────────────┘  └────────────┘        │      │
│   └─────────────────────────────────────────────────────────┘      │
│                          │                                          │
│                          ▼                                          │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │              @ui5/webcomponents (NPM)                    │      │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │      │
│   │  │ Button  │ │ Switch  │ │ Slider  │ │  List   │  ...  │      │
│   │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │      │
│   └─────────────────────────────────────────────────────────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
ui5-webcomponents-ha/
├── src/
│   ├── index.ts                 # Entry Point, Card Registration
│   ├── ui5-loader.ts            # UI5 Component Imports
│   ├── cards/
│   │   ├── base-card.ts         # Abstract Base Class
│   │   ├── ui5-button-card.ts   # Concrete Cards
│   │   ├── ui5-switch-card.ts
│   │   ├── ui5-slider-card.ts
│   │   ├── ui5-progress-card.ts
│   │   └── *.test.ts            # Unit Tests
│   ├── utils/
│   │   ├── action-handler.ts    # Action Dispatching
│   │   ├── template-processor.ts # HA Template Syntax
│   │   └── ha-helpers.ts        # HA Utility Functions
│   └── types/
│       └── home-assistant.ts    # TypeScript Definitions
├── dist/                         # Build Output
│   └── ui5-webcomponents-ha.js  # Single Bundle
├── CLAUDE.md                     # AI Context
├── ROADMAP.md                    # Component Roadmap
└── docs/
    ├── architecture.md           # This File
    └── components/
        └── IMPLEMENTATION.md     # Implementation Checklist
```

---

## Core Components

### 1. Entry Point (`index.ts`)

**Responsibilities:**

- Initialize UI5 Web Components
- Detect and apply HA theme (dark/light)
- Register cards with `window.customCards`
- Signal readiness to Home Assistant

```typescript
// Simplified Flow
async function init(): Promise<void> {
  await waitForUI5Ready(); // 1. Wait for UI5
  initUI5Theme(isDarkMode()); // 2. Apply theme
  registerCards(); // 3. Register with HA
  window.dispatchEvent(new Event("ui5-ready")); // 4. Signal ready
}
```

**Card Registration:**

```typescript
const CARD_DEFINITIONS = [
  {
    type: "custom:ui5-button-card",
    name: "UI5 Button Card",
    description: "SAP UI5 styled button",
    preview: false,
    documentationURL: "https://...",
  },
  // ... more cards
];

// Register for HA Card Picker
window.customCards = window.customCards || [];
window.customCards.push(...CARD_DEFINITIONS);
```

---

### 2. Base Card (`base-card.ts`)

**Pattern:** Template Method Pattern

```typescript
export abstract class BaseUI5Card extends HTMLElement {
  protected _hass?: HomeAssistant;
  protected _config?: CardConfig;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  // Abstract - must be implemented
  protected abstract render(): void;

  // Can be overridden
  protected getDefaultTapAction(): ActionConfig {
    return { action: "more-info" };
  }

  // Shared behavior
  set hass(hass: HomeAssistant) {
    const oldHass = this._hass;
    this._hass = hass;

    if (this.hasEntityStateChanged(oldHass, hass)) {
      this.requestUpdate();
    }
  }

  protected requestUpdate(): void {
    this.render();
  }
}
```

**Lifecycle:**

```
constructor()
    │
    ▼
connectedCallback()     ← Element added to DOM
    │
    ▼
setConfig(config)       ← HA passes configuration
    │
    ▼
set hass(hass)          ← HA passes state (repeating)
    │
    ▼
render()                ← Update Shadow DOM
    │
    ▼
disconnectedCallback()  ← Element removed from DOM
```

---

### 3. Action Handler (`action-handler.ts`)

**Pattern:** Strategy Pattern

```typescript
type ActionType =
  | "toggle"
  | "more-info"
  | "call-service"
  | "navigate"
  | "url"
  | "none";

interface ActionConfig {
  action: ActionType;
  service?: string;
  service_data?: Record<string, unknown>;
  navigation_path?: string;
  url_path?: string;
}

export function handleAction(
  element: HTMLElement,
  hass: HomeAssistant,
  config: ActionConfig,
  entityId?: string,
): void {
  switch (config.action) {
    case "toggle":
      handleToggleAction(hass, entityId);
      break;
    case "more-info":
      handleMoreInfoAction(element, entityId);
      break;
    case "call-service":
      handleCallServiceAction(hass, config);
      break;
    case "navigate":
      handleNavigateAction(config.navigation_path);
      break;
    case "url":
      handleUrlAction(config.url_path);
      break;
    case "none":
    default:
      break;
  }
}
```

---

### 4. Template Processor (`template-processor.ts`)

**Pattern:** Interpreter Pattern

**Supported Syntax:**

```
{{ states('sensor.temperature') }}     → "21.5"
{{ state_attr('light.x', 'brightness') }} → "255"
{{ entity.state }}                      → Current state
{{ entity.attributes.friendly_name }}   → Attribute value
{{ now() }}                             → Current timestamp
{{ as_timestamp(entity.last_changed) }} → Unix timestamp
```

```typescript
export function processTemplate(
  template: string,
  hass: HomeAssistant,
  entity?: HassEntity,
): string {
  let result = template;

  // Process states('entity_id')
  result = result.replace(
    /\{\{\s*states\(['"]([^'"]+)['"]\)\s*\}\}/g,
    (_, entityId) => getEntityState(hass, entityId),
  );

  // Process state_attr('entity_id', 'attribute')
  result = result.replace(
    /\{\{\s*state_attr\(['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\)\s*\}\}/g,
    (_, entityId, attr) => getEntityAttribute(hass, entityId, attr),
  );

  // ... more patterns

  return result;
}
```

---

### 5. UI5 Loader (`ui5-loader.ts`)

**Purpose:** Centralized UI5 component imports

```typescript
// Base Components
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Switch.js";
import "@ui5/webcomponents/dist/Slider.js";
import "@ui5/webcomponents/dist/ProgressIndicator.js";

// Fiori Components
import "@ui5/webcomponents-fiori/dist/ShellBar.js";
import "@ui5/webcomponents-fiori/dist/SideNavigation.js";

// Theme
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";

export function initUI5Theme(isDark: boolean): void {
  setTheme(isDark ? "sap_horizon_dark" : "sap_horizon");
}

export async function waitForUI5Ready(): Promise<void> {
  // Wait for all UI5 components to be defined
  await customElements.whenDefined("ui5-button");
}
```

**Import Rules:**

1. ✅ Always verify path exists: `ls node_modules/@ui5/.../dist/`
2. ✅ Use side-effect imports only: `import "..."`
3. ❌ Never import classes directly in cards
4. ❌ Never guess import paths

---

## Data Flow

### State Update Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Home Assistant Core                       │
└─────────────────────────────┬───────────────────────────────┘
                              │ WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Home Assistant Frontend                   │
│                                                              │
│   hass object updated                                        │
│        │                                                     │
│        ▼                                                     │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              card.hass = newHass                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     UI5 Card (BaseUI5Card)                   │
│                                                              │
│   set hass(newHass) {                                        │
│     if (hasEntityStateChanged(oldHass, newHass)) {          │
│       this.requestUpdate();  ──────────────────────┐        │
│     }                                               │        │
│   }                                                 │        │
│                                                     ▼        │
│   requestUpdate() {                                          │
│     this.render();  ◄───────────────────────────────         │
│   }                                                          │
│                                                              │
│   render() {                                                 │
│     this.shadowRoot.innerHTML = `                            │
│       <ui5-button>${state}</ui5-button>                     │
│     `;                                                       │
│   }                                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Action Flow

```
┌──────────────────────────────────────────────────────────────┐
│  User clicks UI5 Button                                       │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  UI5 Button fires "click" event                               │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  Card's event listener catches event                          │
│                                                               │
│  ui5Button.addEventListener("click", () => {                  │
│    handleAction(this, this._hass, this._config.tap_action);  │
│  });                                                          │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  action-handler.ts                                            │
│                                                               │
│  switch (config.action) {                                     │
│    case "toggle":                                             │
│      hass.callService("homeassistant", "toggle", {           │
│        entity_id: entityId                                    │
│      });                                                      │
│      break;                                                   │
│    case "more-info":                                          │
│      fireEvent(element, "hass-more-info", { entityId });     │
│      break;                                                   │
│  }                                                            │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  Home Assistant processes action                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Design Patterns Summary

| Pattern             | Location                | Purpose                                         |
| ------------------- | ----------------------- | ----------------------------------------------- |
| **Template Method** | `base-card.ts`          | Shared card behavior with customizable render() |
| **Strategy**        | `action-handler.ts`     | Pluggable action types                          |
| **Interpreter**     | `template-processor.ts` | Parse HA template syntax                        |
| **Observer**        | `hass` setter           | React to state changes                          |
| **Module**          | `index.ts`              | Async initialization                            |
| **Composition**     | All cards               | Utilities over inheritance                      |

---

## Shadow DOM Encapsulation

Each card uses Shadow DOM for style isolation:

```typescript
constructor() {
  super();
  this.attachShadow({ mode: "open" });
}

render() {
  this.shadowRoot!.innerHTML = `
    <style>
      /* Scoped styles - won't leak out */
      :host {
        display: block;
      }
      .card-content {
        padding: 16px;
      }
    </style>
    <div class="card-content">
      <ui5-button>Click me</ui5-button>
    </div>
  `;
}
```

**Benefits:**

- ✅ Styles don't leak to HA dashboard
- ✅ HA styles don't affect card internals
- ✅ Predictable rendering

**Accessing Shadow DOM in Tests:**

```typescript
const shadowRoot = element.shadowRoot!;
const button = shadowRoot.querySelector("ui5-button");
```

---

## Theming

### Theme Detection

```typescript
function isDarkMode(): boolean {
  // Check HA theme
  const haTheme = document.body.getAttribute("data-theme");
  if (haTheme) {
    return haTheme.includes("dark");
  }

  // Fallback to system preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
```

### Theme Application

```typescript
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";

// Available themes:
// - sap_horizon (light)
// - sap_horizon_dark
// - sap_horizon_hcb (high contrast black)
// - sap_horizon_hcw (high contrast white)

setTheme(isDarkMode() ? "sap_horizon_dark" : "sap_horizon");
```

### Theme Change Listener

```typescript
// Listen for HA theme changes
window.addEventListener("theme-changed", () => {
  setTheme(isDarkMode() ? "sap_horizon_dark" : "sap_horizon");
});
```

---

## Build & Bundle

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "UI5WebComponentsHA",
      fileName: "ui5-webcomponents-ha",
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        // Single file output for HACS
        inlineDynamicImports: true,
      },
    },
  },
});
```

### Output

```
dist/
└── ui5-webcomponents-ha.js    # ~250-400 KB (includes UI5 components)
```

---

## HACS Integration

### hacs.json

```json
{
  "name": "UI5 Web Components",
  "render_readme": true,
  "filename": "ui5-webcomponents-ha.js"
}
```

### Lovelace Resource

```yaml
# configuration.yaml or via UI
lovelace:
  resources:
    - url: /hacsfiles/ui5-webcomponents-ha/ui5-webcomponents-ha.js
      type: module
```

---

## Testing Strategy

### Unit Tests (Vitest + happy-dom)

```typescript
describe("UI5ButtonCard", () => {
  let element: HTMLElement;
  let mockHass: Partial<HomeAssistant>;

  beforeEach(() => {
    mockHass = createMockHass();
    element = document.createElement("ui5-button-card");
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders ui5-button in shadow DOM", async () => {
    const card = element as any;
    card.setConfig({ type: "custom:ui5-button-card" });
    card.hass = mockHass;

    await tick();

    const button = element.shadowRoot!.querySelector("ui5-button");
    expect(button).not.toBeNull();
  });
});
```

### Test Categories

| Category       | Tests                              | Priority |
| -------------- | ---------------------------------- | -------- |
| Initialization | Custom element defined, shadow DOM | High     |
| Configuration  | setConfig validation               | High     |
| Rendering      | UI5 component present              | High     |
| State          | Entity state display, updates      | Medium   |
| Actions        | tap_action, hold_action            | Medium   |
| Edge Cases     | Missing entity, null config        | Low      |

---

## Performance Considerations

### Lazy Loading (Future)

```typescript
// Current: All components loaded upfront
import "@ui5/webcomponents/dist/Button.js";

// Future: Dynamic import when needed
async function loadButton() {
  await import("@ui5/webcomponents/dist/Button.js");
}
```

### Change Detection

```typescript
// Only re-render when relevant state changes
hasEntityStateChanged(oldHass: HomeAssistant, newHass: HomeAssistant): boolean {
  if (!this._config?.entity) return false;

  const oldState = oldHass?.states[this._config.entity];
  const newState = newHass?.states[this._config.entity];

  return oldState !== newState;
}
```

### Memory Management

```typescript
disconnectedCallback() {
  // Clean up event listeners
  this._abortController?.abort();

  // Clear references
  this._hass = undefined;
  this._config = undefined;
}
```

---

## Security Considerations

### XSS Prevention

```typescript
// Always escape user content
import { escapeHtml } from "./template-processor";

render() {
  const name = escapeHtml(this._config?.name || "");
  this.shadowRoot!.innerHTML = `<ui5-button>${name}</ui5-button>`;
}
```

### Template Processing

```typescript
// Only process known patterns, reject unknown
function processTemplate(template: string): string {
  // Whitelist approach - only known functions
  const allowedFunctions = ["states", "state_attr", "now", "as_timestamp"];
  // ...
}
```

---

## References

- [UI5 Web Components Documentation](https://sap.github.io/ui5-webcomponents/)
- [Home Assistant Frontend Development](https://developers.home-assistant.io/docs/frontend/)
- [Custom Elements Spec](https://html.spec.whatwg.org/multipage/custom-elements.html)
- [Shadow DOM Spec](https://dom.spec.whatwg.org/#shadow-trees)
