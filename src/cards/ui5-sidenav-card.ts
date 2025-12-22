/**
 * UI5 SideNavigation Card
 * A Lovelace card that displays a UI5 SideNavigation component
 */

import { BaseUI5Card } from "./base-card";
import type { UI5SideNavCardConfig } from "../types";
import "../ui5-loader";

export class UI5SideNavCard extends BaseUI5Card {
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

    // Build navigation items
    const itemsHtml =
      this.config.items
        ?.map((item, index) => {
          const hasSubItems = item.items && item.items.length > 0;
          const subItemsHtml = hasSubItems
            ? item
                .items!.map(
                  (subItem, subIndex) => `
            <ui5-side-navigation-sub-item
              id="subitem-${index}-${subIndex}"
              text="${this.processTemplateEscaped(subItem.text)}"
              ${subItem.path ? `data-path="${subItem.path}"` : ""}
            ></ui5-side-navigation-sub-item>
          `,
                )
                .join("")
            : "";

          return `
        <ui5-side-navigation-item
          id="item-${index}"
          text="${this.processTemplateEscaped(item.text)}"
          ${item.icon ? `icon="${item.icon}"` : ""}
          ${item.path ? `data-path="${item.path}"` : ""}
          ${hasSubItems ? "expanded" : ""}
        >
          ${subItemsHtml}
        </ui5-side-navigation-item>
      `;
        })
        .join("") || "";

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .sidenav-container {
          width: 100%;
          min-height: 300px;
        }

        ui5-side-navigation {
          width: 100%;
          height: 100%;
        }

        .card-container {
          padding: 0;
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="sidenav-container">
          <ui5-side-navigation id="main-sidenav">
            ${itemsHtml}
          </ui5-side-navigation>
        </div>
      </div>
    `;

    // Set up click handlers for navigation items
    this.config.items?.forEach((item, index) => {
      const element = this.shadow.getElementById(`item-${index}`);
      if (element) {
        element.addEventListener("click", () => {
          const path = element.getAttribute("data-path");
          if (path) {
            this.executeAction({ action: "navigate", navigation_path: path });
          }
        });
      }

      // Handle sub-items
      item.items?.forEach((subItem, subIndex) => {
        const subElement = this.shadow.getElementById(
          `subitem-${index}-${subIndex}`,
        );
        if (subElement) {
          subElement.addEventListener("click", () => {
            const path = subElement.getAttribute("data-path");
            if (path) {
              this.executeAction({ action: "navigate", navigation_path: path });
            }
          });
        }
      });
    });

    // Set up action handler for main sidenav
    const sidenav = this.shadow.getElementById("main-sidenav");
    if (sidenav) {
      this.setupActionHandlers(sidenav);
    }
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-sidenav-card",
      items: [
        {
          text: "Home",
          icon: "home",
          path: "/lovelace/0",
        },
        {
          text: "Settings",
          icon: "action-settings",
          items: [
            { text: "General", path: "/config/general" },
            { text: "Integrations", path: "/config/integrations" },
          ],
        },
      ],
    };
  }
}

// Register custom element
customElements.define("ui5-sidenav-card", UI5SideNavCard);
