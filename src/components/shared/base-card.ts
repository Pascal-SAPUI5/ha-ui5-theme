/**
 * Base Card Class
 * Shared functionality for all UI5 Lovelace cards
 */

import type {
  HomeAssistant,
  BaseCardConfig,
  ActionConfig,
  LovelaceCard,
} from "../../types";
import { handleAction } from "../../utils/action-handler";
import { processTemplate, escapeHtml } from "../../utils/template-processor";

export abstract class BaseUI5Card extends HTMLElement implements LovelaceCard {
  protected _hass?: HomeAssistant;
  protected _config?: BaseCardConfig;
  protected shadow: ShadowRoot;
  protected content?: HTMLElement;

  // Action handling
  private holdTimer?: ReturnType<typeof setTimeout>;
  private holdDelay = 500; // ms
  private clickCount = 0;
  private clickTimer?: ReturnType<typeof setTimeout>;
  private clickDelay = 250; // ms
  private abortController?: AbortController;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  /**
   * Set Home Assistant object
   */
  set hass(hass: HomeAssistant) {
    const oldHass = this._hass;
    this._hass = hass;

    // Only update if hass changed or entity state changed
    if (
      !oldHass ||
      this.hasEntityStateChanged(oldHass, hass) ||
      this.hasThemeChanged(oldHass, hass)
    ) {
      this.requestUpdate();
    }
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  /**
   * Set card configuration
   */
  setConfig(config: BaseCardConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }

    this._config = config;
    this.requestUpdate();
  }

  get config(): BaseCardConfig | undefined {
    return this._config;
  }

  /**
   * Check if entity state has changed
   */
  protected hasEntityStateChanged(
    oldHass: HomeAssistant,
    newHass: HomeAssistant,
  ): boolean {
    if (!this._config?.entity) {
      return false;
    }

    const oldState = oldHass.states[this._config.entity];
    const newState = newHass.states[this._config.entity];

    return oldState !== newState;
  }

  /**
   * Check if theme has changed
   */
  protected hasThemeChanged(
    oldHass: HomeAssistant,
    newHass: HomeAssistant,
  ): boolean {
    return oldHass.selectedTheme !== newHass.selectedTheme;
  }

  /**
   * Request update (will call render)
   */
  protected requestUpdate(): void {
    if (!this._hass || !this._config) {
      return;
    }

    this.render();
  }

  /**
   * Render the card (to be implemented by subclasses)
   */
  protected abstract render(): void;

  /**
   * Render error state
   */
  protected renderError(message: string): void {
    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 24px;
          text-align: center;
        }

