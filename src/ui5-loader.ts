/**
 * UI5 Web Components Loader
 * Loads and initializes UI5 Web Components packages
 *
 * OPTIMIZED: Only loads components that are actually used
 * Expected bundle size: ~300-500 KB (instead of 18 MB)
 */

// ==================== Core UI5 Components for Cards ====================

// Button components
import "@ui5/webcomponents/dist/Button.js";

// Switch/Toggle components
import "@ui5/webcomponents/dist/Switch.js";

// Slider components
import "@ui5/webcomponents/dist/Slider.js";

// Progress indicators
import "@ui5/webcomponents/dist/ProgressIndicator.js";
import "@ui5/webcomponents/dist/BusyIndicator.js";

// Icons - ONLY import specific icons you need
import "@ui5/webcomponents/dist/Icon.js";

// Common icons used in Home Assistant cards
// Add more as needed, but NEVER use AllIcons.js
import "@ui5/webcomponents-icons/dist/home.js";
import "@ui5/webcomponents-icons/dist/lightbulb.js";
import "@ui5/webcomponents-icons/dist/temperature.js";
import "@ui5/webcomponents-icons/dist/heating-cooling.js";
import "@ui5/webcomponents-icons/dist/settings.js";
import "@ui5/webcomponents-icons/dist/synchronize.js";
import "@ui5/webcomponents-icons/dist/refresh.js";
import "@ui5/webcomponents-icons/dist/error.js";
import "@ui5/webcomponents-icons/dist/warning.js";
import "@ui5/webcomponents-icons/dist/information.js";
import "@ui5/webcomponents-icons/dist/accept.js";
import "@ui5/webcomponents-icons/dist/decline.js";
import "@ui5/webcomponents-icons/dist/add.js";
import "@ui5/webcomponents-icons/dist/less.js";
import "@ui5/webcomponents-icons/dist/navigation-right-arrow.js";
import "@ui5/webcomponents-icons/dist/navigation-left-arrow.js";
import "@ui5/webcomponents-icons/dist/overflow.js";
import "@ui5/webcomponents-icons/dist/action.js";

// ==================== Additional Components (used by cards) ====================

// Input components
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/Option.js";
import "@ui5/webcomponents/dist/DatePicker.js";
import "@ui5/webcomponents/dist/TimePicker.js";

// Display components
import "@ui5/webcomponents/dist/Card.js";
import "@ui5/webcomponents/dist/CardHeader.js";
import "@ui5/webcomponents/dist/Tag.js";
import "@ui5/webcomponents/dist/MessageStrip.js";
import "@ui5/webcomponents/dist/Toast.js";

// Dialog and Popover components
import "@ui5/webcomponents/dist/Dialog.js";
import "@ui5/webcomponents/dist/Popover.js";

// Menu components
import "@ui5/webcomponents/dist/Menu.js";
import "@ui5/webcomponents/dist/MenuItem.js";

// List components
import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/ListItemStandard.js";
import "@ui5/webcomponents/dist/ListItemCustom.js";
import "@ui5/webcomponents/dist/ListItemGroup.js";

// Table components
import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableHeaderRow.js";
import "@ui5/webcomponents/dist/TableHeaderCell.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TableCell.js";

// Panel component
import "@ui5/webcomponents/dist/Panel.js";

// Tab components
import "@ui5/webcomponents/dist/TabContainer.js";
import "@ui5/webcomponents/dist/Tab.js";
import "@ui5/webcomponents/dist/TabSeparator.js";

// Bar component (header/footer bar)
import "@ui5/webcomponents/dist/Bar.js";

// ==================== AI Components (Experimental) ====================

import "@ui5/webcomponents-ai/dist/PromptInput.js";
import "@ui5/webcomponents-ai/dist/TextArea.js";

// ==================== Theme Configuration ====================

import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";

/**
 * Available UI5 themes
 */
export enum UI5Theme {
  SAP_HORIZON = "sap_horizon",
  SAP_FIORI_3 = "sap_fiori_3",
  SAP_FIORI_3_DARK = "sap_fiori_3_dark",
  SAP_HORIZON_DARK = "sap_horizon_dark",
}

/**
 * Initialize UI5 theme based on Home Assistant theme
 */
