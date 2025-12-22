/**
 * UI5 ShellBar Card
 * A Lovelace card that displays a UI5 ShellBar component
 */

import { BaseUI5Card } from "./base-card";
import type { UI5ShellBarCardConfig } from "../types";
import { ensureFiori } from "../ui5-loader";

export class UI5ShellBarCard extends BaseUI5Card {
  async connectedCallback(): void {
    try {
      await ensureFiori();
    } catch (error) {
      console.error(
        "[ui5-shellbar-card] Failed to load Fiori components:",
        error,
      );
      this.renderError("Failed to load UI5 Fiori components");
      return;
    }
    super.connectedCallback();
  }

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

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .shellbar-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        ui5-shellbar {
          width: 100%;
        }

        .entity-info {
          font-size: 12px;
          color: var(--secondary-text-color);
          text-align: center;
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="shellbar-container">
          <ui5-shellbar
            id="shellbar"
            primary-title="${primaryTitle}"
            ${secondaryTitle ? `secondary-title="${secondaryTitle}"` : ""}
            ${logo ? `logo="${logo}"` : ""}
          ></ui5-shellbar>
          ${
            this.config.entity
              ? `<div class="entity-info">${entityState}</div>`
              : ""
          }
        </div>
      </div>
    `;

    // Set up action handlers
    const shellbar = this.shadow.getElementById("shellbar");
    if (shellbar) {
      this.setupActionHandlers(shellbar);
    }
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-shellbar-card",
      primary_title: "Home Assistant",
      secondary_title: "Dashboard",
    };
  }
}

// Register custom element
customElements.define("ui5-shellbar-card", UI5ShellBarCard);
