/**
 * Tests for UI5 List Card
 * Tests for entity list display with Home Assistant integration
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  createMockHass,
  createMockEntity,
  mountCard,
  wait,
} from "./setup";
import type { LovelaceCard, UI5ListCardConfig } from "../types";

// Import the card (registers the custom element)
import "../components/List/List";

describe("ui5-list-card", () => {
  beforeAll(async () => {
    // Wait for custom element to be defined
    await customElements.whenDefined("ui5-list-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-list-card") as LovelaceCard;

      expect(() => {
        card.setConfig({} as any);
      }).toThrow("Card type is required");
    });

    it("should accept valid config with entities", () => {
      const card = document.createElement("ui5-list-card") as LovelaceCard;

      expect(() => {
        card.setConfig({
          type: "custom:ui5-list-card",
          entities: ["light.living_room", "switch.kitchen"],
        } as UI5ListCardConfig);
      }).not.toThrow();
    });

    it("should accept valid config with items", () => {
      const card = document.createElement("ui5-list-card") as LovelaceCard;

      expect(() => {
        card.setConfig({
          type: "custom:ui5-list-card",
          items: [
            { text: "Item 1", description: "First item" },
            { text: "Item 2", entity: "light.test" },
          ],
        } as UI5ListCardConfig);
      }).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-list element", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-list-card", {
        type: "custom:ui5-list-card",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const list = shadowRoot.querySelector("ui5-list");

      expect(list).toBeTruthy();
    });

    it("should render header text", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-list-card", {
        type: "custom:ui5-list-card",
        title: "My Devices",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const header = shadowRoot.querySelector(".list-header");

      expect(header?.textContent).toBe("My Devices");
    });

    it("should render no data message when empty", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-list-card", {
        type: "custom:ui5-list-card",
        no_data_text: "No devices found",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const list = shadowRoot.querySelector("ui5-list");
      const item = list?.querySelector("ui5-li");

      expect(item?.textContent?.trim()).toBe("No devices found");
    });

    it("should render custom no data text", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-list-card", {
        type: "custom:ui5-list-card",
        no_data_text: "Empty list",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const item = shadowRoot.querySelector("ui5-li");

      expect(item?.textContent?.trim()).toBe("Empty list");
    });
  });

  describe("entity binding", () => {
    it("should render entities as list items", async () => {
      const entities = {
        "light.living_room": createMockEntity("light.living_room", "on", {
          friendly_name: "Living Room Light",
        }),
        "switch.kitchen": createMockEntity("switch.kitchen", "off", {
          friendly_name: "Kitchen Switch",
        }),
      };
      const hass = createMockHass(entities);

      const card = await mountCard<LovelaceCard>("ui5-list-card", {
        type: "custom:ui5-list-card",
        entities: ["light.living_room", "switch.kitchen"],
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const items = shadowRoot.querySelectorAll("ui5-li");

      expect(items.length).toBe(2);
      expect(items[0]?.textContent?.trim()).toBe("Living Room Light");
      expect(items[1]?.textContent?.trim()).toBe("Kitchen Switch");
    });

    it("should show entity state as additional text", async () => {
      const entities = {
        "light.living_room": createMockEntity("light.living_room", "on", {
          friendly_name: "Living Room Light",
        }),
      };
      const hass = createMockHass(entities);

      const card = await mountCard<LovelaceCard>("ui5-list-card", {
        type: "custom:ui5-list-card",
        entities: ["light.living_room"],
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const item = shadowRoot.querySelector("ui5-li");

      expect(item?.getAttribute("additional-text")).toBe("On");
    });

    it("should update when entity state changes", async () => {
      const entities = {
        "light.living_room": createMockEntity("light.living_room", "on"),
      };
      const hass = createMockHass(entities);

      const card = await mountCard<LovelaceCard>("ui5-list-card", {
        type: "custom:ui5-list-card",
        entities: ["light.living_room"],
      }, hass);

      // Update entity state
      const updatedEntities = {
        "light.living_room": createMockEntity("light.living_room", "off"),
      };
      card.hass = createMockHass(updatedEntities);

      await wait(10);

      const shadowRoot = card.shadowRoot!;
      const item = shadowRoot.querySelector("ui5-li");

      expect(item?.getAttribute("additional-text")).toBe("Off");
    });

    it("should set data-entity attribute for click handling", async () => {
      const entities = {
        "light.living_room": createMockEntity("light.living_room", "on"),
      };
      const hass = createMockHass(entities);

      const card = await mountCard<LovelaceCard>("ui5-list-card", {
        type: "custom:ui5-list-card",
        entities: ["light.living_room"],
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const item = shadowRoot.querySelector("ui5-li");

      expect(item?.getAttribute("data-entity")).toBe("light.living_room");
    });
  });

  describe("custom items", () => {
    it("should render custom items", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-list-card", {
        type: "custom:ui5-list-card",
        items: [
          { text: "Custom Item 1", description: "Description 1" },
          { text: "Custom Item 2", description: "Description 2" },
        ],
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const items = shadowRoot.querySelectorAll("ui5-li");

      expect(items.length).toBe(2);
      expect(items[0]?.textContent?.trim()).toBe("Custom Item 1");
      expect(items[0]?.getAttribute("description")).toBe("Description 1");
    });

    it("should render item with icon", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-list-card", {
        type: "custom:ui5-list-card",
        items: [{ text: "Home", icon: "home" }],
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const item = shadowRoot.querySelector("ui5-li");

      expect(item?.getAttribute("icon")).toBe("home");
    });

    it("should bind item entity state", async () => {
      const entities = {
        "sensor.temperature": createMockEntity("sensor.temperature", "21.5", {
          unit_of_measurement: "°C",
        }),
      };
      const hass = createMockHass(entities);

      const card = await mountCard<LovelaceCard>("ui5-list-card", {
        type: "custom:ui5-list-card",
        items: [{ text: "Temperature", entity: "sensor.temperature" }],
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const item = shadowRoot.querySelector("ui5-li");

      expect(item?.getAttribute("additional-text")).toContain("21.5");
    });
  });

  describe("grouping", () => {
    it("should group items by domain", async () => {
      const entities = {
        "light.living_room": createMockEntity("light.living_room", "on"),
        "light.bedroom": createMockEntity("light.bedroom", "off"),
        "switch.kitchen": createMockEntity("switch.kitchen", "on"),
      };
      const hass = createMockHass(entities);

      const card = await mountCard<LovelaceCard>("ui5-list-card", {
        type: "custom:ui5-list-card",
        entities: ["light.living_room", "light.bedroom", "switch.kitchen"],
        group_by: "domain",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const groups = shadowRoot.querySelectorAll("ui5-li-group");

      expect(groups.length).toBe(2); // Lights and Switches
    });
  });

  describe("list modes", () => {
    it("should set list mode", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-list-card", {
        type: "custom:ui5-list-card",
        mode: "SingleSelect",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const list = shadowRoot.querySelector("ui5-list");

      expect(list?.getAttribute("mode")).toBe("SingleSelect");
    });

    it("should set growing mode", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-list-card", {
        type: "custom:ui5-list-card",
        growing: "Scroll",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const list = shadowRoot.querySelector("ui5-list");

      expect(list?.getAttribute("growing")).toBe("Scroll");
    });
  });

  describe("getCardSize", () => {
    it("should return correct size for entities", () => {
      const card = document.createElement("ui5-list-card") as LovelaceCard;
      card.setConfig({
        type: "custom:ui5-list-card",
        entities: ["light.a", "light.b", "light.c", "light.d", "light.e"],
      } as UI5ListCardConfig);

      expect(card.getCardSize?.()).toBe(2);
    });

    it("should return 1 for empty list", () => {
      const card = document.createElement("ui5-list-card") as LovelaceCard;
      card.setConfig({ type: "custom:ui5-list-card" } as UI5ListCardConfig);

      expect(card.getCardSize?.()).toBe(1);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-list-card") as any;
      const stub = CardClass.getStubConfig();

      expect(stub).toHaveProperty("type", "custom:ui5-list-card");
      expect(stub).toHaveProperty("title");
      expect(stub).toHaveProperty("entities");
    });
  });
});
