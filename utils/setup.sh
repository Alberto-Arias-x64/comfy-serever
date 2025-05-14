#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run this script as root (sudo)"
    exit 1
fi

# Update system
print_message "Updating system..."
apt update && apt upgrade -y

# Install curl
print_message "Installing curl..."
apt install -y curl

# Install git
print_message "Installing git..."
apt install -y git

# Install python
print_message "Installing python..."
apt install -y \
  make build-essential libssl-dev zlib1g-dev \
  libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
  libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev \
  libffi-dev liblzma-dev
apt install python3-venv -y
apt install python3-tk -y

## Install Cuda
# print_message "Installing Cuda..."
# apt install ubuntu-drivers-common -y
# ubuntu-drivers devices
# ubuntu-drivers autoinstall
# wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.1-1_all.deb
# dpkg -i cuda-keyring_1.1-1_all.deb
# apt-get update
# apt-get -y install cuda-toolkit-12-4

# Install node
print_message "Installing node..."
curl -o- https://fnm.vercel.app/install | bash
fnm install 22

#install pm2
print_message "Installing pm2..."
npm install pm2 -g
pm2 completion install

# Create working directory
print_message "Creating working directory..."
mkdir -p /home/flux
cd /home/flux

# Setup Server
print_message "Setting up Server..."
git clone https://github.com/Alberto-Arias-x64/comfy-serever.git server
cd server
npm install

# Setup ComfyUI
print_message "Setting up ComfyUI..."
chmod +x /home/flux/server/utils/setup_comfy.sh
/home/flux/server/utils/setup_comfy.sh

print_message "Installation complete!"