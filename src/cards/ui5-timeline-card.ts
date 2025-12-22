/**
 * UI5 Timeline Card
 * A Lovelace card that displays a UI5 Timeline component
 */

import { BaseUI5Card } from "./base-card";
import type { UI5TimelineCardConfig } from "../types";
import "../ui5-loader";

export class UI5TimelineCard extends BaseUI5Card {
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
    const itemsHtml =
      this.config.items
        ?.map((item, index) => {
          const title = this.processTemplateEscaped(item.title);
          const subtitle = item.subtitle
            ? this.processTemplateEscaped(item.subtitle)
            : "";
          const timestamp = item.timestamp || "";
          const icon = item.icon || "activities";

          // If entity is specified, get its state
          let content = subtitle;
          if (item.entity && this._hass) {
            const entity = this._hass.states[item.entity];
            if (entity) {
              content = `${subtitle ? subtitle + " - " : ""}${entity.state}`;
            }
          }

          return `
        <ui5-timeline-group-item
          id="item-${index}"
          title-text="${title}"
          ${subtitle ? `subtitle-text="${content}"` : ""}
          ${timestamp ? `timestamp="${timestamp}"` : ""}
          icon="${icon}"
        ></ui5-timeline-group-item>
      `;
        })
        .join("") || "";

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .timeline-container {
          width: 100%;
        }

        ui5-timeline {
          width: 100%;
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="timeline-container">
          <ui5-timeline
            id="main-timeline"
            layout="${layout}"
          >
            ${itemsHtml}
          </ui5-timeline>
        </div>
      </div>
    `;

    // Set up action handlers for timeline items
    this.config.items?.forEach((item, index) => {
      const element = this.shadow.getElementById(`item-${index}`);
      if (element && item.entity) {
        element.addEventListener("click", () => {
          this.executeAction({ action: "more-info" });
        });
      }
    });

    // Set up action handler for main timeline
    const timeline = this.shadow.getElementById("main-timeline");
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
          title: "System Started",
          subtitle: "Home Assistant initialized",
          timestamp: "2024-01-01 12:00",
          icon: "sys-enter",
        },
        {
          title: "Motion Detected",
          subtitle: "Living Room",
          timestamp: "2024-01-01 12:30",
          icon: "activate",
        },
      ],
    };
  }
}

// Register custom element
customElements.define("ui5-timeline-card", UI5TimelineCard);
