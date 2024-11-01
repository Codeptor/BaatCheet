#!/bin/bash

# Kill any existing processes on ports 3000 and 8000
kill $(lsof -t -i:3000) 2>/dev/null
kill $(lsof -t -i:8000) 2>/dev/null

# Start Redis if not running
sudo systemctl start redis-server

# Start Django with Daphne
source venv/bin/activate
daphne -b 0.0.0.0 -p 8000 baat_cheet.asgi:application &

# Start React development server
cd frontend && npm start
