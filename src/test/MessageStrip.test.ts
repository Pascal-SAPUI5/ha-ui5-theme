/**
 * Tests for UI5 MessageStrip Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5MessageStripCardConfig } from "../types";

import "../components/MessageStrip/MessageStrip";

describe("ui5-messagestrip-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-messagestrip-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-messagestrip-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5MessageStripCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-messagestrip-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-messagestrip-card",
        } as UI5MessageStripCardConfig)
      ).not.toThrow();
    });

    it("should accept config with text", () => {
      const card = document.createElement("ui5-messagestrip-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-messagestrip-card",
          text: "System message",
        } as UI5MessageStripCardConfig)
      ).not.toThrow();
    });

    it("should accept config with design", () => {
      const card = document.createElement("ui5-messagestrip-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-messagestrip-card",
          design: "Negative",
        } as UI5MessageStripCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-message-strip element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-messagestrip-card", {
        type: "custom:ui5-messagestrip-card",
        text: "Info message",
      }, hass);

      const messageStrip = card.shadowRoot!.querySelector("ui5-message-strip");
      expect(messageStrip).toBeTruthy();
    });

    it("should display text", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-messagestrip-card", {
        type: "custom:ui5-messagestrip-card",
        text: "Important notice",
      }, hass);

      const messageStrip = card.shadowRoot!.querySelector("ui5-message-strip");
      expect(messageStrip?.textContent).toContain("Important notice");
    });

    it("should set design attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-messagestrip-card", {
        type: "custom:ui5-messagestrip-card",
        text: "Error occurred",
        design: "Negative",
      }, hass);

      const messageStrip = card.shadowRoot!.querySelector("ui5-message-strip");
      expect(messageStrip?.getAttribute("design")).toBe("Negative");
    });

    it("should hide close button by default", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-messagestrip-card", {
        type: "custom:ui5-messagestrip-card",
        text: "Message",
      }, hass);

      const messageStrip = card.shadowRoot!.querySelector("ui5-message-strip");
      expect(messageStrip?.hasAttribute("hide-close-button")).toBe(true);
    });

    it("should hide icon when configured", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-messagestrip-card", {
        type: "custom:ui5-messagestrip-card",
        text: "Message",
        hide_icon: true,
      }, hass);

      const messageStrip = card.shadowRoot!.querySelector("ui5-message-strip");
      expect(messageStrip?.hasAttribute("hide-icon")).toBe(true);
    });
  });

  describe("entity binding", () => {
    it("should display entity state", async () => {
      const hass = createMockHass({
        "sensor.battery": createMockEntity("sensor.battery", "15", {
          friendly_name: "Battery",
          unit_of_measurement: "%",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-messagestrip-card", {
        type: "custom:ui5-messagestrip-card",
        entity: "sensor.battery",
      }, hass);

      const messageStrip = card.shadowRoot!.querySelector("ui5-message-strip");
      expect(messageStrip?.textContent).toContain("Battery");
      expect(messageStrip?.textContent).toContain("15");
    });

    it("should auto-select design based on numeric state", async () => {
      const hass = createMockHass({
        "sensor.battery_low": createMockEntity("sensor.battery_low", "10", {
          friendly_name: "Battery Low",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-messagestrip-card", {
        type: "custom:ui5-messagestrip-card",
        entity: "sensor.battery_low",
      }, hass);

      const messageStrip = card.shadowRoot!.querySelector("ui5-message-strip");
      expect(messageStrip?.getAttribute("design")).toBe("Negative");
    });

    it("should handle unavailable entity", async () => {
      const hass = createMockHass({
        "sensor.offline": createMockEntity("sensor.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-messagestrip-card", {
        type: "custom:ui5-messagestrip-card",
        entity: "sensor.offline",
      }, hass);

      const container = card.shadowRoot!.querySelector(".messagestrip-container");
      expect(container?.classList.contains("unavailable")).toBe(true);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-messagestrip-card") as unknown as { getStubConfig: () => UI5MessageStripCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-messagestrip-card");
      expect(stub.text).toBeDefined();
      expect(stub.design).toBeDefined();
    });
  });
});
