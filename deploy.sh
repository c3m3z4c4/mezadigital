#!/bin/bash
# Deploy Meza Digital to VPS
# Usage: ./deploy.sh
# Requires: ssh key configured for VPS_USER@VPS_HOST

set -e

VPS_USER="root"
VPS_HOST="31.97.41.99"
REMOTE_DIR="/var/www/mezadigital"
APP_NAME="mezadigital"

echo "▶ Building..."
npm run build

echo "▶ Syncing files to $VPS_HOST..."
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env*' \
  --exclude='estatico' \
  .next \
  public \
  package.json \
  package-lock.json \
  next.config.ts \
  ecosystem.config.js \
  "$VPS_USER@$VPS_HOST:$REMOTE_DIR/"

echo "▶ Installing dependencies and restarting on server..."
ssh "$VPS_USER@$VPS_HOST" bash <<EOF
  cd $REMOTE_DIR
  npm ci --omit=dev
  pm2 startOrRestart ecosystem.config.js --env production
  pm2 save
EOF

echo "✓ Deploy complete — Meza Digital running on port 3001"
