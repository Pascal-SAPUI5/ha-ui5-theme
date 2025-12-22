/**
 * Home Assistant HACS Frontend Plugin using UI5 Web Components
 *
 * This module:
 * 1. Imports and registers UI5 Web Components
 * 2. Injects global CSS overrides for Home Assistant theming
 * 3. Optionally mounts a proof-of-concept UI5 element
 *
 * @version 0.1.0
 */

// ==================== UI5 Web Components Imports ====================

// Base Assets (theme definitions)
import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents-fiori/dist/Assets.js";

// Interactive Components
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Switch.js";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/Slider.js";
import "@ui5/webcomponents/dist/ColorPicker.js";

// Display Components
import "@ui5/webcomponents/dist/Card.js";
import "@ui5/webcomponents/dist/CardHeader.js";
import "@ui5/webcomponents/dist/Tag.js";
import "@ui5/webcomponents/dist/MessageStrip.js";
import "@ui5/webcomponents/dist/Icon.js";

// Layout Components
import "@ui5/webcomponents-fiori/dist/Page.js";
import "@ui5/webcomponents-fiori/dist/ShellBar.js";

// Utility Components
import "@ui5/webcomponents/dist/Dialog.js";
import "@ui5/webcomponents/dist/Popover.js";
import "@ui5/webcomponents/dist/BusyIndicator.js";

// Common Icons
import "@ui5/webcomponents-icons/dist/home.js";
import "@ui5/webcomponents-icons/dist/settings.js";
import "@ui5/webcomponents-icons/dist/alert.js";
import "@ui5/webcomponents-icons/dist/message-success.js";
import "@ui5/webcomponents-icons/dist/decline.js";
import "@ui5/webcomponents-icons/dist/refresh.js";

// ==================== Type Definitions ====================

interface UI5ThemeConfig {
  disableProofElement?: boolean;
  disableGlobalStyles?: boolean;
  primaryColor?: string;
  accentColor?: string;
  proofElementPosition?: { x: number; y: number };
  proofElementVisible?: boolean;
}

declare global {
  interface Window {
    haUi5Config?: Partial<UI5ThemeConfig>;
    haUi5ThemeCleanup?: () => void;
  }
}

// ==================== Configuration Management ====================

const CONFIG_KEY = "ha-ui5-theme-config";
const DEFAULT_CONFIG: UI5ThemeConfig = {
  disableProofElement: false,
  disableGlobalStyles: false,
  primaryColor: "#0854a0",
  accentColor: "#d04343",
  proofElementPosition: { x: 20, y: 20 },
  proofElementVisible: true,
};

function getConfig<K extends keyof UI5ThemeConfig>(key: K): UI5ThemeConfig[K] {
  try {
    // Priority 1: window.haUi5Config
    if (window.haUi5Config && key in window.haUi5Config) {
      return window.haUi5Config[key] as UI5ThemeConfig[K];
    }

    // Priority 2: localStorage
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const config = JSON.parse(stored) as Partial<UI5ThemeConfig>;
      if (key in config) {
        return config[key] as UI5ThemeConfig[K];
      }
    }
  } catch (error) {
    console.warn("[ha-ui5-theme] Config read failed:", error);
  }

  // Priority 3: defaults
  return DEFAULT_CONFIG[key];
}

function setConfig<K extends keyof UI5ThemeConfig>(
  key: K,
  value: UI5ThemeConfig[K],
): void {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    const config = stored ? JSON.parse(stored) : {};
    config[key] = value;
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn("[ha-ui5-theme] Config write failed:", error);
  }
}

// ==================== Lifecycle Management ====================

let cleanupFunctions: Array<() => void> = [];

function addCleanup(fn: () => void): void {
  cleanupFunctions.push(fn);
}

function cleanup(): void {
  cleanupFunctions.forEach((fn) => {
    try {
      fn();
    } catch (error) {
      console.error("[ha-ui5-theme] Cleanup failed:", error);
    }
  });
  cleanupFunctions = [];
}

// ==================== Error Handling Utilities ====================

function safeOperation(fn: () => void, context: string): void {
  try {
    fn();
  } catch (error) {
    console.error(`[ha-ui5-theme] ${context} failed:`, error);
  }
}

function waitForDOM(timeout = 5000): Promise<void> {
  return new Promise((resolve) => {
    if (document.body) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      console.warn("[ha-ui5-theme] DOM ready timeout");
      resolve();
    }, timeout);

    const handler = () => {
      clearTimeout(timeoutId);
      resolve();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", handler, { once: true });
    } else {
      handler();
    }
  });
}

// ==================== Global CSS Injection ====================

/**
 * Inject global CSS overrides
 * Uses CSS variables to influence Home Assistant UI broadly
 */
