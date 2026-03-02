#!/usr/bin/env bash
set -e

echo ""
echo "  Armsrace Monitor - Starting..."
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "  Installing dependencies (first run)..."
  npm install
  echo ""
fi

# Create .env if missing
if [ ! -f ".env" ]; then
  echo "  Creating .env from .env.example..."
  cp .env.example .env
  echo "  Edit .env to add optional API keys for enhanced data."
  echo ""
fi

# Ensure data directory exists
mkdir -p data

# Start all services
npm run dev
