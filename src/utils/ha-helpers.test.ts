import { describe, it, expect } from "vitest";
import {
  getEntity,
  getEntityState,
  getEntityAttribute,
  getEntityName,
  getEntityIcon,
  isEntityAvailable,
  isEntityOn,
  formatEntityState,
  stateToNumber,
  calculatePrecisionFromStep,
  formatNumber,
  formatEntityValue,
  getDomain,
  getObjectId,
  clamp,
  formatDuration,
} from "./ha-helpers";
import type { HomeAssistant, HassEntity } from "../types";

// Helper to create mock Home Assistant instance
function createMockHass(entities: Record<string, HassEntity>): HomeAssistant {
  return {
    states: entities,
  } as HomeAssistant;
}

// Helper to create mock entity
function createMockEntity(
  state: string,
  attributes: Record<string, any> = {},
): HassEntity {
  return {
    entity_id: "test.entity",
    state,
    attributes: {
      friendly_name: "Test Entity",
      ...attributes,
    },
    last_changed: "",
    last_updated: "",
    context: { id: "", parent_id: null, user_id: null },
  };
}

describe("ha-helpers", () => {
  describe("getEntity", () => {
    it("should return entity when it exists", () => {
      const entity = createMockEntity("on");
      const hass = createMockHass({ "light.living_room": entity });

      const result = getEntity(hass, "light.living_room");
      expect(result).toEqual(entity);
    });

    it("should return undefined when entity does not exist", () => {
      const hass = createMockHass({});
      const result = getEntity(hass, "light.nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getEntityState", () => {
    it("should return entity state", () => {
      const entity = createMockEntity("on");
      const hass = createMockHass({ "light.living_room": entity });

      const result = getEntityState(hass, "light.living_room");
      expect(result).toBe("on");
    });

    it("should return unavailable for missing entity", () => {
      const hass = createMockHass({});
      const result = getEntityState(hass, "light.nonexistent");
      expect(result).toBe("unavailable");
    });
  });

  describe("getEntityAttribute", () => {
    it("should return attribute value", () => {
      const entity = createMockEntity("on", { brightness: 255 });
      const hass = createMockHass({ "light.living_room": entity });

      const result = getEntityAttribute(
        hass,
        "light.living_room",
        "brightness",
      );
      expect(result).toBe(255);
    });

    it("should return undefined for missing attribute", () => {
      const entity = createMockEntity("on");
      const hass = createMockHass({ "light.living_room": entity });

      const result = getEntityAttribute(
        hass,
        "light.living_room",
        "nonexistent",
      );
      expect(result).toBeUndefined();
    });
  });

  describe("getEntityName", () => {
    it("should return friendly name", () => {
      const entity = createMockEntity("on", {
        friendly_name: "Living Room Light",
      });
      const hass = createMockHass({ "light.living_room": entity });

      const result = getEntityName(hass, "light.living_room");
      expect(result).toBe("Living Room Light");
    });

    it("should return entity ID when no friendly name", () => {
      const entity = createMockEntity("on", {});
      delete entity.attributes.friendly_name;
      const hass = createMockHass({ "light.living_room": entity });

      const result = getEntityName(hass, "light.living_room");
      expect(result).toBe("light.living_room");
    });
  });

  describe("getEntityIcon", () => {
    it("should return icon when present", () => {
      const entity = createMockEntity("on", { icon: "mdi:lightbulb" });
      const hass = createMockHass({ "light.living_room": entity });

      const result = getEntityIcon(hass, "light.living_room");
      expect(result).toBe("mdi:lightbulb");
    });

    it("should return undefined when no icon", () => {
      const entity = createMockEntity("on");
      const hass = createMockHass({ "light.living_room": entity });

      const result = getEntityIcon(hass, "light.living_room");
      expect(result).toBeUndefined();
    });
  });

  describe("isEntityAvailable", () => {
    it("should return true for available entity", () => {
      const entity = createMockEntity("on");
      const hass = createMockHass({ "light.living_room": entity });

      const result = isEntityAvailable(hass, "light.living_room");
      expect(result).toBe(true);
    });

    it("should return false for unavailable entity", () => {
      const entity = createMockEntity("unavailable");
      const hass = createMockHass({ "light.living_room": entity });

      const result = isEntityAvailable(hass, "light.living_room");
      expect(result).toBe(false);
    });

    it("should return false for unknown entity", () => {
      const entity = createMockEntity("unknown");
      const hass = createMockHass({ "light.living_room": entity });

      const result = isEntityAvailable(hass, "light.living_room");
      expect(result).toBe(false);
    });
  });

  describe("isEntityOn", () => {
    it("should return true when state is on", () => {
      const entity = createMockEntity("on");
      const hass = createMockHass({ "light.living_room": entity });

      const result = isEntityOn(hass, "light.living_room");
      expect(result).toBe(true);
    });

    it("should return false when state is off", () => {
      const entity = createMockEntity("off");
      const hass = createMockHass({ "light.living_room": entity });

      const result = isEntityOn(hass, "light.living_room");
      expect(result).toBe(false);
    });
  });

  describe("formatEntityState", () => {
    it("should format on state", () => {
      const entity = createMockEntity("on");
      const hass = createMockHass({ "light.living_room": entity });

      const result = formatEntityState(hass, "light.living_room");
      expect(result).toBe("On");
    });

    it("should format off state", () => {
      const entity = createMockEntity("off");
      const hass = createMockHass({ "light.living_room": entity });

      const result = formatEntityState(hass, "light.living_room");
      expect(result).toBe("Off");
    });

    it("should append unit of measurement", () => {
      const entity = createMockEntity("23.5", { unit_of_measurement: "°C" });
      const hass = createMockHass({ "sensor.temperature": entity });

      const result = formatEntityState(hass, "sensor.temperature");
      expect(result).toBe("23.5 °C");
    });

    it("should capitalize first letter for other states", () => {
      const entity = createMockEntity("docked");
      const hass = createMockHass({ "vacuum.robot": entity });

      const result = formatEntityState(hass, "vacuum.robot");
      expect(result).toBe("Docked");
    });
  });

  describe("stateToNumber", () => {
    it("should convert state to number", () => {
      const entity = createMockEntity("42.5");
      const hass = createMockHass({ "sensor.temperature": entity });

      const result = stateToNumber(hass, "sensor.temperature");
      expect(result).toBe(42.5);
    });

    it("should return 0 for non-numeric state", () => {
      const entity = createMockEntity("unavailable");
      const hass = createMockHass({ "sensor.temperature": entity });

      const result = stateToNumber(hass, "sensor.temperature");
      expect(result).toBe(0);
    });

    it("should get number from attribute", () => {
      const entity = createMockEntity("on", { brightness: 128 });
      const hass = createMockHass({ "light.living_room": entity });

      const result = stateToNumber(hass, "light.living_room", "brightness");
      expect(result).toBe(128);
    });
  });

  describe("calculatePrecisionFromStep", () => {
    it("should return 0 for step >= 1", () => {
      expect(calculatePrecisionFromStep(1)).toBe(0);
      expect(calculatePrecisionFromStep(5)).toBe(0);
    });

    it("should return 1 for step 0.1", () => {
      expect(calculatePrecisionFromStep(0.1)).toBe(1);
    });

    it("should return 2 for step 0.01", () => {
      expect(calculatePrecisionFromStep(0.01)).toBe(2);
    });

    it("should return 3 for step 0.001", () => {
      expect(calculatePrecisionFromStep(0.001)).toBe(3);
    });

    it("should cap precision at 10", () => {
      expect(calculatePrecisionFromStep(0.00000000001)).toBe(10);
    });

    it("should return 0 for invalid input", () => {
      expect(calculatePrecisionFromStep(0)).toBe(0);
      expect(calculatePrecisionFromStep(-1)).toBe(0);
    });
  });

  describe("formatNumber", () => {
    it("should format number with default options", () => {
      const result = formatNumber(1234.56);
      // Result depends on locale, but should be a string representation
      expect(typeof result).toBe("string");
      expect(result).toContain("1");
    });

    it("should respect maximum fraction digits", () => {
      const result = formatNumber(1.23456, { maximumFractionDigits: 2 });
      expect(result).toMatch(/1\.23/);
    });
  });

  describe("getDomain", () => {
    it("should extract domain from entity ID", () => {
      expect(getDomain("light.living_room")).toBe("light");
      expect(getDomain("sensor.temperature")).toBe("sensor");
      expect(getDomain("switch.outlet")).toBe("switch");
    });
  });

  describe("getObjectId", () => {
    it("should extract object ID from entity ID", () => {
      expect(getObjectId("light.living_room")).toBe("living_room");
      expect(getObjectId("sensor.temperature")).toBe("temperature");
      expect(getObjectId("switch.outlet")).toBe("outlet");
    });
  });

  describe("clamp", () => {
    it("should clamp value between min and max", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe("formatDuration", () => {
    it("should format seconds only", () => {
      expect(formatDuration(45)).toBe("45s");
    });

    it("should format minutes and seconds", () => {
      expect(formatDuration(125)).toBe("2m 5s");
    });

    it("should format hours, minutes, and seconds", () => {
      expect(formatDuration(3665)).toBe("1h 1m 5s");
    });

    it("should handle zero seconds", () => {
      expect(formatDuration(0)).toBe("0s");
    });
  });
});
