/**
 * UI5 Page Card
 * A Lovelace card that displays a UI5 Page component
 */

import { BaseUI5Card } from "./base-card";
import type { UI5PageCardConfig } from "../types";
import "../ui5-loader";

export class UI5PageCard extends BaseUI5Card {
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

    const headerText = this.processTemplateEscaped(
      this.config.header_text || "Page",
    );
    const showFooter = this.config.show_footer ?? false;
    const footerText = showFooter
      ? this.processTemplateEscaped(this.config.footer_text || "Footer")
      : "";
    const content = this.processTemplateEscaped(
      this.config.content || "Content goes here",
    );

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .page-container {
          width: 100%;
          min-height: 400px;
        }

        ui5-page {
          width: 100%;
          height: 100%;
        }

        .card-container {
          padding: 0;
          overflow: hidden;
        }

        .page-content {
          padding: 16px;
          color: var(--primary-text-color);
        }

        .page-footer {
          padding: 12px 16px;
          border-top: 1px solid var(--divider-color);
          text-align: center;
          color: var(--secondary-text-color);
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="page-container">
          <ui5-page
            id="main-page"
            header-text="${headerText}"
          >
            <div class="page-content">${content}</div>
            ${
              showFooter
                ? `<div slot="footer" class="page-footer">${footerText}</div>`
                : ""
            }
          </ui5-page>
        </div>
      </div>
    `;

    // Set up action handler for main page
    const page = this.shadow.getElementById("main-page");
    if (page) {
      this.setupActionHandlers(page);
    }
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-page-card",
      header_text: "My Page",
      content: "This is the page content area",
      show_footer: true,
      footer_text: "Footer text",
    };
  }
}

// Register custom element
customElements.define("ui5-page-card", UI5PageCard);
