````md
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Status

This repository starts empty (initial commit only). No build tooling, source code, or CI/CD is set up yet.

## Project Goal

Build a **Home Assistant HACS Frontend plugin** plus an **optional Home Assistant Theme (YAML)** that uses **UI5 Web Components** (https://ui5.github.io/webcomponents/) and is bundled with **Vite**.

This is **NOT** a classic SAPUI5/OpenUI5 application (no `ui5.yaml`, no UI5 Tooling build). We use UI5 **Web Components** as UI primitives inside Home Assistant’s existing frontend.

## Target Output

### 1) Frontend Module (HACS)
- Build exactly one ESM file:
  - `dist/ha-ui5-theme.js`
- The module must:
  - import/register UI5 Web Components (at least one component from `@ui5/webcomponents`; optional `@ui5/webcomponents-fiori`)
  - inject global CSS overrides (primarily CSS variables; minimal, resilient selectors) to influence HA UI broadly
  - optionally mount a small UI5-based proof element (e.g., floating button) to show it works outside Lovelace dashboards

### 2) Optional Home Assistant Theme (YAML)
- Provide `themes/ui5.yaml` (or similar) with HA theme variables.
- Document how to enable the theme in Home Assistant.

## Home Assistant Integration Requirements

Installation must be documented for:
- HACS (Frontend)
- Home Assistant `configuration.yaml`:

```yaml
frontend:
  extra_module_url:
    - /hacsfiles/<repo-name>/ha-ui5-theme.js
````

Notes:

* Home Assistant loads this file as an ES module via `extra_module_url`.
* Avoid code splitting; HA must load a single JS file.

## Tech Stack

* Node.js 18+
* TypeScript
* Vite (library mode / single-file ESM build)
* UI5 Web Components:

  * `@ui5/webcomponents`
  * optional: `@ui5/webcomponents-fiori`
* Optional tooling:

  * ESLint
  * Prettier

## Repository Structure (Intended)

* `src/` — TypeScript sources
* `dist/` — build output (generated)
* `themes/` — optional HA theme YAML(s)
* `.github/workflows/` — CI and release workflows
* `hacs.json` — HACS metadata
* `README.md` — install and usage docs
* `LICENSE` — project license

## Commands (To Be Created)

Expected scripts in `package.json`:

* `npm run dev` (optional local preview)
* `npm run build` (must create `dist/ha-ui5-theme.js`)
* `npm run lint` (optional)
* `npm test` (optional)

## CI/CD Requirements

GitHub Actions workflows must be included:

### 1) CI workflow (push + pull_request)

* `npm ci`
* `npm run build`
* optional: `npm run lint`

### 2) Release workflow (tags `v*`)

* build the project
* create a GitHub Release
* upload `dist/ha-ui5-theme.js` as a release asset

## Implementation Constraints / Guardrails

* No SSR / Next.js for the Home Assistant runtime bundle.
* Output must be a single ESM file (no chunking) to keep HA resource loading simple.
* Keep runtime dependencies minimal.
* Do not rely on unstable internal Home Assistant component APIs. Prefer CSS variables and minimal DOM mounting.
* Write defensive code: avoid fragile selectors; handle missing elements gracefully; avoid breaking the HA UI.

## When In Doubt

Prefer:

* Vite library build with `inlineDynamicImports` to prevent additional chunks.
* Small, incremental commits:

  1. scaffold tooling
  2. implement minimal module behavior
  3. docs
  4. CI/CD

```
::contentReference[oaicite:0]{index=0}
```
