/**
 * UI5 Web Components for Home Assistant
 * Lovelace custom cards using SAP UI5 Web Components
 *
 * @version 0.1.0
 */

// Import UI5 Web Components loader
import "./ui5-loader";
import { initUI5Theme, waitForUI5Ready } from "./ui5-loader";

// Import all components
import "./components/Button/Button";
import "./components/Switch/Switch";
import "./components/Slider/Slider";
import "./components/Progress/Progress";
import "./components/ShellBar/ShellBar";
import "./components/SideNavigation/SideNavigation";
import "./components/Timeline/Timeline";
import "./components/Wizard/Wizard";
import "./components/NotificationList/NotificationList";
import "./components/Page/Page";
import "./components/Element/Element";
import "./components/List/List";
import "./components/Table/Table";
import "./components/Card/Card";
import "./components/Panel/Panel";
import "./components/Tabs/Tabs";
import "./components/Bar/Bar";
import "./components/Input/Input";
import "./components/Select/Select";
import "./components/DatePicker/DatePicker";
import "./components/TimePicker/TimePicker";
import "./components/Badge/Badge";
import "./components/MessageStrip/MessageStrip";
import "./components/Toast/Toast";

// Card registration information
const CARD_DEFINITIONS = [
  {
    type: "custom:ui5-button-card",
    name: "UI5 Button Card",
    description: "A customizable button card using UI5 Button component",
    preview: true,
  },
  {
    type: "custom:ui5-switch-card",
    name: "UI5 Switch Card",
    description: "A toggle switch card using UI5 Switch component",
    preview: true,
  },
  {
    type: "custom:ui5-slider-card",
    name: "UI5 Slider Card",
    description: "A slider control card using UI5 Slider component",
    preview: true,
  },
  {
    type: "custom:ui5-progress-card",
    name: "UI5 Progress Card",
    description:
      "A progress indicator card using UI5 ProgressIndicator component",
    preview: true,
  },
  {
    type: "custom:ui5-shellbar-card",
    name: "UI5 ShellBar Card",
    description: "A shell bar card using UI5 Fiori ShellBar component",
    preview: true,
  },
  {
    type: "custom:ui5-sidenav-card",
    name: "UI5 SideNavigation Card",
    description:
      "A side navigation card using UI5 Fiori SideNavigation component",
    preview: true,
  },
  {
    type: "custom:ui5-timeline-card",
    name: "UI5 Timeline Card",
    description:
      "A timeline card showing entity states or custom events using UI5 Fiori Timeline component",
    preview: true,
  },
  {
    type: "custom:ui5-wizard-card",
    name: "UI5 Wizard Card",
    description: "A wizard card using UI5 Fiori Wizard component",
    preview: true,
  },
  {
    type: "custom:ui5-notification-list-card",
    name: "UI5 NotificationList Card",
    description:
      "A notification list card using UI5 Fiori NotificationList component",
    preview: true,
  },
  {
    type: "custom:ui5-page-card",
    name: "UI5 Page Card",
    description: "A page card using UI5 Fiori Page component",
    preview: true,
  },
  {
    type: "custom:ui5-element-card",
    name: "UI5 Element Card",
    description: "A generic card that can render any UI5 element",
    preview: true,
  },
  {
    type: "custom:ui5-list-card",
    name: "UI5 List Card",
    description: "Display entities in a list with state indicators and grouping",
    preview: true,
  },
  {
    type: "custom:ui5-table-card",
    name: "UI5 Table Card",
    description: "Display entities in a table with configurable columns",
    preview: true,
  },
  {
    type: "custom:ui5-card-card",
    name: "UI5 Card Card",
    description: "A styled card container with header and entity display",
    preview: true,
  },
  {
    type: "custom:ui5-panel-card",
    name: "UI5 Panel Card",
    description: "A collapsible panel for grouping entities",
    preview: true,
  },
  {
    type: "custom:ui5-tabs-card",
    name: "UI5 Tabs Card",
    description: "Tabbed container for organizing entities by category",
    preview: true,
  },
  {
    type: "custom:ui5-bar-card",
    name: "UI5 Bar Card",
    description: "A header/footer bar for layout and status display",
    preview: true,
  },
  {
    type: "custom:ui5-input-card",
    name: "UI5 Input Card",
    description: "A text input card for entering values",
    preview: true,
  },
  {
    type: "custom:ui5-select-card",
    name: "UI5 Select Card",
    description: "A dropdown select card for choosing options",
    preview: true,
  },
  {
    type: "custom:ui5-datepicker-card",
    name: "UI5 DatePicker Card",
    description: "A date picker card for selecting dates",
    preview: true,
  },
  {
    type: "custom:ui5-timepicker-card",
    name: "UI5 TimePicker Card",
    description: "A time picker card for selecting times",
    preview: true,
  },
  {
    type: "custom:ui5-badge-card",
    name: "UI5 Badge Card",
    description: "A badge/tag for displaying status indicators",
    preview: true,
  },
  {
    type: "custom:ui5-messagestrip-card",
    name: "UI5 MessageStrip Card",
    description: "A message strip for alerts and notifications",
    preview: true,
  },
  {
    type: "custom:ui5-toast-card",
    name: "UI5 Toast Card",
    description: "A toast notification triggered by entity changes",
    preview: true,
  },
];

/**
 * Register cards in the card picker
 */
function registerCards(): void {
  if (!window.customCards) {
    window.customCards = [];
  }

  // Register each card
  CARD_DEFINITIONS.forEach((card) => {
    // Check if already registered
    const existing = window.customCards!.find((c) => c.type === card.type);
    if (!existing) {
      window.customCards!.push(card);
      console.log(`[ui5-cards] Registered: ${card.type}`);
    }
  });

  console.log(
    `[ui5-cards] ${CARD_DEFINITIONS.length} cards registered in picker`,
  );
}

/**
 * Initialize the plugin
 */
async function init(): Promise<void> {
  console.log("[ui5-cards] UI5 Web Components Cards v0.1.0 initializing...");

  try {
    // Wait for UI5 Web Components to be ready
    await waitForUI5Ready();

    // Initialize UI5 theme (detect dark mode)
    const isDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    initUI5Theme(isDark);

    // Register cards in card picker
    registerCards();

    // Listen for theme changes
    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          initUI5Theme(e.matches);
        });
    }

    // Dispatch ready event
    window.dispatchEvent(
      new CustomEvent("ui5-cards-ready", {
        detail: { version: "0.1.0" },
      }),
    );

    console.log("[ui5-cards] Initialization complete");
  } catch (error) {
    console.error("[ui5-cards] Initialization failed:", error);
  }
}

// Auto-initialize when module loads
init();

// Export for testing/debugging
export { CARD_DEFINITIONS };
