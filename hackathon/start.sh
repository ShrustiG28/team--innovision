#!/bin/bash

# Quick Start Script for Decentralized Identity Vault
# macOS / Linux version

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  🔐 Decentralized Identity Vault - Quick Start          ║"
echo "║     Starting Backend and Frontend...                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend dependencies installation failed"
    exit 1
fi
echo "✅ Backend dependencies installed"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependencies installation failed"
    exit 1
fi
echo "✅ Frontend dependencies installed"
echo ""

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  Starting Services...                                  ║"
echo "║                                                        ║"
echo "║  Backend:  http://localhost:5000                       ║"
echo "║  Frontend: http://localhost:3000                       ║"
echo "║                                                        ║"
echo "║  Both services will run in this terminal.             ║"
echo "║  Press Ctrl+C to stop all services.                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Start backend in background
cd ../backend
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services started!"
echo "   - Backend running on http://localhost:5000 (PID: $BACKEND_PID)"
echo "   - Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "📝 Next steps:"
echo "   1. Wait for both services to show 'ready' message"
echo "   2. Open http://localhost:3000 in your browser"
echo "   3. Start with the 🆔 Identity tab to create your DID"
echo ""
echo "💡 To stop:"
echo "   Press Ctrl+C to stop all services"
echo ""

# Wait for interrupt
wait
