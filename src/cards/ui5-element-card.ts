/**
 * UI5 Element Card (Generic)
 * A Lovelace card that can render any UI5 element with properties and slots
 */

import { BaseUI5Card } from "./base-card";
import type { UI5ElementCardConfig } from "../types";
import { ensureFiori } from "../ui5-loader";

export class UI5ElementCard extends BaseUI5Card {
  async connectedCallback(): void {
    // Ensure Fiori components are loaded for flexibility
    await ensureFiori();
    super.connectedCallback();
  }

  setConfig(config: UI5ElementCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    if (!config.element) {
      throw new Error("element (tag name) is required for ui5-element-card");
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
   */
  private buildAttributes(props: Record<string, any>): string {
    return Object.entries(props)
      .map(([key, value]) => {
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
