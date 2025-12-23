/**
 * UI5 Menu Card
 * A Lovelace card that displays a UI5 Menu component
 * Useful for showing actions or options in a dropdown menu
 */

import { BaseUI5Card } from "../shared/base-card";
import type { UI5MenuCardConfig } from "../../types";

export class UI5MenuCard extends BaseUI5Card {
  setConfig(config: UI5MenuCardConfig): void {
    if (!config.type) {
      throw new Error("Card type is required");
    }

    super.setConfig(config);
  }

  get config(): UI5MenuCardConfig | undefined {
    return this._config as UI5MenuCardConfig;
  }

  protected render(): void {
    if (!this._hass || !this.config) {
      return;
    }

    const entityState = this.config.entity ? this.getEntityState() : undefined;
    const isUnavailable = entityState === "unavailable";

    const buttonText = this.config.button_text || "Menu";
    const items = this.config.items || [];

    // Build menu items HTML
    const itemsHtml = items
      .map((item, index) => {
        const text = this.processTemplateEscaped(item.text);
        const icon = item.icon || "";
        const disabled = item.disabled === true;
        const startsSection = item.starts_section === true;

        return `
          <ui5-menu-item
            id="menu-item-${index}"
            text="${text}"
            ${icon ? `icon="${icon}"` : ""}
            ${disabled ? "disabled" : ""}
            ${startsSection ? "starts-section" : ""}
            data-index="${index}"
          ></ui5-menu-item>
        `;
      })
      .join("");

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .menu-container {
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
      <div class="menu-container ${isUnavailable ? "unavailable" : ""}">
        <ui5-button id="menu-opener" icon="overflow" design="Default">${buttonText}</ui5-button>
        <ui5-menu id="menu">
          ${itemsHtml || '<ui5-menu-item text="No items"></ui5-menu-item>'}
        </ui5-menu>
      </div>
    `;

    // Handle button click to open menu
    const opener = this.shadowRoot!.querySelector("#menu-opener");
    if (opener) {
      opener.addEventListener("click", () => this.openMenu());
    }

    // Handle menu item selection
    const menu = this.shadowRoot!.querySelector("#menu");
    if (menu) {
      menu.addEventListener("item-click", (e: Event) => this.handleItemClick(e));
    }
  }

  private openMenu(): void {
    const menu = this.shadowRoot!.querySelector("#menu") as HTMLElement & {
      open: (opener: HTMLElement) => void;
    };
    const opener = this.shadowRoot!.querySelector("#menu-opener") as HTMLElement;

    if (menu?.open && opener) {
      menu.open(opener);
    }
  }

  private handleItemClick(event: Event): void {
    const detail = (event as CustomEvent).detail;
    const item = detail?.item as HTMLElement | undefined;
    if (!item) return;

    const index = parseInt(item.getAttribute("data-index") || "0", 10);
    const itemConfig = this.config?.items?.[index];

    if (itemConfig?.service && this._hass) {
      const [domain, service] = itemConfig.service.split(".");
      if (domain && service) {
        const serviceData = {
          ...itemConfig.service_data,
        };

        // Add entity_id if configured
        if (this.config?.entity) {
          serviceData.entity_id = this.config.entity;
        }

        this._hass.callService(domain, service, serviceData);
      }
    }
  }

  static getStubConfig(): UI5MenuCardConfig {
    return {
      type: "custom:ui5-menu-card",
      button_text: "Actions",
      items: [
        { text: "Option 1", icon: "action" },
        { text: "Option 2", icon: "settings" },
        { text: "Option 3", starts_section: true },
      ],
    };
  }
}

// Register the custom element
if (!customElements.get("ui5-menu-card")) {
  customElements.define("ui5-menu-card", UI5MenuCard);
}
