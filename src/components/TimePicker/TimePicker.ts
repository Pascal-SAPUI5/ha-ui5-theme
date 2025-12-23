/**
 * UI5 TimePicker Card
 * A Lovelace card with a UI5 TimePicker component
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5TimePickerCardConfig } from "../../types";

export class UI5TimePickerCard extends BaseUI5Card {
  setConfig(config: UI5TimePickerCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5TimePickerCardConfig | undefined {
    return this._config as UI5TimePickerCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    // Get current value from entity attribute or state
    let currentValue = "";
    if (this.config.entity) {
      const entity = this._hass.states[this.config.entity];
      if (entity) {
        if (this.config.value_attribute) {
          currentValue = String(entity.attributes[this.config.value_attribute] || "");
        } else {
          currentValue = entity.state;
        }
      }
    }

    const placeholder = this.processTemplateEscaped(this.config.placeholder || "Select time...");
    const formatPattern = this.config.format_pattern || "HH:mm";

    // Get entity name for label
    let label = "";
    if (this.config.entity) {
      const entity = this._hass.states[this.config.entity];
      if (entity) {
        label = entity.attributes.friendly_name || this.config.entity;
      }
    }

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .timepicker-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
        }
        .label {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-text-color);
        }
        ui5-time-picker {
          width: 100%;
        }
        .unavailable {
          opacity: 0.5;
        }
      </style>
      <div class="timepicker-container ${isUnavailable ? "unavailable" : ""}">
        ${label ? `<div class="label">${label}</div>` : ""}
        <ui5-time-picker
          id="timepicker"
          placeholder="${placeholder}"
          value="${this.escapeAttribute(currentValue)}"
          format-pattern="${formatPattern}"
          ${isUnavailable ? "disabled" : ""}
        ></ui5-time-picker>
      </div>
    `;

    // Handle time change
    const timePicker = this.shadowRoot!.querySelector("ui5-time-picker");
    if (timePicker && this.config.service) {
      timePicker.addEventListener("change", (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.callTimeService(target.value);
      });
    }
  }

  private escapeAttribute(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  private callTimeService(value: string): void {
    if (!this._hass || !this.config?.service) {
      return;
    }

    const [domain, service] = this.config.service.split(".");
    if (!domain || !service) {
      console.error("[ui5-timepicker-card] Invalid service format:", this.config.service);
      return;
    }

    const serviceData = {
      ...this.config.service_data,
      time: value,
    };

    if (this.config.entity) {
      (serviceData as Record<string, unknown>).entity_id = this.config.entity;
    }

    this._hass.callService(domain, service, serviceData);
  }

  static getStubConfig(): UI5TimePickerCardConfig {
    return {
      type: "custom:ui5-timepicker-card",
      placeholder: "Select time...",
      format_pattern: "HH:mm",
    };
  }
}

// Register the custom element
if (!customElements.get("ui5-timepicker-card")) {
  customElements.define("ui5-timepicker-card", UI5TimePickerCard);
}
