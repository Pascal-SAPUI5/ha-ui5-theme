/**
 * Tests for UI5 TimePicker Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5TimePickerCardConfig } from "../types";

import "../components/TimePicker/TimePicker";

describe("ui5-timepicker-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-timepicker-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-timepicker-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5TimePickerCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-timepicker-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-timepicker-card",
        } as UI5TimePickerCardConfig)
      ).not.toThrow();
    });

    it("should accept config with placeholder", () => {
      const card = document.createElement("ui5-timepicker-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-timepicker-card",
          placeholder: "Pick a time",
        } as UI5TimePickerCardConfig)
      ).not.toThrow();
    });

    it("should accept config with format pattern", () => {
      const card = document.createElement("ui5-timepicker-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-timepicker-card",
          format_pattern: "hh:mm a",
        } as UI5TimePickerCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-time-picker element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-timepicker-card", {
        type: "custom:ui5-timepicker-card",
      }, hass);

      const timePicker = card.shadowRoot!.querySelector("ui5-time-picker");
      expect(timePicker).toBeTruthy();
    });

    it("should set placeholder", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-timepicker-card", {
        type: "custom:ui5-timepicker-card",
        placeholder: "Select time",
      }, hass);

      const timePicker = card.shadowRoot!.querySelector("ui5-time-picker");
      expect(timePicker?.getAttribute("placeholder")).toBe("Select time");
    });

    it("should set format pattern", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-timepicker-card", {
        type: "custom:ui5-timepicker-card",
        format_pattern: "HH:mm:ss",
      }, hass);

      const timePicker = card.shadowRoot!.querySelector("ui5-time-picker");
      expect(timePicker?.getAttribute("format-pattern")).toBe("HH:mm:ss");
    });

    it("should use default format pattern", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-timepicker-card", {
        type: "custom:ui5-timepicker-card",
      }, hass);

      const timePicker = card.shadowRoot!.querySelector("ui5-time-picker");
      expect(timePicker?.getAttribute("format-pattern")).toBe("HH:mm");
    });
  });

  describe("entity binding", () => {
    it("should display entity state as value", async () => {
      const hass = createMockHass({
        "input_datetime.alarm": createMockEntity("input_datetime.alarm", "07:30", {
          friendly_name: "Alarm Time",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-timepicker-card", {
        type: "custom:ui5-timepicker-card",
        entity: "input_datetime.alarm",
      }, hass);

      const timePicker = card.shadowRoot!.querySelector("ui5-time-picker");
      expect(timePicker?.getAttribute("value")).toBe("07:30");
    });

    it("should disable picker when entity unavailable", async () => {
      const hass = createMockHass({
        "input_datetime.offline": createMockEntity("input_datetime.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-timepicker-card", {
        type: "custom:ui5-timepicker-card",
        entity: "input_datetime.offline",
      }, hass);

      const timePicker = card.shadowRoot!.querySelector("ui5-time-picker");
      expect(timePicker?.hasAttribute("disabled")).toBe(true);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-timepicker-card") as unknown as { getStubConfig: () => UI5TimePickerCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-timepicker-card");
      expect(stub.placeholder).toBeDefined();
      expect(stub.format_pattern).toBeDefined();
    });
  });
});
