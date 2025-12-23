/**
 * Tests for UI5 ShellBar Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5ShellBarCardConfig } from "../types";

import "../components/ShellBar/ShellBar";

describe("ui5-shellbar-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-shellbar-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-shellbar-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5ShellBarCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-shellbar-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-shellbar-card",
          primary_title: "Home Assistant",
        } as UI5ShellBarCardConfig)
      ).not.toThrow();
    });

    it("should accept config with secondary title", () => {
      const card = document.createElement("ui5-shellbar-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-shellbar-card",
          primary_title: "Home",
          secondary_title: "Dashboard",
        } as UI5ShellBarCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-shellbar element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-shellbar-card", {
        type: "custom:ui5-shellbar-card",
        primary_title: "Test Home",
      }, hass);

      const shellbar = card.shadowRoot!.querySelector("ui5-shellbar");
      expect(shellbar).toBeTruthy();
    });

    it("should display primary title", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-shellbar-card", {
        type: "custom:ui5-shellbar-card",
        primary_title: "My Home",
      }, hass);

      const shellbar = card.shadowRoot!.querySelector("ui5-shellbar");
      // Check that shellbar exists and has primary-title attribute
      expect(shellbar).toBeTruthy();
      const title = shellbar?.getAttribute("primary-title");
      expect(title).toBe("My Home");
    });

    it("should display secondary title", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-shellbar-card", {
        type: "custom:ui5-shellbar-card",
        primary_title: "Home",
        secondary_title: "Living Room",
      }, hass);

      const shellbar = card.shadowRoot!.querySelector("ui5-shellbar");
      expect(shellbar?.getAttribute("secondary-title")).toBe("Living Room");
    });
  });

  describe("entity binding", () => {
    it("should handle entity binding", async () => {
      const hass = createMockHass({
        "sensor.temperature": createMockEntity("sensor.temperature", "22", {
          friendly_name: "Temperature",
          unit_of_measurement: "°C",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-shellbar-card", {
        type: "custom:ui5-shellbar-card",
        entity: "sensor.temperature",
        primary_title: "Home",
      }, hass);

      const shellbar = card.shadowRoot!.querySelector("ui5-shellbar");
      expect(shellbar).toBeTruthy();
    });

    it("should handle unavailable entity", async () => {
      const hass = createMockHass({
        "sensor.offline": createMockEntity("sensor.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-shellbar-card", {
        type: "custom:ui5-shellbar-card",
        entity: "sensor.offline",
        primary_title: "Status",
      }, hass);

      const shellbar = card.shadowRoot!.querySelector("ui5-shellbar");
      expect(shellbar).toBeTruthy();
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-shellbar-card") as unknown as { getStubConfig: () => UI5ShellBarCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-shellbar-card");
      expect(stub.primary_title).toBeDefined();
    });
  });
});
