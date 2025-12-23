/**
 * UI5 NotificationList Card
 * A Lovelace card that displays a UI5 NotificationList component
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5NotificationListCardConfig } from "../../types";
import { ensureFiori } from "../../ui5-loader";

export class UI5NotificationListCard extends BaseUI5Card {
  async connectedCallback(): Promise<void> {
    try {
      await ensureFiori();
    } catch (error) {
      console.error(
        "[ui5-notification-list-card] Failed to load Fiori components:",
        error,
      );
      this.renderError("Failed to load UI5 Fiori components");
      return;
    }
    super.connectedCallback();
  }

  setConfig(config: UI5NotificationListCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5NotificationListCardConfig | undefined {
    return this._config as UI5NotificationListCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    // Build notification items
    const items = (this.config.items || [])
      .map((item) => {
        const titleText = this.processTemplateEscaped(item.title_text);
        const priority = item.priority || "None";
        const read = item.read ? "read" : "";
        return `<ui5-notification-list-item
          title-text="${titleText}"
          priority="${priority}"
          ${read}
        >${this.processTemplateEscaped(item.description || "")}</ui5-notification-list-item>`;
      })
      .join("");

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .notification-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        ui5-notification-list {
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
        <div class="notification-container">
          <ui5-notification-list id="notification-list">
            ${items}
          </ui5-notification-list>
          ${
            this.config.entity
              ? `<div class="entity-info">${entityState}</div>`
              : ""
          }
        </div>
      </div>
    `;

    // Set up action handlers
    const notificationList = this.shadow.getElementById("notification-list");
    if (notificationList) {
      this.setupActionHandlers(notificationList);
    }
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-notification-list-card",
      items: [
        {
          title_text: "New Message",
          description: "You have a new message",
          priority: "High",
          read: false,
        },
        {
          title_text: "System Update",
          description: "System update available",
          priority: "Medium",
          read: true,
        },
      ],
    };
  }
}

// Register custom element
customElements.define("ui5-notification-list-card", UI5NotificationListCard);
