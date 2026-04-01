#!/bin/bash
set -e

echo "→ Installing dependencies..."
npm install

echo "→ Building..."
npm run build

echo "→ Copying dist/ contents to repo root..."
cp -r dist/* .

echo "✓ Done. dist/ contents copied to root."
