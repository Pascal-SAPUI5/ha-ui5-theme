/**
 * Tests for UI5 Timeline Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5TimelineCardConfig } from "../types";

import "../components/Timeline/Timeline";

describe("ui5-timeline-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-timeline-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-timeline-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5TimelineCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-timeline-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-timeline-card",
        } as UI5TimelineCardConfig)
      ).not.toThrow();
    });

    it("should accept config with entities", () => {
      const card = document.createElement("ui5-timeline-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-timeline-card",
          entities: ["sensor.temperature", "sensor.humidity"],
        } as UI5TimelineCardConfig)
      ).not.toThrow();
    });

    it("should accept config with static items", () => {
      const card = document.createElement("ui5-timeline-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-timeline-card",
          items: [
            { title_text: "Event 1", subtitle_text: "10:00" },
            { title_text: "Event 2", subtitle_text: "11:00" },
          ],
        } as UI5TimelineCardConfig)
      ).not.toThrow();
    });

    it("should accept layout config", () => {
      const card = document.createElement("ui5-timeline-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-timeline-card",
          layout: "Horizontal",
        } as UI5TimelineCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-timeline element with items", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-timeline-card", {
        type: "custom:ui5-timeline-card",
        items: [
          { title_text: "Event 1", subtitle_text: "10:00" },
        ],
      }, hass);

      // Timeline requires items to render
      const timeline = card.shadowRoot!.querySelector("ui5-timeline");
      expect(timeline).toBeTruthy();
    });

    it("should render static items", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-timeline-card", {
        type: "custom:ui5-timeline-card",
        items: [
          { title_text: "Morning", subtitle_text: "08:00" },
          { title_text: "Afternoon", subtitle_text: "14:00" },
        ],
      }, hass);

      const items = card.shadowRoot!.querySelectorAll("ui5-timeline-item");
      expect(items.length).toBe(2);
    });

    it("should set layout attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-timeline-card", {
        type: "custom:ui5-timeline-card",
        layout: "Horizontal",
        items: [{ title_text: "Event", subtitle_text: "Now" }],
      }, hass);

      const timeline = card.shadowRoot!.querySelector("ui5-timeline");
      expect(timeline).toBeTruthy();
      expect(timeline?.getAttribute("layout")).toBe("Horizontal");
    });
  });

  describe("entity binding", () => {
    it("should render entities as timeline items", async () => {
      const hass = createMockHass({
        "sensor.temperature": createMockEntity("sensor.temperature", "22", {
          friendly_name: "Temperature",
          unit_of_measurement: "°C",
        }),
        "sensor.humidity": createMockEntity("sensor.humidity", "45", {
          friendly_name: "Humidity",
          unit_of_measurement: "%",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-timeline-card", {
        type: "custom:ui5-timeline-card",
        entities: ["sensor.temperature", "sensor.humidity"],
      }, hass);

      const items = card.shadowRoot!.querySelectorAll("ui5-timeline-item");
      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle max_items limit", async () => {
      const hass = createMockHass({
        "sensor.temp1": createMockEntity("sensor.temp1", "20", { friendly_name: "Temp 1" }),
        "sensor.temp2": createMockEntity("sensor.temp2", "21", { friendly_name: "Temp 2" }),
        "sensor.temp3": createMockEntity("sensor.temp3", "22", { friendly_name: "Temp 3" }),
      });

      const card = await mountCard<HTMLElement>("ui5-timeline-card", {
        type: "custom:ui5-timeline-card",
        entities: ["sensor.temp1", "sensor.temp2", "sensor.temp3"],
        max_items: 2,
      }, hass);

      const items = card.shadowRoot!.querySelectorAll("ui5-timeline-item");
      expect(items.length).toBeLessThanOrEqual(2);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-timeline-card") as unknown as { getStubConfig: () => UI5TimelineCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-timeline-card");
    });
  });
});
