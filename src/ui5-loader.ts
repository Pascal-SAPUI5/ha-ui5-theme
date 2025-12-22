/**
 * UI5 Web Components Loader
 * Loads and initializes UI5 Web Components packages
 */

// ==================== UI5 Base Assets ====================
import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents-fiori/dist/Assets.js";

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

// Icons
import "@ui5/webcomponents/dist/Icon.js";

// Common icons used in cards
import "@ui5/webcomponents-icons/dist/AllIcons.js";

// ==================== Additional Components ====================

// Input components (for future cards)
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/Option.js";

// Display components
import "@ui5/webcomponents/dist/Card.js";
import "@ui5/webcomponents/dist/CardHeader.js";
import "@ui5/webcomponents/dist/Tag.js";
import "@ui5/webcomponents/dist/MessageStrip.js";

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

console.log("[ui5-loader] UI5 Web Components loaded");
