/**
 * Tests for UI5 Table Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5TableCardConfig } from "../types";

import "../components/Table/Table";

describe("ui5-table-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-table-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-table-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5TableCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-table-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-table-card",
          entities: ["light.test"],
        } as UI5TableCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-table element", async () => {
      const entities = {
        "light.test": createMockEntity("light.test", "on"),
      };
      const hass = createMockHass(entities);
      const card = await mountCard<LovelaceCard>("ui5-table-card", {
        type: "custom:ui5-table-card",
        entities: ["light.test"],
      }, hass);

      const table = card.shadowRoot!.querySelector("ui5-table");
      expect(table).toBeTruthy();
    });

    it("should render title", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-table-card", {
        type: "custom:ui5-table-card",
        title: "My Table",
      }, hass);

      const header = card.shadowRoot!.querySelector(".table-header");
      expect(header?.textContent).toBe("My Table");
    });

    it("should render no data message when empty", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-table-card", {
        type: "custom:ui5-table-card",
        no_data_text: "Empty table",
      }, hass);

      const noData = card.shadowRoot!.querySelector(".no-data");
      expect(noData?.textContent).toBe("Empty table");
    });

    it("should render header row with columns", async () => {
      const entities = {
        "light.test": createMockEntity("light.test", "on"),
      };
      const hass = createMockHass(entities);
      const card = await mountCard<LovelaceCard>("ui5-table-card", {
        type: "custom:ui5-table-card",
        entities: ["light.test"],
        columns: [
          { header: "Name", field: "name" },
          { header: "Status", field: "state" },
        ],
      }, hass);

      const headerCells = card.shadowRoot!.querySelectorAll("ui5-table-header-cell");
      expect(headerCells.length).toBe(2);
      expect(headerCells[0]?.textContent).toBe("Name");
      expect(headerCells[1]?.textContent).toBe("Status");
    });

    it("should render entity rows", async () => {
      const entities = {
        "light.living_room": createMockEntity("light.living_room", "on"),
        "light.bedroom": createMockEntity("light.bedroom", "off"),
      };
      const hass = createMockHass(entities);
      const card = await mountCard<LovelaceCard>("ui5-table-card", {
        type: "custom:ui5-table-card",
        entities: ["light.living_room", "light.bedroom"],
      }, hass);

      const rows = card.shadowRoot!.querySelectorAll("ui5-table-row");
      expect(rows.length).toBe(2);
    });

    it("should set data-entity attribute on rows", async () => {
      const entities = {
        "light.test": createMockEntity("light.test", "on"),
      };
      const hass = createMockHass(entities);
      const card = await mountCard<LovelaceCard>("ui5-table-card", {
        type: "custom:ui5-table-card",
        entities: ["light.test"],
      }, hass);

      const row = card.shadowRoot!.querySelector("ui5-table-row");
      expect(row?.getAttribute("data-entity")).toBe("light.test");
    });
  });

  describe("custom rows", () => {
    it("should render custom rows", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-table-card", {
        type: "custom:ui5-table-card",
        columns: [{ header: "Col1" }, { header: "Col2" }],
        rows: [
          { cells: ["A", "B"] },
          { cells: ["C", "D"] },
        ],
      }, hass);

      const rows = card.shadowRoot!.querySelectorAll("ui5-table-row");
      expect(rows.length).toBe(2);
    });
  });

  describe("getCardSize", () => {
    it("should return size based on row count", () => {
      const card = document.createElement("ui5-table-card") as LovelaceCard;
      card.setConfig({
        type: "custom:ui5-table-card",
        entities: ["a", "b", "c", "d", "e", "f"],
      } as UI5TableCardConfig);

      expect(card.getCardSize?.()).toBeGreaterThan(1);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-table-card") as unknown as { getStubConfig: () => UI5TableCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-table-card");
      expect(stub.columns).toBeDefined();
    });
  });
});
