#!/usr/bin/env bash

# Photo Gallery - Supabase Setup Checker
# This script verifies your setup is correct

echo "════════════════════════════════════════════════════════════════"
echo "  📸 Photo Gallery - Supabase Setup Checker"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

checks_passed=0
checks_failed=0

# Function to check file existence
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        ((checks_passed++))
    else
        echo -e "${RED}✗${NC} $1 missing"
        ((checks_failed++))
    fi
}

# Function to check directory existence
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/ directory exists"
        ((checks_passed++))
    else
        echo -e "${RED}✗${NC} $1/ directory missing"
        ((checks_failed++))
    fi
}

echo "📋 Checking project structure..."
echo ""

# Check key files
check_file "package.json"
check_file "server.js"
check_file ".env"
check_file ".env.example"
check_file "vercel.json"

echo ""
echo "📁 Checking directories..."
echo ""

check_dir "public"
check_dir "routes"
check_dir "config"
check_dir "data"
check_dir "middleware"
check_dir "node_modules"

echo ""
echo "🔧 Checking backend configuration..."
echo ""

check_file "config/supabase.js"
check_file "data/supabase-db.js"
check_file "routes/auth.js"
check_file "routes/photos.js"
check_file "routes/categories.js"

echo ""
echo "🎨 Checking frontend files..."
echo ""

check_file "public/index.html"
check_dir "public/pages"
check_dir "public/css"
check_dir "public/js"

echo ""
echo "📚 Checking documentation..."
echo ""

check_file "README_SUPABASE.md"
check_file "SUPABASE_SETUP.md"
check_file "VERCEL_DEPLOYMENT.md"
check_file "MIGRATION_GUIDE.md"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "  Results: ${GREEN}$checks_passed passed${NC}, ${RED}$checks_failed failed${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""

if [ $checks_failed -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "📝 Next steps:"
    echo "1. Edit .env with your Supabase credentials"
    echo "2. Run: npm start"
    echo "3. Open http://localhost:5000 in browser"
    echo ""
else
    echo -e "${RED}✗ Some checks failed. Please review above.${NC}"
    echo ""
fi
