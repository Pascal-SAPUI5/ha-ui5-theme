/**
 * UI5 Button Card
 * A Lovelace card that displays a UI5 Button component
 */

import { BaseUI5Card } from "./base-card";
import type { UI5ButtonCardConfig } from "../types";
import "../ui5-loader";

export class UI5ButtonCard extends BaseUI5Card {
  setConfig(config: UI5ButtonCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5ButtonCardConfig | undefined {
    return this._config as UI5ButtonCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    // Process text with templates (escaped for security)
    const text = this.processTemplateEscaped(
      this.config.text || this.config.name || "Button",
    );
    const icon = this.config.icon;
    const design = this.config.design || "Default";
    const iconOnly = this.config.icon_only || false;

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .button-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        ui5-button {
          width: 100%;
        }

        .entity-info {
          font-size: 12px;
          color: var(--secondary-text-color);
          text-align: center;
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="button-container">
          <ui5-button
            id="main-button"
            design="${design}"
            ${icon ? `icon="${icon}"` : ""}
            ${iconOnly ? "icon-only" : ""}
          >
            ${iconOnly ? "" : text}
          </ui5-button>
          ${
            this.config.entity
              ? `<div class="entity-info">${entityState}</div>`
              : ""
          }
        </div>
      </div>
    `;

    // Set up action handlers
    const button = this.shadow.getElementById("main-button");
    if (button) {
      this.setupActionHandlers(button);
    }
  }

  /**
   * Override default tap action for button (toggle if entity is provided)
   */
  protected getDefaultTapAction() {
    if (this.config?.entity) {
      return { action: "toggle" as const };
    }
    return { action: "none" as const };
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-button-card",
      text: "Press Me",
      design: "Emphasized",
    };
  }
}

// Register custom element
customElements.define("ui5-button-card", UI5ButtonCard);
