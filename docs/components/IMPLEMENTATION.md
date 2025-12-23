# UI5 Components Implementation Checklist

## Legende

- ✅ Implementiert + Tests
- 🔄 In Arbeit
- ⬜ Ausstehend
- ❌ Nicht möglich/Skipped

---

## Phase 2: Kern-Dashboard (Sprint 1-2)

### Listen & Tabellen

| #   | Komponente | Card Name        | Import Check | Card | Tests | CI  |
| --- | ---------- | ---------------- | ------------ | ---- | ----- | --- |
| 1   | List       | `ui5-list-card`  | ✅           | ✅   | ✅    | ✅  |
| 2   | Table      | `ui5-table-card` | ✅           | ✅   | ✅    | ✅  |

### Cards & Container

| #   | Komponente | Card Name        | Import Check | Card | Tests | CI  |
| --- | ---------- | ---------------- | ------------ | ---- | ----- | --- |
| 3   | Card       | `ui5-card-card`  | ✅           | ✅   | ✅    | ✅  |
| 4   | Panel      | `ui5-panel-card` | ✅           | ✅   | ✅    | ✅  |

### Navigation

| #   | Komponente   | Card Name       | Import Check | Card | Tests | CI  |
| --- | ------------ | --------------- | ------------ | ---- | ----- | --- |
| 5   | TabContainer | `ui5-tabs-card` | ✅           | ✅   | ✅    | ✅  |

---

## Phase 3: Fiori Layout (Sprint 3-4)

### App Shell

| #   | Komponente     | Card Name           | Import Check | Card | Tests | CI  |
| --- | -------------- | ------------------- | ------------ | ---- | ----- | --- |
| 6   | ShellBar       | `ui5-shellbar-card` | ✅           | ✅   | ✅    | ✅  |
| 7   | SideNavigation | `ui5-sidenav-card`  | ✅           | ✅   | ✅    | ✅  |
| 8   | Bar            | `ui5-bar-card`      | ✅           | ✅   | ✅    | ✅  |

### Timeline

| #   | Komponente | Card Name           | Import Check | Card | Tests | CI  |
| --- | ---------- | ------------------- | ------------ | ---- | ----- | --- |
| 9   | Timeline   | `ui5-timeline-card` | ✅           | ✅   | ✅    | ✅  |

---

## Phase 4: Inputs (Sprint 5)

| #   | Komponente | Card Name             | Import Check | Card | Tests | CI  |
| --- | ---------- | --------------------- | ------------ | ---- | ----- | --- |
| 10  | Input      | `ui5-input-card`      | ✅           | ✅   | ✅    | ✅  |
| 11  | Select     | `ui5-select-card`     | ✅           | ✅   | ✅    | ✅  |
| 12  | DatePicker | `ui5-datepicker-card` | ✅           | ✅   | ✅    | ✅  |
| 13  | TimePicker | `ui5-timepicker-card` | ✅           | ✅   | ✅    | ✅  |

---

## Phase 5: Feedback (Sprint 6)

| #   | Komponente   | Card Name               | Import Check | Card | Tests | CI  |
| --- | ------------ | ----------------------- | ------------ | ---- | ----- | --- |
| 14  | Badge        | `ui5-badge-card`        | ⬜           | ⬜   | ⬜    | ⬜  |
| 15  | MessageStrip | `ui5-messagestrip-card` | ⬜           | ⬜   | ⬜    | ⬜  |
| 16  | Toast        | `ui5-toast-card`        | ⬜           | ⬜   | ⬜    | ⬜  |

---

## Phase 6: Dialoge (Sprint 7)

| #   | Komponente | Card Name          | Import Check | Card | Tests | CI  |
| --- | ---------- | ------------------ | ------------ | ---- | ----- | --- |
| 17  | Dialog     | `ui5-dialog-card`  | ⬜           | ⬜   | ⬜    | ⬜  |
| 18  | Popover    | `ui5-popover-card` | ⬜           | ⬜   | ⬜    | ⬜  |
| 19  | Menu       | `ui5-menu-card`    | ⬜           | ⬜   | ⬜    | ⬜  |

---

## Phase 7: Wizard (Sprint 8)

| #   | Komponente | Card Name         | Import Check | Card | Tests | CI  |
| --- | ---------- | ----------------- | ------------ | ---- | ----- | --- |
| 20  | Wizard     | `ui5-wizard-card` | ✅           | ✅   | ⬜    | ✅  |

---

## Phase 8: AI (Experimental)

| #   | Komponente  | Card Name              | Import Check | Card | Tests | CI  |
| --- | ----------- | ---------------------- | ------------ | ---- | ----- | --- |
| 21  | PromptInput | `ui5-prompt-card`      | ⬜           | ⬜   | ⬜    | ⬜  |
| 22  | AITextarea  | `ui5-ai-textarea-card` | ⬜           | ⬜   | ⬜    | ⬜  |

---

## Workflow pro Komponente

```bash
# 1. Import prüfen
ls node_modules/@ui5/webcomponents/dist/ | grep -i <component>
ls node_modules/@ui5/webcomponents-fiori/dist/ | grep -i <component>

# 2. Implementieren
/project:add-component <component>

# 3. Tests schreiben
/project:add-tests <component>

# 4. Validieren
/project:validate

# 5. Checkbox aktualisieren
# Markiere ✅ in dieser Datei
```

---

## Release-Planung

| Version | Komponenten                           | Ziel-Datum |
| ------- | ------------------------------------- | ---------- |
| v0.2.0  | List, Table, Card, Panel, Tabs        | TBD        |
| v0.3.0  | ShellBar, SideNav, Timeline, Bar      | TBD        |
| v0.4.0  | Inputs (Input, Select, DatePicker)    | TBD        |
| v0.5.0  | Feedback (Badge, MessageStrip, Toast) | TBD        |
| v0.6.0  | Dialoge (Dialog, Popover, Menu)       | TBD        |
| v0.7.0  | Wizard                                | TBD        |
| v1.0.0  | Stable Release                        | TBD        |

---

## Quick Commands

```bash
# Alle ausstehenden Komponenten anzeigen
grep "⬜" IMPLEMENTATION-CHECKLIST.md

# Fortschritt zählen
echo "Implementiert: $(grep -c '✅' IMPLEMENTATION-CHECKLIST.md)"
echo "Ausstehend: $(grep -c '⬜' IMPLEMENTATION-CHECKLIST.md)"
```
