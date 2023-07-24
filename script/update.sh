#!/bin/bash

# Set appropriate permissions for the application directory
sudo chmod -R 777 /root/toolplate-backend
# Grant execute permissions to the script
chmod +x update.sh

# Change to the application directory
cd /root/toolplate-backend

# Install dependencies
npm install

# Restart the application using pm2
pm2 restart "toolplate-backend"