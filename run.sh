#!/bin/bash

# --- Color Definitions ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}      Starting Ecommerce Application Runner       ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Ensure we are in the root directory of the workspace
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# --- Dependency Checks ---
echo -e "\n${BLUE}[1/4] Checking system dependencies...${NC}"

if ! command -v dotnet &> /dev/null; then
    echo -e "${RED}Error: .NET SDK is not installed or not in PATH. Please install .NET to run the backend.${NC}"
    exit 1
else
    echo -e " - .NET Core SDK: ${GREEN}Detected${NC} ($(dotnet --version))"
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: Node.js/npm is not installed or not in PATH. Please install Node.js to run the client.${NC}"
    exit 1
else
    echo -e " - Node.js/npm:   ${GREEN}Detected${NC} ($(npm --version))"
fi

# --- Port Conflict Checks ---
echo -e "\n${BLUE}[2/4] Checking port availability...${NC}"

check_port() {
    local port=$1
    local service=$2
    # Check if port is in use (compatible with macOS / lsof)
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Error: Port $port (required by $service) is already in use.${NC}"
        echo -e "${YELLOW}Please stop the service using port $port and try again.${NC}"
        exit 1
    else
        echo -e " - Port $port ($service): ${GREEN}Available${NC}"
    fi
}

# check_port 5000 "Backend API"
# check_port 3000 "Client App"

# --- Node Modules Setup Check ---
echo -e "\n${BLUE}[3/4] Preparing client dependencies...${NC}"
if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}node_modules not found in 'client'. Installing dependencies...${NC}"
    cd client && npm install && cd ..
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to install client dependencies.${NC}"
        exit 1
    fi
    echo -e " - Client dependencies: ${GREEN}Installed successfully${NC}"
else
    echo -e " - Client dependencies: ${GREEN}Already installed${NC}"
fi

# --- Start Services ---
echo -e "\n${BLUE}[4/4] Starting services concurrently...${NC}"

# PIDs of background processes
BACKEND_PID=""
CLIENT_PID=""

# Clean termination handler
cleanup() {
    echo -e "\n\n${YELLOW}==================================================${NC}"
    echo -e "${YELLOW}Stopping services and cleaning up background tasks...${NC}"
    
    if [ -n "$BACKEND_PID" ]; then
        echo -e "Stopping Backend (PID: $BACKEND_PID)..."
        kill "$BACKEND_PID" 2>/dev/null
    fi
    
    if [ -n "$CLIENT_PID" ]; then
        echo -e "Stopping Client (PID: $CLIENT_PID)..."
        kill "$CLIENT_PID" 2>/dev/null
    fi
    
    echo -e "${GREEN}All services stopped successfully.${NC}"
    echo -e "${YELLOW}==================================================${NC}"
    exit 0
}

# Catch interrupt signals
trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${BLUE}Starting Backend...${NC}"
dotnet run --project backend/Ecommerce.Api/Ecommerce.Api.csproj --launch-profile http &
BACKEND_PID=$!

# Wait briefly to let backend bind/start
sleep 2

# Start client
echo -e "${BLUE}Starting Client...${NC}"
npm run dev --prefix client &
CLIENT_PID=$!

echo -e "\n${GREEN}==================================================${NC}"
echo -e "${GREEN}Application is running successfully!${NC}"
echo -e " - ${BLUE}Client URL:${NC}  http://localhost:3000"
echo -e " - ${BLUE}Backend URL:${NC} http://localhost:5000"
echo -e "Press ${RED}Ctrl+C${NC} to stop both services."
echo -e "${GREEN}==================================================${NC}\n"

# Keep script running to monitor logs and intercept Ctrl+C
wait
