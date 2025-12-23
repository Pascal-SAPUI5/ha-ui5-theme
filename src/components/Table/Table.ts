/**
 * UI5 Table Card
 * A Lovelace card that displays entities in a UI5 Table component
 *
 * Features:
 * - Display entity data in tabular format
 * - Configurable columns
 * - Entity state display
 * - Click to show more-info dialog
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5TableCardConfig, HassEntity } from "../../types";
import { getEntityName, formatEntityState, getDomain } from "../../utils/ha-helpers";
import "../../ui5-loader";

export class UI5TableCard extends BaseUI5Card {
  setConfig(config: UI5TableCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5TableCardConfig | undefined {
    return this._config as UI5TableCardConfig;
  }

  protected hasEntityStateChanged(
    oldHass: typeof this._hass,
    newHass: typeof this._hass,
  ): boolean {
    if (!oldHass || !newHass || !this.config) return true;

    if (this.config.entities) {
      for (const entityId of this.config.entities) {
        if (oldHass.states[entityId] !== newHass.states[entityId]) return true;
      }
    }

    if (this.config.rows) {
      for (const row of this.config.rows) {
        if (row.entity && oldHass.states[row.entity] !== newHass.states[row.entity]) {
          return true;
        }
      }
    }

    return false;
  }

  private escapeText(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private getDefaultColumns(): Array<{ header: string; field: string }> {
    return [
      { header: "Name", field: "name" },
      { header: "State", field: "state" },
      { header: "Domain", field: "domain" },
    ];
  }

  private renderHeaderRow(): string {
    const columns = this.config?.columns || this.getDefaultColumns();
    const cells = columns
      .map((col) => `<ui5-table-header-cell>${this.escapeText(col.header)}</ui5-table-header-cell>`)
      .join("");

    return `<ui5-table-header-row slot="headerRow">${cells}</ui5-table-header-row>`;
  }

  private getEntityFieldValue(entityId: string, entity: HassEntity, field: string): string {
    switch (field) {
      case "name":
        return getEntityName(this._hass!, entityId);
      case "state":
        return formatEntityState(this._hass!, entityId);
      case "domain":
        return getDomain(entityId);
      case "entity_id":
        return entityId;
      case "last_changed":
        return new Date(entity.last_changed).toLocaleString();
      case "last_updated":
        return new Date(entity.last_updated).toLocaleString();
      default:
        // Check attributes
        if (entity.attributes[field] !== undefined) {
          const value = entity.attributes[field];
          return typeof value === "object" ? JSON.stringify(value) : String(value);
        }
        return "";
    }
  }

  private renderEntityRows(): string {
    if (!this._hass || !this.config?.entities) return "";

    const columns = this.config.columns || this.getDefaultColumns();
    let rows = "";

    for (const entityId of this.config.entities) {
      const entity = this._hass.states[entityId];
      if (!entity) continue;

      const cells = columns
        .map((col) => {
          const value = this.getEntityFieldValue(entityId, entity, col.field || col.header.toLowerCase());
          return `<ui5-table-cell>${this.escapeText(value)}</ui5-table-cell>`;
        })
        .join("");

      rows += `<ui5-table-row data-entity="${entityId}">${cells}</ui5-table-row>`;
    }

    return rows;
  }

  private renderCustomRows(): string {
    if (!this.config?.rows) return "";

    let rows = "";

    for (const row of this.config.rows) {
      const cells = row.cells
        .map((cell) => `<ui5-table-cell>${this.escapeText(this.processTemplate(cell))}</ui5-table-cell>`)
        .join("");

      const entityAttr = row.entity ? `data-entity="${row.entity}"` : "";
      rows += `<ui5-table-row ${entityAttr}>${cells}</ui5-table-row>`;
    }

    return rows;
  }

  protected render(): void {
    if (!this._hass || !this.config) return;

    const title = this.config.title || "";
    const showHeader = this.config.show_header !== false;
    const stickyHeader = this.config.sticky_column_header ? "sticky-column-header" : "";
    const noDataText = this.config.no_data_text || "No data";

    const entityRows = this.renderEntityRows();
    const customRows = this.renderCustomRows();
    const hasRows = entityRows || customRows;

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .table-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .table-header {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
          padding-bottom: 8px;
        }

        ui5-table {
          width: 100%;
        }

        ui5-table-row {
          cursor: pointer;
        }

        ui5-table-row:hover {
          background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
        }

        .no-data {
          padding: 24px;
          text-align: center;
          color: var(--secondary-text-color);
        }
      </style>

      <div class="card-container">
        <div class="table-container">
          ${title ? `<div class="table-header">${this.escapeText(title)}</div>` : ""}
          ${
            hasRows
              ? `
            <ui5-table id="entity-table" ${stickyHeader}>
              ${showHeader ? this.renderHeaderRow() : ""}
              ${entityRows}
              ${customRows}
            </ui5-table>
          `
              : `<div class="no-data">${this.escapeText(noDataText)}</div>`
          }
        </div>
      </div>
    `;

    this.setupRowClickHandlers();
  }

  private setupRowClickHandlers(): void {
    const table = this.shadow.getElementById("entity-table");
    if (!table) return;

    table.addEventListener("row-click", (event: Event) => {
      const customEvent = event as CustomEvent;
      const row = customEvent.detail?.row as HTMLElement;
      if (!row) return;

      const entityId = row.getAttribute("data-entity");
      if (entityId && this._hass) {
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
    const rowCount = (this.config?.entities?.length || 0) + (this.config?.rows?.length || 0);
    return Math.max(2, Math.ceil(rowCount / 3) + 1);
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-table-card",
      title: "Entity Table",
      entities: ["light.living_room", "sensor.temperature"],
      columns: [
        { header: "Name", field: "name" },
        { header: "State", field: "state" },
      ],
    };
  }
}

customElements.define("ui5-table-card", UI5TableCard);
