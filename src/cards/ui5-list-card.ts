/**
 * UI5 List Card
 * A Lovelace card that displays entities in a UI5 List component
 *
 * Features:
 * - Display multiple entities in a list format
 * - Entity state as additional text
 * - Click to show more-info dialog
 * - Grouping by domain
 * - Custom items support
 */

import { BaseUI5Card } from "./base-card";
import type { UI5ListCardConfig, HassEntity } from "../types";
import { getEntityName, getDomain, formatEntityState } from "../utils/ha-helpers";
import "../ui5-loader";

interface ListItem {
  text: string;
  description?: string;
  icon?: string;
  iconEnd?: string;
  additionalText?: string;
  additionalTextState?: string;
  type?: string;
  entityId?: string;
}

interface GroupedItems {
  [group: string]: ListItem[];
}

export class UI5ListCard extends BaseUI5Card {
  setConfig(config: UI5ListCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5ListCardConfig | undefined {
    return this._config as UI5ListCardConfig;
  }

  /**
   * Check if any watched entity changed
   */
  protected hasEntityStateChanged(
    oldHass: typeof this._hass,
    newHass: typeof this._hass,
  ): boolean {
    if (!oldHass || !newHass || !this.config) {
      return true;
    }

    // Check primary entity
    if (this.config.entity) {
      const oldState = oldHass.states[this.config.entity];
      const newState = newHass.states[this.config.entity];
      if (oldState !== newState) return true;
    }

    // Check entities array
    if (this.config.entities) {
      for (const entityId of this.config.entities) {
        const oldState = oldHass.states[entityId];
        const newState = newHass.states[entityId];
        if (oldState !== newState) return true;
      }
    }

    // Check item entities
    if (this.config.items) {
      for (const item of this.config.items) {
        if (item.entity) {
          const oldState = oldHass.states[item.entity];
          const newState = newHass.states[item.entity];
          if (oldState !== newState) return true;
        }
      }
    }

    return false;
  }

  /**
   * Get list items from config
   */
  private getListItems(): ListItem[] {
    if (!this._hass || !this.config) return [];

    const items: ListItem[] = [];

    // Add items from entities array
    if (this.config.entities) {
      for (const entityId of this.config.entities) {
        const entity = this._hass.states[entityId];
        if (entity) {
          items.push(this.entityToListItem(entityId, entity));
        }
      }
    }

    // Add custom items
    if (this.config.items) {
      for (const item of this.config.items) {
        const listItem: ListItem = {
          text: this.processTemplate(item.text),
          description: item.description ? this.processTemplate(item.description) : undefined,
          icon: item.icon,
          iconEnd: item.icon_end,
          additionalText: item.additional_text,
          additionalTextState: item.additional_text_state || "None",
          type: item.type || "Active",
          entityId: item.entity,
        };

        // If item has entity, get state
        if (item.entity && this._hass.states[item.entity]) {
          const entity = this._hass.states[item.entity];
          listItem.additionalText = listItem.additionalText || formatEntityState(this._hass, item.entity);
          listItem.additionalTextState = this.getStateValueState(entity.state);
        }

        items.push(listItem);
      }
    }

    return items;
  }

  /**
   * Convert entity to list item
   */
  private entityToListItem(entityId: string, entity: HassEntity): ListItem {
    const state = formatEntityState(this._hass!, entityId);
    const icon = this.getEntityIcon(entityId, entity);

    return {
      text: getEntityName(this._hass!, entityId),
      description: entity.attributes.device_class || getDomain(entityId),
      icon,
      additionalText: state,
      additionalTextState: this.getStateValueState(entity.state),
      type: "Active",
      entityId,
    };
  }

  /**
   * Get icon for entity
   */
  private getEntityIcon(entityId: string, entity: HassEntity): string | undefined {
    // Check for custom icon
    if (entity.attributes.icon) {
      // Convert mdi:xxx to SAP icon format or return as-is
      const mdiIcon = entity.attributes.icon as string;
      if (mdiIcon.startsWith("mdi:")) {
        // Map common MDI icons to SAP icons
        return this.mapMdiToSap(mdiIcon);
      }
      return mdiIcon;
    }

    // Default icons by domain
    const domain = getDomain(entityId);
    const domainIcons: Record<string, string> = {
      light: "lightbulb",
      switch: "switches",
      sensor: "measure",
      binary_sensor: "status-positive",
      climate: "heating-cooling",
      fan: "fan",
      cover: "expand",
      lock: "locked",
      camera: "camera",
      media_player: "media-play",
      vacuum: "dishwasher",
      automation: "process",
      script: "developer-settings",
      scene: "palette",
      person: "employee",
      device_tracker: "locate-me",
      weather: "weather-proofing",
      sun: "weather-proofing",
    };

    return domainIcons[domain] || "home";
  }

  /**
   * Map MDI icon to SAP icon
   */
  private mapMdiToSap(mdiIcon: string): string {
    const icon = mdiIcon.replace("mdi:", "");
    const mdiToSap: Record<string, string> = {
      "lightbulb": "lightbulb",
      "lightbulb-on": "lightbulb",
      "lightbulb-off": "lightbulb",
      "power": "switches",
      "thermometer": "temperature",
      "water-percent": "washing-machine",
      "motion-sensor": "person-placeholder",
      "door": "door",
      "window": "expand",
      "lock": "locked",
      "unlock": "unlocked",
      "fan": "fan",
      "home": "home",
    };

    return mdiToSap[icon] || "action";
  }

  /**
   * Get value state for entity state
   */
  private getStateValueState(state: string): string {
    switch (state.toLowerCase()) {
      case "on":
      case "open":
      case "unlocked":
      case "home":
      case "playing":
        return "Success";
      case "off":
      case "closed":
      case "locked":
      case "away":
      case "paused":
      case "idle":
        return "None";
      case "unavailable":
      case "unknown":
        return "Warning";
      default:
        return "Information";
    }
  }

  /**
   * Group items by domain
   */
  private groupItemsByDomain(items: ListItem[]): GroupedItems {
    const groups: GroupedItems = {};

    for (const item of items) {
      const domain = item.entityId ? getDomain(item.entityId) : "other";
      const groupName = this.formatDomainName(domain);

      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(item);
    }

    return groups;
  }

  /**
   * Format domain name for display
   */
  private formatDomainName(domain: string): string {
    const names: Record<string, string> = {
      light: "Lights",
      switch: "Switches",
      sensor: "Sensors",
      binary_sensor: "Binary Sensors",
      climate: "Climate",
      fan: "Fans",
      cover: "Covers",
      lock: "Locks",
      camera: "Cameras",
      media_player: "Media Players",
      vacuum: "Vacuums",
      automation: "Automations",
      script: "Scripts",
      scene: "Scenes",
      person: "People",
      device_tracker: "Device Trackers",
      other: "Other",
    };

    return names[domain] || domain.charAt(0).toUpperCase() + domain.slice(1).replace(/_/g, " ");
  }

  /**
   * Render a single list item
   */
  private renderListItem(item: ListItem): string {
    const iconAttr = item.icon ? `icon="${item.icon}"` : "";
    const iconEndAttr = item.iconEnd ? `icon-end="${item.iconEnd}"` : "";
    const descriptionAttr = item.description ? `description="${this.escapeAttrValue(item.description)}"` : "";
    const additionalTextAttr = item.additionalText ? `additional-text="${this.escapeAttrValue(item.additionalText)}"` : "";
    const stateAttr = item.additionalTextState ? `additional-text-state="${item.additionalTextState}"` : "";
    const typeAttr = item.type ? `type="${item.type}"` : "";
    const entityAttr = item.entityId ? `data-entity="${item.entityId}"` : "";

    return `
      <ui5-li
        ${iconAttr}
        ${iconEndAttr}
        ${descriptionAttr}
        ${additionalTextAttr}
        ${stateAttr}
        ${typeAttr}
        ${entityAttr}
      >${this.escapeText(item.text)}</ui5-li>
    `;
  }

  /**
   * Escape HTML for safe text content
   */
  private escapeText(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Escape attribute value
   */
  private escapeAttrValue(text: string): string {
    return text.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const items = this.getListItems();
    const headerText = this.config.header_text || this.config.title || "";
    const footerText = this.config.footer_text || "";
    const noDataText = this.config.no_data_text || "No items";
    const mode = this.config.mode || "None";
    const growing = this.config.growing || "None";
    const groupBy = this.config.group_by || "none";

    let listContent = "";

    if (items.length === 0) {
      listContent = `<ui5-li type="Inactive">${noDataText}</ui5-li>`;
    } else if (groupBy === "domain") {
      const groups = this.groupItemsByDomain(items);
      for (const [groupName, groupItems] of Object.entries(groups)) {
        listContent += `<ui5-li-group header-text="${this.escapeAttrValue(groupName)}">`;
        for (const item of groupItems) {
          listContent += this.renderListItem(item);
        }
        listContent += `</ui5-li-group>`;
      }
    } else {
      for (const item of items) {
        listContent += this.renderListItem(item);
      }
    }

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .list-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .list-header {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
          padding-bottom: 8px;
        }

        .list-footer {
          font-size: 12px;
          color: var(--secondary-text-color);
          padding-top: 8px;
          text-align: center;
        }

        ui5-list {
          width: 100%;
          border-radius: 8px;
          overflow: hidden;
        }

        ui5-li {
          cursor: pointer;
        }

        ui5-li[type="Inactive"] {
          cursor: default;
          opacity: 0.7;
        }
      </style>

      <div class="card-container">
        <div class="list-container">
          ${headerText ? `<div class="list-header">${this.escapeText(headerText)}</div>` : ""}
          <ui5-list
            id="entity-list"
            mode="${mode}"
            ${growing !== "None" ? `growing="${growing}"` : ""}
          >
            ${listContent}
          </ui5-list>
          ${footerText ? `<div class="list-footer">${this.escapeText(footerText)}</div>` : ""}
        </div>
      </div>
    `;

    // Set up click handlers for list items
    this.setupListItemHandlers();
  }

  /**
   * Set up click handlers for list items
   */
  private setupListItemHandlers(): void {
    const list = this.shadow.getElementById("entity-list");
    if (!list) return;

    list.addEventListener("item-click", (event: Event) => {
      const customEvent = event as CustomEvent;
      const item = customEvent.detail?.item as HTMLElement;
      if (!item) return;

      const entityId = item.getAttribute("data-entity");
      if (entityId && this._hass) {
        // Fire more-info event
        const moreInfoEvent = new CustomEvent("hass-more-info", {
          bubbles: true,
          composed: true,
          detail: { entityId },
        });
        this.dispatchEvent(moreInfoEvent);
      }
    });
  }

  getCardSize(): number {
    const itemCount = this.config?.entities?.length || this.config?.items?.length || 0;
    return Math.max(1, Math.ceil(itemCount / 3));
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-list-card",
      title: "Entity List",
      entities: ["light.living_room", "switch.kitchen"],
    };
  }
}

// Register custom element
customElements.define("ui5-list-card", UI5ListCard);
