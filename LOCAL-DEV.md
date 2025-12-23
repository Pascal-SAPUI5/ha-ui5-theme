# Local Development with Docker

This guide explains how to run a local Home Assistant instance for testing UI5 Web Components cards.

## Quick Start

```bash
# 1. Build the project
npm run build

# 2. Start Home Assistant
docker compose -f docker-compose.dev.yml up -d

# 3. Open browser
# http://localhost:8123
```

## First-Time Setup

When starting Home Assistant for the first time:

1. Open http://localhost:8123
2. Complete the onboarding wizard (create a user account)
3. Go to **Settings > Dashboards > Resources** to verify the UI5 resource is loaded
4. Navigate to the test dashboard

## Project Structure

```
ha-config/
├── configuration.yaml    # HA configuration with test entities
├── ui-lovelace.yaml      # Dashboard with card placeholders
└── themes/               # Custom themes directory

dist/
└── ui5-webcomponents-ha.js  # Built JS file (mounted read-only)
```

## Available Test Entities

| Entity Type      | Examples                                           |
| ---------------- | -------------------------------------------------- |
| `input_boolean`  | test_switch, living_room_light, bedroom_light      |
| `input_number`   | test_slider, temperature_setpoint, brightness      |
| `input_text`     | test_input, notification_message                   |
| `input_select`   | test_select, hvac_mode, scene_selector             |
| Template Sensors | indoor_temperature, indoor_humidity, power_consumption |

## Useful Commands

```bash
# View container logs
docker logs -f ha-dev

# Restart container (after config changes)
docker restart ha-dev

# Stop container
docker compose -f docker-compose.dev.yml down

# Rebuild and restart
npm run build && docker restart ha-dev

# Access container shell
docker exec -it ha-dev bash

# Check if JS file is mounted correctly
docker exec ha-dev ls -la /config/www/ui5-components/
```

## Development Workflow

1. **Edit source files** in `src/`
2. **Rebuild**: `npm run build`
3. **Hard refresh** browser (Ctrl+Shift+R / Cmd+Shift+R)
4. Alternatively: **Developer Tools > YAML > Lovelace Dashboards** to reload

## Adding Custom Cards to Dashboard

Edit `ha-config/ui-lovelace.yaml` and add your cards:

```yaml
# Example: UI5 Button Card
- type: custom:ui5-button-card
  entity: input_boolean.test_switch
  name: My Button

# Example: UI5 List Card
- type: custom:ui5-list-card
  entities:
    - input_boolean.test_switch
    - input_boolean.living_room_light
  title: My List
```

After editing, reload dashboards in HA or restart the container.

## Debugging

### Check Resource Loading

In browser DevTools (F12):
- **Network tab**: Look for `ui5-webcomponents-ha.js` - should be 200 OK
- **Console tab**: Check for JavaScript errors

### Common Issues

| Problem | Solution |
|---------|----------|
| Card not appearing | Check browser console for errors |
| "Custom element doesn't exist" | Resource not loaded - check Resources in HA settings |
| Changes not visible | Hard refresh (Ctrl+Shift+R) or clear cache |
| Container won't start | Check `docker logs ha-dev` for errors |
| Port 8123 in use | Stop other HA instance or change port in docker-compose |

### Changing Port

If port 8123 is already in use, edit `docker-compose.dev.yml`:

```yaml
services:
  homeassistant:
    # Remove network_mode: host and add:
    ports:
      - "8124:8123"  # Use port 8124 instead
```

## Clean Up

```bash
# Stop and remove container
docker compose -f docker-compose.dev.yml down

# Remove HA data (fresh start)
rm -rf ha-config/.storage ha-config/home-assistant_v2.db

# Keep templates for version control
git checkout ha-config/configuration.yaml ha-config/ui-lovelace.yaml
```