export function initUI5Theme(isDark: boolean = false): void {
  try {
    const theme = isDark ? UI5Theme.SAP_HORIZON_DARK : UI5Theme.SAP_HORIZON;
    setTheme(theme);
    console.log(`[ui5-loader] Theme set to: ${theme}`);
  } catch (error) {
    console.error("[ui5-loader] Failed to set theme:", error);
  }
}

/**
 * Check if UI5 Web Components are loaded
 */
export function isUI5Loaded(): boolean {
  return typeof customElements.get("ui5-button") !== "undefined";
}

/**
 * Wait for UI5 Web Components to be ready
 */
export function waitForUI5Ready(timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isUI5Loaded()) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isUI5Loaded()) {
        clearInterval(checkInterval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error("UI5 Web Components loading timeout"));
      }
    }, 100);
  });
}

// ==================== Fiori Components (Lazy Loaded) ====================

/**
 * Promise cache for Fiori component loading
 */
let fioriLoadPromise: Promise<void> | null = null;

/**
 * Ensure Fiori components are loaded
 * Call this ONLY when a Fiori card is actually used
 */
export async function ensureFiori(): Promise<void> {
  if (fioriLoadPromise) {
    return fioriLoadPromise;
  }

  fioriLoadPromise = (async () => {
    try {
      // Only load what's actually needed
      // ShellBar
      await import("@ui5/webcomponents-fiori/dist/ShellBar.js");
      await import("@ui5/webcomponents-fiori/dist/ShellBarItem.js");

      // SideNavigation
      await import("@ui5/webcomponents-fiori/dist/SideNavigation.js");
      await import("@ui5/webcomponents-fiori/dist/SideNavigationItem.js");
      await import("@ui5/webcomponents-fiori/dist/SideNavigationSubItem.js");

      // Timeline
      await import("@ui5/webcomponents-fiori/dist/Timeline.js");
      await import("@ui5/webcomponents-fiori/dist/TimelineItem.js");

      // Wizard
      await import("@ui5/webcomponents-fiori/dist/Wizard.js");
      await import("@ui5/webcomponents-fiori/dist/WizardStep.js");

      // Page
      await import("@ui5/webcomponents-fiori/dist/Page.js");

      // NotificationList
      await import("@ui5/webcomponents-fiori/dist/NotificationList.js");
      await import("@ui5/webcomponents-fiori/dist/NotificationListItem.js");

      console.log("[ui5-loader] Fiori components loaded");
    } catch (error) {
      fioriLoadPromise = null;
      console.error("[ui5-loader] Failed to load Fiori components:", error);
      throw error;
    }
  })();

  return fioriLoadPromise;
}

/**
 * Load specific Fiori component on demand
 * More granular than ensureFiori() for better code splitting
 */
export async function loadFioriComponent(
  component:
    | "shellbar"
    | "sidenav"
    | "timeline"
    | "wizard"
    | "page"
    | "notifications",
): Promise<void> {
  switch (component) {
    case "shellbar":
      await import("@ui5/webcomponents-fiori/dist/ShellBar.js");
      await import("@ui5/webcomponents-fiori/dist/ShellBarItem.js");
      break;
    case "sidenav":
      await import("@ui5/webcomponents-fiori/dist/SideNavigation.js");
      await import("@ui5/webcomponents-fiori/dist/SideNavigationItem.js");
      await import("@ui5/webcomponents-fiori/dist/SideNavigationSubItem.js");
      break;
    case "timeline":
      await import("@ui5/webcomponents-fiori/dist/Timeline.js");
      await import("@ui5/webcomponents-fiori/dist/TimelineItem.js");
      break;
    case "wizard":
      await import("@ui5/webcomponents-fiori/dist/Wizard.js");
      await import("@ui5/webcomponents-fiori/dist/WizardStep.js");
      break;
    case "page":
      await import("@ui5/webcomponents-fiori/dist/Page.js");
      break;
    case "notifications":
      await import("@ui5/webcomponents-fiori/dist/NotificationList.js");
      await import("@ui5/webcomponents-fiori/dist/NotificationListItem.js");
      break;
  }
}

console.log("[ui5-loader] UI5 Web Components loaded");
