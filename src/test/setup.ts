/**
 * Vitest setup file for HACS/Home Assistant Frontend testing
 * Runs before all test files
 */

import { vi, beforeEach, afterEach } from "vitest";
import type { HomeAssistant, HassEntity } from "../types";

// ==================== Custom Elements Registry ====================

// Store registered custom elements for cleanup
const registeredElements = new Set<string>();
const originalDefine = customElements.define.bind(customElements);

// Override customElements.define to track registrations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(customElements as any).define = function (
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
) {
  if (!customElements.get(name)) {
    registeredElements.add(name);
    return originalDefine(name, constructor, options);
  }
  // Skip if already defined (prevents errors in tests)
  return undefined;
};

// ==================== Home Assistant Globals ====================

// Mock window.customCards (HA card picker)
Object.defineProperty(window, "customCards", {
  value: [],
  writable: true,
  configurable: true,
});

// Mock matchMedia for theme detection
Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("dark") ? false : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  root = null;
  rootMargin = "";
  thresholds = [];
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// ==================== Test Lifecycle ====================

beforeEach(() => {
  // Reset customCards
  window.customCards = [];
});

afterEach(() => {
  // Clean up DOM
  document.body.innerHTML = "";

  // Clear all mocks
  vi.clearAllMocks();
});

// ==================== Helper Exports ====================

/**
 * Create a mock Home Assistant instance
 */
export function createMockHass(
  entities: Record<string, HassEntity> = {},
): HomeAssistant {
  return {
    states: entities,
    config: {
      latitude: 52.52,
      longitude: 13.405,
      elevation: 34,
      unit_system: {
        length: "km",
        mass: "kg",
        temperature: "°C",
        volume: "L",
      },
      location_name: "Test Home",
      time_zone: "Europe/Berlin",
      components: [],
      config_dir: "/config",
      whitelist_external_dirs: [],
      allowlist_external_dirs: [],
      version: "2024.1.0",
      config_source: "storage",
      safe_mode: false,
      state: "RUNNING",
      external_url: null,
      internal_url: null,
    },
    themes: {},
    selectedTheme: null,
    panels: {},
    panelUrl: "lovelace",
    language: "en",
    selectedLanguage: "en",
    resources: {},
    localize: vi.fn((key: string) => key),
    translationMetadata: {},
    suspendWhenHidden: true,
    enableShortcuts: true,
    vibrate: true,
    debugConnection: false,
    dockedSidebar: "auto",
    defaultPanel: "lovelace",
    moreInfoEntityId: null,
    user: {
      id: "test-user",
      name: "Test User",
      is_owner: true,
      is_admin: true,
      credentials: [],
      mfa_modules: [],
    },
    hassUrl: vi.fn((path?: string) => `http://localhost:8123${path || ""}`),
    callService: vi.fn().mockResolvedValue(undefined),
    callWS: vi.fn().mockResolvedValue({}),
    connection: {
      subscribeEvents: vi.fn(),
      subscribeMessage: vi.fn(),
    },
  } as HomeAssistant;
}

/**
 * Create a mock entity
 */
export function createMockEntity(
  entityId: string,
  state: string,
  attributes: Record<string, unknown> = {},
): HassEntity {
  const defaultName =
    entityId.split(".")[1]?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
    entityId;

  return {
    entity_id: entityId,
    state,
    attributes: {
      friendly_name: defaultName,
      ...attributes,
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    context: {
      id: `ctx-${Date.now()}`,
      parent_id: null,
      user_id: null,
    },
  };
}

/**
 * Wait for custom element to be defined
 */
export async function waitForElement(tagName: string): Promise<void> {
  await customElements.whenDefined(tagName);
}

/**
 * Wait for next animation frame
 */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * Wait for a specific amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create and mount a card element for testing
 */
export async function mountCard<T extends HTMLElement>(
  tagName: string,
  config: Record<string, unknown>,
  hass?: HomeAssistant,
): Promise<T> {
  const element = document.createElement(tagName) as T & {
    setConfig: (c: Record<string, unknown>) => void;
    hass: HomeAssistant;
  };

  element.setConfig(config);

  if (hass) {
    element.hass = hass;
  }

  document.body.appendChild(element);

  // Wait for element to render
  await nextFrame();
  await wait(0);

  return element;
}

/**
 * Fire a Home Assistant event on an element
 */
export function fireEvent(
  element: HTMLElement,
  type: string,
  detail?: Record<string, unknown>,
): void {
  const event = new CustomEvent(type, {
    bubbles: true,
    composed: true,
    detail,
  });
  element.dispatchEvent(event);
}
