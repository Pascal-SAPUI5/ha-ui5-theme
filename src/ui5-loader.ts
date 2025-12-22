/**
 * UI5 Web Components Loader
 * Loads and initializes UI5 Web Components packages
 */

// ==================== UI5 Base Assets ====================
import "@ui5/webcomponents/dist/Assets.js";

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

// ==================== Fiori Components (Lazy Loaded) ====================

/**
 * Promise cache for Fiori component loading
 * Prevents race conditions when multiple cards load simultaneously
 */
let fioriLoadPromise: Promise<void> | null = null;

/**
 * Promise cache for AI component loading
 * Prevents race conditions when multiple cards load simultaneously
 */
let aiLoadPromise: Promise<void> | null = null;

/**
 * Ensure Fiori components are loaded
 * Lazy loads @ui5/webcomponents-fiori components on demand
 * Uses promise caching to prevent race conditions
 */
export async function ensureFiori(): Promise<void> {
  // Return existing promise if already loading/loaded
  if (fioriLoadPromise) {
    return fioriLoadPromise;
  }

  // Create and cache the loading promise
  fioriLoadPromise = (async () => {
    try {
      // Import Fiori Assets
      await import("@ui5/webcomponents-fiori/dist/Assets.js");

      // BarcodeScannerDialog
      await import("@ui5/webcomponents-fiori/dist/BarcodeScannerDialog.js");

      // DynamicSideContent
      await import("@ui5/webcomponents-fiori/dist/DynamicSideContent.js");

      // FlexibleColumnLayout
      await import("@ui5/webcomponents-fiori/dist/FlexibleColumnLayout.js");

      // IllustratedMessage
      await import("@ui5/webcomponents-fiori/dist/IllustratedMessage.js");

      // MediaGallery
      await import("@ui5/webcomponents-fiori/dist/MediaGallery.js");
      await import("@ui5/webcomponents-fiori/dist/MediaGalleryItem.js");

      // NotificationList + related components
      await import("@ui5/webcomponents-fiori/dist/NotificationList.js");
      await import("@ui5/webcomponents-fiori/dist/NotificationListItem.js");
      await import("@ui5/webcomponents-fiori/dist/NotificationListGroupItem.js");
      await import("@ui5/webcomponents-fiori/dist/NotificationAction.js");

      // Page
      await import("@ui5/webcomponents-fiori/dist/Page.js");

      // ProductSwitch
      await import("@ui5/webcomponents-fiori/dist/ProductSwitch.js");
      await import("@ui5/webcomponents-fiori/dist/ProductSwitchItem.js");

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
      await import("@ui5/webcomponents-fiori/dist/TimelineGroupItem.js");

      // UploadCollection
      await import("@ui5/webcomponents-fiori/dist/UploadCollection.js");
      await import("@ui5/webcomponents-fiori/dist/UploadCollectionItem.js");

      // UserMenu
      await import("@ui5/webcomponents-fiori/dist/UserMenu.js");
      await import("@ui5/webcomponents-fiori/dist/UserMenuItem.js");
      await import("@ui5/webcomponents-fiori/dist/UserMenuAccount.js");

      // ViewSettingsDialog
      await import("@ui5/webcomponents-fiori/dist/ViewSettingsDialog.js");
      await import("@ui5/webcomponents-fiori/dist/SortItem.js");
      await import("@ui5/webcomponents-fiori/dist/FilterItem.js");
      await import("@ui5/webcomponents-fiori/dist/FilterItemOption.js");

      // Wizard
      await import("@ui5/webcomponents-fiori/dist/Wizard.js");
      await import("@ui5/webcomponents-fiori/dist/WizardStep.js");

      console.log("[ui5-loader] Fiori components loaded");
    } catch (error) {
      // Clear the promise cache on error so retry is possible
      fioriLoadPromise = null;
      console.error("[ui5-loader] Failed to load Fiori components:", error);
      throw error;
    }
  })();

  return fioriLoadPromise;
}

/**
 * Ensure AI components are loaded (optional)
 * Lazy loads @ui5/webcomponents-ai components on demand
 * Uses promise caching to prevent race conditions
 */
export async function ensureAI(): Promise<void> {
  // Return existing promise if already loading/loaded
  if (aiLoadPromise) {
    return aiLoadPromise;
  }

  // Create and cache the loading promise
  aiLoadPromise = (async () => {
    try {
      // Note: @ui5/webcomponents-ai is optional and may not be installed
      await import("@ui5/webcomponents-ai/dist/Assets.js");
      console.log("[ui5-loader] AI components loaded");
    } catch (error) {
      console.warn(
        "[ui5-loader] AI components not available (optional package):",
        error,
      );
      // Don't throw - AI components are optional
    }
  })();

  return aiLoadPromise;
}

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
