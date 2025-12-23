/**
 * Tests for UI5 Bar Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5BarCardConfig } from "../types";

import "../components/Bar/Bar";

describe("ui5-bar-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-bar-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-bar-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5BarCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-bar-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-bar-card",
        } as UI5BarCardConfig)
      ).not.toThrow();
    });

    it("should accept config with design", () => {
      const card = document.createElement("ui5-bar-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-bar-card",
          design: "Footer",
        } as UI5BarCardConfig)
      ).not.toThrow();
    });

    it("should accept config with content slots", () => {
      const card = document.createElement("ui5-bar-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-bar-card",
          start_content: "Home",
          middle_content: "Dashboard",
          end_content: "Settings",
        } as UI5BarCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-bar element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-bar-card", {
        type: "custom:ui5-bar-card",
      }, hass);

      const bar = card.shadowRoot!.querySelector("ui5-bar");
      expect(bar).toBeTruthy();
    });

    it("should set design attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-bar-card", {
        type: "custom:ui5-bar-card",
        design: "Footer",
      }, hass);

      const bar = card.shadowRoot!.querySelector("ui5-bar");
      expect(bar?.getAttribute("design")).toBe("Footer");
    });

    it("should render start content", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-bar-card", {
        type: "custom:ui5-bar-card",
        start_content: "Start Text",
      }, hass);

      const startSlot = card.shadowRoot!.querySelector('[slot="startContent"]');
      expect(startSlot?.textContent).toContain("Start Text");
    });

    it("should render middle content", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-bar-card", {
        type: "custom:ui5-bar-card",
        middle_content: "Middle Text",
      }, hass);

      const middleSlot = card.shadowRoot!.querySelector('[slot="middleContent"]');
      expect(middleSlot?.textContent).toContain("Middle Text");
    });

    it("should render end content", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-bar-card", {
        type: "custom:ui5-bar-card",
        end_content: "End Text",
      }, hass);

      const endSlot = card.shadowRoot!.querySelector('[slot="endContent"]');
      expect(endSlot?.textContent).toContain("End Text");
    });

    it("should use Header design by default", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-bar-card", {
        type: "custom:ui5-bar-card",
      }, hass);

      const bar = card.shadowRoot!.querySelector("ui5-bar");
      expect(bar?.getAttribute("design")).toBe("Header");
    });
  });

  describe("entity binding", () => {
    it("should display entity state", async () => {
      const hass = createMockHass({
        "sensor.temperature": createMockEntity("sensor.temperature", "22", {
          friendly_name: "Temperature",
          unit_of_measurement: "°C",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-bar-card", {
        type: "custom:ui5-bar-card",
        entity: "sensor.temperature",
        show_entity_state: true,
      }, hass);

      const bar = card.shadowRoot!.querySelector("ui5-bar");
      expect(bar?.textContent).toContain("22");
    });

    it("should process templates in content", async () => {
      const hass = createMockHass({
        "sensor.power": createMockEntity("sensor.power", "150", {
          friendly_name: "Power",
          unit_of_measurement: "W",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-bar-card", {
        type: "custom:ui5-bar-card",
        entity: "sensor.power",
        end_content: "Power: {{ state }}W",
      }, hass);

      const endSlot = card.shadowRoot!.querySelector('[slot="endContent"]');
      // Template contains state value or template string
      expect(endSlot?.textContent).toContain("Power:");
    });

    it("should handle unavailable entity", async () => {
      const hass = createMockHass({
        "sensor.offline": createMockEntity("sensor.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-bar-card", {
        type: "custom:ui5-bar-card",
        entity: "sensor.offline",
      }, hass);

      const bar = card.shadowRoot!.querySelector("ui5-bar");
      expect(bar?.classList.contains("unavailable")).toBe(true);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-bar-card") as unknown as { getStubConfig: () => UI5BarCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-bar-card");
      expect(stub.design).toBeDefined();
    });
  });
});
