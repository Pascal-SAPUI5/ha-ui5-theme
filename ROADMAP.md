# UI5 Web Components für Home Assistant Dashboard

## Übersicht der Packages

| Package                    | Beschreibung                                     | Installation                     |
| -------------------------- | ------------------------------------------------ | -------------------------------- |
| `@ui5/webcomponents`       | Basis-Komponenten (Buttons, Inputs, Lists, etc.) | `npm i @ui5/webcomponents`       |
| `@ui5/webcomponents-fiori` | Fiori UX Komponenten (ShellBar, SideNav, etc.)   | `npm i @ui5/webcomponents-fiori` |
| `@ui5/webcomponents-ai`    | AI-bezogene Komponenten (experimentell)          | `npm i @ui5/webcomponents-ai`    |
| `@ui5/webcomponents-icons` | Icon-Bibliothek                                  | `npm i @ui5/webcomponents-icons` |

---

## Phase 1: Basis-Komponenten (BEREITS IMPLEMENTIERT ✅)

| Komponente         | Tag                      | Import                                         | Status  |
| ------------------ | ------------------------ | ---------------------------------------------- | ------- |
| Button             | `ui5-button`             | `@ui5/webcomponents/dist/Button.js`            | ✅ Done |
| Switch             | `ui5-switch`             | `@ui5/webcomponents/dist/Switch.js`            | ✅ Done |
| Slider             | `ui5-slider`             | `@ui5/webcomponents/dist/Slider.js`            | ✅ Done |
| Progress Indicator | `ui5-progress-indicator` | `@ui5/webcomponents/dist/ProgressIndicator.js` | ✅ Done |

---

## Phase 2: Kern-Dashboard Komponenten (HOHE PRIORITÄT 🔴)

### 2.1 Listen & Daten-Anzeige

| Komponente       | Tag                    | Import                                        | HA Use Case                  |
| ---------------- | ---------------------- | --------------------------------------------- | ---------------------------- |
| **List**         | `ui5-list`             | `@ui5/webcomponents/dist/List.js`             | Entity-Listen, Räume, Geräte |
| List Item        | `ui5-li`               | `@ui5/webcomponents/dist/ListItemStandard.js` | Standard-Listeneinträge      |
| List Item Custom | `ui5-li-custom`        | `@ui5/webcomponents/dist/ListItemCustom.js`   | Custom Entity Cards          |
| List Item Group  | `ui5-li-group`         | `@ui5/webcomponents/dist/ListItemGroup.js`    | Gruppierung nach Räumen      |
| **Table**        | `ui5-table`            | `@ui5/webcomponents/dist/Table.js`            | Sensor-Daten, History        |
| Table Row        | `ui5-table-row`        | `@ui5/webcomponents/dist/TableRow.js`         |                              |
| Table Cell       | `ui5-table-cell`       | `@ui5/webcomponents/dist/TableCell.js`        |                              |
| Table Header Row | `ui5-table-header-row` | `@ui5/webcomponents/dist/TableHeaderRow.js`   |                              |

### 2.2 Cards & Container

| Komponente  | Tag               | Import                                  | HA Use Case            |
| ----------- | ----------------- | --------------------------------------- | ---------------------- |
| **Card**    | `ui5-card`        | `@ui5/webcomponents/dist/Card.js`       | Entity Card Container  |
| Card Header | `ui5-card-header` | `@ui5/webcomponents/dist/CardHeader.js` | Card Titel mit Actions |
| **Panel**   | `ui5-panel`       | `@ui5/webcomponents/dist/Panel.js`      | Collapsible Sections   |

### 2.3 Navigation & Layout

| Komponente        | Tag                 | Import                                    | HA Use Case            |
| ----------------- | ------------------- | ----------------------------------------- | ---------------------- |
| **Tab Container** | `ui5-tabcontainer`  | `@ui5/webcomponents/dist/TabContainer.js` | Dashboard Tabs (Räume) |
| Tab               | `ui5-tab`           | `@ui5/webcomponents/dist/Tab.js`          |                        |
| Tab Separator     | `ui5-tab-separator` | `@ui5/webcomponents/dist/TabSeparator.js` |                        |

---

## Phase 3: Fiori Layout Komponenten (MITTLERE PRIORITÄT 🟡)

### 3.1 App Shell & Navigation

