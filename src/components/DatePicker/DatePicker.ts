/**
 * UI5 DatePicker Card
 * A Lovelace card with a UI5 DatePicker component
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5DatePickerCardConfig } from "../../types";

export class UI5DatePickerCard extends BaseUI5Card {
  setConfig(config: UI5DatePickerCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5DatePickerCardConfig | undefined {
    return this._config as UI5DatePickerCardConfig;
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

    const placeholder = this.processTemplateEscaped(this.config.placeholder || "Select date...");
    const formatPattern = this.config.format_pattern || "yyyy-MM-dd";

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
        .datepicker-container {
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
        ui5-date-picker {
          width: 100%;
        }
        .unavailable {
          opacity: 0.5;
        }
      </style>
      <div class="datepicker-container ${isUnavailable ? "unavailable" : ""}">
        ${label ? `<div class="label">${label}</div>` : ""}
        <ui5-date-picker
          id="datepicker"
          placeholder="${placeholder}"
          value="${this.escapeAttribute(currentValue)}"
          format-pattern="${formatPattern}"
          ${this.config.min_date ? `min-date="${this.config.min_date}"` : ""}
          ${this.config.max_date ? `max-date="${this.config.max_date}"` : ""}
          ${isUnavailable ? "disabled" : ""}
        ></ui5-date-picker>
      </div>
    `;

    // Handle date change
    const datePicker = this.shadowRoot!.querySelector("ui5-date-picker");
    if (datePicker && this.config.service) {
      datePicker.addEventListener("change", (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.callDateService(target.value);
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

  private callDateService(value: string): void {
    if (!this._hass || !this.config?.service) {
      return;
    }

    const [domain, service] = this.config.service.split(".");
    if (!domain || !service) {
      console.error("[ui5-datepicker-card] Invalid service format:", this.config.service);
      return;
    }

    const serviceData = {
      ...this.config.service_data,
      date: value,
    };

    if (this.config.entity) {
      (serviceData as Record<string, unknown>).entity_id = this.config.entity;
    }

    this._hass.callService(domain, service, serviceData);
  }

  static getStubConfig(): UI5DatePickerCardConfig {
    return {
      type: "custom:ui5-datepicker-card",
      placeholder: "Select date...",
      format_pattern: "yyyy-MM-dd",
    };
  }
}

// Register the custom element
if (!customElements.get("ui5-datepicker-card")) {
  customElements.define("ui5-datepicker-card", UI5DatePickerCard);
}
