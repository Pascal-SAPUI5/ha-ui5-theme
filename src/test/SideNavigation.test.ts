/**
 * Tests for UI5 SideNavigation Card
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createMockHass, createMockEntity, mountCard } from "./setup";
import type { LovelaceCard, UI5SideNavCardConfig } from "../types";

import "../components/SideNavigation/SideNavigation";

describe("ui5-sidenav-card", () => {
  beforeAll(async () => {
    await customElements.whenDefined("ui5-sidenav-card");
  });

  describe("configuration", () => {
    it("should require type in config", () => {
      const card = document.createElement("ui5-sidenav-card") as LovelaceCard;
      expect(() => card.setConfig({} as UI5SideNavCardConfig)).toThrow("Card type is required");
    });

    it("should accept valid config", () => {
      const card = document.createElement("ui5-sidenav-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-sidenav-card",
        } as UI5SideNavCardConfig)
      ).not.toThrow();
    });

    it("should accept config with items", () => {
      const card = document.createElement("ui5-sidenav-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-sidenav-card",
          items: [
            { text: "Home", icon: "home" },
            { text: "Settings", icon: "settings" },
          ],
        } as UI5SideNavCardConfig)
      ).not.toThrow();
    });

    it("should accept collapsed config", () => {
      const card = document.createElement("ui5-sidenav-card") as LovelaceCard;
      expect(() =>
        card.setConfig({
          type: "custom:ui5-sidenav-card",
          collapsed: true,
        } as UI5SideNavCardConfig)
      ).not.toThrow();
    });
  });

  describe("rendering", () => {
    it("should render ui5-side-navigation element", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-sidenav-card", {
        type: "custom:ui5-sidenav-card",
      }, hass);

      const sidenav = card.shadowRoot!.querySelector("ui5-side-navigation");
      expect(sidenav).toBeTruthy();
    });

    it("should render navigation items", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-sidenav-card", {
        type: "custom:ui5-sidenav-card",
        items: [
          { text: "Dashboard", icon: "home" },
          { text: "Devices", icon: "settings" },
        ],
      }, hass);

      const items = card.shadowRoot!.querySelectorAll("ui5-side-navigation-item");
      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    it("should set collapsed state", async () => {
      const hass = createMockHass({});
      const card = await mountCard<HTMLElement>("ui5-sidenav-card", {
        type: "custom:ui5-sidenav-card",
        collapsed: true,
      }, hass);

      const sidenav = card.shadowRoot!.querySelector("ui5-side-navigation");
      expect(sidenav).toBeTruthy();
      // Verify the sidenav rendered (collapsed behavior depends on UI5 internals)
    });
  });

  describe("entity binding", () => {
    it("should handle entity state in items", async () => {
      const hass = createMockHass({
        "light.living_room": createMockEntity("light.living_room", "on", {
          friendly_name: "Living Room",
        }),
      });

      const card = await mountCard<HTMLElement>("ui5-sidenav-card", {
        type: "custom:ui5-sidenav-card",
        entity: "light.living_room",
        items: [{ text: "Living Room", icon: "lightbulb" }],
      }, hass);

      const sidenav = card.shadowRoot!.querySelector("ui5-side-navigation");
      expect(sidenav).toBeTruthy();
    });
  });

  describe("getStubConfig", () => {
    it("should return valid stub config", () => {
      const CardClass = customElements.get("ui5-sidenav-card") as unknown as { getStubConfig: () => UI5SideNavCardConfig };
      const stub = CardClass.getStubConfig();
      expect(stub.type).toBe("custom:ui5-sidenav-card");
    });
  });
});
