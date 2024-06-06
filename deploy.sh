#!/bin/bash

# Change to the application directory
cd /root/toolplate-backend

# Update the codebase from your repository
git restore .
git pull

# Install dependencies
npm install

# Restart the application using PM2 (replace with your app name)
if pm2 restart "toolplate-backend"; then
  echo "Application restarted successfully."
else
  echo "Failed to restart the application." >&2
  exit 1
fi