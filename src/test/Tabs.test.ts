/**
 * Tests for UI5 Tabs Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5TabsCardConfig } from "../types";

import "../components/Tabs/Tabs";

describe("ui5-tabs-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-tabs-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-tabs-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5TabsCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-tabs-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-tabs-card",
          tabs: [{ text: "Tab 1" }],
        } as UI5TabsCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-tabcontainer element", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-tabs-card", {
        type: "custom:ui5-tabs-card",
        tabs: [{ text: "Tab 1" }],
      }, hass);

      const tabContainer = card.shadowRoot!.querySelector("ui5-tabcontainer");
      expect(tabContainer).toBeTruthy();
    });

    it("should render tabs", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-tabs-card", {
        type: "custom:ui5-tabs-card",
        tabs: [
          { text: "Tab 1" },
          { text: "Tab 2" },
          { text: "Tab 3" },
        ],
      }, hass);

      const tabs = card.shadowRoot!.querySelectorAll("ui5-tab");
      expect(tabs.length).toBe(3);
    });

    it("should render tab with text", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-tabs-card", {
        type: "custom:ui5-tabs-card",
        tabs: [{ text: "My Tab" }],
      }, hass);

      const tab = card.shadowRoot!.querySelector("ui5-tab");
      expect(tab?.getAttribute("text")).toBe("My Tab");
    });

    it("should render tab with icon", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-tabs-card", {
        type: "custom:ui5-tabs-card",
        tabs: [{ text: "Home", icon: "home" }],
      }, hass);

      const tab = card.shadowRoot!.querySelector("ui5-tab");
      expect(tab?.getAttribute("icon")).toBe("home");
    });

    it("should render disabled tab", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-tabs-card", {
        type: "custom:ui5-tabs-card",
        tabs: [{ text: "Disabled", disabled: true }],
      }, hass);

      const tab = card.shadowRoot!.querySelector("ui5-tab");
      expect(tab?.hasAttribute("disabled")).toBe(true);
    });

    it("should render selected tab", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-tabs-card", {
        type: "custom:ui5-tabs-card",
        tabs: [
          { text: "Tab 1" },
          { text: "Tab 2", selected: true },
        ],
      }, hass);

      const tabs = card.shadowRoot!.querySelectorAll("ui5-tab");
      expect(tabs[1]?.hasAttribute("selected")).toBe(true);
    });

    it("should render entity list in tab", async () => {
      const entities = {
        "light.living_room": createMockEntity("light.living_room", "on"),
        "light.bedroom": createMockEntity("light.bedroom", "off"),
      };
      const hass = createMockHass(entities);
      const card = await mountCard<LovelaceCard>("ui5-tabs-card", {
        type: "custom:ui5-tabs-card",
        tabs: [
          {
            text: "Lights",
            entities: ["light.living_room", "light.bedroom"],
          },
        ],
      }, hass);

      const entityRows = card.shadowRoot!.querySelectorAll(".entity-row");
      expect(entityRows.length).toBe(2);
    });

    it("should render custom content in tab", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-tabs-card", {
        type: "custom:ui5-tabs-card",
        tabs: [{ text: "Tab", content: "Custom content" }],
      }, hass);

      const content = card.shadowRoot!.querySelector(".custom-content");
      expect(content?.textContent).toBe("Custom content");
    });

    it("should set tab layout", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-tabs-card", {
        type: "custom:ui5-tabs-card",
        tabs: [{ text: "Tab" }],
        tab_layout: "Inline",
      }, hass);

      const tabContainer = card.shadowRoot!.querySelector("ui5-tabcontainer");
      expect(tabContainer?.getAttribute("tab-layout")).toBe("Inline");
    });
  });

  describe("getCardSize", () => {
    it("should return size based on max entities", () => {
      const card = document.createElement("ui5-tabs-card") as LovelaceCard;
      card.setConfig({
        type: "custom:ui5-tabs-card",
        tabs: [
          { text: "Tab 1", entities: ["a", "b"] },
          { text: "Tab 2", entities: ["c", "d", "e", "f", "g"] },
        ],
      } as UI5TabsCardConfig);
      expect(card.getCardSize?.()).toBeGreaterThan(1);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-tabs-card") as unknown as { getStubConfig: () => UI5TabsCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-tabs-card");
      expect(stub.tabs).toBeDefined();
      expect(stub.tabs!.length).toBeGreaterThan(0);
    });
  });
});
