/**
 * UI5 Slider Card
 * A Lovelace card that displays a UI5 Slider component
 */

import { BaseUI5Card } from "./base-card";
import type { UI5SliderCardConfig } from "../types";
import { stateToNumber, clamp, debounce } from "../utils/ha-helpers";
import "../ui5-loader";

export class UI5SliderCard extends BaseUI5Card {
  setConfig(config: UI5SliderCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5SliderCardConfig | undefined {
    return this._config as UI5SliderCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    // Get slider parameters
    const min = this.config.min ?? 0;
    const max = this.config.max ?? 100;
    const step = this.config.step ?? 1;
    const showValue = this.config.show_value ?? true;

    // Determine current value
    let value = 0;
    if (this.config.entity && this._hass) {
      value = stateToNumber(
        this._hass,
        this.config.entity,
        this.config.attribute,
      );
      value = clamp(value, min, max);
    }

    // Process label with templates
    const label = this.processTemplate(this.config.name || "Slider");

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .slider-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .slider-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .slider-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-text-color);
        }

        .slider-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-color);
          min-width: 40px;
          text-align: right;
        }

        ui5-slider {
          width: 100%;
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="slider-container">
          <div class="slider-header">
            <div class="slider-label">${label}</div>
            ${showValue ? `<div class="slider-value" id="value-display">${value}</div>` : ""}
          </div>
          <ui5-slider
            id="main-slider"
            min="${min}"
            max="${max}"
            step="${step}"
            value="${value}"
          ></ui5-slider>
        </div>
      </div>
    `;

    // Set up slider change handler
    const slider = this.shadow.getElementById("main-slider") as HTMLElement & {
      value: number;
    };
    const valueDisplay = this.shadow.getElementById("value-display");

    if (slider) {
      // Update value display on input (real-time)
      slider.addEventListener("input", () => {
        if (valueDisplay) {
          valueDisplay.textContent = slider.value.toString();
        }
      });

      // Call service on change (when user releases slider)
      slider.addEventListener(
        "change",
        debounce(() => {
          this.handleSliderChange(slider.value);
        }, 300),
      );
    }
  }

  /**
   * Handle slider value change
   */
  private handleSliderChange(value: number): void {
    if (!this.config?.entity || !this._hass) {
      return;
    }

    // If tap_action is configured, use it
    if (this.config.tap_action) {
      this.executeTapAction();
      return;
    }

    // Otherwise, call appropriate service based on entity domain
    const [domain] = this.config.entity.split(".");

    switch (domain) {
      case "light":
        this._hass.callService("light", "turn_on", {
          entity_id: this.config.entity,
          brightness_pct: value,
        });
        break;

      case "cover":
        this._hass.callService("cover", "set_cover_position", {
          entity_id: this.config.entity,
          position: value,
        });
        break;

      case "climate":
        this._hass.callService("climate", "set_temperature", {
          entity_id: this.config.entity,
          temperature: value,
        });
        break;

      case "input_number":
        this._hass.callService("input_number", "set_value", {
          entity_id: this.config.entity,
          value: value,
        });
        break;

      case "number":
        this._hass.callService("number", "set_value", {
          entity_id: this.config.entity,
          value: value,
        });
        break;

      default:
        console.warn(
          `[ui5-slider-card] Unsupported domain for slider: ${domain}`,
        );
    }
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-slider-card",
      name: "Brightness",
      min: 0,
      max: 100,
      step: 1,
    };
  }
}

// Register custom element
customElements.define("ui5-slider-card", UI5SliderCard);
