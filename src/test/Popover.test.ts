/**
 * Tests for UI5 Popover Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5PopoverCardConfig } from "../types";

import "../components/Popover/Popover";

describe("ui5-popover-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-popover-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-popover-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5PopoverCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-popover-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-popover-card",
        } as UI5PopoverCardConfig)
      ).not.toThrow();
    });

    it("should accept config with header text", () => {
      const card = document.createElement("ui5-popover-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-popover-card",
          header_text: "Info",
        } as UI5PopoverCardConfig)
      ).not.toThrow();
    });

    it("should accept config with content", () => {
      const card = document.createElement("ui5-popover-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-popover-card",
          content: "Popover content here",
        } as UI5PopoverCardConfig)
      ).not.toThrow();
    });

    it("should accept config with placement", () => {
      const card = document.createElement("ui5-popover-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-popover-card",
          placement: "Top",
        } as UI5PopoverCardConfig)
      ).not.toThrow();
    });

    it("should accept config with alignment options", () => {
      const card = document.createElement("ui5-popover-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-popover-card",
          horizontal_align: "Start",
          vertical_align: "Top",
        } as UI5PopoverCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-popover element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-popover-card", {
        type: "custom:ui5-popover-card",
      }, hass);

      const popover = card.shadowRoot!.querySelector("ui5-popover");
      expect(popover).toBeTruthy();
    });

    it("should render opener button", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-popover-card", {
        type: "custom:ui5-popover-card",
      }, hass);

      const button = card.shadowRoot!.querySelector("#popover-opener");
      expect(button).toBeTruthy();
    });

    it("should set header text attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-popover-card", {
        type: "custom:ui5-popover-card",
        header_text: "Details",
      }, hass);

      const popover = card.shadowRoot!.querySelector("ui5-popover");
      expect(popover?.getAttribute("header-text")).toBe("Details");
    });

    it("should set placement attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-popover-card", {
        type: "custom:ui5-popover-card",
        placement: "Top",
      }, hass);

      const popover = card.shadowRoot!.querySelector("ui5-popover");
      expect(popover?.getAttribute("placement")).toBe("Top");
    });

    it("should use default placement", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-popover-card", {
        type: "custom:ui5-popover-card",
      }, hass);

      const popover = card.shadowRoot!.querySelector("ui5-popover");
      expect(popover?.getAttribute("placement")).toBe("Bottom");
    });

    it("should use custom button text", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-popover-card", {
        type: "custom:ui5-popover-card",
        button_text: "Show Info",
      }, hass);

      const button = card.shadowRoot!.querySelector("#popover-opener");
      expect(button?.textContent).toContain("Show Info");
    });

    it("should render content", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-popover-card", {
        type: "custom:ui5-popover-card",
        content: "Custom content here",
      }, hass);

      const content = card.shadowRoot!.querySelector(".popover-content");
      expect(content?.textContent).toContain("Custom content here");
    });
  });

  describe("entity binding", () => {
    it("should display entity state in content", async () => {
      const hass = createMockHass({
        "sensor.humidity": createMockEntity("sensor.humidity", "65", {
          friendly_name: "Humidity",
          unit_of_measurement: "%",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-popover-card", {
        type: "custom:ui5-popover-card",
        entity: "sensor.humidity",
      }, hass);

      const content = card.shadowRoot!.querySelector(".popover-content");
      expect(content?.textContent).toContain("Humidity");
      expect(content?.textContent).toContain("65");
    });

    it("should handle unavailable entity", async () => {
      const hass = createMockHass({
        "sensor.offline": createMockEntity("sensor.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-popover-card", {
        type: "custom:ui5-popover-card",
        entity: "sensor.offline",
      }, hass);

      const container = card.shadowRoot!.querySelector(".popover-container");
      expect(container?.classList.contains("unavailable")).toBe(true);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-popover-card") as unknown as { getStubConfig: () => UI5PopoverCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-popover-card");
      expect(stub.header_text).toBeDefined();
      expect(stub.content).toBeDefined();
      expect(stub.placement).toBeDefined();
    });
  });
});