| Komponente               | Tag                           | Import                                                   | HA Use Case       |
| ------------------------ | ----------------------------- | -------------------------------------------------------- | ----------------- |
| **ShellBar**             | `ui5-shellbar`                | `@ui5/webcomponents-fiori/dist/ShellBar.js`              | Dashboard Header  |
| ShellBar Item            | `ui5-shellbar-item`           | `@ui5/webcomponents-fiori/dist/ShellBarItem.js`          | Header Actions    |
| **Side Navigation**      | `ui5-side-navigation`         | `@ui5/webcomponents-fiori/dist/SideNavigation.js`        | Raum-Navigation   |
| Side Navigation Item     | `ui5-side-navigation-item`    | `@ui5/webcomponents-fiori/dist/SideNavigationItem.js`    |                   |
| Side Navigation Sub Item | `ui5-side-navigation-subitem` | `@ui5/webcomponents-fiori/dist/SideNavigationSubItem.js` |                   |
| **Bar**                  | `ui5-bar`                     | `@ui5/webcomponents-fiori/dist/Bar.js`                   | Footer/Header Bar |

### 3.2 Timeline & History

| Komponente    | Tag                 | Import                                          | HA Use Case    |
| ------------- | ------------------- | ----------------------------------------------- | -------------- |
| **Timeline**  | `ui5-timeline`      | `@ui5/webcomponents-fiori/dist/Timeline.js`     | Entity History |
| Timeline Item | `ui5-timeline-item` | `@ui5/webcomponents-fiori/dist/TimelineItem.js` | History Events |

### 3.3 Page Layouts

| Komponente                 | Tag                          | Import                                                  | HA Use Case          |
| -------------------------- | ---------------------------- | ------------------------------------------------------- | -------------------- |
| **Dynamic Page**           | `ui5-dynamic-page`           | `@ui5/webcomponents-fiori/dist/DynamicPage.js`          | Scrollable Dashboard |
| Dynamic Page Title         | `ui5-dynamic-page-title`     | `@ui5/webcomponents-fiori/dist/DynamicPageTitle.js`     |                      |
| Dynamic Page Header        | `ui5-dynamic-page-header`    | `@ui5/webcomponents-fiori/dist/DynamicPageHeader.js`    |                      |
| **Flexible Column Layout** | `ui5-flexible-column-layout` | `@ui5/webcomponents-fiori/dist/FlexibleColumnLayout.js` | Master-Detail View   |

---

## Phase 4: Input & Interaktion (MITTLERE PRIORITÄT 🟡)

### 4.1 Inputs

| Komponente           | Tag                    | Import                                       | HA Use Case          |
| -------------------- | ---------------------- | -------------------------------------------- | -------------------- |
| **Input**            | `ui5-input`            | `@ui5/webcomponents/dist/Input.js`           | Entity Name Filter   |
| **Select**           | `ui5-select`           | `@ui5/webcomponents/dist/Select.js`          | Entity Auswahl       |
| Option               | `ui5-option`           | `@ui5/webcomponents/dist/Option.js`          |                      |
| **ComboBox**         | `ui5-combobox`         | `@ui5/webcomponents/dist/ComboBox.js`        | Autocomplete Suche   |
| ComboBox Item        | `ui5-cb-item`          | `@ui5/webcomponents/dist/ComboBoxItem.js`    |                      |
| **MultiComboBox**    | `ui5-multi-combobox`   | `@ui5/webcomponents/dist/MultiComboBox.js`   | Multi-Entity Auswahl |
| **Range Slider**     | `ui5-range-slider`     | `@ui5/webcomponents/dist/RangeSlider.js`     | Temperatur-Bereich   |
| **Rating Indicator** | `ui5-rating-indicator` | `@ui5/webcomponents/dist/RatingIndicator.js` | Bewertungen          |
| **Step Input**       | `ui5-step-input`       | `@ui5/webcomponents/dist/StepInput.js`       | Numerische Eingabe   |

### 4.2 Date & Time

| Komponente          | Tag                   | Import                                      | HA Use Case      |
| ------------------- | --------------------- | ------------------------------------------- | ---------------- |
| **Date Picker**     | `ui5-date-picker`     | `@ui5/webcomponents/dist/DatePicker.js`     | Schedule Config  |
| **Time Picker**     | `ui5-time-picker`     | `@ui5/webcomponents/dist/TimePicker.js`     | Automation Zeit  |
| **DateTime Picker** | `ui5-datetime-picker` | `@ui5/webcomponents/dist/DateTimePicker.js` | Event Planung    |
| **Calendar**        | `ui5-calendar`        | `@ui5/webcomponents/dist/Calendar.js`       | Kalender Ansicht |

---

## Phase 5: Feedback & Status (MITTLERE PRIORITÄT 🟡)

