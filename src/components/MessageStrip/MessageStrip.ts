/**
 * UI5 MessageStrip Card
 * A Lovelace card that displays a UI5 MessageStrip component
 * Useful for showing status messages, alerts, or notifications
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5MessageStripCardConfig } from "../../types";

export class UI5MessageStripCard extends BaseUI5Card {
  setConfig(config: UI5MessageStripCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5MessageStripCardConfig | undefined {
    return this._config as UI5MessageStripCardConfig;
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
        const unit = entity.attributes.unit_of_measurement || "";
        displayText = `${name}: ${state}${unit ? " " + unit : ""}`;
      }
    }
    displayText = this.processTemplateEscaped(displayText);

    // Determine design based on entity state or config
    let design: UI5MessageStripCardConfig["design"] = this.config.design || "Information";
    if (!this.config.design && this.config.entity) {
      design = this.getDesignFromState(entityState || "") as UI5MessageStripCardConfig["design"];
    }

    const hideCloseButton = this.config.hide_close_button !== false;
    const hideIcon = this.config.hide_icon === true;

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .messagestrip-container {
          padding: 8px;
        }
        ui5-message-strip {
          width: 100%;
        }
        .unavailable {
          opacity: 0.5;
        }
      </style>
      <div class="messagestrip-container ${isUnavailable ? "unavailable" : ""}">
        <ui5-message-strip
          id="messagestrip"
          design="${design}"
          ${hideCloseButton ? "hide-close-button" : ""}
          ${hideIcon ? "hide-icon" : ""}
        >${displayText}</ui5-message-strip>
      </div>
    `;

    // Handle close event
    const messageStrip = this.shadowRoot!.querySelector("ui5-message-strip");
    if (messageStrip && !hideCloseButton) {
      messageStrip.addEventListener("close", () => {
        this.shadowRoot!.querySelector(".messagestrip-container")?.remove();
      });
    }
  }

  private getDesignFromState(state: string): string {
    const stateDesigns: Record<string, string> = {
      on: "Positive",
      off: "Information",
      home: "Positive",
      away: "Critical",
      unavailable: "Negative",
      unknown: "Information",
      problem: "Negative",
      ok: "Positive",
    };

    // Check for numeric states (e.g., battery percentage)
    const numState = parseFloat(state);
    if (!isNaN(numState)) {
      if (numState < 20) return "Negative";
      if (numState < 50) return "Critical";
      return "Positive";
    }

    return stateDesigns[state.toLowerCase()] || "Information";
  }

  static getStubConfig(): UI5MessageStripCardConfig {
    return {
      type: "custom:ui5-messagestrip-card",
      text: "This is an information message",
      design: "Information",
    };
  }
}

// Register the custom element
if (!customElements.get("ui5-messagestrip-card")) {
  customElements.define("ui5-messagestrip-card", UI5MessageStripCard);
}
