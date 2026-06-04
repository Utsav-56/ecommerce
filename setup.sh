#!/bin/bash

# Exit immediately if any command fails
set -e

echo "========================================="
echo "       GoCart E-Commerce Setup           "
echo "========================================="

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "Error: pnpm is not installed."
    echo "Please install pnpm first: https://pnpm.io/installation"
    exit 1
fi

# Ensure .env exists (it is tracked in git, but copy from .env.example if missing)
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        # Add default DATABASE_URL and SESSION_SECRET to .env if they are not there
        echo "DATABASE_URL=\"file:prisma/dev.db\"" >> .env
        echo "SESSION_SECRET=\"e9a9d20c5d5e2ba7e8bb657bf5c31622b7c6c49e798f4bbd05cf52bd7aefce3d\"" >> .env
    else
        echo "DATABASE_URL=\"file:prisma/dev.db\"" > .env
        echo "SESSION_SECRET=\"e9a9d20c5d5e2ba7e8bb657bf5c31622b7c6c49e798f4bbd05cf52bd7aefce3d\"" >> .env
    fi
fi

echo "Installing project dependencies via pnpm..."
pnpm install

echo "Initializing SQLite database and seeding initial data..."
pnpm run db:init

echo "========================================="
echo " Setup completed successfully!"
echo "========================================="
echo "To run the development server:"
echo "  pnpm dev"
echo ""
echo "To build for production:"
echo "  pnpm build"
echo "========================================="
