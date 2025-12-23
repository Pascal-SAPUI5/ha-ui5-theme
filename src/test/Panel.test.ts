/**
 * Tests for UI5 Panel Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5PanelCardConfig } from "../types";

import "../components/Panel/Panel";

describe("ui5-panel-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-panel-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-panel-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5PanelCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-panel-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-panel-card",
          header_text: "Panel",
        } as UI5PanelCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-panel element", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-panel-card", {
        type: "custom:ui5-panel-card",
      }, hass);

      const panel = card.shadowRoot!.querySelector("ui5-panel");
      expect(panel).toBeTruthy();
    });

    it("should render header text", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-panel-card", {
        type: "custom:ui5-panel-card",
        header_text: "My Panel",
      }, hass);

      const panel = card.shadowRoot!.querySelector("ui5-panel");
      expect(panel?.getAttribute("header-text")).toBe("My Panel");
    });

    it("should use entity name as header when no header_text", async () => {
      const entities = {
        "light.living_room": createMockEntity("light.living_room", "on", {
          friendly_name: "Living Room Light",
        }),
      };
      const hass = createMockHass(entities);
      const card = await mountCard<LovelaceCard>("ui5-panel-card", {
        type: "custom:ui5-panel-card",
        entity: "light.living_room",
      }, hass);

      const panel = card.shadowRoot!.querySelector("ui5-panel");
      expect(panel?.getAttribute("header-text")).toBe("Living Room Light");
    });

    it("should render collapsed when configured", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-panel-card", {
        type: "custom:ui5-panel-card",
        header_text: "Panel",
        collapsed: true,
      }, hass);

      const panel = card.shadowRoot!.querySelector("ui5-panel");
      expect(panel?.hasAttribute("collapsed")).toBe(true);
    });

    it("should render fixed when configured", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-panel-card", {
        type: "custom:ui5-panel-card",
        header_text: "Panel",
        fixed: true,
      }, hass);

      const panel = card.shadowRoot!.querySelector("ui5-panel");
      expect(panel?.hasAttribute("fixed")).toBe(true);
    });

    it("should render entity list", async () => {
      const entities = {
        "light.living_room": createMockEntity("light.living_room", "on"),
        "light.bedroom": createMockEntity("light.bedroom", "off"),
      };
      const hass = createMockHass(entities);
      const card = await mountCard<LovelaceCard>("ui5-panel-card", {
        type: "custom:ui5-panel-card",
        header_text: "Lights",
        entities: ["light.living_room", "light.bedroom"],
      }, hass);

      const entityRows = card.shadowRoot!.querySelectorAll(".entity-row");
      expect(entityRows.length).toBe(2);
    });

    it("should display entity name and state", async () => {
      const entities = {
        "light.living_room": createMockEntity("light.living_room", "on", {
          friendly_name: "Living Room",
        }),
      };
      const hass = createMockHass(entities);
      const card = await mountCard<LovelaceCard>("ui5-panel-card", {
        type: "custom:ui5-panel-card",
        entities: ["light.living_room"],
      }, hass);

      const entityName = card.shadowRoot!.querySelector(".entity-name");
      const entityState = card.shadowRoot!.querySelector(".entity-state");
      expect(entityName?.textContent).toBe("Living Room");
      expect(entityState?.textContent).toBe("On");
    });

    it("should render custom content", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-panel-card", {
        type: "custom:ui5-panel-card",
        header_text: "Panel",
        content: "Custom panel content",
      }, hass);

      const content = card.shadowRoot!.querySelector(".custom-content");
      expect(content?.textContent).toBe("Custom panel content");
    });
  });

  describe("getCardSize", () => {
    it("should return size based on entity count", () => {
      const card = document.createElement("ui5-panel-card") as LovelaceCard;
      card.setConfig({
        type: "custom:ui5-panel-card",
        entities: ["a", "b", "c", "d", "e"],
      } as UI5PanelCardConfig);
      expect(card.getCardSize?.()).toBeGreaterThan(1);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-panel-card") as unknown as { getStubConfig: () => UI5PanelCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-panel-card");
      expect(stub.header_text).toBeDefined();
    });
  });
});
