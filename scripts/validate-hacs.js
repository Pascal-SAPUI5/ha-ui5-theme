#!/usr/bin/env node

/**
 * HACS Validation Script
 * Validates that the project meets HACS requirements
 *
 * Usage: node scripts/validate-hacs.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

console.log("");
console.log("═══════════════════════════════════════════════════════════════");
console.log("  🏠 HACS Validation");
console.log("═══════════════════════════════════════════════════════════════");
console.log("");

let errors = 0;
let warnings = 0;

// Helper functions
function check(condition, successMsg, errorMsg, isWarning = false) {
  if (condition) {
    console.log(`  ✅ ${successMsg}`);
    return true;
  } else {
    if (isWarning) {
      console.log(`  ⚠️  ${errorMsg}`);
      warnings++;
    } else {
      console.log(`  ❌ ${errorMsg}`);
      errors++;
    }
    return false;
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(ROOT, filePath));
}

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, filePath), "utf8"));
  } catch {
    return null;
  }
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(path.join(ROOT, filePath));
    return stats.size;
  } catch {
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. hacs.json
// ─────────────────────────────────────────────────────────────────────────────

console.log("📦 hacs.json");
const hacsConfig = readJSON("hacs.json");

if (!hacsConfig) {
  check(false, "", "hacs.json not found or invalid");
} else {
  check(hacsConfig.name, `name: "${hacsConfig.name}"`, "name is required");
  check(
    hacsConfig.filename,
    `filename: "${hacsConfig.filename}"`,
    "filename is required",
  );
  check(
    hacsConfig.render_readme !== undefined,
    `render_readme: ${hacsConfig.render_readme}`,
    "render_readme recommended",
    true,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Dist bundle
// ─────────────────────────────────────────────────────────────────────────────

console.log("");
console.log("📦 Distribution Bundle");

if (hacsConfig && hacsConfig.filename) {
  const distPath = `dist/${hacsConfig.filename}`;
  const bundleExists = fileExists(distPath);

  check(
    bundleExists,
    `Bundle found: ${distPath}`,
    `Bundle not found: ${distPath} (run: npm run build)`,
  );

  if (bundleExists) {
    const size = getFileSize(distPath);
    const sizeKB = (size / 1024).toFixed(2);
    const sizeMB = (size / 1024 / 1024).toFixed(2);

    console.log(`     Size: ${sizeKB} KB (${sizeMB} MB)`);

    check(
      size < 5 * 1024 * 1024,
      "",
      `Bundle too large (${sizeMB} MB) - HACS may reject`,
      false,
    );

    if (size > 1024 * 1024) {
      console.log(
        `  ⚠️  Bundle > 1MB - consider optimization (current: ${sizeMB} MB)`,
      );
      warnings++;
    }

    // Check bundle content
    const content = fs.readFileSync(path.join(ROOT, distPath), "utf8");
    check(
      content.includes("customElements.define"),
      "customElements.define found",
      "No customElements.define found - cards may not register",
      true,
    );
    check(
      content.includes("customCards"),
      "customCards registration found",
      "No customCards found - card picker may not work",
      true,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. README.md
// ─────────────────────────────────────────────────────────────────────────────

console.log("");
console.log("📄 README.md");

const readmeExists = fileExists("README.md");
check(
  readmeExists,
  "README.md found",
  "README.md not found (required for HACS)",
);

if (readmeExists) {
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  check(
    readme.length > 500,
    `Length: ${readme.length} chars`,
    "README seems too short (<500 chars)",
    true,
  );
  check(
    /install|hacs/i.test(readme),
    "Installation section found",
    "README should contain installation instructions",
    true,
  );
  check(
    /example|usage|configuration/i.test(readme),
    "Usage examples found",
    "README should contain usage examples",
    true,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. LICENSE
// ─────────────────────────────────────────────────────────────────────────────

console.log("");
console.log("📜 LICENSE");
check(
  fileExists("LICENSE"),
  "LICENSE found",
  "LICENSE not found (recommended)",
  true,
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. package.json version
// ─────────────────────────────────────────────────────────────────────────────

console.log("");
console.log("🏷️  Version");

const pkg = readJSON("package.json");
if (pkg && pkg.version) {
  console.log(`     Version: ${pkg.version}`);
  check(
    /^\d+\.\d+\.\d+/.test(pkg.version),
    "Follows semver",
    "Version should follow semver (x.y.z)",
    true,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. GitHub Release workflow
// ─────────────────────────────────────────────────────────────────────────────

console.log("");
console.log("🚀 Release Setup");

const hasReleaseWorkflow = fileExists(".github/workflows/release.yml");
check(
  hasReleaseWorkflow,
  "Release workflow found",
  "No release.yml - consider adding automated releases",
  true,
);

// Check if dist is in .gitignore
if (fileExists(".gitignore")) {
  const gitignore = fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8");
  if (gitignore.includes("dist")) {
    check(
      hasReleaseWorkflow,
      "",
      "dist in .gitignore but no release workflow - HACS needs dist",
      true,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log("");
console.log("═══════════════════════════════════════════════════════════════");

if (errors > 0) {
  console.log(
    `  ❌ VALIDATION FAILED: ${errors} error(s), ${warnings} warning(s)`,
  );
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log("");
  process.exit(1);
} else if (warnings > 0) {
  console.log(`  ⚠️  VALIDATION PASSED with ${warnings} warning(s)`);
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log("");
  process.exit(0);
} else {
  console.log("  ✅ VALIDATION PASSED - Ready for HACS!");
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log("");
  process.exit(0);
}
