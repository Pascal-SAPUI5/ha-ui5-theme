/**
 * UI5 Select Card
 * A Lovelace card with a UI5 Select dropdown component
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5SelectCardConfig } from "../../types";

export class UI5SelectCard extends BaseUI5Card {
  setConfig(config: UI5SelectCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5SelectCardConfig | undefined {
    return this._config as UI5SelectCardConfig;
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

    // Build options from config or entity options attribute
    let options = this.config.options || [];
    if (options.length === 0 && this.config.entity) {
      const entity = this._hass.states[this.config.entity];
      if (entity?.attributes.options) {
        options = entity.attributes.options.map((opt: string) => ({
          value: opt,
          label: opt,
        }));
      }
    }

    // Get entity name for label
    let label = "";
    if (this.config.entity) {
      const entity = this._hass.states[this.config.entity];
      if (entity) {
        label = entity.attributes.friendly_name || this.config.entity;
      }
    }

    const optionsHtml = options
      .map((opt) => {
        const value = this.escapeAttribute(opt.value);
        const optLabel = opt.label || opt.value;
        const selected = opt.value === currentValue ? "selected" : "";
        const icon = opt.icon ? `icon="${opt.icon}"` : "";
        return `<ui5-option value="${value}" ${selected} ${icon}>${this.escapeText(optLabel)}</ui5-option>`;
      })
      .join("");

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .select-container {
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
        ui5-select {
          width: 100%;
        }
        .unavailable {
          opacity: 0.5;
        }
      </style>
      <div class="select-container ${isUnavailable ? "unavailable" : ""}">
        ${label ? `<div class="label">${label}</div>` : ""}
        <ui5-select id="select" ${isUnavailable ? "disabled" : ""}>
          ${optionsHtml}
        </ui5-select>
      </div>
    `;

    // Handle selection change
    const select = this.shadowRoot!.querySelector("ui5-select");
    if (select && this.config.service) {
      select.addEventListener("change", (e: Event) => {
        const target = e.target as HTMLSelectElement;
        const selectedOption = target.querySelector("ui5-option[selected]");
        if (selectedOption) {
          this.callSelectService(selectedOption.getAttribute("value") || "");
        }
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

  private escapeText(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  private callSelectService(value: string): void {
    if (!this._hass || !this.config?.service) {
      return;
    }

    const [domain, service] = this.config.service.split(".");
    if (!domain || !service) {
      console.error("[ui5-select-card] Invalid service format:", this.config.service);
      return;
    }

    const serviceData = {
      ...this.config.service_data,
      option: value,
    };

    if (this.config.entity) {
      (serviceData as Record<string, unknown>).entity_id = this.config.entity;
    }

    this._hass.callService(domain, service, serviceData);
  }

  static getStubConfig(): UI5SelectCardConfig {
    return {
      type: "custom:ui5-select-card",
      options: [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3" },
      ],
    };
  }
}

// Register the custom element
if (!customElements.get("ui5-select-card")) {
  customElements.define("ui5-select-card", UI5SelectCard);
}
