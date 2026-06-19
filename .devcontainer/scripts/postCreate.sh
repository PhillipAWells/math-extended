#!/usr/bin/env bash
set -euo pipefail

# Enable corepack (ships with Node.js 16.9+)
corepack enable

# Install the pinned Yarn version non-interactively
# Using exact version (4.16.0) instead of mutable major tag (yarn@4)
COREPACK_ENABLE_STRICT=0 corepack prepare yarn@4.16.0 --activate

# Disable anonymous telemetry
yarn config set --home enableTelemetry 0

# Install Dependencies
yarn install