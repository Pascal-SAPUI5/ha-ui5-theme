/**
 * UI5 ShellBar Card
 * A Lovelace card that displays a UI5 ShellBar component
 */

import { BaseUI5Card } from "./base-card";
import type { UI5ShellBarCardConfig } from "../types";
import "../ui5-loader";

export class UI5ShellBarCard extends BaseUI5Card {
  setConfig(config: UI5ShellBarCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5ShellBarCardConfig | undefined {
    return this._config as UI5ShellBarCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    // Process text with templates (escaped for security)
    const primaryTitle = this.processTemplateEscaped(
      this.config.primary_title || "Home Assistant",
    );
    const secondaryTitle = this.processTemplateEscaped(
      this.config.secondary_title || "",
    );
    const logo = this.config.logo || "";
    const showNotifications = this.config.show_notifications ?? true;
    const showProfile = this.config.show_profile ?? true;

    // Build shell bar items
    const itemsHtml =
      this.config.items
        ?.map(
          (item, index) => `
      <ui5-shellbar-item
        id="item-${index}"
        text="${this.processTemplateEscaped(item.text)}"
        ${item.icon ? `icon="${item.icon}"` : ""}
      ></ui5-shellbar-item>
    `,
        )
        .join("") || "";

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .shellbar-container {
          width: 100%;
        }

        ui5-shellbar {
          width: 100%;
        }

        .card-container {
          padding: 0;
          overflow: hidden;
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="shellbar-container">
          <ui5-shellbar
            id="main-shellbar"
            primary-title="${primaryTitle}"
            ${secondaryTitle ? `secondary-title="${secondaryTitle}"` : ""}
            ${logo ? `logo="${logo}"` : ""}
            ${showNotifications ? "show-notifications" : ""}
            ${showProfile ? "show-product-switch" : ""}
          >
            ${itemsHtml}
          </ui5-shellbar>
        </div>
      </div>
    `;

    // Set up action handlers for items
    this.config.items?.forEach((item, index) => {
      const element = this.shadow.getElementById(`item-${index}`);
      if (element && item.action) {
        element.addEventListener("click", () => {
          if (item.action) {
            this.executeAction(item.action);
          }
        });
      }
    });

    // Set up action handler for main shellbar
    const shellbar = this.shadow.getElementById("main-shellbar");
    if (shellbar) {
      this.setupActionHandlers(shellbar);
    }
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-shellbar-card",
      primary_title: "Home Assistant",
      secondary_title: "Dashboard",
      show_notifications: true,
      show_profile: true,
    };
  }
}

// Register custom element
customElements.define("ui5-shellbar-card", UI5ShellBarCard);