        .error-icon {
          font-size: 48px;
          color: var(--error-color, #f44336);
        }

        .error-message {
          font-size: 14px;
          color: var(--primary-text-color);
          font-weight: 500;
        }

        .error-details {
          font-size: 12px;
          color: var(--secondary-text-color);
        }
      </style>

      <div class="card-container">
        <div class="error-container">
          <div class="error-icon">⚠️</div>
          <div class="error-message">Error Loading Card</div>
          <div class="error-details">${this.escapeHtml(message)}</div>
        </div>
      </div>
    `;
  }

  /**
   * Escape HTML for safe insertion
   */
  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get card size for layout purposes
   */
  getCardSize(): number {
    return 1;
  }

  /**
   * Process template string
   */
  protected processTemplate(template: string | undefined): string {
    if (!template || !this._hass) {
      return template || "";
    }

    return processTemplate(template, this._hass, this._config?.entity);
  }

  /**
   * Process template string and escape HTML for safe insertion
   */
  protected processTemplateEscaped(template: string | undefined): string {
    const processed = this.processTemplate(template);
    return escapeHtml(processed);
  }

  /**
   * Get entity state
   */
  protected getEntityState(): string {
    if (!this._hass || !this._config?.entity) {
      return "unavailable";
    }

    const entity = this._hass.states[this._config.entity];
    return entity?.state || "unavailable";
  }

  /**
   * Get entity attribute
   */
  protected getEntityAttribute(attribute: string): any {
    if (!this._hass || !this._config?.entity) {
      return undefined;
    }

    const entity = this._hass.states[this._config.entity];
    return entity?.attributes[attribute];
  }

  /**
   * Set up action handlers for an element
   */
  protected setupActionHandlers(element: HTMLElement): void {
    // Create new AbortController for this render cycle
    // (Previous one will be aborted in disconnectedCallback or next render)
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    // Handle tap action
    element.addEventListener("click", (e) => this.handleClick(e), { signal });

    // Handle hold action
    element.addEventListener("pointerdown", (e) => this.handlePointerDown(e), {
      signal,
    });
    element.addEventListener("pointerup", () => this.handlePointerUp(), {
      signal,
    });
    element.addEventListener("pointercancel", () => this.handlePointerUp(), {
      signal,
    });

    // Prevent context menu on hold
    element.addEventListener(
      "contextmenu",
      (e) => {
        if (this._config?.hold_action) {
          e.preventDefault();
        }
      },
      { signal },
    );
  }

  /**
   * Handle click event (for tap and double_tap actions)
   */
  private handleClick(e: Event): void {
    e.stopPropagation();

    this.clickCount++;

    if (this.clickCount === 1) {
      // Wait to see if it's a double click
      this.clickTimer = setTimeout(() => {
        this.executeTapAction();
        this.clickCount = 0;
      }, this.clickDelay);
    } else if (this.clickCount === 2) {
      // Double click detected
      if (this.clickTimer) {
        clearTimeout(this.clickTimer);
      }
      this.executeDoubleTapAction();
      this.clickCount = 0;
    }
  }

  /**
   * Handle pointer down (for hold action)
   */
  private handlePointerDown(e: PointerEvent): void {
    if (e.button !== 0) {
      return; // Only handle left click
    }

    this.holdTimer = setTimeout(() => {
      this.executeHoldAction();
    }, this.holdDelay);
  }

  /**
   * Handle pointer up (cancel hold action)
   */
  private handlePointerUp(): void {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = undefined;
    }
  }

  /**
   * Execute tap action
   */
  protected executeTapAction(): void {
    const action = this._config?.tap_action || this.getDefaultTapAction();
    this.executeAction(action);
  }

  /**
   * Execute hold action
   */
  protected executeHoldAction(): void {
    const action = this._config?.hold_action || this.getDefaultHoldAction();
    this.executeAction(action);
  }

  /**
   * Execute double tap action
   */
  protected executeDoubleTapAction(): void {
    const action =
      this._config?.double_tap_action || this.getDefaultDoubleTapAction();
    this.executeAction(action);
  }

  /**
   * Execute an action
   */
  protected executeAction(action: ActionConfig): void {
    if (!this._hass) {
      return;
    }

    handleAction(this, this._hass, action, this._config?.entity);
  }

  /**
   * Get default tap action
   */
  protected getDefaultTapAction(): ActionConfig {
    return { action: "more-info" };
  }

  /**
   * Get default hold action
   */
  protected getDefaultHoldAction(): ActionConfig {
    return { action: "more-info" };
  }

  /**
   * Get default double tap action
   */
  protected getDefaultDoubleTapAction(): ActionConfig {
    return { action: "none" };
  }

  /**
   * Create base styles for cards
   */
  protected getBaseStyles(): string {
    return `
      :host {
        display: block;
        box-sizing: border-box;
      }

      .card-container {
        padding: 16px;
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
        overflow: hidden;
        min-width: 0;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .card-icon {
        width: 24px;
        height: 24px;
      }

      .unavailable {
        opacity: 0.5;
        pointer-events: none;
      }
    `;
  }

  /**
   * Lifecycle: connected to DOM
   */
  connectedCallback(): void {
    this.requestUpdate();
  }

  /**
   * Lifecycle: disconnected from DOM
   */
  disconnectedCallback(): void {
    // Clear timers
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
    }
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
    }

    // Abort all event listeners
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = undefined;
    }
  }
}
