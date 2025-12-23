/**
 * UI5 Panel Card
 * A Lovelace card using UI5 Panel component for collapsible sections
 *
 * Features:
 * - Collapsible content
 * - Entity display in panel content
 * - Custom content support
 * - Fixed (non-collapsible) mode
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5PanelCardConfig } from "../../types";
import { getEntityName, formatEntityState } from "../../utils/ha-helpers";
import "../../ui5-loader";

export class UI5PanelCard extends BaseUI5Card {
  setConfig(config: UI5PanelCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5PanelCardConfig | undefined {
    return this._config as UI5PanelCardConfig;
  }

  protected hasEntityStateChanged(
    oldHass: typeof this._hass,
    newHass: typeof this._hass,
  ): boolean {
    if (!oldHass || !newHass || !this.config) return true;

    if (this.config.entity) {
      if (oldHass.states[this.config.entity] !== newHass.states[this.config.entity]) {
        return true;
      }
    }

    if (this.config.entities) {
      for (const entityId of this.config.entities) {
        if (oldHass.states[entityId] !== newHass.states[entityId]) return true;
      }
    }

    return false;
  }

  private escapeText(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeAttrValue(text: string): string {
    return text.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  private renderEntityList(): string {
    if (!this._hass || !this.config?.entities) return "";

    let html = '<div class="entity-list">';

    for (const entityId of this.config.entities) {
      const entity = this._hass.states[entityId];
      if (!entity) continue;

      const name = getEntityName(this._hass, entityId);
      const state = formatEntityState(this._hass, entityId);

      html += `
        <div class="entity-row" data-entity="${entityId}">
          <span class="entity-name">${this.escapeText(name)}</span>
          <span class="entity-state">${this.escapeText(state)}</span>
        </div>
      `;
    }

    html += "</div>";
    return html;
  }

  protected render(): void {
    if (!this._hass || !this.config) return;

    // Get header text from config or entity name
    let headerText = this.config.header_text || "";
    if (!headerText && this.config.entity) {
      headerText = getEntityName(this._hass, this.config.entity);
    }

    const collapsed = this.config.collapsed || false;
    const fixed = this.config.fixed || false;
    const accessibleRole = this.config.accessible_role || "Region";

    // Process content
    const customContent = this.config.content
      ? this.processTemplate(this.config.content)
      : "";

    const entityList = this.renderEntityList();

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .panel-wrapper {
          display: block;
        }

        ui5-panel {
          width: 100%;
        }

        .panel-content {
          padding: 8px 0;
        }

        .entity-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .entity-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .entity-row:hover {
          background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
        }

        .entity-name {
          font-size: 14px;
          color: var(--primary-text-color);
        }

        .entity-state {
          font-size: 14px;
          font-weight: 500;
          color: var(--secondary-text-color);
        }

        .custom-content {
          padding: 8px 0;
          color: var(--primary-text-color);
        }
      </style>

      <div class="card-container">
        <div class="panel-wrapper">
          <ui5-panel
            id="main-panel"
            header-text="${this.escapeAttrValue(headerText)}"
            ${collapsed ? "collapsed" : ""}
            ${fixed ? "fixed" : ""}
            accessible-role="${accessibleRole}"
          >
            <div class="panel-content">
              ${customContent ? `<div class="custom-content">${this.escapeText(customContent)}</div>` : ""}
              ${entityList}
            </div>
          </ui5-panel>
        </div>
      </div>
    `;

    this.setupEntityClickHandlers();
  }

  private setupEntityClickHandlers(): void {
    const entityRows = this.shadow.querySelectorAll(".entity-row");

    entityRows.forEach((row) => {
      row.addEventListener("click", () => {
        const entityId = row.getAttribute("data-entity");
        if (entityId && this._hass) {
          const moreInfoEvent = new CustomEvent("hass-more-info", {
            bubbles: true,
            composed: true,
            detail: { entityId },
          });
          this.dispatchEvent(moreInfoEvent);
        }
      });
    });
  }

  getCardSize(): number {
    const entityCount = this.config?.entities?.length || 0;
    return Math.max(1, Math.ceil(entityCount / 4) + 1);
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-panel-card",
      header_text: "Panel Section",
      entities: ["light.living_room", "switch.kitchen"],
      collapsed: false,
    };
  }
}

customElements.define("ui5-panel-card", UI5PanelCard);
