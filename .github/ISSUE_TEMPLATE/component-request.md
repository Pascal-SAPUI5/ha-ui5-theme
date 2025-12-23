---
name: "🧩 New UI5 Component Request"
about: "Request a new UI5 Web Component Card for Home Assistant"
title: "feat: ui5-[COMPONENT]-card"
labels: ["enhancement", "component"]
assignees: []
---

## Component Information

### UI5 Component

<!-- Name der UI5 Web Component -->

**Name:** `ui5-[component]`

**Package:**

- [ ] `@ui5/webcomponents`
- [ ] `@ui5/webcomponents-fiori`
- [ ] `@ui5/webcomponents-ai`

**Import Path:**

```typescript
import "@ui5/webcomponents/dist/[Component].js";
```

### Verification

<!-- Hast du geprüft ob die Komponente existiert? -->

```bash
ls node_modules/@ui5/webcomponents/dist/ | grep -i [component]
```

- [ ] Import-Pfad verifiziert

---

## Home Assistant Use Case

### Beschreibung

<!-- Wofür soll die Card in Home Assistant verwendet werden? -->

### Beispiel-Konfiguration

```yaml
type: custom:ui5-[component]-card
entity: sensor.example
name: "Example Card"
# weitere Config-Optionen...
```

### Mockup / Screenshot

<!-- Optional: Skizze oder Screenshot wie die Card aussehen soll -->

---

## Technical Requirements

### Entity Types

<!-- Welche HA Entity-Typen soll die Card unterstützen? -->

- [ ] `light.*`
- [ ] `switch.*`
- [ ] `sensor.*`
- [ ] `binary_sensor.*`
- [ ] `climate.*`
- [ ] `cover.*`
- [ ] `media_player.*`
- [ ] `vacuum.*`
- [ ] Andere: \_\_\_

### Actions

<!-- Welche Actions soll die Card unterstützen? -->

- [ ] `tap_action`
- [ ] `hold_action`
- [ ] `double_tap_action`

### Features

<!-- Zusätzliche Features -->

- [ ] Template Support (`{{ states('entity') }}`)
- [ ] Theming (Dark/Light Mode)
- [ ] Responsive Design
- [ ] Andere: \_\_\_

---

## Definition of Done

- [ ] Import in `ui5-loader.ts` hinzugefügt
- [ ] Card-Klasse in `src/cards/ui5-[component]-card.ts` erstellt
- [ ] Card in `index.ts` registriert (CARD_DEFINITIONS)
- [ ] Unit Tests geschrieben
- [ ] `npm run lint` ✓
- [ ] `npm run typecheck` ✓
- [ ] `npm test` ✓
- [ ] `npm run build` ✓
- [ ] README Beispiel hinzugefügt

---

## Additional Context

<!-- Weitere Informationen, Links zur UI5 Dokumentation, etc. -->

**UI5 Dokumentation:** https://sap.github.io/ui5-webcomponents/components/[Component]/

---

## Checklist for Maintainers

- [ ] Priorität festgelegt
- [ ] Sprint/Milestone zugewiesen
- [ ] Abhängigkeiten geprüft
