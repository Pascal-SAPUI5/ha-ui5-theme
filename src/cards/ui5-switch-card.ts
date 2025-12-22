/**
 * UI5 Switch Card
 * A Lovelace card that displays a UI5 Switch component
 */

import { BaseUI5Card } from "./base-card";
import type { UI5SwitchCardConfig } from "../types";
import { isEntityOn } from "../utils/ha-helpers";
import "../ui5-loader";

export class UI5SwitchCard extends BaseUI5Card {
  setConfig(config: UI5SwitchCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5SwitchCardConfig | undefined {
    return this._config as UI5SwitchCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    // Determine checked state
    let isChecked = this.config.checked || false;
    if (this.config.entity && this._hass) {
      isChecked = isEntityOn(this._hass, this.config.entity);
    }

    // Process text with templates
    const text = this.processTemplate(
      this.config.text || this.config.name || "Switch",
    );

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .switch-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .switch-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-text-color);
          flex: 1;
        }

        .entity-info {
          font-size: 12px;
          color: var(--secondary-text-color);
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="switch-container">
          <div class="switch-label">
            ${text}
            ${
              this.config.entity && entityState
                ? `<div class="entity-info">${entityState}</div>`
                : ""
            }
          </div>
          <ui5-switch
            id="main-switch"
            ${isChecked ? "checked" : ""}
          ></ui5-switch>
        </div>
      </div>
    `;

    // Set up switch change handler
    const switchEl = this.shadow.getElementById(
      "main-switch",
    ) as HTMLElement & { checked: boolean };
    if (switchEl) {
      switchEl.addEventListener("change", () => {
        this.executeTapAction();
      });
    }
  }

  /**
   * Override default tap action for switch (toggle if entity is provided)
   */
  protected getDefaultTapAction() {
    if (this.config?.entity) {
      return { action: "toggle" as const };
    }
    return { action: "none" as const };
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-switch-card",
      text: "Toggle Switch",
    };
  }
}

// Register custom element
customElements.define("ui5-switch-card", UI5SwitchCard);
