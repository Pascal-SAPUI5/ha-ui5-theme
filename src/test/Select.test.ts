/**
 * Tests for UI5 Select Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5SelectCardConfig } from "../types";

import "../components/Select/Select";

describe("ui5-select-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-select-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-select-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5SelectCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-select-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-select-card",
        } as UI5SelectCardConfig)
      ).not.toThrow();
    });

    it("should accept config with options", () => {
      const card = document.createElement("ui5-select-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-select-card",
          options: [
            { value: "opt1", label: "Option 1" },
            { value: "opt2", label: "Option 2" },
          ],
        } as UI5SelectCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-select element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-select-card", {
        type: "custom:ui5-select-card",
      }, hass);

      const select = card.shadowRoot!.querySelector("ui5-select");
      expect(select).toBeTruthy();
    });

    it("should render options", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-select-card", {
        type: "custom:ui5-select-card",
        options: [
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
          { value: "c", label: "Gamma" },
        ],
      }, hass);

      const options = card.shadowRoot!.querySelectorAll("ui5-option");
      expect(options.length).toBe(3);
    });

    it("should set option values", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-select-card", {
        type: "custom:ui5-select-card",
        options: [
          { value: "test_value", label: "Test" },
        ],
      }, hass);

      const option = card.shadowRoot!.querySelector("ui5-option");
      expect(option?.getAttribute("value")).toBe("test_value");
    });
  });

  describe("entity binding", () => {
    it("should select current entity state", async () => {
      const hass = createMockHass({
        "input_select.mode": createMockEntity("input_select.mode", "eco", {
          friendly_name: "Mode",
          options: ["eco", "comfort", "away"],
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-select-card", {
        type: "custom:ui5-select-card",
        entity: "input_select.mode",
        options: [
          { value: "eco", label: "Eco" },
          { value: "comfort", label: "Comfort" },
          { value: "away", label: "Away" },
        ],
      }, hass);

      const selectedOption = card.shadowRoot!.querySelector("ui5-option[selected]");
      expect(selectedOption?.getAttribute("value")).toBe("eco");
    });

    it("should use entity options if no options configured", async () => {
      const hass = createMockHass({
        "input_select.source": createMockEntity("input_select.source", "TV", {
          friendly_name: "Source",
          options: ["TV", "Radio", "Bluetooth"],
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-select-card", {
        type: "custom:ui5-select-card",
        entity: "input_select.source",
      }, hass);

      const options = card.shadowRoot!.querySelectorAll("ui5-option");
      expect(options.length).toBe(3);
    });

    it("should disable select when entity unavailable", async () => {
      const hass = createMockHass({
        "input_select.offline": createMockEntity("input_select.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-select-card", {
        type: "custom:ui5-select-card",
        entity: "input_select.offline",
      }, hass);

      const select = card.shadowRoot!.querySelector("ui5-select");
      expect(select?.hasAttribute("disabled")).toBe(true);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-select-card") as unknown as { getStubConfig: () => UI5SelectCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-select-card");
      expect(stub.options).toBeDefined();
      expect(stub.options!.length).toBeGreaterThan(0);
    });
  });
});
