/**
 * UI5 Timeline Card
 * A Lovelace card that displays a UI5 Timeline component
 */

import { BaseUI5Card } from "./base-card";
import type { UI5TimelineCardConfig } from "../types";
import { ensureFiori } from "../ui5-loader";

export class UI5TimelineCard extends BaseUI5Card {
  async connectedCallback(): void {
    try {
      await ensureFiori();
    } catch (error) {
      console.error(
        "[ui5-timeline-card] Failed to load Fiori components:",
        error,
      );
      this.renderError("Failed to load UI5 Fiori components");
      return;
    }
    super.connectedCallback();
  }

  setConfig(config: UI5TimelineCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5TimelineCardConfig | undefined {
    return this._config as UI5TimelineCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";
    const layout = this.config.layout || "Vertical";

    // Build timeline items
    const items = (this.config.items || [])
      .map((item) => {
        const titleText = this.processTemplateEscaped(item.title_text);
        const subtitleText = this.processTemplateEscaped(
          item.subtitle_text || "",
        );
        const icon = item.icon || "";
        const name = item.name || "";
        return `<ui5-timeline-item
          title-text="${titleText}"
          ${subtitleText ? `subtitle-text="${subtitleText}"` : ""}
          ${icon ? `icon="${icon}"` : ""}
          ${name ? `name="${name}"` : ""}
        ></ui5-timeline-item>`;
      })
      .join("");

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .timeline-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        ui5-timeline {
          width: 100%;
          min-height: 200px;
        }

        .entity-info {
          font-size: 12px;
          color: var(--secondary-text-color);
          text-align: center;
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="timeline-container">
          <ui5-timeline
            id="timeline"
            layout="${layout}"
          >
            ${items}
          </ui5-timeline>
          ${
            this.config.entity
              ? `<div class="entity-info">${entityState}</div>`
              : ""
          }
        </div>
      </div>
    `;

    // Set up action handlers
    const timeline = this.shadow.getElementById("timeline");
    if (timeline) {
      this.setupActionHandlers(timeline);
    }
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-timeline-card",
      layout: "Vertical",
      items: [
        {
          title_text: "Event 1",
          subtitle_text: "Just now",
          icon: "phone",
        },
        {
          title_text: "Event 2",
          subtitle_text: "5 minutes ago",
          icon: "message",
        },
      ],
    };
  }
}

// Register custom element
customElements.define("ui5-timeline-card", UI5TimelineCard);
