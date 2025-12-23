/**
 * UI5 Prompt Input Card (Experimental)
 * A Lovelace card that displays a UI5 AI Prompt Input component
 * Useful for AI-powered text generation prompts
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5PromptCardConfig } from "../../types";

export class UI5PromptCard extends BaseUI5Card {
  setConfig(config: UI5PromptCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5PromptCardConfig | undefined {
    return this._config as UI5PromptCardConfig;
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

    const placeholder = this.config.placeholder || "Enter your prompt...";
    const label = this.config.label || "";
    const showClearIcon = this.config.show_clear_icon !== false;
    const maxLength = this.config.max_length || 0;

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .prompt-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        ui5-ai-prompt-input {
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
      <div class="prompt-container ${isUnavailable ? "unavailable" : ""}">
        <span class="experimental-badge">Experimental</span>
        <ui5-ai-prompt-input
          id="prompt-input"
          placeholder="${placeholder}"
          ${label ? `label="${label}"` : ""}
          ${showClearIcon ? "show-clear-icon" : ""}
          ${maxLength > 0 ? `maxlength="${maxLength}"` : ""}
          value="${initialValue}"
        ></ui5-ai-prompt-input>
      </div>
    `;

    // Handle submit event
    const promptInput = this.shadowRoot!.querySelector("#prompt-input");
    if (promptInput) {
      promptInput.addEventListener("submit", () => this.handleSubmit());
    }
  }

  private handleSubmit(): void {
    const promptInput = this.shadowRoot!.querySelector("#prompt-input") as HTMLElement & { value: string };
    const value = promptInput?.value || "";

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

  static getStubConfig(): UI5PromptCardConfig {
    return {
      type: "custom:ui5-prompt-card",
      placeholder: "Ask AI anything...",
      label: "AI Prompt",
      show_clear_icon: true,
    };
  }
}

// Register the custom element
if (!customElements.get("ui5-prompt-card")) {
  customElements.define("ui5-prompt-card", UI5PromptCard);
}
