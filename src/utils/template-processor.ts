/**
 * Template Processor
 * Processes Home Assistant templates like {{ states('entity.id') }}
 */

import type { HomeAssistant } from "../types";

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Maximum template string length to prevent ReDoS attacks
 */
const MAX_TEMPLATE_LENGTH = 10000;

/**
 * Entity ID validation pattern
 * Format: domain.entity_name (lowercase, numbers, underscores)
 */
const ENTITY_ID_PATTERN = /^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/;

/**
 * Validate entity ID format
 */
function isValidEntityId(entityId: string): boolean {
  return ENTITY_ID_PATTERN.test(entityId);
}

/**
 * Process a template string with Home Assistant context
 * Note: Output is NOT escaped - caller must escape when inserting into HTML
 */
export function processTemplate(
  template: string | undefined,
  hass: HomeAssistant,
  entityId?: string,
): string {
  if (!template || typeof template !== "string") {
    return "";
  }

  // Security: Prevent ReDoS attacks with length limit
  if (template.length > MAX_TEMPLATE_LENGTH) {
    console.warn(
      `[template-processor] Template exceeds maximum length (${MAX_TEMPLATE_LENGTH} chars)`,
    );
    return template.substring(0, MAX_TEMPLATE_LENGTH);
  }

  // If no template markers, return as-is
  if (!template.includes("{{") && !template.includes("{%")) {
    return template;
  }

  // Security: Validate entity ID if provided
  if (entityId && !isValidEntityId(entityId)) {
    console.warn(`[template-processor] Invalid entity ID format: ${entityId}`);
    return template;
  }

  try {
    let result = template;

    // Process {{ states('entity.id') }}
    result = result.replace(
      /\{\{\s*states\(['"]([^'"]+)['"]\)\s*\}\}/g,
      (_, entity) => {
        return getEntityState(hass, entity);
      },
    );

    // Process {{ state_attr('entity.id', 'attribute') }}
    result = result.replace(
      /\{\{\s*state_attr\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)\s*\}\}/g,
      (_, entity, attr) => {
        return getEntityAttribute(hass, entity, attr);
      },
    );

    // Process {{ entity }} - current entity state
    if (entityId) {
      result = result.replace(/\{\{\s*entity\s*\}\}/g, () => {
        return getEntityState(hass, entityId);
      });

      // Process {{ entity.state }}
      result = result.replace(/\{\{\s*entity\.state\s*\}\}/g, () => {
        return getEntityState(hass, entityId);
      });

      // Process {{ entity.attributes.attribute_name }}
      result = result.replace(
        /\{\{\s*entity\.attributes\.(\w+)\s*\}\}/g,
        (_, attr) => {
          return getEntityAttribute(hass, entityId, attr);
        },
      );
    }

    // Process {{ now() }} - current timestamp
    result = result.replace(/\{\{\s*now\(\)\s*\}\}/g, () => {
      return new Date().toISOString();
    });

    // Process {{ as_timestamp(now()) }} - current timestamp as number
    result = result.replace(/\{\{\s*as_timestamp\(now\(\)\)\s*\}\}/g, () => {
      return Math.floor(Date.now() / 1000).toString();
    });

    return result;
  } catch (error) {
    console.error("[template-processor] Template processing failed:", error);
    return template;
  }
}

/**
 * Get entity state value
 */
function getEntityState(hass: HomeAssistant, entityId: string): string {
  // Security: Validate entity ID format
  if (!isValidEntityId(entityId)) {
    console.warn(`[template-processor] Invalid entity ID: ${entityId}`);
    return "unavailable";
  }

  // Security: Prevent prototype pollution
  if (!Object.prototype.hasOwnProperty.call(hass.states, entityId)) {
    console.warn(`[template-processor] Entity not found: ${entityId}`);
    return "unavailable";
  }

  const entity = hass.states[entityId];
  if (!entity) {
    return "unavailable";
  }
  return entity.state || "unknown";
}

/**
 * Get entity attribute value
 */
function getEntityAttribute(
  hass: HomeAssistant,
  entityId: string,
  attribute: string,
): string {
  // Security: Validate entity ID format
  if (!isValidEntityId(entityId)) {
    console.warn(`[template-processor] Invalid entity ID: ${entityId}`);
    return "";
  }

  // Security: Prevent prototype pollution
  if (!Object.prototype.hasOwnProperty.call(hass.states, entityId)) {
    console.warn(`[template-processor] Entity not found: ${entityId}`);
    return "";
  }

  const entity = hass.states[entityId];
  if (!entity) {
    return "";
  }

  // Security: Validate attribute name
  if (!Object.prototype.hasOwnProperty.call(entity.attributes, attribute)) {
    return "";
  }

  const value = entity.attributes[attribute];
  if (value === undefined || value === null) {
    return "";
  }

  // Convert to string
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Check if a string contains template syntax
 */
export function hasTemplate(value: string | undefined): boolean {
  if (!value || typeof value !== "string") {
    return false;
  }
  return value.includes("{{") || value.includes("{%");
}

/**
 * Evaluate a simple expression (basic math operations)
 */
export function evaluateExpression(
  expression: string,
  hass: HomeAssistant,
  entityId?: string,
): number | string {
  try {
    // First process any templates
    const processed = processTemplate(expression, hass, entityId);

    // Try to evaluate as a number
    const num = parseFloat(processed);
    if (!isNaN(num)) {
      return num;
    }

    return processed;
  } catch (error) {
    console.error("[template-processor] Expression evaluation failed:", error);
    return expression;
  }
}
