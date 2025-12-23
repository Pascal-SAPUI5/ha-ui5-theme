/**
 * Tests for UI5 Toast Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5ToastCardConfig } from "../types";

import "../components/Toast/Toast";

describe("ui5-toast-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-toast-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-toast-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5ToastCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-toast-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-toast-card",
        } as UI5ToastCardConfig)
      ).not.toThrow();
    });

    it("should accept config with text", () => {
      const card = document.createElement("ui5-toast-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-toast-card",
          text: "Notification",
        } as UI5ToastCardConfig)
      ).not.toThrow();
    });

    it("should accept config with duration", () => {
      const card = document.createElement("ui5-toast-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-toast-card",
          duration: 5000,
        } as UI5ToastCardConfig)
      ).not.toThrow();
    });

    it("should accept config with placement", () => {
      const card = document.createElement("ui5-toast-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-toast-card",
          placement: "TopEnd",
        } as UI5ToastCardConfig)
      ).not.toThrow();
    });

    it("should accept config with trigger entity", () => {
      const card = document.createElement("ui5-toast-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-toast-card",
          trigger_entity: "binary_sensor.motion",
          trigger_state: "on",
        } as UI5ToastCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-toast element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-toast-card", {
        type: "custom:ui5-toast-card",
        text: "Test toast",
      }, hass);

      const toast = card.shadowRoot!.querySelector("ui5-toast");
      expect(toast).toBeTruthy();
    });

    it("should render show button", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-toast-card", {
        type: "custom:ui5-toast-card",
        text: "Test",
      }, hass);

      const button = card.shadowRoot!.querySelector("ui5-button");
      expect(button).toBeTruthy();
      expect(button?.textContent).toContain("Show Toast");
    });

    it("should set duration attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-toast-card", {
        type: "custom:ui5-toast-card",
        text: "Test",
        duration: 5000,
      }, hass);

      const toast = card.shadowRoot!.querySelector("ui5-toast");
      expect(toast?.getAttribute("duration")).toBe("5000");
    });

    it("should set placement attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-toast-card", {
        type: "custom:ui5-toast-card",
        text: "Test",
        placement: "TopCenter",
      }, hass);

      const toast = card.shadowRoot!.querySelector("ui5-toast");
      expect(toast?.getAttribute("placement")).toBe("TopCenter");
    });

    it("should use default placement", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-toast-card", {
        type: "custom:ui5-toast-card",
        text: "Test",
      }, hass);

      const toast = card.shadowRoot!.querySelector("ui5-toast");
      expect(toast?.getAttribute("placement")).toBe("BottomCenter");
    });

    it("should display trigger info when configured", async () => {
      const hass = createMockHass({
        "binary_sensor.motion": createMockEntity("binary_sensor.motion", "off", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-toast-card", {
        type: "custom:ui5-toast-card",
        text: "Motion detected!",
        trigger_entity: "binary_sensor.motion",
        trigger_state: "on",
      }, hass);

      const triggerInfo = card.shadowRoot!.querySelector(".toast-trigger");
      expect(triggerInfo?.textContent).toContain("binary_sensor.motion");
    });
  });

  describe("entity binding", () => {
    it("should display entity-based message", async () => {
      const hass = createMockHass({
        "binary_sensor.door": createMockEntity("binary_sensor.door", "open", {
          friendly_name: "Front Door",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-toast-card", {
        type: "custom:ui5-toast-card",
        entity: "binary_sensor.door",
      }, hass);

      const preview = card.shadowRoot!.querySelector(".toast-preview");
      expect(preview?.textContent).toContain("Front Door");
    });

    it("should handle unavailable entity", async () => {
      const hass = createMockHass({
        "sensor.offline": createMockEntity("sensor.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-toast-card", {
        type: "custom:ui5-toast-card",
        entity: "sensor.offline",
      }, hass);

      const container = card.shadowRoot!.querySelector(".toast-container");
      expect(container?.classList.contains("unavailable")).toBe(true);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-toast-card") as unknown as { getStubConfig: () => UI5ToastCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-toast-card");
      expect(stub.text).toBeDefined();
      expect(stub.duration).toBeDefined();
      expect(stub.placement).toBeDefined();
    });
  });
});
