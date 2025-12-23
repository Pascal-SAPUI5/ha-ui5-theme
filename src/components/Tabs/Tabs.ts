/**
 * UI5 Tabs Card
 * A Lovelace card using UI5 TabContainer for tabbed content
 *
 * Features:
 * - Multiple tabs with custom content
 * - Entity lists per tab
 * - Tab icons and disabled state
 * - Configurable layout
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5TabsCardConfig } from "../../types";
import { getEntityName, formatEntityState } from "../../utils/ha-helpers";
import "../../ui5-loader";

export class UI5TabsCard extends BaseUI5Card {
  private selectedTabIndex = 0;

  setConfig(config: UI5TabsCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);

    // Find initially selected tab
    if (config.tabs) {
      const selectedIndex = config.tabs.findIndex((tab) => tab.selected);
      if (selectedIndex >= 0) {
        this.selectedTabIndex = selectedIndex;
      }
    }
  }

  get config(): UI5TabsCardConfig | undefined {
    return this._config as UI5TabsCardConfig;
  }

  protected hasEntityStateChanged(
    oldHass: typeof this._hass,
    newHass: typeof this._hass,
  ): boolean {
    if (!oldHass || !newHass || !this.config?.tabs) return true;

    for (const tab of this.config.tabs) {
      if (tab.entities) {
        for (const entityId of tab.entities) {
          if (oldHass.states[entityId] !== newHass.states[entityId]) return true;
        }
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

  private renderEntityList(entities: string[]): string {
    if (!this._hass || !entities.length) return "";

    let html = '<div class="entity-list">';

    for (const entityId of entities) {
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

  private renderTabs(): string {
    if (!this.config?.tabs) return "";

    return this.config.tabs
      .map((tab, index) => {
        const text = this.processTemplate(tab.text);
        const iconAttr = tab.icon ? `icon="${tab.icon}"` : "";
        const disabledAttr = tab.disabled ? "disabled" : "";
        const selectedAttr = index === this.selectedTabIndex ? "selected" : "";

        // Content for this tab
        const customContent = tab.content ? this.processTemplate(tab.content) : "";
        const entityList = tab.entities ? this.renderEntityList(tab.entities) : "";

        return `
          <ui5-tab
            text="${this.escapeAttrValue(text)}"
            ${iconAttr}
            ${disabledAttr}
            ${selectedAttr}
            data-tab-index="${index}"
          >
            <div class="tab-content">
              ${customContent ? `<div class="custom-content">${this.escapeText(customContent)}</div>` : ""}
              ${entityList}
              ${!customContent && !entityList ? '<div class="empty-content">No content</div>' : ""}
            </div>
          </ui5-tab>
        `;
      })
      .join("");
  }

  protected render(): void {
    if (!this._hass || !this.config) return;

    const tabLayout = this.config.tab_layout || "Standard";
    const overflowMode = this.config.tabs_overflow_mode || "End";
    const collapsed = this.config.collapsed || false;

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .tabs-wrapper {
          display: block;
        }

        ui5-tabcontainer {
          width: 100%;
        }

        .tab-content {
          padding: 16px 0;
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

        .empty-content {
          padding: 24px;
          text-align: center;
          color: var(--secondary-text-color);
        }
      </style>

      <div class="card-container">
        <div class="tabs-wrapper">
          <ui5-tabcontainer
            id="tab-container"
            tab-layout="${tabLayout}"
            tabs-overflow-mode="${overflowMode}"
            ${collapsed ? "collapsed" : ""}
          >
            ${this.renderTabs()}
          </ui5-tabcontainer>
        </div>
      </div>
    `;

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle tab selection
    const tabContainer = this.shadow.getElementById("tab-container");
    if (tabContainer) {
      tabContainer.addEventListener("tab-select", (event: Event) => {
        const customEvent = event as CustomEvent;
        const tab = customEvent.detail?.tab as HTMLElement;
        if (tab) {
          const index = tab.getAttribute("data-tab-index");
          if (index !== null) {
            this.selectedTabIndex = parseInt(index, 10);
          }
        }
      });
    }

    // Handle entity clicks
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
    const maxEntities = Math.max(
      ...(this.config?.tabs?.map((t) => t.entities?.length || 0) || [0]),
    );
    return Math.max(2, Math.ceil(maxEntities / 4) + 1);
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-tabs-card",
      tabs: [
        {
          text: "Lights",
          icon: "lightbulb",
          entities: ["light.living_room"],
        },
        {
          text: "Switches",
          icon: "switches",
          entities: ["switch.kitchen"],
        },
      ],
    };
  }
}

customElements.define("ui5-tabs-card", UI5TabsCard);
