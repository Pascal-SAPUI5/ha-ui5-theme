# UI5 Web Components for Home Assistant

A **Home Assistant HACS Plugin** that provides **Lovelace custom cards** using **SAP UI5 Web Components**.

This plugin uses UI5 Web Components (NOT classic SAPUI5/OpenUI5) to create beautiful, customizable dashboard cards for your Home Assistant installation.

## Features

- 🎴 **Custom Lovelace Cards** using UI5 Web Components
- 🎨 **Visual Card Picker** integration
- ⚡ **Action Support**: tap_action, hold_action, double_tap_action
- 🔄 **Entity Binding**: automatically sync with Home Assistant entities
- 📝 **Template Support**: use `{{ states('entity.id') }}` in card configurations
- 🌓 **Theme-aware**: automatically adapts to Home Assistant themes
- 📦 **Single-file ESM bundle** for easy installation

## Available Cards

### Core Cards

#### UI5 Button Card

A customizable button card with support for icons, different designs, and entity state display.

#### UI5 Switch Card

A toggle switch card for controlling binary entities (lights, switches, etc.).

#### UI5 Slider Card

A slider control card for adjusting numeric values (brightness, volume, temperature, etc.).

#### UI5 Progress Card

A progress indicator card for displaying percentage-based values.

### Fiori Cards

#### UI5 ShellBar Card

A shell bar card for displaying a top application bar with title and logo.

#### UI5 SideNavigation Card

A side navigation card for displaying hierarchical navigation menus.

#### UI5 Timeline Card

A timeline card for displaying chronological events and activities.

#### UI5 Wizard Card

A wizard card for multi-step processes and workflows.

#### UI5 NotificationList Card

A notification list card for displaying system notifications and alerts.

#### UI5 Page Card

A page layout card for organizing content with consistent styling.

### Generic Card

#### UI5 Element Card

A generic card that can render any UI5 Web Component with custom properties and slots.

## Installation

### Prerequisites

- Home Assistant 2023.1.0 or newer
- HACS (Home Assistant Community Store) installed

### HACS Installation

1. **Add this repository to HACS:**
   - Open HACS in your Home Assistant
   - Click the three dots menu in the top right
   - Select "Custom repositories"
   - Add this repository URL
   - Select category: "Plugin"

2. **Install the plugin:**
   - Find "UI5 Web Components Cards" in HACS
   - Click "Install"
   - Restart Home Assistant

3. **Configure Home Assistant:**
   Add the following to your `configuration.yaml`:

   ```yaml
   frontend:
     extra_module_url:
       - /hacsfiles/ha-ui5-theme/ui5-webcomponents-ha.js
   ```

4. **Restart Home Assistant** to load the module

## Usage

After installation, the UI5 cards will appear in the Lovelace card picker when you add a new card to your dashboard.

### UI5 Button Card

```yaml
type: custom:ui5-button-card
entity: light.living_room
text: Toggle Light
design: Emphasized # Default | Emphasized | Positive | Negative | Transparent
icon: lightbulb
tap_action:
  action: toggle
```

### UI5 Switch Card

```yaml
type: custom:ui5-switch-card
entity: switch.bedroom_fan
text: Bedroom Fan
tap_action:
  action: toggle
```

### UI5 Slider Card

```yaml
type: custom:ui5-slider-card
entity: light.kitchen
name: Kitchen Brightness
min: 0
max: 100
step: 1
show_value: true
```

### UI5 Progress Card

```yaml
type: custom:ui5-progress-card
entity: sensor.battery_level
name: Battery Level
max: 100
display_value: true
state: Success # None | Success | Warning | Error | Information
```

### UI5 ShellBar Card

```yaml
type: custom:ui5-shellbar-card
primary_title: Home Assistant
secondary_title: Dashboard
logo: /local/logo.png
```

### UI5 SideNavigation Card

```yaml
type: custom:ui5-sidenav-card
collapsed: false
items:
  - text: Home
    icon: home
  - text: Lights
    icon: lightbulb
  - text: Climate
    icon: temperature
  - text: Settings
    icon: settings
```

### UI5 Timeline Card

```yaml
type: custom:ui5-timeline-card
layout: Vertical
items:
  - title_text: Door opened
    subtitle_text: 5 minutes ago
    icon: door-open
    name: Front Door
  - title_text: Motion detected
    subtitle_text: 10 minutes ago
    icon: walking
    name: Living Room
  - title_text: Light turned on
    subtitle_text: 15 minutes ago
    icon: lightbulb
    name: Kitchen
```

