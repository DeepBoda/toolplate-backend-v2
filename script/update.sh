#!/bin/bash

# Change to the application directory
cd /root/toolplate-backend

# Update the codebase from your repository
git pull

# Install dependencies
npm install

# Restart the application using PM2 (replace with your app name)
pm2 restart "toolplate-backend"
