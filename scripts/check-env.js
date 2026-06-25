#!/usr/bin/env node
// Sanity-checks .env.local before `npm run dev` / `npm run build` starts.
// Wired in via "predev"/"prebuild" in package.json, so it runs automatically
// — you never have to remember to call it. It only WARNS, it never blocks
// the command: a missing Alpaca key just means the ticker shows a loading
// state instead of live prices, and that's a fine way to run the site too.

const fs = require("fs");
const path = require("path");

const ENV_FILE = path.join(process.cwd(), ".env.local");

const REQUIRED = [
  { key: "ADMIN_USERNAME", why: "without this, /admin is blocked entirely (fails closed)" },
  { key: "ADMIN_PASSWORD", why: "without this, /admin is blocked entirely (fails closed)" },
];

const OPTIONAL = [
  { key: "ALPACA_API_KEY_ID", why: "without this, the homepage ticker falls back to a loading state instead of live prices" },
  { key: "ALPACA_API_SECRET_KEY", why: "without this, the homepage ticker falls back to a loading state instead of live prices" },
];

// Values straight from .env.local.example that mean "never actually filled in."
// "admin" is NOT here — it's a legitimate real username, not a placeholder.
const PLACEHOLDER_VALUES = new Set([
  "your_key_id_here",
  "your_secret_key_here",
  "pick_something_only_you_know",
]);

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return null;
  const values = {};
  for (const rawLine of fs.readFileSync(file, "utf-8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function isUnset(value) {
  return !value || PLACEHOLDER_VALUES.has(value);
}

console.log("\n— Checking .env.local —");

const env = loadEnvFile(ENV_FILE);

if (!env) {
  console.log(`✗ No .env.local found at ${ENV_FILE}`);
  console.log("  Run: cp .env.local.example .env.local — then fill in real values.\n");
} else {
  let missingRequired = false;

  for (const { key, why } of REQUIRED) {
    if (isUnset(env[key])) {
      missingRequired = true;
      console.log(`✗ ${key} is missing or still a placeholder — ${why}`);
    } else {
      console.log(`✓ ${key} is set`);
    }
  }

  for (const { key, why } of OPTIONAL) {
    if (isUnset(env[key])) {
      console.log(`⚠ ${key} is missing or still a placeholder — ${why}`);
    } else {
      console.log(`✓ ${key} is set`);
    }
  }

  if (missingRequired) {
    console.log("\n/admin will NOT work until the ✗ items above are fixed.\n");
  } else {
    console.log("\nAll required values look good.\n");
  }
}
