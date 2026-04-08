#!/usr/bin/env bash
set -e

echo "Bootstrapping FarmYard Android..."
npm install
npm run cap:add:android
npm run cap:sync
npm run cap:assets

echo "Android scaffold ready. Next step: npm run cap:open:android"
