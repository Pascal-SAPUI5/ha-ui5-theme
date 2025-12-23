/**
 * Tests for UI5 Button Card
 * Pattern for testing Home Assistant custom cards with UI5 Web Components
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  createMockHass,
  createMockEntity,
  mountCard,
  wait,
} from "./setup";
import type { LovelaceCard, UI5ButtonCardConfig } from "../types";

// Import the card (registers the custom element)
import "../cards/ui5-button-card";

describe("ui5-button-card", () => {
  beforeAll(async () => {
    // Wait for custom element to be defined
    await customElements.whenDefined("ui5-button-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-button-card") as LovelaceCard;

      expect(() => {
        card.setConfig({} as any);
      }).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-button-card") as LovelaceCard;

      expect(() => {
        card.setConfig({
          type: "custom:ui5-button-card",
          text: "Test Button",
        } as UI5ButtonCardConfig);
      }).not.toThrow();
    });

    it("should store config correctly", () => {
      const card = document.createElement("ui5-button-card") as LovelaceCard;
      const config: UI5ButtonCardConfig = {
        type: "custom:ui5-button-card",
        text: "Test Button",
        design: "Emphasized",
      };

      card.setConfig(config);

      expect(card.config).toEqual(config);
    });
  });

  describe("rendering", () => {
    it("should render button with default text", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-button-card", {
        type: "custom:ui5-button-card",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const button = shadowRoot.querySelector("ui5-button");

      expect(button).toBeTruthy();
      expect(button?.textContent?.trim()).toBe("Button");
    });

    it("should render button with custom text", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-button-card", {
        type: "custom:ui5-button-card",
        text: "Press Me",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const button = shadowRoot.querySelector("ui5-button");

      expect(button?.textContent?.trim()).toBe("Press Me");
    });

    it("should apply design attribute", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-button-card", {
        type: "custom:ui5-button-card",
        text: "Emphasized",
        design: "Emphasized",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const button = shadowRoot.querySelector("ui5-button");

      expect(button?.getAttribute("design")).toBe("Emphasized");
    });

    it("should render icon when provided", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-button-card", {
        type: "custom:ui5-button-card",
        text: "Home",
        icon: "home",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const button = shadowRoot.querySelector("ui5-button");

      expect(button?.getAttribute("icon")).toBe("home");
    });

    it("should render icon-only button", async () => {
      const hass = createMockHass();
      const card = await mountCard<LovelaceCard>("ui5-button-card", {
        type: "custom:ui5-button-card",
        icon: "home",
        icon_only: true,
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const button = shadowRoot.querySelector("ui5-button");

      expect(button?.hasAttribute("icon-only")).toBe(true);
      expect(button?.textContent?.trim()).toBe("");
    });
  });

  describe("entity binding", () => {
    it("should display entity state", async () => {
      const entity = createMockEntity("light.living_room", "on");
      const hass = createMockHass({ "light.living_room": entity });

      const card = await mountCard<LovelaceCard>("ui5-button-card", {
        type: "custom:ui5-button-card",
        entity: "light.living_room",
        text: "Living Room",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const entityInfo = shadowRoot.querySelector(".entity-info");

      expect(entityInfo?.textContent).toBe("on");
    });

    it("should show unavailable state", async () => {
      const entity = createMockEntity("light.offline", "unavailable");
      const hass = createMockHass({ "light.offline": entity });

      const card = await mountCard<LovelaceCard>("ui5-button-card", {
        type: "custom:ui5-button-card",
        entity: "light.offline",
        text: "Offline Light",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const container = shadowRoot.querySelector(".card-container");

      expect(container?.classList.contains("unavailable")).toBe(true);
    });

    it("should update when entity state changes", async () => {
      const entity = createMockEntity("light.living_room", "on");
      const hass = createMockHass({ "light.living_room": entity });

      const card = await mountCard<LovelaceCard>("ui5-button-card", {
        type: "custom:ui5-button-card",
        entity: "light.living_room",
        text: "Living Room",
      }, hass);

      // Update hass with new state
      const updatedEntity = createMockEntity("light.living_room", "off");
      card.hass = createMockHass({ "light.living_room": updatedEntity });

      await wait(10);

      const shadowRoot = card.shadowRoot!;
      const entityInfo = shadowRoot.querySelector(".entity-info");

      expect(entityInfo?.textContent).toBe("off");
    });
  });

  describe("template processing", () => {
    it("should process template in text using entity.state", async () => {
      const entity = createMockEntity("sensor.temperature", "21.5", {
        unit_of_measurement: "°C",
      });
      const hass = createMockHass({ "sensor.temperature": entity });

      const card = await mountCard<LovelaceCard>("ui5-button-card", {
        type: "custom:ui5-button-card",
        entity: "sensor.temperature",
        text: "Temp: {{ entity.state }}°C",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const button = shadowRoot.querySelector("ui5-button");

      expect(button?.textContent?.trim()).toContain("21.5");
    });

    it("should process template using states() function", async () => {
      const entity = createMockEntity("sensor.humidity", "65", {
        unit_of_measurement: "%",
      });
      const hass = createMockHass({ "sensor.humidity": entity });

      const card = await mountCard<LovelaceCard>("ui5-button-card", {
        type: "custom:ui5-button-card",
        text: "Humidity: {{ states('sensor.humidity') }}%",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const button = shadowRoot.querySelector("ui5-button");

      expect(button?.textContent?.trim()).toContain("65");
    });
  });

  describe("actions", () => {
    it("should call toggle service on tap for entity", async () => {
      const entity = createMockEntity("light.living_room", "on");
      const hass = createMockHass({ "light.living_room": entity });

      const card = await mountCard<LovelaceCard>("ui5-button-card", {
        type: "custom:ui5-button-card",
        entity: "light.living_room",
        text: "Toggle Light",
      }, hass);

      const shadowRoot = card.shadowRoot!;
      const button = shadowRoot.querySelector("ui5-button") as HTMLElement;

      // Simulate click
      button.click();

      // Wait for debounce
      await wait(300);

      // Toggle action should call the homeassistant.toggle service
      expect(hass.callService).toHaveBeenCalled();
    });
  });

  describe("getCardSize", () => {
    it("should return correct card size", () => {
      const card = document.createElement("ui5-button-card") as LovelaceCard;
      card.setConfig({ type: "custom:ui5-button-card" });

      expect(card.getCardSize?.()).toBe(1);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-button-card") as any;
      const stub = CardClass.getStubConfig();

      expect(stub).toHaveProperty("type", "custom:ui5-button-card");
      expect(stub).toHaveProperty("text");
      expect(stub).toHaveProperty("design");
    });
  });
});
