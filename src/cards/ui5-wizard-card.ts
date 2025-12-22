/**
 * UI5 Wizard Card
 * A Lovelace card that displays a UI5 Wizard component
 */

import { BaseUI5Card } from "./base-card";
import type { UI5WizardCardConfig } from "../types";
import "../ui5-loader";

export class UI5WizardCard extends BaseUI5Card {
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
    const stepsHtml =
      this.config.steps
        ?.map((step, index) => {
          const title = this.processTemplateEscaped(step.title);
          const icon = step.icon || "";
          const content = step.content
            ? this.processTemplateEscaped(step.content)
            : "";

          return `
        <ui5-wizard-step
          id="step-${index}"
          title-text="${title}"
          ${icon ? `icon="${icon}"` : ""}
        >
          <div class="step-content">${content}</div>
        </ui5-wizard-step>
      `;
        })
        .join("") || "";

    this.shadow.innerHTML = `
      <style>
        ${this.getBaseStyles()}

        .wizard-container {
          width: 100%;
          min-height: 400px;
        }

        ui5-wizard {
          width: 100%;
          height: 100%;
        }

        .step-content {
          padding: 16px;
          color: var(--primary-text-color);
        }
      </style>

      <div class="card-container ${isUnavailable ? "unavailable" : ""}">
        <div class="wizard-container">
          <ui5-wizard id="main-wizard">
            ${stepsHtml}
          </ui5-wizard>
        </div>
      </div>
    `;

    // Set up action handler for main wizard
    const wizard = this.shadow.getElementById("main-wizard");
    if (wizard) {
      this.setupActionHandlers(wizard);
    }
  }

  static getStubConfig() {
    return {
      type: "custom:ui5-wizard-card",
      steps: [
        {
          title: "Step 1",
          icon: "hint",
          content: "Welcome to the wizard",
        },
        {
          title: "Step 2",
          icon: "activities",
          content: "Configure your settings",
        },
        {
          title: "Step 3",
          icon: "accept",
          content: "Review and confirm",
        },
      ],
    };
  }
}

// Register custom element
customElements.define("ui5-wizard-card", UI5WizardCard);
