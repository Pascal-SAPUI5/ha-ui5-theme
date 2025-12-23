/**
 * UI5 Popover Card
 * A Lovelace card that displays a UI5 Popover component
 * Useful for showing additional information on demand
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5PopoverCardConfig } from "../../types";

export class UI5PopoverCard extends BaseUI5Card {
  setConfig(config: UI5PopoverCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5PopoverCardConfig | undefined {
    return this._config as UI5PopoverCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    // Determine content to display
    let displayContent = this.config.content || "";
    if (!displayContent && this.config.entity) {
      const entity = this._hass.states[this.config.entity];
      if (entity) {
        const name = entity.attributes.friendly_name || this.config.entity;
        const state = entity.state;
        const unit = entity.attributes.unit_of_measurement || "";
        displayContent = `${name}: ${state}${unit ? " " + unit : ""}`;
      }
    }
    displayContent = this.processTemplateEscaped(displayContent);

    const headerText = this.processTemplateEscaped(this.config.header_text || "");
    const placement = this.config.placement || "Bottom";
    const horizontalAlign = this.config.horizontal_align || "Center";
    const verticalAlign = this.config.vertical_align || "Center";
    const buttonText = this.config.button_text || "Show Popover";
    const showArrow = this.config.show_arrow !== false;

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .popover-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }
        .popover-content {
          padding: 1rem;
        }
        .unavailable {
          opacity: 0.5;
        }
      </style>
      <div class="popover-container ${isUnavailable ? "unavailable" : ""}">
        <ui5-button id="popover-opener" design="Default">${buttonText}</ui5-button>
        <ui5-popover
          id="popover"
          ${headerText ? `header-text="${headerText}"` : ""}
          placement="${placement}"
          horizontal-align="${horizontalAlign}"
          vertical-align="${verticalAlign}"
          ${showArrow ? "" : "hide-arrow"}
        >
          <div class="popover-content">
            ${displayContent || "Popover content"}
          </div>
        </ui5-popover>
      </div>
    `;

    // Handle button click to toggle popover
    const opener = this.shadowRoot!.querySelector("#popover-opener");
    if (opener) {
      opener.addEventListener("click", () => this.handleTogglePopover());
    }
  }

  private handleTogglePopover(): void {
    const popover = this.shadowRoot!.querySelector("ui5-popover") as HTMLElement & {
      isOpen: () => boolean;
      open: (opener: HTMLElement) => void;
      close: () => void;
    };
    const opener = this.shadowRoot!.querySelector("#popover-opener") as HTMLElement;

    if (popover && opener) {
      if (popover.isOpen && popover.isOpen()) {
        popover.close();
      } else if (popover.open) {
        popover.open(opener);
      }
    }
  }

  static getStubConfig(): UI5PopoverCardConfig {
    return {
      type: "custom:ui5-popover-card",
      header_text: "Information",
      content: "This is the popover content.",
      button_text: "Show Details",
      placement: "Bottom",
    };
  }
}

// Register the custom element
if (!customElements.get("ui5-popover-card")) {
  customElements.define("ui5-popover-card", UI5PopoverCard);
}
