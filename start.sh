#!/usr/bin/env bash

# ZAMSTATE Quick Start Script
# Starts both frontend and backend servers

echo "🚀 ZAMSTATE Full Stack Startup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo ""

# Start backend in background
echo "📦 Starting Backend Server..."
cd server
npm install --legacy-peer-deps > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
echo ""

# Wait a moment for backend to start
sleep 2

# Start frontend
cd ..
echo "⚛️  Starting Frontend Server..."
npm install --legacy-peer-deps > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo ""

echo "=================================="
echo "🎉 ZAMSTATE is running!"
echo ""
echo "Frontend:  http://localhost:5173"
echo "Backend:   http://localhost:5000"
echo ""
echo "Admin Credentials:"
echo "  Email:    admin@zamstate.com"
echo "  Password: Admin@123456"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=================================="

# Handle cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'Servers stopped'; exit" SIGINT

# Keep script running
wait
