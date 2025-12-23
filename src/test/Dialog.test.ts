/**
 * Tests for UI5 Dialog Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5DialogCardConfig } from "../types";

import "../components/Dialog/Dialog";

describe("ui5-dialog-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-dialog-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-dialog-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5DialogCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-dialog-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-dialog-card",
        } as UI5DialogCardConfig)
      ).not.toThrow();
    });

    it("should accept config with header text", () => {
      const card = document.createElement("ui5-dialog-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-dialog-card",
          header_text: "My Dialog",
        } as UI5DialogCardConfig)
      ).not.toThrow();
    });

    it("should accept config with content", () => {
      const card = document.createElement("ui5-dialog-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-dialog-card",
          content: "Dialog content here",
        } as UI5DialogCardConfig)
      ).not.toThrow();
    });

    it("should accept config with state", () => {
      const card = document.createElement("ui5-dialog-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-dialog-card",
          state: "Warning",
        } as UI5DialogCardConfig)
      ).not.toThrow();
    });

    it("should accept config with draggable and resizable", () => {
      const card = document.createElement("ui5-dialog-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-dialog-card",
          draggable: true,
          resizable: true,
        } as UI5DialogCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-dialog element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-dialog-card", {
        type: "custom:ui5-dialog-card",
      }, hass);

      const dialog = card.shadowRoot!.querySelector("ui5-dialog");
      expect(dialog).toBeTruthy();
    });

    it("should render open button", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-dialog-card", {
        type: "custom:ui5-dialog-card",
      }, hass);

      const button = card.shadowRoot!.querySelector("#open-dialog");
      expect(button).toBeTruthy();
    });

    it("should set header text attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-dialog-card", {
        type: "custom:ui5-dialog-card",
        header_text: "Test Dialog",
      }, hass);

      const dialog = card.shadowRoot!.querySelector("ui5-dialog");
      expect(dialog?.getAttribute("header-text")).toBe("Test Dialog");
    });

    it("should set state attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-dialog-card", {
        type: "custom:ui5-dialog-card",
        state: "Error",
      }, hass);

      const dialog = card.shadowRoot!.querySelector("ui5-dialog");
      expect(dialog?.getAttribute("state")).toBe("Error");
    });

    it("should render close button by default", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-dialog-card", {
        type: "custom:ui5-dialog-card",
      }, hass);

      const closeButton = card.shadowRoot!.querySelector("#close-dialog");
      expect(closeButton).toBeTruthy();
    });

    it("should use custom button text", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-dialog-card", {
        type: "custom:ui5-dialog-card",
        button_text: "Click Me",
      }, hass);

      const button = card.shadowRoot!.querySelector("#open-dialog");
      expect(button?.textContent).toContain("Click Me");
    });
  });

  describe("entity binding", () => {
    it("should display entity state in content", async () => {
      const hass = createMockHass({
        "sensor.temperature": createMockEntity("sensor.temperature", "22", {
          friendly_name: "Temperature",
          unit_of_measurement: "°C",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-dialog-card", {
        type: "custom:ui5-dialog-card",
        entity: "sensor.temperature",
      }, hass);

      const content = card.shadowRoot!.querySelector("[slot='content']");
      expect(content?.textContent).toContain("Temperature");
      expect(content?.textContent).toContain("22");
    });

    it("should handle unavailable entity", async () => {
      const hass = createMockHass({
        "sensor.offline": createMockEntity("sensor.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-dialog-card", {
        type: "custom:ui5-dialog-card",
        entity: "sensor.offline",
      }, hass);

      const container = card.shadowRoot!.querySelector(".dialog-container");
      expect(container?.classList.contains("unavailable")).toBe(true);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-dialog-card") as unknown as { getStubConfig: () => UI5DialogCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-dialog-card");
      expect(stub.header_text).toBeDefined();
      expect(stub.content).toBeDefined();
    });
  });
});
