#!/bin/bash

# Script to clean sensitive information from the repository
echo "Cleaning sensitive information from the repository..."

# Replace actual client IDs and secrets with placeholder values in .env.example
sed -i '' 's/GOOGLE_CLIENT_ID=.*$/GOOGLE_CLIENT_ID=your_google_client_id/' .env.example
sed -i '' 's/GOOGLE_CLIENT_SECRET=.*$/GOOGLE_CLIENT_SECRET=your_google_client_secret/' .env.example
sed -i '' 's/REPLIT_CLIENT_ID=.*$/REPLIT_CLIENT_ID=your_replit_client_id/' .env.example
sed -i '' 's/REPLIT_CLIENT_SECRET=.*$/REPLIT_CLIENT_SECRET=your_replit_client_secret/' .env.example
sed -i '' 's/REPLIT_ENCRYPTION_KEY=.*$/REPLIT_ENCRYPTION_KEY=your_encryption_key/' .env.example

# Remove any client_secret JSON files
find . -name "client_secret_*.json" -type f -delete

echo "Cleaning complete. Now commit these changes before pushing to GitHub."
