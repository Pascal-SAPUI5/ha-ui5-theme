/**
 * Tests for UI5 Badge Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5BadgeCardConfig } from "../types";

import "../components/Badge/Badge";

describe("ui5-badge-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-badge-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-badge-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5BadgeCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-badge-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-badge-card",
        } as UI5BadgeCardConfig)
      ).not.toThrow();
    });

    it("should accept config with text", () => {
      const card = document.createElement("ui5-badge-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-badge-card",
          text: "Status",
        } as UI5BadgeCardConfig)
      ).not.toThrow();
    });

    it("should accept config with design", () => {
      const card = document.createElement("ui5-badge-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-badge-card",
          design: "Positive",
        } as UI5BadgeCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-tag element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-badge-card", {
        type: "custom:ui5-badge-card",
        text: "Test",
      }, hass);

      const tag = card.shadowRoot!.querySelector("ui5-tag");
      expect(tag).toBeTruthy();
    });

    it("should display text", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-badge-card", {
        type: "custom:ui5-badge-card",
        text: "Active",
      }, hass);

      const tag = card.shadowRoot!.querySelector("ui5-tag");
      expect(tag?.textContent).toContain("Active");
    });

    it("should set design attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-badge-card", {
        type: "custom:ui5-badge-card",
        text: "Warning",
        design: "Critical",
      }, hass);

      const tag = card.shadowRoot!.querySelector("ui5-tag");
      expect(tag?.getAttribute("design")).toBe("Critical");
    });

    it("should be interactive by default", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-badge-card", {
        type: "custom:ui5-badge-card",
        text: "Click me",
      }, hass);

      const tag = card.shadowRoot!.querySelector("ui5-tag");
      expect(tag?.hasAttribute("interactive")).toBe(true);
    });
  });

  describe("entity binding", () => {
    it("should display entity state", async () => {
      const hass = createMockHass({
        "binary_sensor.door": createMockEntity("binary_sensor.door", "on", {
          friendly_name: "Front Door",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-badge-card", {
        type: "custom:ui5-badge-card",
        entity: "binary_sensor.door",
      }, hass);

      const tag = card.shadowRoot!.querySelector("ui5-tag");
      expect(tag?.textContent).toContain("Front Door");
      expect(tag?.textContent).toContain("on");
    });

    it("should auto-select design based on state", async () => {
      const hass = createMockHass({
        "binary_sensor.alarm": createMockEntity("binary_sensor.alarm", "on", {
          friendly_name: "Alarm",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-badge-card", {
        type: "custom:ui5-badge-card",
        entity: "binary_sensor.alarm",
      }, hass);

      const tag = card.shadowRoot!.querySelector("ui5-tag");
      expect(tag?.getAttribute("design")).toBe("Positive");
    });

    it("should handle unavailable entity", async () => {
      const hass = createMockHass({
        "sensor.offline": createMockEntity("sensor.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-badge-card", {
        type: "custom:ui5-badge-card",
        entity: "sensor.offline",
      }, hass);

      const container = card.shadowRoot!.querySelector(".badge-container");
      expect(container?.classList.contains("unavailable")).toBe(true);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-badge-card") as unknown as { getStubConfig: () => UI5BadgeCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-badge-card");
      expect(stub.text).toBeDefined();
    });
  });
});
