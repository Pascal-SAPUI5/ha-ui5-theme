/**
 * UI5 Web Components for Home Assistant
 * Lovelace custom cards using SAP UI5 Web Components
 *
 * @version 0.1.0
 */

// Import UI5 Web Components loader
import "./ui5-loader";
import { initUI5Theme } from "./ui5-loader";

// Import all cards
import "./cards/ui5-button-card";
import "./cards/ui5-switch-card";
import "./cards/ui5-slider-card";
import "./cards/ui5-progress-card";

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
function init(): void {
  console.log("[ui5-cards] UI5 Web Components Cards v0.1.0 initializing...");

  try {
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
