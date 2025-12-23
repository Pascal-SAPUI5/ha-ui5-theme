/**
 * Tests for UI5 Wizard Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5WizardCardConfig } from "../types";

import "../components/Wizard/Wizard";

describe("ui5-wizard-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-wizard-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-wizard-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5WizardCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-wizard-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-wizard-card",
        } as UI5WizardCardConfig)
      ).not.toThrow();
    });

    it("should accept config with steps", () => {
      const card = document.createElement("ui5-wizard-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-wizard-card",
          steps: [
            { title_text: "Step 1" },
            { title_text: "Step 2" },
          ],
        } as UI5WizardCardConfig)
      ).not.toThrow();
    });

    it("should accept config with steps including icons", () => {
      const card = document.createElement("ui5-wizard-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-wizard-card",
          steps: [
            { title_text: "Step 1", icon: "home" },
            { title_text: "Step 2", icon: "settings" },
          ],
        } as UI5WizardCardConfig)
      ).not.toThrow();
    });

    it("should accept config with disabled steps", () => {
      const card = document.createElement("ui5-wizard-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-wizard-card",
          steps: [
            { title_text: "Step 1" },
            { title_text: "Step 2", disabled: true },
          ],
        } as UI5WizardCardConfig)
      ).not.toThrow();
    });

    it("should accept config with entity", () => {
      const card = document.createElement("ui5-wizard-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-wizard-card",
          entity: "sensor.status",
          steps: [{ title_text: "Step 1" }],
        } as UI5WizardCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-wizard element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-wizard-card", {
        type: "custom:ui5-wizard-card",
      }, hass);

      const wizard = card.shadowRoot!.querySelector("ui5-wizard");
      expect(wizard).toBeTruthy();
    });

    it("should render wizard steps", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-wizard-card", {
        type: "custom:ui5-wizard-card",
        steps: [
          { title_text: "First Step" },
          { title_text: "Second Step" },
          { title_text: "Third Step" },
        ],
      }, hass);

      const steps = card.shadowRoot!.querySelectorAll("ui5-wizard-step");
      expect(steps.length).toBe(3);
    });

    it("should set title-text attribute on steps", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-wizard-card", {
        type: "custom:ui5-wizard-card",
        steps: [
          { title_text: "My Step" },
        ],
      }, hass);

      const step = card.shadowRoot!.querySelector("ui5-wizard-step");
      expect(step?.getAttribute("title-text")).toBe("My Step");
    });

    it("should set icon attribute on steps", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-wizard-card", {
        type: "custom:ui5-wizard-card",
        steps: [
          { title_text: "Step", icon: "hint" },
        ],
      }, hass);

      const step = card.shadowRoot!.querySelector("ui5-wizard-step");
      expect(step?.getAttribute("icon")).toBe("hint");
    });

    it("should set disabled attribute on steps", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-wizard-card", {
        type: "custom:ui5-wizard-card",
        steps: [
          { title_text: "Step 1" },
          { title_text: "Step 2", disabled: true },
        ],
      }, hass);

      const steps = card.shadowRoot!.querySelectorAll("ui5-wizard-step");
      expect(steps[0]?.hasAttribute("disabled")).toBe(false);
      expect(steps[1]?.hasAttribute("disabled")).toBe(true);
    });

    it("should render wizard container", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-wizard-card", {
        type: "custom:ui5-wizard-card",
      }, hass);

      const container = card.shadowRoot!.querySelector(".wizard-container");
      expect(container).toBeTruthy();
    });
  });

  describe("entity binding", () => {
    it("should display entity state info", async () => {
      const hass = createMockHass({
        "sensor.process": createMockEntity("sensor.process", "step_2", {
          friendly_name: "Process Status",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-wizard-card", {
        type: "custom:ui5-wizard-card",
        entity: "sensor.process",
        steps: [
          { title_text: "Step 1" },
          { title_text: "Step 2" },
        ],
      }, hass);

      const entityInfo = card.shadowRoot!.querySelector(".entity-info");
      expect(entityInfo?.textContent).toContain("step_2");
    });

    it("should handle unavailable entity", async () => {
      const hass = createMockHass({
        "sensor.offline": createMockEntity("sensor.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-wizard-card", {
        type: "custom:ui5-wizard-card",
        entity: "sensor.offline",
        steps: [{ title_text: "Step" }],
      }, hass);

      const container = card.shadowRoot!.querySelector(".card-container");
      expect(container?.classList.contains("unavailable")).toBe(true);
    });

    it("should not show entity info when no entity configured", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-wizard-card", {
        type: "custom:ui5-wizard-card",
        steps: [{ title_text: "Step" }],
      }, hass);

      const entityInfo = card.shadowRoot!.querySelector(".entity-info");
      expect(entityInfo).toBeFalsy();
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-wizard-card") as unknown as { getStubConfig: () => UI5WizardCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-wizard-card");
      expect(stub.steps).toBeDefined();
      expect(stub.steps!.length).toBeGreaterThan(0);
    });

    it("should have steps with title_text", () => {
      const CardClass = customElements.get("ui5-wizard-card") as unknown as { getStubConfig: () => UI5WizardCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.steps![0].title_text).toBeDefined();
    });
  });
});
