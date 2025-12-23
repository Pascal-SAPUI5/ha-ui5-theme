/**
 * UI5 Bar Card
 * A Lovelace card that displays a UI5 Bar component (header/footer bar)
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5BarCardConfig } from "../../types";

export class UI5BarCard extends BaseUI5Card {
  setConfig(config: UI5BarCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5BarCardConfig | undefined {
    return this._config as UI5BarCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    // Process content with templates
    const startContent = this.processTemplateEscaped(
      this.config.start_content || ""
    );
    const middleContent = this.processTemplateEscaped(
      this.config.middle_content || ""
    );
    const endContent = this.processTemplateEscaped(
      this.config.end_content || ""
    );

    // Build state display if entity is configured
    let stateDisplay = "";
    if (this.config.entity && this.config.show_entity_state !== false) {
      const entity = this._hass.states[this.config.entity];
      if (entity) {
        const friendlyName = entity.attributes.friendly_name || this.config.entity;
        const state = entity.state;
        const unit = entity.attributes.unit_of_measurement || "";
        stateDisplay = `${friendlyName}: ${state}${unit ? " " + unit : ""}`;
      }
    }

    const design = this.config.design || "Header";

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
        }
        ui5-bar {
          width: 100%;
        }
        .bar-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .state-display {
          font-weight: 500;
        }
        .unavailable {
          opacity: 0.5;
        }
      </style>
      <ui5-bar design="${design}" class="${isUnavailable ? "unavailable" : ""}">
        ${
          startContent || stateDisplay
            ? `<div slot="startContent" class="bar-content">
                ${stateDisplay ? `<span class="state-display">${stateDisplay}</span>` : ""}
                ${startContent ? `<span>${startContent}</span>` : ""}
              </div>`
            : ""
        }
        ${
          middleContent
            ? `<div slot="middleContent" class="bar-content">
                <span>${middleContent}</span>
              </div>`
            : ""
        }
        ${
          endContent
            ? `<div slot="endContent" class="bar-content">
                <span>${endContent}</span>
              </div>`
            : ""
        }
      </ui5-bar>
    `;

  }

  static getStubConfig(): UI5BarCardConfig {
    return {
      type: "custom:ui5-bar-card",
      design: "Header",
      start_content: "Home Assistant",
      end_content: "Status: Online",
    };
  }
}

// Register the custom element
if (!customElements.get("ui5-bar-card")) {
  customElements.define("ui5-bar-card", UI5BarCard);
}
