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

### UI5 Button Card

A customizable button card with support for icons, different designs, and entity state display.

### UI5 Switch Card

A toggle switch card for controlling binary entities (lights, switches, etc.).

### UI5 Slider Card

A slider control card for adjusting numeric values (brightness, volume, temperature, etc.).

### UI5 Progress Card

A progress indicator card for displaying percentage-based values.

### UI5 ShellBar Card

A shell bar card providing a navigation header with branding, notifications, and action items.

### UI5 Side Navigation Card

A side navigation card for creating hierarchical navigation menus with expandable groups.

### UI5 Timeline Card

A timeline card for displaying chronological events with icons and entity state integration.

### UI5 Wizard Card

A wizard card for multi-step processes and guided workflows.

### UI5 Notification List Card

A notification list card for displaying alerts, messages, and entity state changes.

### UI5 Page Card

A page card providing a structured layout with header, content area, and optional footer.

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
show_notifications: true
show_profile: true
items:
  - text: Settings
    icon: action-settings
    action:
      action: navigate
      navigation_path: /config/dashboard
```

### UI5 Side Navigation Card

```yaml
type: custom:ui5-sidenav-card
items:
  - text: Home
    icon: home
    path: /lovelace/0
  - text: Settings
    icon: action-settings
    items:
      - text: General
        path: /config/general
      - text: Integrations
        path: /config/integrations
```

### UI5 Timeline Card

```yaml
type: custom:ui5-timeline-card
layout: Vertical # Vertical | Horizontal
items:
  - title: System Started
    subtitle: Home Assistant initialized
    timestamp: 2024-01-01 12:00
    icon: sys-enter
  - title: Motion Detected
    entity: binary_sensor.motion_living_room
    subtitle: Living Room
    icon: activate
```

### UI5 Wizard Card

```yaml
type: custom:ui5-wizard-card
steps:
  - title: Step 1
    icon: hint
    content: Welcome to the wizard
  - title: Step 2
    icon: activities
    content: Configure your settings
  - title: Step 3
    icon: accept
    content: Review and confirm
```

### UI5 Notification List Card

```yaml
type: custom:ui5-notification-list-card
notifications:
  - title: System Update
    description: A new version is available
    priority: High # None | Low | Medium | High
    timestamp: 2 minutes ago
  - title: Battery Low
    entity: sensor.door_sensor_battery
    description: Front door sensor battery is low
    priority: Medium
```

### UI5 Page Card

```yaml
type: custom:ui5-page-card
header_text: My Page
content: This is the page content area
show_footer: true
footer_text: Footer text
```

### Template Support

You can use Home Assistant templates in text fields:

```yaml
type: custom:ui5-button-card
text: "Light is {{ states('light.living_room') }}"
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
│   │   ├── ui5-progress-card.ts
│   │   ├── ui5-shellbar-card.ts
│   │   ├── ui5-sidenav-card.ts
│   │   ├── ui5-timeline-card.ts
│   │   ├── ui5-wizard-card.ts
│   │   ├── ui5-notification-list-card.ts
│   │   └── ui5-page-card.ts
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
