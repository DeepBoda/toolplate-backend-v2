#!/bin/bash

# Set appropriate permissions for the application directory (replace with your directory)
sudo chmod -R 777 /root/toolplate-backend

# Grant execute permissions to the script
chmod +x update.sh

# Change to the application directory
sudo su
cd /root/toolplate-backend

# Update the codebase from your repository
git restore .
git pull

# Install dependencies
npm i

# Restart the application using PM2 (replace with your app name)
pm2 restart "toolplate-backend"
