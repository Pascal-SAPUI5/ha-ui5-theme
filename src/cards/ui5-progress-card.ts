/**
 * UI5 Progress Card
 * A Lovelace card that displays a UI5 ProgressIndicator component
 */

import { BaseUI5Card } from "./base-card";
import type { UI5ProgressCardConfig } from "../types";
import { stateToNumber, clamp } from "../utils/ha-helpers";
import "../ui5-loader";

export class UI5ProgressCard extends BaseUI5Card {
  setConfig(config: UI5ProgressCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5ProgressCardConfig | undefined {
    return this._config as UI5ProgressCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    // Get progress parameters
    const max = this.config.max ?? 100;
    const displayValue = this.config.display_value ?? true;
    const state = this.config.state || "None";

    // Determine current value
    let value = this.config.value ?? 0;
    if (this.config.entity && this._hass) {
      value = stateToNumber(this._hass, this.config.entity);
      value = clamp(value, 0, max);
    }

    // Calculate percentage
    const percentage = Math.round((value / max) * 100);

    // Process label with templates
    const label = this.processTemplate(this.config.name || "Progress");

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .progress-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .progress-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-text-color);
        }

        .progress-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-color);
        }

        ui5-progress-indicator {
          width: 100%;
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="progress-container">
          <div class="progress-header">
            <div class="progress-label">${label}</div>
            ${
              displayValue
                ? `<div class="progress-value">${value} / ${max}</div>`
                : ""
            }
          </div>
          <ui5-progress-indicator
            id="main-progress"
            value="${percentage}"
            ${state !== "None" ? `value-state="${state}"` : ""}
            ${displayValue ? `display-value="${percentage}%"` : ""}
          ></ui5-progress-indicator>
        </div>
      </div>
    `;

    // Set up action handlers (click on progress bar)
    const progress = this.shadow.getElementById("main-progress");
    if (progress) {
      this.setupActionHandlers(progress);
    }
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-progress-card",
      name: "Loading",
      value: 50,
      max: 100,
      display_value: true,
    };
  }
}

// Register custom element
customElements.define("ui5-progress-card", UI5ProgressCard);
