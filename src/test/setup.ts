/**
 * Vitest setup file
 * Runs before all test files
 */

// Mock Home Assistant global objects if needed
globalThis.customElements = globalThis.customElements || {
  define: () => {},
  get: () => undefined,
  whenDefined: () => Promise.resolve(),
};

// You can add more global setup here