function injectGlobalStyles(): void {
  // Check if disabled via config
  if (getConfig("disableGlobalStyles")) {
    console.log("[ha-ui5-theme] Global styles disabled by config");
    return;
  }

  const styleId = "ha-ui5-theme-global-styles";

  if (document.getElementById(styleId)) {
    console.log("[ha-ui5-theme] Global styles already injected");
    return;
  }

  const primaryColor = getConfig("primaryColor");
  const accentColor = getConfig("accentColor");

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    /* ===== UI5 Theme Integration for Home Assistant ===== */

    :root {
      /* UI5 Color Palette - Light Mode */
      --ui5-primary-color: ${primaryColor};
      --ui5-accent-color: ${accentColor};
      --ui5-success-color: #107e3e;
      --ui5-warning-color: #e9730c;
      --ui5-error-color: #b00;
      --ui5-info-color: #0a6ed1;

      /* UI5 Background Colors */
      --ui5-background-color: #fafafa;
      --ui5-surface-color: #ffffff;
      --ui5-card-background: #ffffff;

      /* UI5 Text Colors */
      --ui5-text-primary: #32363a;
      --ui5-text-secondary: #6a6d70;
      --ui5-text-disabled: #8c8c8c;

      /* UI5 Border & Shadow */
      --ui5-border-color: #d9d9d9;
      --ui5-shadow: 0 0 0.125rem 0 rgba(0, 0, 0, 0.1), 0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.1);

      /* HA Overrides (commented by default - uncomment to apply) */
      /* --primary-color: var(--ui5-primary-color); */
      /* --accent-color: var(--ui5-accent-color); */
      /* --card-background-color: var(--ui5-card-background); */
    }

    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      :root {
        --ui5-primary-color: #7ab7ff;
        --ui5-accent-color: #ff6b6b;
        --ui5-success-color: #30bc5b;
        --ui5-warning-color: #ff8c1a;
        --ui5-error-color: #ff5050;
        --ui5-info-color: #5bc5ff;

        --ui5-background-color: #1d1d1d;
        --ui5-surface-color: #2a2a2a;
        --ui5-card-background: #2a2a2a;

        --ui5-text-primary: #e8e8e8;
        --ui5-text-secondary: #b3b3b3;
        --ui5-text-disabled: #737373;

        --ui5-border-color: #3d3d3d;
        --ui5-shadow: 0 0 0.125rem 0 rgba(0, 0, 0, 0.3), 0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.5);
      }
    }

    /* Ensure all UI5 Web Components render properly */
    ui5-button,
    ui5-switch,
    ui5-input,
    ui5-select,
    ui5-slider,
    ui5-color-picker,
    ui5-card,
    ui5-tag,
    ui5-message-strip,
    ui5-icon,
    ui5-page,
    ui5-shellbar,
    ui5-dialog,
    ui5-popover,
    ui5-busy-indicator {
      display: inline-block;
      vertical-align: middle;
    }

    /* Card should be block-level */
    ui5-card,
    ui5-page {
      display: block;
    }

    /* Prevent layout breaks */
    ui5-button {
      max-width: 100%;
      box-sizing: border-box;
    }

    /* Smooth transitions */
    ui5-button,
    ui5-switch,
    ui5-tag {
      transition: all 0.2s ease-in-out;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      ui5-card {
        margin: 0.5rem 0;
      }
    }
  `;

  document.head.appendChild(style);
  console.log("[ha-ui5-theme] Global styles injected");
}

// ==================== Proof Element ====================

/**
 * Mount an enhanced proof-of-concept UI5 element
 * Demonstrates UI5 Web Components working in Home Assistant
 */
function mountProofElement(): void {
  try {
    // Check if disabled via config
    if (getConfig("disableProofElement")) {
      console.log("[ha-ui5-theme] Proof element disabled by config");
      return;
    }

    // Check if already mounted
    const existingProof = document.getElementById("ha-ui5-proof");
    if (existingProof) {
      console.log("[ha-ui5-theme] Proof element already mounted");
      return;
    }

    // Check if body exists
    if (!document.body) {
      console.warn("[ha-ui5-theme] document.body not available");
      return;
    }

    // Create card container
    const card = document.createElement("ui5-card");
    card.id = "ha-ui5-proof";

    // Restore position from config or use defaults
    const position = getConfig("proofElementPosition");
    const visible = getConfig("proofElementVisible");

    card.style.cssText = `
      position: fixed;
      bottom: ${position?.y || 20}px;
      right: ${position?.x || 20}px;
      z-index: 9999;
      width: 280px;
      cursor: move;
      display: ${visible ? "block" : "none"};
      box-shadow: var(--ui5-shadow, 0 2px 8px rgba(0, 0, 0, 0.15));
    `;

    // Create card header
    const header = document.createElement("div");
    header.setAttribute("slot", "header");
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--ui5-surface-color, #fff);
      border-bottom: 1px solid var(--ui5-border-color, #ddd);
    `;

    const headerTitle = document.createElement("div");
    headerTitle.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: var(--ui5-text-primary, #333);
    `;

    const icon = document.createElement("ui5-icon");
    icon.setAttribute("name", "home");
    headerTitle.appendChild(icon);
    headerTitle.appendChild(document.createTextNode("UI5 Active"));

    const closeBtn = document.createElement("ui5-button");
    closeBtn.setAttribute("design", "Transparent");
    closeBtn.setAttribute("icon", "decline");
    closeBtn.setAttribute("tooltip", "Close");
    closeBtn.addEventListener("click", () => {
      card.style.display = "none";
      setConfig("proofElementVisible", false);
    });

    header.appendChild(headerTitle);
    header.appendChild(closeBtn);
    card.appendChild(header);

    // Create card content
    const content = document.createElement("div");
    content.style.cssText = `
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    // Status message strip
    const statusStrip = document.createElement("ui5-message-strip");
    statusStrip.setAttribute("design", "Positive");
    statusStrip.textContent = "UI5 Web Components loaded successfully!";
    content.appendChild(statusStrip);

    // Demo components row
    const demoRow = document.createElement("div");
    demoRow.style.cssText = "display: flex; gap: 8px; align-items: center;";

    const demoButton = document.createElement("ui5-button");
    demoButton.setAttribute("design", "Emphasized");
    demoButton.setAttribute("icon", "message-success");
    demoButton.textContent = "Test";
    demoButton.addEventListener("click", () => {
      alert("UI5 Web Components are working in Home Assistant!");
    });

    const demoTag = document.createElement("ui5-tag");
    demoTag.setAttribute("color-scheme", "8");
    demoTag.textContent = "v0.1.0";

    demoRow.appendChild(demoButton);
    demoRow.appendChild(demoTag);
    content.appendChild(demoRow);

    // Toggle switch demo
    const switchRow = document.createElement("div");
    switchRow.style.cssText =
      "display: flex; align-items: center; gap: 8px; font-size: 14px;";

    const demoSwitch = document.createElement("ui5-switch");
    demoSwitch.setAttribute("checked", "");
    demoSwitch.addEventListener("change", (e: Event) => {
      const checked = (e.target as HTMLElement & { checked: boolean }).checked;
      statusStrip.setAttribute("design", checked ? "Positive" : "Information");
      statusStrip.textContent = checked
        ? "UI5 Web Components loaded successfully!"
        : "Components active but toggle is off";
    });

    switchRow.appendChild(demoSwitch);
    switchRow.appendChild(document.createTextNode("Enable Theme"));
    content.appendChild(switchRow);

    card.appendChild(content);

    // Make draggable
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;

    const dragStart = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName.toLowerCase().startsWith("ui5-")) {
        return; // Don't drag when clicking UI5 components
      }
      isDragging = true;
      initialX = e.clientX - currentX;
      initialY = e.clientY - currentY;
      card.style.cursor = "grabbing";
    };

    const drag = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      const maxX = window.innerWidth - card.offsetWidth;
      const maxY = window.innerHeight - card.offsetHeight;

      currentX = Math.max(0, Math.min(currentX, maxX));
      currentY = Math.max(0, Math.min(currentY, maxY));

      card.style.right = "auto";
      card.style.bottom = "auto";
      card.style.left = currentX + "px";
      card.style.top = currentY + "px";
    };

    const dragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      card.style.cursor = "move";

      // Save position
      const rect = card.getBoundingClientRect();
      setConfig("proofElementPosition", {
        x: window.innerWidth - rect.right,
        y: window.innerHeight - rect.bottom,
      });
    };

    header.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);

    addCleanup(() => {
      header.removeEventListener("mousedown", dragStart);
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", dragEnd);
    });

    // Keyboard shortcut: Ctrl+Shift+U to toggle
    const keyboardHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "U") {
        e.preventDefault();
        const isVisible = card.style.display !== "none";
        card.style.display = isVisible ? "none" : "block";
        setConfig("proofElementVisible", !isVisible);
      }
    };

    document.addEventListener("keydown", keyboardHandler);
    addCleanup(() => {
      document.removeEventListener("keydown", keyboardHandler);
    });

    // Mount to DOM
    document.body.appendChild(card);
    console.log(
      "[ha-ui5-theme] Proof element mounted (Ctrl+Shift+U to toggle)",
    );
  } catch (error) {
    console.error("[ha-ui5-theme] Proof element mount failed:", error);
    // Fail silently - don't break HA
  }
}

// ==================== Initialization ====================

let initialized = false;

/**
 * Initialize the plugin with improved error handling and lifecycle management
 */
async function init(): Promise<void> {
  // Prevent double initialization
  if (initialized) {
    console.log("[ha-ui5-theme] Already initialized, skipping");
    return;
  }

  console.log("[ha-ui5-theme] v0.1.0 initializing...");

  try {
    // Inject global styles
    safeOperation(() => injectGlobalStyles(), "Global styles injection");

    // Wait for DOM to be ready with timeout
    await waitForDOM(5000);

    // Mount proof element
    safeOperation(() => mountProofElement(), "Proof element mounting");

    // Mark as initialized
    initialized = true;

    // Dispatch ready event for other scripts
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("ha-ui5-theme-ready", {
          detail: { version: "0.1.0" },
        }),
      );
    }

    console.log("[ha-ui5-theme] Initialization complete");
  } catch (error) {
    console.error("[ha-ui5-theme] Initialization failed:", error);
    // Don't rethrow - fail gracefully
  }
}

// Expose cleanup for debugging/testing
if (typeof window !== "undefined") {
  window.haUi5ThemeCleanup = cleanup;
}

// Auto-initialize when module loads
init();
