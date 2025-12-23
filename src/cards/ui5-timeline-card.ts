/**
 * UI5 Timeline Card
 * A Lovelace card that displays a UI5 Timeline component
 * Can show entity state changes or custom timeline items
 */

import { BaseUI5Card } from "./base-card";
import type {
  UI5TimelineCardConfig,
  TimelineItemConfig,
  HassEntity,
} from "../types";
import { escapeHtml } from "../utils/template-processor";
import "../ui5-loader";

interface TimelineEntry {
  title: string;
  subtitle: string;
  icon: string;
  state: string;
}

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

  /**
   * Check if any monitored entity state has changed
   */
  protected hasEntityStateChanged(
    oldHass: import("../types").HomeAssistant,
    newHass: import("../types").HomeAssistant,
  ): boolean {
    // Check main entity
    if (super.hasEntityStateChanged(oldHass, newHass)) {
      return true;
    }

    // Check entities array
    const entities = this.config?.entities || [];
    for (const entityId of entities) {
      const oldState = oldHass.states[entityId];
      const newState = newHass.states[entityId];
      if (oldState !== newState) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get timeline entries from entities
   */
  private getEntityEntries(): TimelineEntry[] {
    if (!this._hass || !this.config?.entities) {
      return [];
    }

    const entries: TimelineEntry[] = [];
    const maxItems = this.config.max_items ?? 10;

    for (const entityId of this.config.entities) {
      const entity = this._hass.states[entityId];
      if (!entity) {
        continue;
      }

      entries.push({
        title: entity.attributes.friendly_name || entityId,
        subtitle: this.formatEntityState(entity),
        icon: this.getEntityIcon(entity),
        state: this.getValueState(entity),
      });

      if (entries.length >= maxItems) {
        break;
      }
    }

    return entries;
  }

  /**
   * Get timeline entries from static items config
   */
  private getStaticEntries(): TimelineEntry[] {
    if (!this.config?.items) {
      return [];
    }

    const maxItems = this.config.max_items ?? 10;

    return this.config.items.slice(0, maxItems).map((item: TimelineItemConfig) => ({
      title: item.title,
      subtitle: item.subtitle || "",
      icon: item.icon || "status-positive",
      state: item.state || "None",
    }));
  }

  /**
   * Format entity state for display
   */
  private formatEntityState(entity: HassEntity): string {
    const state = entity.state;
    const unit = entity.attributes.unit_of_measurement;

    if (state === "unavailable" || state === "unknown") {
      return state;
    }

    // Format timestamp
    const lastChanged = new Date(entity.last_changed);
    const timeStr = lastChanged.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (unit) {
      return `${state} ${unit} (${timeStr})`;
    }

    return `${state} (${timeStr})`;
  }

  /**
   * Get icon for entity based on domain
   */
  private getEntityIcon(entity: HassEntity): string {
    const domain = entity.entity_id.split(".")[0];

    const iconMap: Record<string, string> = {
      light: "lightbulb",
      switch: "switch",
      sensor: "measure",
      binary_sensor: "status-positive",
      climate: "temperature",
      cover: "window",
      fan: "fan",
      media_player: "play",
      lock: "locked",
      alarm_control_panel: "shield",
      camera: "camera",
      person: "employee",
      device_tracker: "locate-me",
      automation: "process",
      script: "document-text",
      scene: "home",
      input_boolean: "switch",
      input_number: "number-sign",
    };

    return iconMap[domain] || "circle-task";
  }

  /**
   * Get UI5 value state based on entity state
   */
  private getValueState(entity: HassEntity): string {
    const state = entity.state;

    if (state === "unavailable" || state === "unknown") {
      return "Error";
    }

    if (state === "on" || state === "open" || state === "unlocked") {
      return "Success";
    }

    if (state === "off" || state === "closed" || state === "locked") {
      return "None";
    }

    // For numeric sensors, could add threshold-based states
    return "Information";
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    // Get entries from entities or static items
    const entries =
      this.config.entities && this.config.entities.length > 0
        ? this.getEntityEntries()
        : this.getStaticEntries();

    const layout = this.config.layout || "Vertical";
    const title = this.processTemplateEscaped(this.config.name || "Timeline");

    // Generate timeline items HTML
    const itemsHtml = entries
      .map(
        (entry, index) => `
        <ui5-timeline-item
          id="timeline-item-${index}"
          title-text="${escapeHtml(entry.title)}"
          subtitle-text="${escapeHtml(entry.subtitle)}"
          icon="sap-icon://${escapeHtml(entry.icon)}"
          ${entry.state !== "None" ? `name="${entry.state}"` : ""}
        ></ui5-timeline-item>
      `,
      )
      .join("");

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .timeline-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }

        .timeline-header {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        ui5-timeline {
          width: 100%;
          --sapContent_NonInteractiveIconColor: var(--primary-color);
        }

        ui5-timeline-item {
          cursor: pointer;
        }

        ui5-timeline-item::part(title) {
          color: var(--primary-text-color);
        }

        ui5-timeline-item::part(subtitle) {
          color: var(--secondary-text-color);
        }

        .empty-state {
          text-align: center;
          padding: 24px;
          color: var(--secondary-text-color);
          font-style: italic;
        }
      </style>

      <div class="card-container">
        <div class="timeline-container">
          ${title ? `<div class="timeline-header">${title}</div>` : ""}
          ${
            entries.length > 0
              ? `
            <ui5-timeline id="main-timeline" layout="${layout}">
              ${itemsHtml}
            </ui5-timeline>
          `
              : `
            <div class="empty-state">No timeline entries</div>
          `
          }
        </div>
      </div>
    `;

    // Set up action handlers for each timeline item
    entries.forEach((_, index) => {
      const item = this.shadow.getElementById(`timeline-item-${index}`);
      if (item) {
        this.setupActionHandlers(item);
      }
    });
  }

  getCardSize(): number {
    const entries = this.config?.entities?.length || this.config?.items?.length || 0;
    return Math.max(1, Math.ceil(entries / 3));
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-timeline-card",
      name: "Timeline",
      items: [
        { title: "Event 1", subtitle: "Description", icon: "activities" },
        { title: "Event 2", subtitle: "Description", icon: "activities" },
        { title: "Event 3", subtitle: "Description", icon: "activities" },
      ],
    };
  }
}

// Register custom element
customElements.define("ui5-timeline-card", UI5TimelineCard);
