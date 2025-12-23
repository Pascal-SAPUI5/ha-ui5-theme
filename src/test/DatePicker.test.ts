/**
 * Tests for UI5 DatePicker Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5DatePickerCardConfig } from "../types";

import "../components/DatePicker/DatePicker";

describe("ui5-datepicker-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-datepicker-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-datepicker-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5DatePickerCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-datepicker-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-datepicker-card",
        } as UI5DatePickerCardConfig)
      ).not.toThrow();
    });

    it("should accept config with placeholder", () => {
      const card = document.createElement("ui5-datepicker-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-datepicker-card",
          placeholder: "Pick a date",
        } as UI5DatePickerCardConfig)
      ).not.toThrow();
    });

    it("should accept config with format pattern", () => {
      const card = document.createElement("ui5-datepicker-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-datepicker-card",
          format_pattern: "dd/MM/yyyy",
        } as UI5DatePickerCardConfig)
      ).not.toThrow();
    });

    it("should accept config with min/max dates", () => {
      const card = document.createElement("ui5-datepicker-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-datepicker-card",
          min_date: "2024-01-01",
          max_date: "2024-12-31",
        } as UI5DatePickerCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-date-picker element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-datepicker-card", {
        type: "custom:ui5-datepicker-card",
      }, hass);

      const datePicker = card.shadowRoot!.querySelector("ui5-date-picker");
      expect(datePicker).toBeTruthy();
    });

    it("should set placeholder", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-datepicker-card", {
        type: "custom:ui5-datepicker-card",
        placeholder: "Select date",
      }, hass);

      const datePicker = card.shadowRoot!.querySelector("ui5-date-picker");
      expect(datePicker?.getAttribute("placeholder")).toBe("Select date");
    });

    it("should set format pattern", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-datepicker-card", {
        type: "custom:ui5-datepicker-card",
        format_pattern: "MM/dd/yyyy",
      }, hass);

      const datePicker = card.shadowRoot!.querySelector("ui5-date-picker");
      expect(datePicker?.getAttribute("format-pattern")).toBe("MM/dd/yyyy");
    });

    it("should use default format pattern", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-datepicker-card", {
        type: "custom:ui5-datepicker-card",
      }, hass);

      const datePicker = card.shadowRoot!.querySelector("ui5-date-picker");
      expect(datePicker?.getAttribute("format-pattern")).toBe("yyyy-MM-dd");
    });
  });

  describe("entity binding", () => {
    it("should display entity state as value", async () => {
      const hass = createMockHass({
        "input_datetime.event": createMockEntity("input_datetime.event", "2024-06-15", {
          friendly_name: "Event Date",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-datepicker-card", {
        type: "custom:ui5-datepicker-card",
        entity: "input_datetime.event",
      }, hass);

      const datePicker = card.shadowRoot!.querySelector("ui5-date-picker");
      expect(datePicker?.getAttribute("value")).toBe("2024-06-15");
    });

    it("should disable picker when entity unavailable", async () => {
      const hass = createMockHass({
        "input_datetime.offline": createMockEntity("input_datetime.offline", "unavailable", {}),
      });

      const card = await mountCard<HTMLElement>("ui5-datepicker-card", {
        type: "custom:ui5-datepicker-card",
        entity: "input_datetime.offline",
      }, hass);

      const datePicker = card.shadowRoot!.querySelector("ui5-date-picker");
      expect(datePicker?.hasAttribute("disabled")).toBe(true);
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-datepicker-card") as unknown as { getStubConfig: () => UI5DatePickerCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-datepicker-card");
      expect(stub.placeholder).toBeDefined();
      expect(stub.format_pattern).toBeDefined();
    });
  });
});
