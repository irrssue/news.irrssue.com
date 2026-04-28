#!/bin/bash
# Auto-deploy script for homeserver.
# Polls GitHub main, rebuilds + restarts if new commits.
# Run via cron every N minutes.

set -e

REPO_DIR="$HOME/minimal-hackernews"
PM2_APP="hackernews"
BRANCH="main"

# Ensure npm/pm2 in PATH when run from cron
export PATH="$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -1)/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

cd "$REPO_DIR" || { echo "[$(date)] repo not found"; exit 1; }

git fetch origin "$BRANCH" --quiet

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

echo "[$(date)] new commits detected: $LOCAL -> $REMOTE"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "[$(date)] dirty tree, stashing"
  git stash push -u -m "auto-deploy $(date +%s)"
fi

git pull --ff-only origin "$BRANCH"

npm ci
npm run build

if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP" --update-env
else
  echo "[$(date)] pm2 app '$PM2_APP' not found, starting fresh"
  pm2 start npm --name "$PM2_APP" -- start
fi

echo "[$(date)] deploy complete: $(git rev-parse --short HEAD)"
