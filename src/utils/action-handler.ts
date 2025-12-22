/**
 * Action Handler
 * Handles Home Assistant actions (tap, hold, double tap)
 */

import type {
  HomeAssistant,
  ActionConfig,
  CallServiceActionConfig,
  NavigateActionConfig,
  UrlActionConfig,
} from "../types";

/**
 * Handle an action configuration
 */
export async function handleAction(
  node: HTMLElement,
  hass: HomeAssistant,
  config: ActionConfig,
  entityId?: string,
): Promise<void> {
  if (!config || !hass) {
    return;
  }

  // Handle confirmation if specified
  if (config.confirmation) {
    const confirmed = await confirmAction(config.confirmation.text);
    if (!confirmed) {
      return;
    }
  }

  try {
    switch (config.action) {
      case "none":
        break;

      case "toggle":
        await handleToggleAction(hass, entityId);
        break;

      case "more-info":
        handleMoreInfoAction(entityId);
        break;

      case "call-service":
        await handleCallServiceAction(
          hass,
          config as CallServiceActionConfig,
          entityId,
        );
        break;

      case "navigate":
        handleNavigateAction(config as NavigateActionConfig);
        break;

      case "url":
        handleUrlAction(config as UrlActionConfig);
        break;

      case "fire-dom-event":
        handleFireDomEventAction(node);
        break;

      default: {
        // Exhaustiveness check - this should never happen with proper typing
        const _exhaustiveCheck: never = config;
        console.warn(`[action-handler] Unknown action:`, _exhaustiveCheck);
        break;
      }
    }
  } catch (error) {
    console.error("[action-handler] Action failed:", error);
  }
}

/**
 * Confirm an action with the user
 */
async function confirmAction(text?: string): Promise<boolean> {
  const message = text || "Are you sure you want to perform this action?";
  return confirm(message);
}

/**
 * Handle toggle action
 */
async function handleToggleAction(
  hass: HomeAssistant,
  entityId?: string,
): Promise<void> {
  if (!entityId) {
    console.warn("[action-handler] Toggle action requires entity_id");
    return;
  }

  const [domain] = entityId.split(".");
  await hass.callService(domain, "toggle", { entity_id: entityId });
}

/**
 * Handle more-info action
 */
function handleMoreInfoAction(entityId?: string): void {
  if (!entityId) {
    console.warn("[action-handler] More-info action requires entity_id");
    return;
  }

  const event = new CustomEvent("hass-more-info", {
    detail: { entityId },
    bubbles: true,
    composed: true,
  });

  window.dispatchEvent(event);
}

/**
 * Handle call-service action
 */
async function handleCallServiceAction(
  hass: HomeAssistant,
  config: CallServiceActionConfig,
  entityId?: string,
): Promise<void> {
  if (!config.service) {
    console.warn("[action-handler] Call-service action requires service");
    return;
  }

  const [domain, service] = config.service.split(".");
  if (!domain || !service) {
    console.warn(`[action-handler] Invalid service format: ${config.service}`);
    return;
  }

  // Merge service_data with entity_id if provided
  const serviceData = { ...config.service_data };
  if (entityId && !serviceData.entity_id) {
    serviceData.entity_id = entityId;
  }

  await hass.callService(domain, service, serviceData, config.target);
}

/**
 * Handle navigate action
 */
function handleNavigateAction(config: NavigateActionConfig): void {
  if (!config.navigation_path) {
    console.warn("[action-handler] Navigate action requires navigation_path");
    return;
  }

  history.pushState(null, "", config.navigation_path);
  const event = new CustomEvent("location-changed", {
    detail: { replace: false },
    bubbles: true,
    composed: true,
  });
  window.dispatchEvent(event);
}

/**
 * Handle URL action
 */
function handleUrlAction(config: UrlActionConfig): void {
  if (!config.url_path) {
    console.warn("[action-handler] URL action requires url_path");
    return;
  }

  // Validate URL protocol for security
  if (!isUrlSafe(config.url_path)) {
    console.warn(
      `[action-handler] Blocked potentially unsafe URL: ${config.url_path}`,
    );
    return;
  }

  // Open URL in new tab with security attributes
  window.open(config.url_path, "_blank", "noopener,noreferrer");
}

/**
 * Check if URL is safe to open
 * Only allow http, https, mailto, and tel protocols
 */
function isUrlSafe(url: string): boolean {
  try {
    // Handle relative URLs (treat as safe - they're relative to current origin)
    if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
      return true;
    }

    // Parse URL to check protocol
    const urlObj = new URL(url, window.location.href);
    const protocol = urlObj.protocol.toLowerCase();

    // Allow only safe protocols
    const safeProtocols = ["http:", "https:", "mailto:", "tel:"];
    return safeProtocols.includes(protocol);
  } catch (error) {
    // Invalid URL format
    console.warn(`[action-handler] Invalid URL format: ${url}`);
    return false;
  }
}

/**
 * Handle fire-dom-event action
 */
function handleFireDomEventAction(node: HTMLElement): void {
  const event = new CustomEvent("ll-custom", {
    detail: {},
    bubbles: true,
    composed: true,
  });
  node.dispatchEvent(event);
}

/**
 * Create action handler directive for lit-html
 * This can be used in card templates
 */
export function actionHandler() {
  return (element: HTMLElement): void => {
    // Add visual feedback classes
    element.style.cursor = "pointer";
    element.style.userSelect = "none";

    // Prevent text selection on long press
    element.addEventListener("selectstart", (e) => {
      if (e.target === element) {
        e.preventDefault();
      }
    });
  };
}

/**
 * Get default action config for a given action type
 */
export function getDefaultActionConfig(
  actionType: "tap" | "hold" | "double_tap",
  _entityId?: string,
): ActionConfig {
  switch (actionType) {
    case "tap":
      return { action: "more-info" };
    case "hold":
      return { action: "more-info" };
    case "double_tap":
      return { action: "none" };
    default:
      return { action: "none" };
  }
}
