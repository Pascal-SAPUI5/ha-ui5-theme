/**
 * UI5 Badge Card
 * A Lovelace card that displays a UI5 Tag/Badge component
 * Uses ui5-tag internally (UI5 renamed Badge to Tag)
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5BadgeCardConfig } from "../../types";

export class UI5BadgeCard extends BaseUI5Card {
  setConfig(config: UI5BadgeCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5BadgeCardConfig | undefined {
    return this._config as UI5BadgeCardConfig;
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
    let design: UI5BadgeCardConfig["design"] = this.config.design || "Neutral";
    if (!this.config.design && this.config.entity) {
      design = this.getDesignFromState(entityState || "") as UI5BadgeCardConfig["design"];
    }

    const colorScheme = this.config.color_scheme || "";
    const interactive = this.config.interactive !== false;

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .badge-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        ui5-tag {
          cursor: ${interactive ? "pointer" : "default"};
        }
        .unavailable {
          opacity: 0.5;
        }
      </style>
      <div class="badge-container ${isUnavailable ? "unavailable" : ""}">
        <ui5-tag
          id="badge"
          design="${design}"
          ${colorScheme ? `color-scheme="${colorScheme}"` : ""}
          ${interactive ? "interactive" : ""}
        >${displayText}</ui5-tag>
      </div>
    `;
  }

  private getDesignFromState(state: string): string {
    const stateDesigns: Record<string, string> = {
      on: "Positive",
      off: "Neutral",
      home: "Positive",
      away: "Critical",
      unavailable: "Negative",
      unknown: "Information",
    };

    // Check for numeric states
    const numState = parseFloat(state);
    if (!isNaN(numState)) {
      if (numState > 80) return "Negative";
      if (numState > 50) return "Critical";
      if (numState > 20) return "Information";
      return "Positive";
    }

    return stateDesigns[state.toLowerCase()] || "Neutral";
  }

  static getStubConfig(): UI5BadgeCardConfig {
    return {
      type: "custom:ui5-badge-card",
      text: "Status Badge",
      design: "Information",
    };
  }
}

// Register the custom element
if (!customElements.get("ui5-badge-card")) {
  customElements.define("ui5-badge-card", UI5BadgeCard);
}