### UI5 Wizard Card

```yaml
type: custom:ui5-wizard-card
steps:
  - title_text: Welcome
    icon: hello-world
  - title_text: Configure
    icon: settings
  - title_text: Review
    icon: overview-chart
  - title_text: Complete
    icon: accept
```

### UI5 NotificationList Card

```yaml
type: custom:ui5-notification-list-card
items:
  - title_text: Security Alert
    description: Front door left open
    priority: High
    read: false
  - title_text: System Update
    description: New version available
    priority: Medium
    read: false
  - title_text: Weather Alert
    description: Rain expected this evening
    priority: Low
    read: true
```

### UI5 Page Card

```yaml
type: custom:ui5-page-card
content: Welcome to your Home Assistant dashboard!
background_design: Solid
floating_footer: false
```

### UI5 Element Card (Generic)

The Element Card allows you to use any UI5 Web Component:

```yaml
type: custom:ui5-element-card
element: ui5-illustrated-message
props:
  name: BeforeSearch
slot_content: Start searching for devices
```

```yaml
type: custom:ui5-element-card
element: ui5-message-strip
props:
  design: Positive
slot_content: System is running normally
```

### Template Support

You can use Home Assistant templates in text fields:

```yaml
type: custom:ui5-button-card
text: "Light is {{ states('light.living_room') }}"
```

```yaml
type: custom:ui5-timeline-card
items:
  - title_text: "Temperature: {{ states('sensor.temperature') }}°C"
    subtitle_text: "{{ relative_time(states.sensor.temperature.last_changed) }}"
```

### Action Configuration

All cards support tap, hold, and double-tap actions:

```yaml
type: custom:ui5-button-card
text: Click Me
tap_action:
  action: more-info
hold_action:
  action: call-service
  service: light.toggle
  service_data:
    entity_id: light.living_room
double_tap_action:
  action: navigate
  navigation_path: /lovelace/0
```

Supported actions:

- `toggle` - Toggle an entity
- `more-info` - Show more info dialog
- `call-service` - Call a Home Assistant service
- `navigate` - Navigate to a different view
- `url` - Open a URL
- `none` - No action

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

Output: `dist/ui5-webcomponents-ha.js`

### Dev Mode

```bash
npm run dev
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Format

```bash
npm run format
```

## Project Structure

```
.
├── src/
│   ├── index.ts              # Main entry point
│   ├── types.ts              # TypeScript definitions
│   ├── ui5-loader.ts         # UI5 components loader
│   ├── cards/
│   │   ├── base-card.ts      # Base card class
│   │   ├── ui5-button-card.ts
│   │   ├── ui5-switch-card.ts
│   │   ├── ui5-slider-card.ts
│   │   └── ui5-progress-card.ts
│   └── utils/
│       ├── action-handler.ts      # Action handling
│       ├── template-processor.ts  # Template processing
│       └── ha-helpers.ts          # Helper functions
├── dist/
│   └── ui5-webcomponents-ha.js   # Build output
├── hacs.json                      # HACS metadata
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Technical Details

- **Build tool:** Vite (library mode)
- **Language:** TypeScript
- **UI Components:** @ui5/webcomponents, @ui5/webcomponents-fiori
- **Output:** Single ESM file with inlined dynamic imports
- **No SSR, no code splitting** - optimized for HA's module loading
- **Custom Elements:** All cards are Web Components extending HTMLElement

## Roadmap

See [Issue #7](https://github.com/Pascal-SAPUI5/ha-ui5-theme/issues/7) for the full roadmap.

### Phase 3 — Visual Editors

- [ ] Card configuration editors for each card type
- [ ] Enhanced card picker support

### Phase 4 — Additional Cards

- [ ] UI5 List Card
- [ ] UI5 Table Card
- [ ] UI5 Tabs Card
- [ ] UI5 Dialog Card
- [ ] Fiori components (ShellBar, SideNavigation, Timeline, etc.)

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or PR.

### Claude Code GitHub Actions

This repository uses Claude Code for automated PR reviews and interactive support:

- **Automatic PR Reviews**: Claude reviews all pull requests automatically
- **Interactive Help**: Tag `@claude` in issues or PR comments for assistance

See [CLAUDE_CODE_SETUP.md](./CLAUDE_CODE_SETUP.md) for setup instructions.

## Support

For issues, please use the GitHub issue tracker.
