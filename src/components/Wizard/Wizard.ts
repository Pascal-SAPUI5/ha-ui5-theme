/**
 * UI5 Wizard Card
 * A Lovelace card that displays a UI5 Wizard component
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5WizardCardConfig } from "../../types";
import { ensureFiori } from "../../ui5-loader";

export class UI5WizardCard extends BaseUI5Card {
  async connectedCallback(): Promise<void> {
    try {
      await ensureFiori();
    } catch (error) {
      console.error(
        "[ui5-wizard-card] Failed to load Fiori components:",
        error,
      );
      this.renderError("Failed to load UI5 Fiori components");
      return;
    }
    super.connectedCallback();
  }

  setConfig(config: UI5WizardCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5WizardCardConfig | undefined {
    return this._config as UI5WizardCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    // Build wizard steps
    const steps = (this.config.steps || [])
      .map((step) => {
        const titleText = this.processTemplateEscaped(step.title_text);
        const icon = step.icon || "";
        const disabled = step.disabled ? "disabled" : "";
        return `<ui5-wizard-step
          title-text="${titleText}"
          ${icon ? `icon="${icon}"` : ""}
          ${disabled}
        ></ui5-wizard-step>`;
      })
      .join("");

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .wizard-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        ui5-wizard {
          width: 100%;
          min-height: 200px;
        }

        .entity-info {
          font-size: 12px;
          color: var(--secondary-text-color);
          text-align: center;
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="wizard-container">
          <ui5-wizard id="wizard">
            ${steps}
          </ui5-wizard>
          ${
            this.config.entity
              ? `<div class="entity-info">${entityState}</div>`
              : ""
          }
        </div>
      </div>
    `;

    // Set up action handlers
    const wizard = this.shadow.getElementById("wizard");
    if (wizard) {
      this.setupActionHandlers(wizard);
    }
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-wizard-card",
      steps: [
        { title_text: "Step 1", icon: "hint" },
        { title_text: "Step 2", icon: "hint" },
        { title_text: "Step 3", icon: "hint" },
      ],
    };
  }
}

// Register custom element
customElements.define("ui5-wizard-card", UI5WizardCard);
