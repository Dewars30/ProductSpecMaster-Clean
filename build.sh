#!/bin/bash

# Exit on error
set -e

echo "Installing dependencies including development dependencies..."
npm ci --include=dev

echo "Installing vite globally..."
npm install -g vite

echo "Building client..."
npm run build:client

echo "Building server..."
npm run build:server

echo "Build completed successfully!"
