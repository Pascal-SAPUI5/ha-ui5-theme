/**
 * Tests for UI5 Menu Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5MenuCardConfig } from "../types";

import "../components/Menu/Menu";

describe("ui5-menu-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-menu-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-menu-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5MenuCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-menu-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-menu-card",
        } as UI5MenuCardConfig)
      ).not.toThrow();
    });

    it("should accept config with button text", () => {
      const card = document.createElement("ui5-menu-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-menu-card",
          button_text: "Actions",
        } as UI5MenuCardConfig)
      ).not.toThrow();
    });

    it("should accept config with items", () => {
      const card = document.createElement("ui5-menu-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-menu-card",
          items: [
            { text: "Option 1" },
            { text: "Option 2", icon: "settings" },
          ],
        } as UI5MenuCardConfig)
      ).not.toThrow();
    });

    it("should accept config with items including service", () => {
      const card = document.createElement("ui5-menu-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-menu-card",
          items: [
            { text: "Turn On", service: "light.turn_on" },
            { text: "Turn Off", service: "light.turn_off" },
          ],
        } as UI5MenuCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-menu element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-menu-card", {
        type: "custom:ui5-menu-card",
      }, hass);

      const menu = card.shadowRoot!.querySelector("ui5-menu");
      expect(menu).toBeTruthy();
    });

    it("should render opener button", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-menu-card", {
        type: "custom:ui5-menu-card",
      }, hass);

      const button = card.shadowRoot!.querySelector("#menu-opener");
      expect(button).toBeTruthy();
    });

    it("should use custom button text", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-menu-card", {
        type: "custom:ui5-menu-card",
        button_text: "Options",
      }, hass);

      const button = card.shadowRoot!.querySelector("#menu-opener");
      expect(button?.textContent).toContain("Options");
    });

    it("should render menu items", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-menu-card", {
        type: "custom:ui5-menu-card",
        items: [
          { text: "Item 1" },
          { text: "Item 2" },
          { text: "Item 3" },
        ],
      }, hass);

      const items = card.shadowRoot!.querySelectorAll("ui5-menu-item");
      expect(items.length).toBe(3);
    });

    it("should set item text attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-menu-card", {
        type: "custom:ui5-menu-card",
        items: [
          { text: "My Action" },
        ],
      }, hass);

      const item = card.shadowRoot!.querySelector("ui5-menu-item");
      expect(item?.getAttribute("text")).toBe("My Action");
    });

    it("should set item icon attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-menu-card", {
        type: "custom:ui5-menu-card",
        items: [
          { text: "Settings", icon: "settings" },
        ],
      }, hass);

      const item = card.shadowRoot!.querySelector("ui5-menu-item");
      expect(item?.getAttribute("icon")).toBe("settings");
    });

    it("should set disabled attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-menu-card", {
        type: "custom:ui5-menu-card",
        items: [
          { text: "Disabled Item", disabled: true },
        ],
      }, hass);

      const item = card.shadowRoot!.querySelector("ui5-menu-item");
      expect(item?.hasAttribute("disabled")).toBe(true);
    });

    it("should set starts-section attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-menu-card", {
        type: "custom:ui5-menu-card",
        items: [
          { text: "First Item" },
          { text: "New Section", starts_section: true },
        ],
      }, hass);

      const items = card.shadowRoot!.querySelectorAll("ui5-menu-item");
      expect(items[1]?.hasAttribute("starts-section")).toBe(true);
    });

    it("should render default item when no items provided", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-menu-card", {
        type: "custom:ui5-menu-card",
      }, hass);

      const item = card.shadowRoot!.querySelector("ui5-menu-item");
      expect(item?.getAttribute("text")).toBe("No items");
    });
  });

  describe("entity binding", () => {
    it("should handle entity state", async () => {
      const hass = createMockHass({
        "light.living_room": createMockEntity("light.living_room", "on", {
          friendly_name: "Living Room",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-menu-card", {
        type: "custom:ui5-menu-card",
        entity: "light.living_room",
        items: [
          { text: "Toggle", service: "light.toggle" },
        ],
      }, hass);

      const menu = card.shadowRoot!.querySelector("ui5-menu");
      expect(menu).toBeTruthy();
    });

    it("should handle unavailable entity", async () => {
      const hass = createMockHass({
        "light.offline": createMockEntity("light.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-menu-card", {
        type: "custom:ui5-menu-card",
        entity: "light.offline",
        items: [{ text: "Action" }],
      }, hass);

      const container = card.shadowRoot!.querySelector(".menu-container");
      expect(container?.classList.contains("unavailable")).toBe(true);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-menu-card") as unknown as { getStubConfig: () => UI5MenuCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-menu-card");
      expect(stub.button_text).toBeDefined();
      expect(stub.items).toBeDefined();
      expect(stub.items!.length).toBeGreaterThan(0);
    });
  });
});
