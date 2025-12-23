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

export interface UI5ShellBarCardConfig extends BaseCardConfig {
  type: "custom:ui5-shellbar-card";
  primary_title?: string;
  secondary_title?: string;
  logo?: string;
}

export interface UI5SideNavCardConfig extends BaseCardConfig {
  type: "custom:ui5-sidenav-card";
  collapsed?: boolean;
  items?: Array<{
    text: string;
    icon?: string;
  }>;
}

export interface UI5TimelineCardConfig extends BaseCardConfig {
  type: "custom:ui5-timeline-card";
  layout?: "Vertical" | "Horizontal";
  entities?: string[];
  max_items?: number;
  items?: Array<{
    title_text: string;
    subtitle_text?: string;
    icon?: string;
    name?: string;
  }>;
}

export interface UI5WizardCardConfig extends BaseCardConfig {
  type: "custom:ui5-wizard-card";
  steps?: Array<{
    title_text: string;
    icon?: string;
    disabled?: boolean;
  }>;
}

export interface UI5NotificationListCardConfig extends BaseCardConfig {
  type: "custom:ui5-notification-list-card";
  items?: Array<{
    title_text: string;
    description?: string;
    priority?: "None" | "Low" | "Medium" | "High";
    read?: boolean;
  }>;
}

export interface UI5PageCardConfig extends BaseCardConfig {
  type: "custom:ui5-page-card";
  content?: string;
  background_design?: "Solid" | "Transparent" | "List";
  floating_footer?: boolean;
}

export interface UI5ElementCardConfig extends BaseCardConfig {
  type: "custom:ui5-element-card";
  element: string;
  props?: Record<string, any>;
  slot_content?: string;
}

export interface UI5ListCardConfig extends BaseCardConfig {
  type: "custom:ui5-list-card";
  title?: string;
  mode?: "None" | "SingleSelect" | "SingleSelectBegin" | "SingleSelectEnd" | "MultiSelect" | "Delete";
  header_text?: string;
  footer_text?: string;
  no_data_text?: string;
  growing?: "None" | "Scroll" | "Button";
  entities?: string[];
  items?: Array<{
    text: string;
    description?: string;
    icon?: string;
    icon_end?: string;
    additional_text?: string;
    additional_text_state?: "None" | "Success" | "Warning" | "Error" | "Information";
    type?: "Active" | "Inactive" | "Detail";
    entity?: string;
  }>;
  group_by?: "domain" | "area" | "none";
}

export interface UI5TableCardConfig extends BaseCardConfig {
  type: "custom:ui5-table-card";
  title?: string;
  columns?: Array<{
    header: string;
    field?: string;
    width?: string;
  }>;
  entities?: string[];
  rows?: Array<{
    cells: string[];
    entity?: string;
  }>;
  show_header?: boolean;
  sticky_column_header?: boolean;
  no_data_text?: string;
}

export interface UI5CardCardConfig extends BaseCardConfig {
  type: "custom:ui5-card-card";
  title?: string;
  subtitle?: string;
  status?: string;
  header_interactive?: boolean;
  content?: string;
  show_entity_state?: boolean;
}

export interface UI5PanelCardConfig extends BaseCardConfig {
  type: "custom:ui5-panel-card";
  header_text?: string;
  collapsed?: boolean;
  fixed?: boolean;
  accessible_role?: "Form" | "Region" | "Complementary";
  content?: string;
  entities?: string[];
}

export interface UI5TabsCardConfig extends BaseCardConfig {
  type: "custom:ui5-tabs-card";
  tabs?: Array<{
    text: string;
    icon?: string;
    disabled?: boolean;
    selected?: boolean;
    content?: string;
    entities?: string[];
  }>;
  tab_layout?: "Inline" | "Standard";
  tabs_overflow_mode?: "End" | "StartAndEnd";
  collapsed?: boolean;
}

export interface UI5BarCardConfig extends BaseCardConfig {
  type: "custom:ui5-bar-card";
  design?: "Header" | "Subheader" | "Footer" | "FloatingFooter";
  start_content?: string;
  middle_content?: string;
  end_content?: string;
  show_entity_state?: boolean;
}

export interface UI5InputCardConfig extends BaseCardConfig {
  type: "custom:ui5-input-card";
  placeholder?: string;
  value_attribute?: string;
  service?: string;
  service_data?: Record<string, unknown>;
  show_clear?: boolean;
  input_type?: "Text" | "Email" | "Number" | "Password" | "Tel" | "URL";
}

export interface UI5SelectCardConfig extends BaseCardConfig {
  type: "custom:ui5-select-card";
  options?: Array<{
    value: string;
    label?: string;
    icon?: string;
  }>;
  value_attribute?: string;
  service?: string;
  service_data?: Record<string, unknown>;
}

