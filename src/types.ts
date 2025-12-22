/**
 * Type definitions for Home Assistant Lovelace custom cards
 */

// ==================== Home Assistant Core Types ====================

export interface HomeAssistant {
  states: { [entity_id: string]: HassEntity };
  config: HassConfig;
  themes: any;
  selectedTheme: any;
  panels: any;
  panelUrl: string;
  language: string;
  selectedLanguage: string | null;
  resources: any;
  localize: (key: string, ...args: any[]) => string;
  translationMetadata: any;
  suspendWhenHidden: boolean;
  enableShortcuts: boolean;
  vibrate: boolean;
  debugConnection: boolean;
  dockedSidebar: "docked" | "always_hidden" | "auto";
  defaultPanel: string;
  moreInfoEntityId: string | null;
  user?: HassUser;
  userData?: any;
  hassUrl: (path?: string) => string;
  callService: (
    domain: string,
    service: string,
    serviceData?: Record<string, any>,
    target?: HassServiceTarget,
  ) => Promise<void>;
  callWS: <T>(msg: any) => Promise<T>;
  connection: any;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  last_changed: string;
  last_updated: string;
  attributes: { [key: string]: any };
  context: { id: string; parent_id: string | null; user_id: string | null };
}

export interface HassConfig {
  latitude: number;
  longitude: number;
  elevation: number;
  unit_system: {
    length: string;
    mass: string;
    temperature: string;
    volume: string;
  };
  location_name: string;
  time_zone: string;
  components: string[];
  config_dir: string;
  whitelist_external_dirs: string[];
  allowlist_external_dirs: string[];
  version: string;
  config_source: string;
  safe_mode: boolean;
  state: "NOT_RUNNING" | "STARTING" | "RUNNING" | "STOPPING" | "FINAL_WRITE";
  external_url: string | null;
  internal_url: string | null;
}

export interface HassUser {
  id: string;
  name: string;
  is_owner: boolean;
  is_admin: boolean;
  credentials: Array<{ type: string }>;
  mfa_modules: Array<{ id: string; name: string; enabled: boolean }>;
}

export interface HassServiceTarget {
  entity_id?: string | string[];
  device_id?: string | string[];
  area_id?: string | string[];
}

// ==================== Action Types ====================

export type ActionType =
  | "none"
  | "toggle"
  | "more-info"
  | "call-service"
  | "navigate"
  | "url"
  | "fire-dom-event";

export interface BaseActionConfig {
  action: ActionType;
  confirmation?: {
    text?: string;
    exemptions?: Array<{ user: string }>;
  };
}

export interface ToggleActionConfig extends BaseActionConfig {
  action: "toggle";
}

export interface MoreInfoActionConfig extends BaseActionConfig {
  action: "more-info";
}

export interface CallServiceActionConfig extends BaseActionConfig {
  action: "call-service";
  service: string;
  service_data?: Record<string, any>;
  target?: HassServiceTarget;
}

export interface NavigateActionConfig extends BaseActionConfig {
  action: "navigate";
  navigation_path: string;
}

export interface UrlActionConfig extends BaseActionConfig {
  action: "url";
  url_path: string;
}

export interface FireDomEventActionConfig extends BaseActionConfig {
  action: "fire-dom-event";
}

export interface NoneActionConfig extends BaseActionConfig {
  action: "none";
}

export type ActionConfig =
  | NoneActionConfig
  | ToggleActionConfig
  | MoreInfoActionConfig
  | CallServiceActionConfig
  | NavigateActionConfig
  | UrlActionConfig
  | FireDomEventActionConfig;

// ==================== Card Configuration Types ====================

export interface BaseCardConfig {
  type: string;
  entity?: string;
  name?: string;
  icon?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface UI5ButtonCardConfig extends BaseCardConfig {
  type: "custom:ui5-button-card";
  text?: string;
  design?: "Default" | "Emphasized" | "Positive" | "Negative" | "Transparent";
  icon_only?: boolean;
}

export interface UI5SwitchCardConfig extends BaseCardConfig {
  type: "custom:ui5-switch-card";
  text?: string;
  checked?: boolean;
}

export interface UI5SliderCardConfig extends BaseCardConfig {
  type: "custom:ui5-slider-card";
  min?: number;
  max?: number;
  step?: number;
  show_value?: boolean;
  attribute?: string;
}

export interface UI5ProgressCardConfig extends BaseCardConfig {
  type: "custom:ui5-progress-card";
  value?: number;
  max?: number;
  display_value?: boolean;
  state?: "None" | "Error" | "Warning" | "Success" | "Information";
}

export type UI5CardConfig =
  | UI5ButtonCardConfig
  | UI5SwitchCardConfig
  | UI5SliderCardConfig
  | UI5ProgressCardConfig;

// ==================== Card Registration ====================

export interface LovelaceCardConfig {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
}

export interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant;
  config?: BaseCardConfig;
  setConfig(config: BaseCardConfig): void;
  getCardSize?(): number;
  getConfigElement?(): HTMLElement;
  getStubConfig?(): BaseCardConfig;
}

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  config?: BaseCardConfig;
  setConfig(config: BaseCardConfig): void;
}

declare global {
  interface Window {
    customCards?: Array<LovelaceCardConfig>;
  }

  interface HTMLElementTagNameMap {
    "ui5-button-card": LovelaceCard;
    "ui5-switch-card": LovelaceCard;
    "ui5-slider-card": LovelaceCard;
    "ui5-progress-card": LovelaceCard;
  }
}
