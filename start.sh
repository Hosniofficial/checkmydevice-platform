#!/bin/bash
set -e

echo "🚀 Starting CheckMyDevice Backend..."
echo "📦 Environment: $NODE_ENV"
echo "🔧 Port: ${PORT:-5000}"

# Run migrations if needed (optional - comment out if running manually)
# echo "🗄️  Running database migrations..."
# node src/db/migrate.js

# Start the server
exec node src/server.js
