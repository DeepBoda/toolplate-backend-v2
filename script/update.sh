#!/bin/bash

APP_DIR=/root/toolplate-backend
LOG_FILE=/var/log/update.log

# Change to the application directory
cd $APP_DIR

# Perform a backup (optional, but recommended)
# Example: cp -r $APP_DIR $APP_DIR.bak-$(date +"%Y%m%d%H%M%S")

# Update the codebase from your repository
if git pull; then
    echo "Git pull successful" >> $LOG_FILE

    # Install or update dependencies
    if npm install; then
        echo "Dependencies installed/updated successfully!" >> $LOG_FILE

        # Restart the application using pm2
        if pm2 restart "toolplate-backend"; then
            echo "Application restarted successfully!" >> $LOG_FILE
        else
            echo "FAILED to restart application!" >> $LOG_FILE
        fi
    else
        echo "FAILED to install/update dependencies!" >> $LOG_FILE
        exit 1  # Exit with an error code to indicate failure
    fi
else
    echo "Git pull FAILED!" >> $LOG_FILE
    exit 1  # Exit with an error code to indicate failure
fi

# Change file ownership to the appropriate user and group
# chown -R <your-user>:<your-group> $APP_DIR

# Exit with a success code
exit 0
