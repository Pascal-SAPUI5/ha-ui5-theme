/**
 * UI5 Page Card
 * A Lovelace card that displays a UI5 Page component
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5PageCardConfig } from "../../types";
import { ensureFiori } from "../../ui5-loader";

export class UI5PageCard extends BaseUI5Card {
  async connectedCallback(): Promise<void> {
    try {
      await ensureFiori();
    } catch (error) {
      console.error("[ui5-page-card] Failed to load Fiori components:", error);
      this.renderError("Failed to load UI5 Fiori components");
      return;
    }
    super.connectedCallback();
  }

  setConfig(config: UI5PageCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5PageCardConfig | undefined {
    return this._config as UI5PageCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    // Process content with templates (escaped for security)
    const content = this.processTemplateEscaped(
      this.config.content || "Page content",
    );
    const backgroundDesign = this.config.background_design || "Solid";
    const floatingFooter = this.config.floating_footer ? "floating-footer" : "";

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .page-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        ui5-page {
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
        <div class="page-container">
          <ui5-page
            id="page"
            background-design="${backgroundDesign}"
            ${floatingFooter}
          >
            <div>${content}</div>
          </ui5-page>
          ${
            this.config.entity
              ? `<div class="entity-info">${entityState}</div>`
              : ""
          }
        </div>
      </div>
    `;

    // Set up action handlers
    const page = this.shadow.getElementById("page");
    if (page) {
      this.setupActionHandlers(page);
    }
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-page-card",
      content: "Welcome to Home Assistant",
      background_design: "Solid",
    };
  }
}

// Register custom element
customElements.define("ui5-page-card", UI5PageCard);
