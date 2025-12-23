/**
 * UI5 Card Card
 * A Lovelace card using UI5 Card component as container
 *
 * Features:
 * - UI5 Card styling with header
 * - Entity state display in header status
 * - Custom content support
 * - Interactive header with more-info
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5CardCardConfig } from "../../types";
import { getEntityName, formatEntityState } from "../../utils/ha-helpers";
import "../../ui5-loader";

export class UI5CardCard extends BaseUI5Card {
  setConfig(config: UI5CardCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5CardCardConfig | undefined {
    return this._config as UI5CardCardConfig;
  }

  private escapeText(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeAttrValue(text: string): string {
    return text.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  protected render(): void {
    if (!this._hass || !this.config) return;

    // Get title from config or entity name
    let title = this.config.title || "";
    if (!title && this.config.entity) {
      title = getEntityName(this._hass, this.config.entity);
    }

    // Get subtitle
    const subtitle = this.config.subtitle
      ? this.processTemplate(this.config.subtitle)
      : "";

    // Get status from config or entity state
    let status = this.config.status || "";
    if (this.config.show_entity_state !== false && this.config.entity) {
      status = status || formatEntityState(this._hass, this.config.entity);
    }

    // Process content
    const content = this.config.content
      ? this.processTemplate(this.config.content)
      : "";

    const interactive = this.config.header_interactive !== false;
    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        :host {
          --_ui5_card_border_radius: var(--ha-card-border-radius, 12px);
        }

        .ui5-card-wrapper {
          display: block;
        }

        ui5-card {
          width: 100%;
        }

        ui5-card-header {
          cursor: ${interactive ? "pointer" : "default"};
        }

        .card-content {
          padding: 16px;
          color: var(--primary-text-color);
        }

        .unavailable {
          opacity: 0.5;
        }

        .entity-state {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px;
        }

        .state-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .state-label {
          font-size: 14px;
          color: var(--secondary-text-color);
        }
      </style>

      <div class="ui5-card-wrapper ${isUnavailable ? "unavailable" : ""}">
        <ui5-card>
          <ui5-card-header
            id="card-header"
            slot="header"
            title-text="${this.escapeAttrValue(title)}"
            ${subtitle ? `subtitle-text="${this.escapeAttrValue(subtitle)}"` : ""}
            ${status ? `status="${this.escapeAttrValue(status)}"` : ""}
            ${interactive ? "interactive" : ""}
          ></ui5-card-header>
          ${
            content
              ? `<div class="card-content">${this.escapeText(content)}</div>`
              : this.config.entity
                ? `
              <div class="entity-state">
                <div>
                  <div class="state-value">${formatEntityState(this._hass, this.config.entity)}</div>
                  <div class="state-label">${getEntityName(this._hass, this.config.entity)}</div>
                </div>
              </div>
            `
                : ""
          }
        </ui5-card>
      </div>
    `;

    if (interactive) {
      this.setupHeaderClickHandler();
    }
  }

  private setupHeaderClickHandler(): void {
    const header = this.shadow.getElementById("card-header");
    if (!header) return;

    header.addEventListener("click", () => {
      if (this.config?.entity && this._hass) {
        const moreInfoEvent = new CustomEvent("hass-more-info", {
          bubbles: true,
          composed: true,
          detail: { entityId: this.config.entity },
        });
        this.dispatchEvent(moreInfoEvent);
      }
    });
  }

  getCardSize(): number {
    return this.config?.content ? 3 : 2;
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-card-card",
      title: "UI5 Card",
      subtitle: "Card subtitle",
      entity: "sensor.temperature",
    };
  }
}

customElements.define("ui5-card-card", UI5CardCard);