export interface UI5DatePickerCardConfig extends BaseCardConfig {
  type: "custom:ui5-datepicker-card";
  placeholder?: string;
  format_pattern?: string;
  min_date?: string;
  max_date?: string;
  value_attribute?: string;
  service?: string;
  service_data?: Record<string, unknown>;
}

export interface UI5TimePickerCardConfig extends BaseCardConfig {
  type: "custom:ui5-timepicker-card";
  placeholder?: string;
  format_pattern?: string;
  value_attribute?: string;
  service?: string;
  service_data?: Record<string, unknown>;
}

export interface UI5BadgeCardConfig extends BaseCardConfig {
  type: "custom:ui5-badge-card";
  text?: string;
  design?: "Set1" | "Set2" | "Neutral" | "Information" | "Positive" | "Negative" | "Critical";
  color_scheme?: string;
  interactive?: boolean;
}

export interface UI5MessageStripCardConfig extends BaseCardConfig {
  type: "custom:ui5-messagestrip-card";
  text?: string;
  design?: "Information" | "Positive" | "Negative" | "Critical";
  hide_close_button?: boolean;
  hide_icon?: boolean;
}

export interface UI5ToastCardConfig extends BaseCardConfig {
  type: "custom:ui5-toast-card";
  text?: string;
  duration?: number;
  placement?: "TopStart" | "TopCenter" | "TopEnd" | "MiddleStart" | "MiddleCenter" | "MiddleEnd" | "BottomStart" | "BottomCenter" | "BottomEnd";
  trigger_entity?: string;
  trigger_state?: string;
}

export interface UI5DialogCardConfig extends BaseCardConfig {
  type: "custom:ui5-dialog-card";
  header_text?: string;
  state?: "None" | "Information" | "Success" | "Warning" | "Error";
  content?: string;
  draggable?: boolean;
  resizable?: boolean;
  stretch?: boolean;
  button_text?: string;
  show_close_button?: boolean;
}

export interface UI5PopoverCardConfig extends BaseCardConfig {
  type: "custom:ui5-popover-card";
  header_text?: string;
  content?: string;
  placement?: "Top" | "Bottom" | "Start" | "End";
  horizontal_align?: "Center" | "Start" | "End" | "Stretch";
  vertical_align?: "Center" | "Top" | "Bottom" | "Stretch";
  button_text?: string;
  show_arrow?: boolean;
}

export interface UI5MenuCardConfig extends BaseCardConfig {
  type: "custom:ui5-menu-card";
  button_text?: string;
  items?: Array<{
    text: string;
    icon?: string;
    disabled?: boolean;
    starts_section?: boolean;
    service?: string;
    service_data?: Record<string, unknown>;
  }>;
}

export type UI5CardConfig =
  | UI5ButtonCardConfig
  | UI5SwitchCardConfig
  | UI5SliderCardConfig
  | UI5ProgressCardConfig
  | UI5ShellBarCardConfig
  | UI5SideNavCardConfig
  | UI5TimelineCardConfig
  | UI5WizardCardConfig
  | UI5NotificationListCardConfig
  | UI5PageCardConfig
  | UI5ElementCardConfig
  | UI5ListCardConfig
  | UI5TableCardConfig
  | UI5CardCardConfig
  | UI5PanelCardConfig
  | UI5TabsCardConfig
  | UI5BarCardConfig
  | UI5InputCardConfig
  | UI5SelectCardConfig
  | UI5DatePickerCardConfig
  | UI5TimePickerCardConfig
  | UI5BadgeCardConfig
  | UI5MessageStripCardConfig
  | UI5ToastCardConfig
  | UI5DialogCardConfig
  | UI5PopoverCardConfig
  | UI5MenuCardConfig;

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
    "ui5-shellbar-card": LovelaceCard;
    "ui5-sidenav-card": LovelaceCard;
    "ui5-timeline-card": LovelaceCard;
    "ui5-wizard-card": LovelaceCard;
    "ui5-notification-list-card": LovelaceCard;
    "ui5-page-card": LovelaceCard;
    "ui5-element-card": LovelaceCard;
    "ui5-list-card": LovelaceCard;
    "ui5-table-card": LovelaceCard;
    "ui5-card-card": LovelaceCard;
    "ui5-panel-card": LovelaceCard;
    "ui5-tabs-card": LovelaceCard;
    "ui5-bar-card": LovelaceCard;
    "ui5-input-card": LovelaceCard;
    "ui5-select-card": LovelaceCard;
    "ui5-datepicker-card": LovelaceCard;
    "ui5-timepicker-card": LovelaceCard;
    "ui5-badge-card": LovelaceCard;
    "ui5-messagestrip-card": LovelaceCard;
    "ui5-toast-card": LovelaceCard;
    "ui5-dialog-card": LovelaceCard;
    "ui5-popover-card": LovelaceCard;
    "ui5-menu-card": LovelaceCard;
  }
}
