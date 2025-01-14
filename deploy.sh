#!/bin/bash

# Navigate to the bot's directory
cd "$(dirname "$0")"

# Stop the existing bot session if it is running
pm2 stop "dpsberealbot" || true

# Delete the process from PM2 (optional but ensures a clean state)
pm2 delete "dpsberealbot" || true

# Start the bot using PM2
pm2 start npm --name "dpsberealbot" -- start
