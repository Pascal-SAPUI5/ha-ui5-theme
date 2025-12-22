/**
 * UI5 Element Card (Generic)
 * A Lovelace card that can render any UI5 element with properties and slots
 */

import { BaseUI5Card } from "./base-card";
import type { UI5ElementCardConfig } from "../types";
import { ensureFiori } from "../ui5-loader";

/**
 * Whitelist of allowed UI5 element names
 * Prevents XSS attacks via arbitrary element injection
 */
const ALLOWED_UI5_ELEMENTS = new Set([
  // Core UI5 components
  "ui5-button",
  "ui5-switch",
  "ui5-slider",
  "ui5-progress-indicator",
  "ui5-busy-indicator",
  "ui5-icon",
  "ui5-input",
  "ui5-select",
  "ui5-option",
  "ui5-card",
  "ui5-card-header",
  "ui5-tag",
  "ui5-message-strip",
  // Fiori components
  "ui5-shellbar",
  "ui5-shellbar-item",
  "ui5-side-navigation",
  "ui5-side-navigation-item",
  "ui5-side-navigation-sub-item",
  "ui5-timeline",
  "ui5-timeline-item",
  "ui5-timeline-group-item",
  "ui5-wizard",
  "ui5-wizard-step",
  "ui5-notification-list",
  "ui5-notification-list-item",
  "ui5-notification-list-group-item",
  "ui5-notification-action",
  "ui5-page",
  "ui5-product-switch",
  "ui5-product-switch-item",
  "ui5-user-menu",
  "ui5-user-menu-item",
  "ui5-user-menu-account",
  "ui5-upload-collection",
  "ui5-upload-collection-item",
  "ui5-illustrated-message",
  "ui5-media-gallery",
  "ui5-media-gallery-item",
  "ui5-flexible-column-layout",
  "ui5-dynamic-side-content",
  "ui5-barcode-scanner-dialog",
  "ui5-view-settings-dialog",
  "ui5-sort-item",
  "ui5-filter-item",
  "ui5-filter-item-option",
]);

/**
 * Regex pattern for validating attribute names
 * Only allows alphanumeric characters, hyphens, and underscores
 */
const ATTRIBUTE_NAME_PATTERN = /^[a-z0-9_-]+$/i;

export class UI5ElementCard extends BaseUI5Card {
  async connectedCallback(): void {
    // Ensure Fiori components are loaded for flexibility
    try {
      await ensureFiori();
    } catch (error) {
      console.error(
        "[ui5-element-card] Failed to load Fiori components:",
        error,
      );
      this.renderError("Failed to load UI5 components");
      return;
    }
    super.connectedCallback();
  }

  setConfig(config: UI5ElementCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    if (!config.element) {
      throw new Error("element (tag name) is required for ui5-element-card");
    }

    // Security: Validate element name against whitelist
    if (!ALLOWED_UI5_ELEMENTS.has(config.element.toLowerCase())) {
      throw new Error(
        `Invalid element "${config.element}". Only UI5 Web Components are allowed.`,
      );
    }

    super.setConfig(config);
  }

  get config(): UI5ElementCardConfig | undefined {
    return this._config as UI5ElementCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    // Build attributes string from props
    const attributes = this.buildAttributes(this.config.props || {});

    // Process slot content with templates
    const slotContent = this.processTemplateEscaped(
      this.config.slot_content || "",
    );

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .element-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ui5-element {
          width: 100%;
        }

        .entity-info {
          font-size: 12px;
          color: var(--secondary-text-color);
          text-align: center;
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="element-container">
          <${this.config.element}
            id="ui5-element"
            class="ui5-element"
            ${attributes}
          >${slotContent}</${this.config.element}>
          ${
            this.config.entity
              ? `<div class="entity-info">${entityState}</div>`
              : ""
          }
        </div>
      </div>
    `;

    // Set up action handlers
    const element = this.shadow.getElementById("ui5-element");
    if (element) {
      this.setupActionHandlers(element);
    }
  }

  /**
   * Build HTML attributes from props object
   * Security: Validates attribute names to prevent injection attacks
   */
  private buildAttributes(props: Record<string, any>): string {
    return Object.entries(props)
      .map(([key, value]) => {
        // Security: Validate attribute name
        if (!ATTRIBUTE_NAME_PATTERN.test(key)) {
          console.warn(
            `[ui5-element-card] Invalid attribute name "${key}" - skipping`,
          );
          return "";
        }

        // Process value with templates
        const processedValue = this.processTemplate(String(value));

        // Handle boolean attributes
        if (typeof value === "boolean") {
          return value ? key : "";
        }

        // Handle regular attributes
        return `${key}="${this.escapeAttribute(processedValue)}"`;
      })
      .filter((attr) => attr !== "")
      .join(" ");
  }

  /**
   * Escape attribute value for safe HTML insertion
   */
  private escapeAttribute(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-element-card",
      element: "ui5-button",
      props: {
        design: "Emphasized",
      },
      slot_content: "Click Me",
    };
  }
}

// Register custom element
customElements.define("ui5-element-card", UI5ElementCard);
