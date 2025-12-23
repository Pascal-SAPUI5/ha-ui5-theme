/**
 * UI5 Input Card
 * A Lovelace card with a UI5 Input component for text entry
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5InputCardConfig } from "../../types";

export class UI5InputCard extends BaseUI5Card {
  setConfig(config: UI5InputCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5InputCardConfig | undefined {
    return this._config as UI5InputCardConfig;
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

    const placeholder = this.processTemplateEscaped(this.config.placeholder || "Enter value...");
    const inputType = this.config.input_type || "Text";
    const showClear = this.config.show_clear !== false;

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
        .input-container {
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
        ui5-input {
          width: 100%;
        }
        .unavailable {
          opacity: 0.5;
        }
      </style>
      <div class="input-container ${isUnavailable ? "unavailable" : ""}">
        ${label ? `<div class="label">${label}</div>` : ""}
        <ui5-input
          id="input"
          placeholder="${placeholder}"
          value="${this.escapeAttribute(currentValue)}"
          type="${inputType}"
          ${showClear ? 'show-clear-icon' : ''}
          ${isUnavailable ? "disabled" : ""}
        ></ui5-input>
      </div>
    `;

    // Handle input change
    const input = this.shadowRoot!.querySelector("ui5-input");
    if (input && this.config.service) {
      input.addEventListener("change", (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.callInputService(target.value);
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

  private callInputService(value: string): void {
    if (!this._hass || !this.config?.service) {
      return;
    }

    const [domain, service] = this.config.service.split(".");
    if (!domain || !service) {
      console.error("[ui5-input-card] Invalid service format:", this.config.service);
      return;
    }

    const serviceData = {
      ...this.config.service_data,
      value,
    };

    if (this.config.entity) {
      (serviceData as Record<string, unknown>).entity_id = this.config.entity;
    }

    this._hass.callService(domain, service, serviceData);
  }

  static getStubConfig(): UI5InputCardConfig {
    return {
      type: "custom:ui5-input-card",
      placeholder: "Enter text...",
      input_type: "Text",
    };
  }
}

// Register the custom element
if (!customElements.get("ui5-input-card")) {
  customElements.define("ui5-input-card", UI5InputCard);
}
