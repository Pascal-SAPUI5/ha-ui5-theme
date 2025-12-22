/**
 * Home Assistant Helper Functions
 * Utility functions for working with Home Assistant entities and states
 */

import type { HomeAssistant, HassEntity } from "../types";

/**
 * Get entity object from Home Assistant
 */
export function getEntity(
  hass: HomeAssistant,
  entityId: string,
): HassEntity | undefined {
  return hass.states[entityId];
}

/**
 * Get entity state value
 */
export function getEntityState(hass: HomeAssistant, entityId: string): string {
  const entity = getEntity(hass, entityId);
  return entity?.state || "unavailable";
}

/**
 * Get entity attribute value
 */
export function getEntityAttribute(
  hass: HomeAssistant,
  entityId: string,
  attribute: string,
): any {
  const entity = getEntity(hass, entityId);
  return entity?.attributes[attribute];
}

/**
 * Get entity friendly name
 */
export function getEntityName(hass: HomeAssistant, entityId: string): string {
  const entity = getEntity(hass, entityId);
  return entity?.attributes.friendly_name || entityId;
}

/**
 * Get entity icon
 */
export function getEntityIcon(
  hass: HomeAssistant,
  entityId: string,
): string | undefined {
  const entity = getEntity(hass, entityId);
  return entity?.attributes.icon;
}

/**
 * Check if entity is available
 */
export function isEntityAvailable(
  hass: HomeAssistant,
  entityId: string,
): boolean {
  const state = getEntityState(hass, entityId);
  return state !== "unavailable" && state !== "unknown";
}

/**
 * Check if entity state is "on"
 */
export function isEntityOn(hass: HomeAssistant, entityId: string): boolean {
  const state = getEntityState(hass, entityId);
  return state === "on";
}

/**
 * Format entity state for display
 */
export function formatEntityState(
  hass: HomeAssistant,
  entityId: string,
): string {
  const entity = getEntity(hass, entityId);
  if (!entity) {
    return "unavailable";
  }

  const state = entity.state;
  const unit = entity.attributes.unit_of_measurement;

  // If there's a unit, append it
  if (unit) {
    return `${state} ${unit}`;
  }

  // Format on/off states
  if (state === "on") {
    return "On";
  }
  if (state === "off") {
    return "Off";
  }

  // Capitalize first letter for other states
  return state.charAt(0).toUpperCase() + state.slice(1);
}

/**
 * Convert state to number (for sliders, progress bars, etc.)
 */
export function stateToNumber(
  hass: HomeAssistant,
  entityId: string,
  attribute?: string,
): number {
  let value: any;

  if (attribute) {
    value = getEntityAttribute(hass, entityId, attribute);
  } else {
    value = getEntityState(hass, entityId);
  }

  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Calculate decimal precision from step value
 * @param step The step value (e.g., 0.1, 0.01, 1)
 * @returns Number of decimal places needed (capped at 10)
 */
export function calculatePrecisionFromStep(step: number): number {
  // Handle edge cases: zero, negative, or very large steps
  if (step <= 0) return 0; // Safe default for invalid input
  if (step >= 1) return 0; // No decimals needed for steps >= 1

  // Calculate precision and cap at reasonable maximum
  const precision = Math.max(0, -Math.floor(Math.log10(step)));
  return Math.min(precision, 10); // Cap at 10 decimal places
}

/**
 * Format a number for display using locale-aware formatting
 * @param value The number to format
 * @param options Formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
  },
): string {
  // Defensive: check for navigator existence (e.g., SSR, tests)
  const locale =
    options?.locale ||
    (typeof navigator !== "undefined" ? navigator.language : null) ||
    "en-US";

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value);
}

/**
 * Format entity value with unit of measurement
 * @param hass Home Assistant instance
 * @param entityId Entity ID
 * @param value Value to format (optional, will use entity state if not provided)
 * @param precision Number of decimal places (optional)
 * @returns Formatted value with unit
 */
export function formatEntityValue(
  hass: HomeAssistant,
  entityId: string,
  value?: number,
  precision?: number,
): string {
  const entity = getEntity(hass, entityId);

  if (!entity) {
    return "unavailable";
  }

  // Handle unavailable/unknown states
  if (entity.state === "unavailable") {
    return "unavailable";
  }
  if (entity.state === "unknown") {
    return "unknown";
  }

  // Use provided value or parse entity state
  const numValue = value ?? parseFloat(entity.state);

  if (isNaN(numValue)) {
    return entity.state;
  }

  // Determine precision
  let maxDecimals = precision ?? 2;

  // If the entity has a specific precision in attributes, use it
  if (entity.attributes.precision !== undefined) {
    maxDecimals = entity.attributes.precision;
  }

  // Format the number
  const formatted = formatNumber(numValue, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });

  // Add unit if present
  const unit = entity.attributes.unit_of_measurement;
  if (unit) {
    return `${formatted} ${unit}`;
  }

  return formatted;
}

/**
 * Get domain from entity ID
 */
export function getDomain(entityId: string): string {
  return entityId.split(".")[0];
}

/**
 * Get object ID from entity ID
 */
export function getObjectId(entityId: string): string {
  return entityId.split(".")[1];
}

/**
 * Check if entity supports a specific feature
 */
export function supportsFeature(
  hass: HomeAssistant,
  entityId: string,
  feature: number,
): boolean {
  const entity = getEntity(hass, entityId);
  const supportedFeatures = entity?.attributes.supported_features;
  if (typeof supportedFeatures !== "number") {
    return false;
  }
  return (supportedFeatures & feature) !== 0;
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(" ");
}

/**
 * Format timestamp to locale date/time string
 */
export function formatDateTime(timestamp: string | Date): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return date.toLocaleString();
}

/**
 * Format relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(timestamp: string | Date): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return "just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