| Komponente              | Tag                       | Import                                                | HA Use Case     |
| ----------------------- | ------------------------- | ----------------------------------------------------- | --------------- |
| **Badge**               | `ui5-badge`               | `@ui5/webcomponents/dist/Badge.js`                    | Status Badges   |
| **Tag**                 | `ui5-tag`                 | `@ui5/webcomponents/dist/Tag.js`                      | Entity Tags     |
| **Message Strip**       | `ui5-message-strip`       | `@ui5/webcomponents/dist/MessageStrip.js`             | Warnungen, Info |
| **Toast**               | `ui5-toast`               | `@ui5/webcomponents/dist/Toast.js`                    | Action Feedback |
| **Busy Indicator**      | `ui5-busy-indicator`      | `@ui5/webcomponents/dist/BusyIndicator.js`            | Loading States  |
| **Illustrated Message** | `ui5-illustrated-message` | `@ui5/webcomponents-fiori/dist/IllustratedMessage.js` | Empty States    |

---

## Phase 6: Dialoge & Overlays (NIEDRIGE PRIORITÄT 🟢)

| Komponente             | Tag                      | Import                                         | HA Use Case    |
| ---------------------- | ------------------------ | ---------------------------------------------- | -------------- |
| **Dialog**             | `ui5-dialog`             | `@ui5/webcomponents/dist/Dialog.js`            | Entity Details |
| **Popover**            | `ui5-popover`            | `@ui5/webcomponents/dist/Popover.js`           | Quick Actions  |
| **Responsive Popover** | `ui5-responsive-popover` | `@ui5/webcomponents/dist/ResponsivePopover.js` | Mobile Actions |
| **Menu**               | `ui5-menu`               | `@ui5/webcomponents/dist/Menu.js`              | Context Menu   |
| Menu Item              | `ui5-menu-item`          | `@ui5/webcomponents/dist/MenuItem.js`          |                |

---

## Phase 7: Wizards & Workflows (NIEDRIGE PRIORITÄT 🟢)

| Komponente  | Tag               | Import                                        | HA Use Case      |
| ----------- | ----------------- | --------------------------------------------- | ---------------- |
| **Wizard**  | `ui5-wizard`      | `@ui5/webcomponents-fiori/dist/Wizard.js`     | Automation Setup |
| Wizard Step | `ui5-wizard-step` | `@ui5/webcomponents-fiori/dist/WizardStep.js` |                  |

---

## Phase 8: AI Komponenten (EXPERIMENTELL 🔬)

| Komponente       | Tag                | Import                                      | HA Use Case  |
| ---------------- | ------------------ | ------------------------------------------- | ------------ |
| **Prompt Input** | `ui5-prompt-input` | `@ui5/webcomponents-ai/dist/PromptInput.js` | AI Assistant |
| **AI Textarea**  | `ui5-ai-textarea`  | `@ui5/webcomponents-ai/dist/AITextarea.js`  | AI Chat      |
| **AI Button**    | `ui5-ai-button`    | `@ui5/webcomponents-ai/dist/AIButton.js`    | AI Actions   |

---

## Phase 9: Zusätzliche Komponenten (OPTIONAL 📦)

### 9.1 Visuelle Elemente

| Komponente   | Tag                | Import                                   | HA Use Case       |
| ------------ | ------------------ | ---------------------------------------- | ----------------- |
| **Avatar**   | `ui5-avatar`       | `@ui5/webcomponents/dist/Avatar.js`      | User/Entity Icons |
| Avatar Group | `ui5-avatar-group` | `@ui5/webcomponents/dist/AvatarGroup.js` | Mehrere Entities  |
| **Icon**     | `ui5-icon`         | `@ui5/webcomponents/dist/Icon.js`        | Entity Icons      |
| **Title**    | `ui5-title`        | `@ui5/webcomponents/dist/Title.js`       | Überschriften     |
| **Text**     | `ui5-text`         | `@ui5/webcomponents/dist/Text.js`        | Beschreibungen    |
| **Label**    | `ui5-label`        | `@ui5/webcomponents/dist/Label.js`       | Form Labels       |
| **Link**     | `ui5-link`         | `@ui5/webcomponents/dist/Link.js`        | Navigation Links  |

### 9.2 Media

