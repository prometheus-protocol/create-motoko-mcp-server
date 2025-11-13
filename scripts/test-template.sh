#!/bin/bash
set -e

echo "🧪 Testing create-motoko-mcp-server template..."
echo ""

# Clean up any existing test project
echo "📁 Creating fresh test project..."
cd /tmp
rm -rf test-mcp-project
mkdir test-mcp-project
cp -r /home/jesse/prometheus-protocol/create-motoko-mcp-server/template/* /tmp/test-mcp-project/
cd /tmp/test-mcp-project

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --no-audit

# Deploy canister
echo ""
echo "🚀 Deploying canister..."
dfx deploy

# Run tests
echo ""
echo "🧪 Running tests..."
npm test

echo ""
echo "✅ Template testing complete!"
