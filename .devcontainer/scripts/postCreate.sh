#!/usr/bin/env bash
set -euo pipefail

# Enable corepack (ships with Node.js 16.9+)
corepack enable

# Install the latest stable Yarn non-interactively
# corepack resolves the "stable" tag itself, no npm registry query needed
COREPACK_ENABLE_STRICT=0 corepack prepare yarn@4.14.1 --activate

# Disable anonymous telemetry
yarn config set --home enableTelemetry 0

# Install Dependencies
yarn install