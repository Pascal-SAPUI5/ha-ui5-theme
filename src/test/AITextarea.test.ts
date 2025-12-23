/**
 * Tests for UI5 AI Textarea Card (Experimental)
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5AITextareaCardConfig } from "../types";

import "../components/AITextarea/AITextarea";

describe("ui5-ai-textarea-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-ai-textarea-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-ai-textarea-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5AITextareaCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-ai-textarea-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-ai-textarea-card",
        } as UI5AITextareaCardConfig)
      ).not.toThrow();
    });

    it("should accept config with placeholder", () => {
      const card = document.createElement("ui5-ai-textarea-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-ai-textarea-card",
          placeholder: "Enter text...",
        } as UI5AITextareaCardConfig)
      ).not.toThrow();
    });

    it("should accept config with rows", () => {
      const card = document.createElement("ui5-ai-textarea-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-ai-textarea-card",
          rows: 5,
        } as UI5AITextareaCardConfig)
      ).not.toThrow();
    });

    it("should accept config with growing options", () => {
      const card = document.createElement("ui5-ai-textarea-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-ai-textarea-card",
          growing: true,
          growing_max_rows: 15,
        } as UI5AITextareaCardConfig)
      ).not.toThrow();
    });

    it("should accept config with service", () => {
      const card = document.createElement("ui5-ai-textarea-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-ai-textarea-card",
          service: "script.save_text",
        } as UI5AITextareaCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-ai-textarea element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-ai-textarea-card", {
        type: "custom:ui5-ai-textarea-card",
      }, hass);

      const textarea = card.shadowRoot!.querySelector("ui5-ai-textarea");
      expect(textarea).toBeTruthy();
    });

    it("should render experimental badge", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-ai-textarea-card", {
        type: "custom:ui5-ai-textarea-card",
      }, hass);

      const badge = card.shadowRoot!.querySelector(".experimental-badge");
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toContain("Experimental");
    });

    it("should set placeholder attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-ai-textarea-card", {
        type: "custom:ui5-ai-textarea-card",
        placeholder: "Type your content...",
      }, hass);

      const textarea = card.shadowRoot!.querySelector("ui5-ai-textarea");
      expect(textarea?.getAttribute("placeholder")).toBe("Type your content...");
    });

    it("should set rows attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-ai-textarea-card", {
        type: "custom:ui5-ai-textarea-card",
        rows: 6,
      }, hass);

      const textarea = card.shadowRoot!.querySelector("ui5-ai-textarea");
      expect(textarea?.getAttribute("rows")).toBe("6");
    });

    it("should use default rows", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-ai-textarea-card", {
        type: "custom:ui5-ai-textarea-card",
      }, hass);

      const textarea = card.shadowRoot!.querySelector("ui5-ai-textarea");
      expect(textarea?.getAttribute("rows")).toBe("3");
    });

    it("should have growing attribute by default", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-ai-textarea-card", {
        type: "custom:ui5-ai-textarea-card",
      }, hass);

      const textarea = card.shadowRoot!.querySelector("ui5-ai-textarea");
      expect(textarea?.hasAttribute("growing")).toBe(true);
    });

    it("should set growing-max-rows attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-ai-textarea-card", {
        type: "custom:ui5-ai-textarea-card",
        growing_max_rows: 20,
      }, hass);

      const textarea = card.shadowRoot!.querySelector("ui5-ai-textarea");
      expect(textarea?.getAttribute("growing-max-rows")).toBe("20");
    });

    it("should set maxlength attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-ai-textarea-card", {
        type: "custom:ui5-ai-textarea-card",
        max_length: 2000,
      }, hass);

      const textarea = card.shadowRoot!.querySelector("ui5-ai-textarea");
      expect(textarea?.getAttribute("maxlength")).toBe("2000");
    });

    it("should use default placeholder", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-ai-textarea-card", {
        type: "custom:ui5-ai-textarea-card",
      }, hass);

      const textarea = card.shadowRoot!.querySelector("ui5-ai-textarea");
      expect(textarea?.getAttribute("placeholder")).toBe("Enter text...");
    });
  });

  describe("entity binding", () => {
    it("should use entity state as initial value", async () => {
      const hass = createMockHass({
        "input_text.notes": createMockEntity("input_text.notes", "My notes content", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-ai-textarea-card", {
        type: "custom:ui5-ai-textarea-card",
        entity: "input_text.notes",
      }, hass);

      const textarea = card.shadowRoot!.querySelector("ui5-ai-textarea");
      expect(textarea?.getAttribute("value")).toBe("My notes content");
    });

    it("should handle unavailable entity", async () => {
      const hass = createMockHass({
        "input_text.offline": createMockEntity("input_text.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-ai-textarea-card", {
        type: "custom:ui5-ai-textarea-card",
        entity: "input_text.offline",
      }, hass);

      const container = card.shadowRoot!.querySelector(".textarea-container");
      expect(container?.classList.contains("unavailable")).toBe(true);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-ai-textarea-card") as unknown as { getStubConfig: () => UI5AITextareaCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-ai-textarea-card");
      expect(stub.placeholder).toBeDefined();
      expect(stub.rows).toBeDefined();
    });
  });
});
