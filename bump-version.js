#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function bumpVersion() {
  // Read manifest.json
  const manifestPath = path.join(__dirname, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  // Read package.json
  const packagePath = path.join(__dirname, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  // Parse current version
  const currentVersion = manifest.version;
  const versionParts = currentVersion.split(".").map(Number);

  // Bump patch version
  versionParts[2] += 1;
  const newVersion = versionParts.join(".");

  // Update manifest.json
  manifest.version = newVersion;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  // Update package.json
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");

  console.log(`Version bumped from ${currentVersion} to ${newVersion}`);
  return newVersion;
}

if (require.main === module) {
  bumpVersion();
}

module.exports = { bumpVersion };