| Komponente         | Tag                      | Import                                              | HA Use Case  |
| ------------------ | ------------------------ | --------------------------------------------------- | ------------ |
| **Media Gallery**  | `ui5-media-gallery`      | `@ui5/webcomponents-fiori/dist/MediaGallery.js`     | Kamera Feeds |
| Media Gallery Item | `ui5-media-gallery-item` | `@ui5/webcomponents-fiori/dist/MediaGalleryItem.js` |              |
| **Carousel**       | `ui5-carousel`           | `@ui5/webcomponents/dist/Carousel.js`               | Image Slider |

### 9.3 Notifications

| Komponente                   | Tag                         | Import                                                       | HA Use Case      |
| ---------------------------- | --------------------------- | ------------------------------------------------------------ | ---------------- |
| **Notification List**        | `ui5-notification-list`     | `@ui5/webcomponents-fiori/dist/NotificationList.js`          | HA Notifications |
| Notification List Item       | `ui5-li-notification`       | `@ui5/webcomponents-fiori/dist/NotificationListItem.js`      |                  |
| Notification List Group Item | `ui5-li-notification-group` | `@ui5/webcomponents-fiori/dist/NotificationListGroupItem.js` |                  |

### 9.4 Trees

| Komponente       | Tag                    | Import                                      | HA Use Case       |
| ---------------- | ---------------------- | ------------------------------------------- | ----------------- |
| **Tree**         | `ui5-tree`             | `@ui5/webcomponents/dist/Tree.js`           | Entity Hierarchie |
| Tree Item        | `ui5-tree-item`        | `@ui5/webcomponents/dist/TreeItem.js`       |                   |
| Tree Item Custom | `ui5-tree-item-custom` | `@ui5/webcomponents/dist/TreeItemCustom.js` |                   |

---

## Empfohlene Implementierungs-Reihenfolge

```
Phase 2 (Kern)     →  List, Table, Card, TabContainer
Phase 3 (Layout)   →  ShellBar, SideNavigation, Timeline
Phase 4 (Input)    →  Input, Select, DatePicker
Phase 5 (Feedback) →  Badge, MessageStrip, Toast
Phase 6 (Dialog)   →  Dialog, Popover, Menu
Phase 7 (Wizard)   →  Wizard
Phase 8 (AI)       →  PromptInput (wenn stabil)
Phase 9 (Extra)    →  Nach Bedarf
```

---

## Import-Beispiel für ui5-loader.ts

```typescript
// Phase 2: Kern-Komponenten
import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/ListItemStandard.js";
import "@ui5/webcomponents/dist/ListItemCustom.js";
import "@ui5/webcomponents/dist/ListItemGroup.js";
import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TableCell.js";
import "@ui5/webcomponents/dist/TableHeaderRow.js";
import "@ui5/webcomponents/dist/Card.js";
import "@ui5/webcomponents/dist/CardHeader.js";
import "@ui5/webcomponents/dist/Panel.js";
import "@ui5/webcomponents/dist/TabContainer.js";
import "@ui5/webcomponents/dist/Tab.js";

// Phase 3: Fiori Layout
import "@ui5/webcomponents-fiori/dist/ShellBar.js";
import "@ui5/webcomponents-fiori/dist/ShellBarItem.js";
import "@ui5/webcomponents-fiori/dist/SideNavigation.js";
import "@ui5/webcomponents-fiori/dist/SideNavigationItem.js";
import "@ui5/webcomponents-fiori/dist/SideNavigationSubItem.js";
import "@ui5/webcomponents-fiori/dist/Bar.js";
import "@ui5/webcomponents-fiori/dist/Timeline.js";
import "@ui5/webcomponents-fiori/dist/TimelineItem.js";

// Phase 4: Inputs
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/Option.js";
import "@ui5/webcomponents/dist/DatePicker.js";
import "@ui5/webcomponents/dist/TimePicker.js";

// Phase 5: Feedback
import "@ui5/webcomponents/dist/Badge.js";
import "@ui5/webcomponents/dist/Tag.js";
import "@ui5/webcomponents/dist/MessageStrip.js";
import "@ui5/webcomponents/dist/Toast.js";
import "@ui5/webcomponents/dist/BusyIndicator.js";
```

---

## Quellen

- [UI5 Web Components Dokumentation](https://sap.github.io/ui5-webcomponents/)
- [GitHub Repository](https://github.com/SAP/ui5-webcomponents)
- [NPM @ui5/webcomponents](https://www.npmjs.com/package/@ui5/webcomponents)
- [NPM @ui5/webcomponents-fiori](https://www.npmjs.com/package/@ui5/webcomponents-fiori)
- [NPM @ui5/webcomponents-ai](https://www.npmjs.com/package/@ui5/webcomponents-ai)
