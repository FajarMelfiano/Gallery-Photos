#!/bin/bash

# Photo Gallery - macOS/Linux Start Script
# Run: chmod +x start.sh && ./start.sh

echo "========================================"
echo "  Photo Gallery - Server Startup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found!"
    echo "Please run this script from the 'backend' folder."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "❗ IMPORTANT: Please edit .env and add your Supabase credentials:"
    echo "   SUPABASE_URL"
    echo "   SUPABASE_KEY"
    echo "   SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: npm install failed!"
        exit 1
    fi
fi

# Check database setup
echo ""
echo "🔍 Checking database setup..."
node scripts/db-init.js 2>/dev/null
DB_CHECK=$?

if [ $DB_CHECK -ne 0 ]; then
    echo ""
    echo "⚠️  Database tables not found"
    echo ""
    echo "Setup database with:"
    echo "  npm run setup"
    echo ""
    exit 1
fi

# Start the server
echo ""
echo "Starting Photo Gallery Server..."
echo ""
echo "========================================"
echo "Open your browser and go to:"
echo "  🖼️  Gallery: http://localhost:5000"
echo "  🔐 Admin:   http://localhost:5000/admin"
echo "========================================"
echo ""
echo "Default login:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

npm start
