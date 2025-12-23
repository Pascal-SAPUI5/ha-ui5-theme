/**
 * Tests for UI5 Card Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5CardCardConfig } from "../types";

import "../components/Card/Card";

describe("ui5-card-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-card-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-card-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5CardCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-card-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-card-card",
          title: "Test Card",
        } as UI5CardCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-card element", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-card-card", {
        type: "custom:ui5-card-card",
        title: "Test",
      }, hass);

      const ui5Card = card.shadowRoot!.querySelector("ui5-card");
      expect(ui5Card).toBeTruthy();
    });

    it("should render card header with title", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-card-card", {
        type: "custom:ui5-card-card",
        title: "My Card Title",
      }, hass);

      const header = card.shadowRoot!.querySelector("ui5-card-header");
      expect(header?.getAttribute("title-text")).toBe("My Card Title");
    });

    it("should render subtitle", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-card-card", {
        type: "custom:ui5-card-card",
        title: "Title",
        subtitle: "Subtitle text",
      }, hass);

      const header = card.shadowRoot!.querySelector("ui5-card-header");
      expect(header?.getAttribute("subtitle-text")).toBe("Subtitle text");
    });

    it("should render status", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-card-card", {
        type: "custom:ui5-card-card",
        title: "Title",
        status: "Active",
      }, hass);

      const header = card.shadowRoot!.querySelector("ui5-card-header");
      expect(header?.getAttribute("status")).toBe("Active");
    });

    it("should use entity name as title when no title provided", async () => {
      const entities = {
        "sensor.temperature": createMockEntity("sensor.temperature", "21.5", {
          friendly_name: "Room Temperature",
        }),
      };
      const hass = createMockHass(entities);
      const card = await mountCard<LovelaceCard>("ui5-card-card", {
        type: "custom:ui5-card-card",
        entity: "sensor.temperature",
      }, hass);

      const header = card.shadowRoot!.querySelector("ui5-card-header");
      expect(header?.getAttribute("title-text")).toBe("Room Temperature");
    });

    it("should show entity state", async () => {
      const entities = {
        "sensor.temperature": createMockEntity("sensor.temperature", "21.5", {
          unit_of_measurement: "°C",
        }),
      };
      const hass = createMockHass(entities);
      const card = await mountCard<LovelaceCard>("ui5-card-card", {
        type: "custom:ui5-card-card",
        entity: "sensor.temperature",
      }, hass);

      const stateValue = card.shadowRoot!.querySelector(".state-value");
      expect(stateValue?.textContent).toContain("21.5");
    });

    it("should render custom content", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-card-card", {
        type: "custom:ui5-card-card",
        title: "Title",
        content: "Custom content here",
      }, hass);

      const content = card.shadowRoot!.querySelector(".card-content");
      expect(content?.textContent).toBe("Custom content here");
    });

    it("should set header as interactive by default", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-card-card", {
        type: "custom:ui5-card-card",
        title: "Title",
      }, hass);

      const header = card.shadowRoot!.querySelector("ui5-card-header");
      expect(header?.hasAttribute("interactive")).toBe(true);
    });
  });

  describe("getCardSize", () => {
    it("should return size based on content", () => {
      const card = document.createElement("ui5-card-card") as LovelaceCard;
      card.setConfig({ type: "custom:ui5-card-card" } as UI5CardCardConfig);
      expect(card.getCardSize?.()).toBeGreaterThanOrEqual(2);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-card-card") as unknown as { getStubConfig: () => UI5CardCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-card-card");
      expect(stub.title).toBeDefined();
    });
  });
});
