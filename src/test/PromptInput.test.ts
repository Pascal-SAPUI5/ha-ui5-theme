/**
 * Tests for UI5 Prompt Card (Experimental)
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5PromptCardConfig } from "../types";

import "../components/PromptInput/PromptInput";

describe("ui5-prompt-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-prompt-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-prompt-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5PromptCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-prompt-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-prompt-card",
        } as UI5PromptCardConfig)
      ).not.toThrow();
    });

    it("should accept config with placeholder", () => {
      const card = document.createElement("ui5-prompt-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-prompt-card",
          placeholder: "Enter prompt...",
        } as UI5PromptCardConfig)
      ).not.toThrow();
    });

    it("should accept config with label", () => {
      const card = document.createElement("ui5-prompt-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-prompt-card",
          label: "AI Prompt",
        } as UI5PromptCardConfig)
      ).not.toThrow();
    });

    it("should accept config with max_length", () => {
      const card = document.createElement("ui5-prompt-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-prompt-card",
          max_length: 500,
        } as UI5PromptCardConfig)
      ).not.toThrow();
    });

    it("should accept config with service", () => {
      const card = document.createElement("ui5-prompt-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-prompt-card",
          service: "script.process_prompt",
        } as UI5PromptCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-ai-prompt-input element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-prompt-card", {
        type: "custom:ui5-prompt-card",
      }, hass);

      const promptInput = card.shadowRoot!.querySelector("ui5-ai-prompt-input");
      expect(promptInput).toBeTruthy();
    });

    it("should render experimental badge", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-prompt-card", {
        type: "custom:ui5-prompt-card",
      }, hass);

      const badge = card.shadowRoot!.querySelector(".experimental-badge");
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toContain("Experimental");
    });

    it("should set placeholder attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-prompt-card", {
        type: "custom:ui5-prompt-card",
        placeholder: "Ask me anything...",
      }, hass);

      const promptInput = card.shadowRoot!.querySelector("ui5-ai-prompt-input");
      expect(promptInput?.getAttribute("placeholder")).toBe("Ask me anything...");
    });

    it("should set label attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-prompt-card", {
        type: "custom:ui5-prompt-card",
        label: "Your Question",
      }, hass);

      const promptInput = card.shadowRoot!.querySelector("ui5-ai-prompt-input");
      expect(promptInput?.getAttribute("label")).toBe("Your Question");
    });

    it("should set maxlength attribute", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-prompt-card", {
        type: "custom:ui5-prompt-card",
        max_length: 1000,
      }, hass);

      const promptInput = card.shadowRoot!.querySelector("ui5-ai-prompt-input");
      expect(promptInput?.getAttribute("maxlength")).toBe("1000");
    });

    it("should have show-clear-icon by default", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-prompt-card", {
        type: "custom:ui5-prompt-card",
      }, hass);

      const promptInput = card.shadowRoot!.querySelector("ui5-ai-prompt-input");
      expect(promptInput?.hasAttribute("show-clear-icon")).toBe(true);
    });

    it("should use default placeholder", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-prompt-card", {
        type: "custom:ui5-prompt-card",
      }, hass);

      const promptInput = card.shadowRoot!.querySelector("ui5-ai-prompt-input");
      expect(promptInput?.getAttribute("placeholder")).toBe("Enter your prompt...");
    });
  });

  describe("entity binding", () => {
    it("should use entity state as initial value", async () => {
      const hass = createMockHass({
        "input_text.prompt": createMockEntity("input_text.prompt", "Hello AI", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-prompt-card", {
        type: "custom:ui5-prompt-card",
        entity: "input_text.prompt",
      }, hass);

      const promptInput = card.shadowRoot!.querySelector("ui5-ai-prompt-input");
      expect(promptInput?.getAttribute("value")).toBe("Hello AI");
    });

    it("should handle unavailable entity", async () => {
      const hass = createMockHass({
        "input_text.offline": createMockEntity("input_text.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-prompt-card", {
        type: "custom:ui5-prompt-card",
        entity: "input_text.offline",
      }, hass);

      const container = card.shadowRoot!.querySelector(".prompt-container");
      expect(container?.classList.contains("unavailable")).toBe(true);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-prompt-card") as unknown as { getStubConfig: () => UI5PromptCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-prompt-card");
      expect(stub.placeholder).toBeDefined();
    });
  });
});
