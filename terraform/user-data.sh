#!/bin/bash

# Log all output to a file for debugging
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "=========================================="
echo "TechStore EC2 Instance Setup Script"
echo "=========================================="
echo "Started at: $(date)"

# Update system
echo "Step 1: Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install required packages
echo "Step 2: Installing required packages..."
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
echo "Step 3: Adding Docker GPG key..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo "Step 4: Setting up Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list
apt-get update -y

# Install Docker
echo "Step 5: Installing Docker..."
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
echo "Step 6: Starting Docker service..."
systemctl start docker
systemctl enable docker

# Add ubuntu user to docker group
echo "Step 7: Configuring Docker permissions..."
usermod -aG docker ubuntu

# Install Docker Compose standalone
echo "Step 8: Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
echo "Step 9: Verifying installations..."
docker --version
docker-compose --version

# Create application directory
echo "Step 10: Creating application directory..."
mkdir -p /home/ubuntu/techstore
cd /home/ubuntu/techstore

# Create docker-compose.yml
echo "Step 11: Creating docker-compose.yml..."
cat > docker-compose.yml <<'EOF'
services:
  backend:
    image: lakithaviraj/techstore-backend:latest
    container_name: techstore-backend
    ports:
      - "3000:3000"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: lakithaviraj/techstore-frontend:latest
    container_name: techstore-frontend
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
    environment:
      - VITE_API_URL=http://localhost:3000
EOF

# Set correct ownership
chown -R ubuntu:ubuntu /home/ubuntu/techstore

# Pull Docker images
echo "Step 12: Pulling Docker images..."
docker pull lakithaviraj/techstore-backend:latest
docker pull lakithaviraj/techstore-frontend:latest

# Start the application
echo "Step 13: Starting TechStore application..."
cd /home/ubuntu/techstore
docker-compose up -d

# Wait for containers to be healthy
echo "Step 14: Waiting for application to be ready..."
sleep 30

# Check container status
echo "Step 15: Checking container status..."
docker ps

echo "=========================================="
echo "TechStore Setup Complete!"
echo "=========================================="
echo "Completed at: $(date)"
echo ""
echo "Application should be accessible at:"
echo "- Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "- Backend:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To check status: docker ps"
echo "=========================================="
