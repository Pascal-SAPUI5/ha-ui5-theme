/**
 * UI5 NotificationList Card
 * A Lovelace card that displays a UI5 NotificationList component
 */

import { BaseUI5Card } from "./base-card";
import type { UI5NotificationListCardConfig } from "../types";
import "../ui5-loader";

export class UI5NotificationListCard extends BaseUI5Card {
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
    const itemsHtml =
      this.config.notifications
        ?.map((notification, index) => {
          const title = this.processTemplateEscaped(notification.title);
          const description = notification.description
            ? this.processTemplateEscaped(notification.description)
            : "";
          const priority = notification.priority || "None";
          const timestamp = notification.timestamp || "";

          // If entity is specified, get its state
          let content = description;
          if (notification.entity && this._hass) {
            const entity = this._hass.states[notification.entity];
            if (entity) {
              content = `${description ? description + " - " : ""}${entity.state}`;
            }
          }

          return `
        <ui5-notification-list-item
          id="notification-${index}"
          title-text="${title}"
          priority="${priority}"
          ${timestamp ? `timestamp="${timestamp}"` : ""}
          show-close
        >
          ${content}
        </ui5-notification-list-item>
      `;
        })
        .join("") || "";

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .notification-container {
          width: 100%;
        }

        ui5-notification-list {
          width: 100%;
        }

        .card-container {
          padding: 0;
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="notification-container">
          <ui5-notification-list id="main-notification-list">
            ${itemsHtml}
          </ui5-notification-list>
        </div>
      </div>
    `;

    // Set up click handlers for notification items
    this.config.notifications?.forEach((notification, index) => {
      const element = this.shadow.getElementById(`notification-${index}`);
      if (element) {
        // Handle close button
        element.addEventListener("close", (e) => {
          e.stopPropagation();
          if (element.parentElement) {
            element.parentElement.removeChild(element);
          }
        });

        // Handle click to show more info if entity is specified
        if (notification.entity) {
          element.addEventListener("click", () => {
            this.executeAction({ action: "more-info" });
          });
        }
      }
    });

    // Set up action handler for main notification list
    const notificationList = this.shadow.getElementById(
      "main-notification-list",
    );
    if (notificationList) {
      this.setupActionHandlers(notificationList);
    }
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-notification-list-card",
      notifications: [
        {
          title: "System Update",
          description: "A new version is available",
          priority: "High",
          timestamp: "2 minutes ago",
        },
        {
          title: "Battery Low",
          description: "Front door sensor battery is low",
          priority: "Medium",
          timestamp: "1 hour ago",
        },
      ],
    };
  }
}

// Register custom element
customElements.define("ui5-notification-list-card", UI5NotificationListCard);
