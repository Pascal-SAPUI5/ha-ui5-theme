/**
 * UI5 AI Textarea Card (Experimental)
 * A Lovelace card that displays a UI5 AI Textarea component
 * Provides AI-powered text generation and editing capabilities
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5AITextareaCardConfig } from "../../types";

export class UI5AITextareaCard extends BaseUI5Card {
  setConfig(config: UI5AITextareaCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5AITextareaCardConfig | undefined {
    return this._config as UI5AITextareaCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    // Get initial value from entity if configured
    let initialValue = "";
    if (this.config.entity) {
      const entity = this._hass.states[this.config.entity];
      if (entity) {
        initialValue = entity.state !== "unavailable" ? entity.state : "";
      }
    }

    const placeholder = this.config.placeholder || "Enter text...";
    const rows = this.config.rows || 3;
    const maxLength = this.config.max_length || 0;
    const growing = this.config.growing !== false;
    const growingMaxRows = this.config.growing_max_rows || 10;

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .textarea-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        ui5-ai-textarea {
          width: 100%;
        }
        .unavailable {
          opacity: 0.5;
        }
        .experimental-badge {
          font-size: 10px;
          color: var(--warning-color, #e65100);
          background: var(--warning-color-light, #fff3e0);
          padding: 2px 6px;
          border-radius: 4px;
          align-self: flex-start;
        }
      </style>
      <div class="textarea-container ${isUnavailable ? "unavailable" : ""}">
        <span class="experimental-badge">Experimental</span>
        <ui5-ai-textarea
          id="ai-textarea"
          placeholder="${placeholder}"
          rows="${rows}"
          ${maxLength > 0 ? `maxlength="${maxLength}"` : ""}
          ${growing ? "growing" : ""}
          ${growing ? `growing-max-rows="${growingMaxRows}"` : ""}
          value="${initialValue}"
        ></ui5-ai-textarea>
      </div>
    `;

    // Handle change event
    const textarea = this.shadowRoot!.querySelector("#ai-textarea");
    if (textarea) {
      textarea.addEventListener("change", () => this.handleChange());
    }
  }

  private handleChange(): void {
    const textarea = this.shadowRoot!.querySelector("#ai-textarea") as HTMLElement & { value: string };
    const value = textarea?.value || "";

    if (this.config?.service && this._hass) {
      const [domain, service] = this.config.service.split(".");
      if (domain && service) {
        const serviceData: Record<string, unknown> = {
          ...this.config.service_data,
          value,
        };

        if (this.config.entity) {
          serviceData.entity_id = this.config.entity;
        }

        this._hass.callService(domain, service, serviceData);
      }
    }
  }

  static getStubConfig(): UI5AITextareaCardConfig {
    return {
      type: "custom:ui5-ai-textarea-card",
      placeholder: "Enter text for AI assistance...",
      rows: 4,
      growing: true,
    };
  }
}

// Register the custom element
if (!customElements.get("ui5-ai-textarea-card")) {
  customElements.define("ui5-ai-textarea-card", UI5AITextareaCard);
}
