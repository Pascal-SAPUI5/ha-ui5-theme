/**
 * UI5 Dialog Card
 * A Lovelace card that displays a UI5 Dialog component
 * Useful for showing modal content and confirmations
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5DialogCardConfig } from "../../types";

export class UI5DialogCard extends BaseUI5Card {
  setConfig(config: UI5DialogCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5DialogCardConfig | undefined {
    return this._config as UI5DialogCardConfig;
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

    const headerText = this.processTemplateEscaped(this.config.header_text || "Dialog");
    const state = this.config.state || "None";
    const draggable = this.config.draggable !== false;
    const resizable = this.config.resizable === true;
    const stretch = this.config.stretch === true;
    const buttonText = this.config.button_text || "Open Dialog";
    const showCloseButton = this.config.show_close_button !== false;

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .dialog-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }
        .unavailable {
          opacity: 0.5;
        }
      </style>
      <div class="dialog-container ${isUnavailable ? "unavailable" : ""}">
        <ui5-button id="open-dialog" design="Emphasized">${buttonText}</ui5-button>
        <ui5-dialog
          id="dialog"
          header-text="${headerText}"
          state="${state}"
          ${draggable ? "draggable" : ""}
          ${resizable ? "resizable" : ""}
          ${stretch ? "stretch" : ""}
        >
          <div slot="content" style="padding: 1rem;">
            ${displayContent || "Dialog content goes here."}
          </div>
          ${
            showCloseButton
              ? `<ui5-button id="close-dialog" slot="footer" design="Emphasized">Close</ui5-button>`
              : ""
          }
        </ui5-dialog>
      </div>
    `;

    // Handle button click to open dialog
    const openButton = this.shadowRoot!.querySelector("#open-dialog");
    if (openButton) {
      openButton.addEventListener("click", () => this.openDialog());
    }

    // Handle close button
    const closeButton = this.shadowRoot!.querySelector("#close-dialog");
    if (closeButton) {
      closeButton.addEventListener("click", () => this.closeDialog());
    }
  }

  private openDialog(): void {
    const dialog = this.shadowRoot!.querySelector("ui5-dialog") as HTMLElement & { show: () => void };
    if (dialog?.show) {
      dialog.show();
    }
  }

  private closeDialog(): void {
    const dialog = this.shadowRoot!.querySelector("ui5-dialog") as HTMLElement & { close: () => void };
    if (dialog?.close) {
      dialog.close();
    }
  }

  static getStubConfig(): UI5DialogCardConfig {
    return {
      type: "custom:ui5-dialog-card",
      header_text: "Dialog Title",
      content: "This is the dialog content.",
      button_text: "Open Dialog",
    };
  }
}

// Register the custom element
if (!customElements.get("ui5-dialog-card")) {
  customElements.define("ui5-dialog-card", UI5DialogCard);
}
