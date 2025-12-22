# Home Assistant UI5 Theme

A **Home Assistant HACS Frontend plugin** that integrates **SAP UI5 Web Components** into your Home Assistant installation.

This plugin uses UI5 Web Components (NOT classic SAPUI5/OpenUI5) and provides global theming capabilities for your Home Assistant frontend.

## Features

- UI5 Web Components integration
- Global CSS variable overrides for HA theming
- Single-file ESM bundle (no code splitting)
- Proof-of-concept UI5 button element
- Built with Vite and TypeScript

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
   - Select category: "Frontend"

2. **Install the plugin:**
   - Find "Home Assistant UI5 Theme" in HACS
   - Click "Install"
   - Restart Home Assistant

3. **Configure Home Assistant:**
   Add the following to your `configuration.yaml`:

   ```yaml
   frontend:
     extra_module_url:
       - /hacsfiles/ha-ui5-theme/ha-ui5-theme.js
   ```

4. **Restart Home Assistant** to load the module

## Verification

After installation, you should see:

- A floating UI5 button in the bottom-right corner of your HA interface
- Clicking it shows a confirmation that UI5 Web Components are active
- Console logs in browser DevTools showing `[ha-ui5-theme]` messages

## Optional: Home Assistant Theme

You can also use the included YAML theme for additional theming capabilities:

1. Copy `themes/ui5.yaml` (when available) to your HA `themes/` directory
2. Reference it in `configuration.yaml`:
   ```yaml
   frontend:
     themes: !include_dir_merge_named themes
   ```
3. Select "UI5" theme in your HA user profile

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

Output: `dist/ha-ui5-theme.js`

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
│   └── main.ts           # Main entry point
├── dist/
│   └── ha-ui5-theme.js   # Build output (generated)
├── themes/               # Optional HA themes (future)
├── hacs.json             # HACS metadata
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

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or PR.

## Support

For issues, please use the GitHub issue tracker.
