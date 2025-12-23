/**
 * UI5 Toast Card
 * A Lovelace card that displays a UI5 Toast notification
 * Can be triggered by entity state changes
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5ToastCardConfig, HomeAssistant } from "../../types";

export class UI5ToastCard extends BaseUI5Card {
  private _lastTriggerState: string | null = null;

  setConfig(config: UI5ToastCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5ToastCardConfig | undefined {
    return this._config as UI5ToastCardConfig;
  }

  set hass(hass: HomeAssistant) {
    const oldHass = this._hass;
    super.hass = hass;

    // Check for trigger entity state change
    if (this.config?.trigger_entity && oldHass) {
      const oldState = oldHass.states[this.config.trigger_entity]?.state;
      const newState = hass.states[this.config.trigger_entity]?.state;

      if (oldState !== newState) {
        // Check if we should trigger the toast
        if (this.config.trigger_state) {
          if (newState === this.config.trigger_state) {
            this.showToast();
          }
        } else if (this._lastTriggerState !== null && this._lastTriggerState !== newState) {
          // Trigger on any state change
          this.showToast();
        }
        this._lastTriggerState = newState;
      }
    }
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    // Determine text to display
    let displayText = this.config.text || "";
    if (!displayText && this.config.entity) {
      const entity = this._hass.states[this.config.entity];
      if (entity) {
        const name = entity.attributes.friendly_name || this.config.entity;
        const state = entity.state;
        displayText = `${name} is now ${state}`;
      }
    }
    displayText = this.processTemplateEscaped(displayText);

    const duration = this.config.duration || 3000;
    const placement = this.config.placement || "BottomCenter";

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .toast-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }
        .toast-preview {
          padding: 12px 24px;
          background: var(--primary-color);
          color: var(--text-primary-color, white);
          border-radius: 8px;
          font-size: 14px;
        }
        .toast-trigger {
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        ui5-button {
          margin-top: 8px;
        }
        .unavailable {
          opacity: 0.5;
        }
      </style>
      <div class="toast-container ${isUnavailable ? "unavailable" : ""}">
        <div class="toast-preview">${displayText || "Toast notification"}</div>
        ${
          this.config.trigger_entity
            ? `<div class="toast-trigger">Triggers on: ${this.config.trigger_entity}${this.config.trigger_state ? ` = ${this.config.trigger_state}` : " (any change)"}</div>`
            : ""
        }
        <ui5-button id="show-toast" design="Emphasized">Show Toast</ui5-button>
        <ui5-toast
          id="toast"
          duration="${duration}"
          placement="${placement}"
        >${displayText}</ui5-toast>
      </div>
    `;

    // Handle button click to show toast
    const button = this.shadowRoot!.querySelector("#show-toast");
    if (button) {
      button.addEventListener("click", () => this.showToast());
    }
  }

  private showToast(): void {
    const toast = this.shadowRoot!.querySelector("ui5-toast") as HTMLElement & { show: () => void };
    if (toast?.show) {
      toast.show();
    }
  }

  static getStubConfig(): UI5ToastCardConfig {
    return {
      type: "custom:ui5-toast-card",
      text: "Notification message",
      duration: 3000,
      placement: "BottomCenter",
    };
  }
}

// Register the custom element
if (!customElements.get("ui5-toast-card")) {
  customElements.define("ui5-toast-card", UI5ToastCard);
}
