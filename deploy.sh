#!/bin/bash

# Set the script to exit immediately on error
set -e

# Optionally set to fail on unset variables
set -u

# Define the application directory
APP_DIR="/root/toolplate-backend"

# Change to the application directory
cd "$APP_DIR"

# Ensuring the directory exists and cd succeeded
if [ $? -ne 0 ]; then
    echo "Failed to change directory to $APP_DIR." >&2
    exit 1
fi

# Update the codebase from your repository
git restore . || { echo "Git restore failed."; exit 1; }
git pull || { echo "Git pull failed."; exit 1; }

# Install dependencies
echo "Installing dependencies..."
npm install || { echo "Failed to install dependencies." >&2; exit 1; }

# Restart the application using PM2
echo "Restarting the application..."
if pm2 restart "toolplate-backend"; then
  echo "Application restarted successfully."
else
  echo "Failed to restart the application." >&2
  exit 1
fi

# Check if the application is running properly
pm2 show "toolplate-backend" || { echo "Failed to retrieve PM2 application status." >&2; exit 1; }

echo "Deployment completed successfully."
