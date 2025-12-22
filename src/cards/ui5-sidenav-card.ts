/**
 * UI5 SideNavigation Card
 * A Lovelace card that displays a UI5 SideNavigation component
 */

import { BaseUI5Card } from "./base-card";
import type { UI5SideNavCardConfig } from "../types";
import { ensureFiori } from "../ui5-loader";

export class UI5SideNavCard extends BaseUI5Card {
  async connectedCallback(): void {
    await ensureFiori();
    super.connectedCallback();
  }

  setConfig(config: UI5SideNavCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5SideNavCardConfig | undefined {
    return this._config as UI5SideNavCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";
    const collapsed = this.config.collapsed || false;

    // Build navigation items
    const items = (this.config.items || [])
      .map((item) => {
        const text = this.processTemplateEscaped(item.text);
        const icon = item.icon || "";
        return `<ui5-side-navigation-item text="${text}" ${icon ? `icon="${icon}"` : ""}></ui5-side-navigation-item>`;
      })
      .join("");

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .sidenav-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        ui5-side-navigation {
          width: 100%;
          min-height: 300px;
        }

        .entity-info {
          font-size: 12px;
          color: var(--secondary-text-color);
          text-align: center;
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="sidenav-container">
          <ui5-side-navigation
            id="sidenav"
            ${collapsed ? "collapsed" : ""}
          >
            ${items}
          </ui5-side-navigation>
          ${
            this.config.entity
              ? `<div class="entity-info">${entityState}</div>`
              : ""
          }
        </div>
      </div>
    `;

    // Set up action handlers
    const sidenav = this.shadow.getElementById("sidenav");
    if (sidenav) {
      this.setupActionHandlers(sidenav);
    }
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-sidenav-card",
      items: [
        { text: "Home", icon: "home" },
        { text: "Settings", icon: "settings" },
      ],
    };
  }
}

// Register custom element
customElements.define("ui5-sidenav-card", UI5SideNavCard);
