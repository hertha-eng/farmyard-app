#!/usr/bin/env bash
set -e

echo "Bootstrapping FarmYard iPhone..."
npm install
npm run cap:add:ios
npm run cap:sync
npm run cap:assets

echo "iPhone scaffold ready. Next step: npm run cap:open:ios"
