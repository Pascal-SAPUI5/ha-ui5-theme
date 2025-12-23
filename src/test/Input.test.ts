/**
 * Tests for UI5 Input Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5InputCardConfig } from "../types";

import "../components/Input/Input";

describe("ui5-input-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-input-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-input-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5InputCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-input-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-input-card",
        } as UI5InputCardConfig)
      ).not.toThrow();
    });

    it("should accept config with placeholder", () => {
      const card = document.createElement("ui5-input-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-input-card",
          placeholder: "Enter text...",
        } as UI5InputCardConfig)
      ).not.toThrow();
    });

    it("should accept config with input type", () => {
      const card = document.createElement("ui5-input-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-input-card",
          input_type: "Email",
        } as UI5InputCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-input element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-input-card", {
        type: "custom:ui5-input-card",
      }, hass);

      const input = card.shadowRoot!.querySelector("ui5-input");
      expect(input).toBeTruthy();
    });

    it("should set placeholder", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-input-card", {
        type: "custom:ui5-input-card",
        placeholder: "Type here",
      }, hass);

      const input = card.shadowRoot!.querySelector("ui5-input");
      expect(input?.getAttribute("placeholder")).toBe("Type here");
    });

    it("should set input type", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-input-card", {
        type: "custom:ui5-input-card",
        input_type: "Number",
      }, hass);

      const input = card.shadowRoot!.querySelector("ui5-input");
      expect(input?.getAttribute("type")).toBe("Number");
    });

    it("should show clear icon by default", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-input-card", {
        type: "custom:ui5-input-card",
      }, hass);

      const input = card.shadowRoot!.querySelector("ui5-input");
      expect(input?.hasAttribute("show-clear-icon")).toBe(true);
    });
  });

  describe("entity binding", () => {
    it("should display entity state as value", async () => {
      const hass = createMockHass({
        "input_text.name": createMockEntity("input_text.name", "John", {
          friendly_name: "Name",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-input-card", {
        type: "custom:ui5-input-card",
        entity: "input_text.name",
      }, hass);

      const input = card.shadowRoot!.querySelector("ui5-input");
      expect(input?.getAttribute("value")).toBe("John");
    });

    it("should display entity attribute as value", async () => {
      const hass = createMockHass({
        "sensor.device": createMockEntity("sensor.device", "active", {
          friendly_name: "Device",
          name: "My Device",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-input-card", {
        type: "custom:ui5-input-card",
        entity: "sensor.device",
        value_attribute: "name",
      }, hass);

      const input = card.shadowRoot!.querySelector("ui5-input");
      expect(input?.getAttribute("value")).toBe("My Device");
    });

    it("should disable input when entity unavailable", async () => {
      const hass = createMockHass({
        "input_text.offline": createMockEntity("input_text.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-input-card", {
        type: "custom:ui5-input-card",
        entity: "input_text.offline",
      }, hass);

      const input = card.shadowRoot!.querySelector("ui5-input");
      expect(input?.hasAttribute("disabled")).toBe(true);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-input-card") as unknown as { getStubConfig: () => UI5InputCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-input-card");
      expect(stub.placeholder).toBeDefined();
    });
  });
});
