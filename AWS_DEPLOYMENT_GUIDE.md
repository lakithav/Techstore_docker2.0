# TechStore AWS Deployment Guide

Complete step-by-step guide to deploy your TechStore application on AWS EC2.

---

## Prerequisites

✅ AWS Account (free tier eligible)  
✅ Your Docker images on DockerHub (already done!)  
✅ Credit/Debit card for AWS verification (free tier available)  
✅ Basic terminal/SSH knowledge

---

## Table of Contents

1. [AWS Account Setup](#step-1-aws-account-setup)
2. [Create EC2 Instance](#step-2-create-ec2-instance)
3. [Connect to EC2 Instance](#step-3-connect-to-ec2-instance)
4. [Install Docker on EC2](#step-4-install-docker-on-ec2)
5. [Deploy Application](#step-5-deploy-application)
6. [Configure Security Groups](#step-6-configure-security-groups)
7. [Access Your Application](#step-7-access-your-application)
8. [Optional Enhancements](#optional-enhancements)
9. [Cost Management](#cost-management)
10. [Troubleshooting](#troubleshooting)

---

## Step 1: AWS Account Setup

### 1.1 Create AWS Account

1. **Go to**: https://aws.amazon.com
2. **Click**: "Create an AWS Account"
3. **Fill in details**:
   - Email address
   - Password
   - AWS account name
4. **Contact Information**:
   - Select "Personal" account type
   - Enter your details
5. **Payment Information**:
   - Add credit/debit card (won't be charged with free tier)
6. **Identity Verification**:
   - Verify phone number via SMS/call
7. **Select Support Plan**:
   - Choose "Basic Support - Free"
8. **Complete Sign Up**

### 1.2 Sign In to AWS Console

1. **Go to**: https://console.aws.amazon.com
2. **Sign in** with your email and password
3. You should see the AWS Management Console

---

## Step 2: Create EC2 Instance

### 2.1 Launch EC2 Instance

1. **Navigate to EC2**:
   - Search "EC2" in the top search bar
   - Click "EC2" (Virtual Servers in the Cloud)

2. **Click**: "Launch Instance" (orange button)

3. **Name Your Instance**:
   - Name: `TechStore-Server`

4. **Choose AMI (Amazon Machine Image)**:
   - **Select**: Ubuntu Server 24.04 LTS (Free tier eligible)
   - Architecture: 64-bit (x86)

5. **Choose Instance Type**:
   - **Select**: `t2.medium` or `t3.medium`
   - **Why**: Docker containers need at least 2GB RAM
   - ⚠️ Note: `t2.medium` is NOT free tier, costs ~$0.0464/hour (~$33/month)
   - For free tier: Use `t2.micro` but performance may be limited

6. **Key Pair (Login)**:
   - Click "Create new key pair"
   - Key pair name: `techstore-key`
   - Key pair type: RSA
   - Private key format: `.pem` (for Mac/Linux) or `.ppk` (for PuTTY on Windows)
   - Click "Create key pair"
   - **⚠️ IMPORTANT**: Save the `.pem` file securely - you can't download it again!

7. **Network Settings**:
   - ✅ Allow SSH traffic from: Anywhere (0.0.0.0/0)
   - ✅ Allow HTTP traffic from the internet
   - ✅ Allow HTTPS traffic from the internet

8. **Configure Storage**:
   - Root volume: `20 GB` gp3 (General Purpose SSD)
   - This should be sufficient for the application

9. **Advanced Details**:
   - Leave as default

10. **Review and Launch**:
    - Click "Launch instance"
    - Wait for instance to start (~2 minutes)

### 2.2 Note Your Instance Details

Once the instance is running:

- **Instance ID**: i-xxxxxxxxxx
- **Public IPv4 address**: XX.XX.XX.XX (this is your server IP)
- **Public IPv4 DNS**: ec2-xx-xx-xx-xx.compute-1.amazonaws.com

---

## Step 3: Connect to EC2 Instance

### 3.1 Connect via SSH (Windows - WSL or PowerShell)

1. **Move your key file to a safe location**:

   ```bash
   # Create .ssh directory if it doesn't exist
   mkdir -p ~/.ssh

   # Move the key file (replace path with your download location)
   mv ~/Downloads/techstore-key.pem ~/.ssh/

   # Set correct permissions (REQUIRED)
   chmod 400 ~/.ssh/techstore-key.pem
   ```

2. **Connect to EC2**:

   ```bash
   # Replace XX.XX.XX.XX with your EC2 Public IP
   ssh -i ~/.ssh/techstore-key.pem ubuntu@XX.XX.XX.XX
   ```

3. **Accept the connection**:
   - Type `yes` when prompted about authenticity

4. **You should see**:
   ```
   Welcome to Ubuntu 24.04 LTS
   ubuntu@ip-172-31-xx-xx:~$
   ```

### 3.2 Alternative: Connect via AWS Console (Browser-based)

1. **In EC2 Console**, select your instance
2. **Click**: "Connect" button (top right)
3. **Select**: "EC2 Instance Connect"
4. **Click**: "Connect"
5. Opens a browser-based terminal

---

## Step 4: Install Docker on EC2

### 4.1 Update System

```bash
# Update package list
sudo apt-get update

# Upgrade existing packages
sudo apt-get upgrade -y
```

### 4.2 Install Docker

```bash
# Install required packages
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list again
sudo apt-get update

# Install Docker Engine, CLI, and Docker Compose
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify Docker installation
docker --version
```

**Expected output**: `Docker version 27.x.x, build xxxxxxx`

### 4.3 Configure Docker Permissions

```bash
# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Apply group changes (logout and login again, or use newgrp)
newgrp docker

# Verify you can run docker without sudo
docker ps
```

### 4.4 Install Docker Compose (Standalone)

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

**Expected output**: `Docker Compose version v2.x.x`

---

## Step 5: Deploy Application

### 5.1 Create Project Directory

```bash
# Create application directory
mkdir -p ~/techstore
cd ~/techstore
```

### 5.2 Create docker-compose.yml

```bash
# Create docker-compose.yml file
nano docker-compose.yml
```

**Paste this content** (press Ctrl+Shift+V):

```yaml
services:
  # MongoDB Database
  mongodb:
    image: mongo:7
    container_name: techstore-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: techstore
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - techstore-network

  # Backend Service
  backend:
    image: lakithaviraj/techstore-backend:latest
    container_name: techstore-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/techstore?authSource=admin
    depends_on:
      - mongodb
    networks:
      - techstore-network

  # Frontend Service
  frontend:
    image: lakithaviraj/techstore-frontend:latest
    container_name: techstore-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - techstore-network

networks:
  techstore-network:
    driver: bridge

volumes:
  mongodb_data:
    driver: local
  mongodb_config:
    driver: local
```

**Save and exit**:

- Press `Ctrl + O` (to save)
- Press `Enter` (confirm filename)
- Press `Ctrl + X` (to exit)

### 5.3 Create nginx.conf (for frontend)

```bash
# Create nginx configuration
nano nginx.conf
```

**Paste this content**:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

**Save and exit**: `Ctrl + O`, `Enter`, `Ctrl + X`

### 5.4 Pull and Start Containers

```bash
# Pull latest images from DockerHub
docker pull lakithaviraj/techstore-backend:latest
docker pull lakithaviraj/techstore-frontend:latest

# Start all containers
docker-compose up -d

# Check container status
docker-compose ps
```

**Expected output**:

```
NAME                  IMAGE                                    STATUS
techstore-mongodb     mongo:7                                  Up
techstore-backend     lakithaviraj/techstore-backend:latest    Up
techstore-frontend    lakithaviraj/techstore-frontend:latest   Up
```

### 5.5 Verify Deployment

```bash
# Check backend logs
docker-compose logs backend

# You should see:
# "Connected to MongoDB successfully"
# "Database seeded successfully"
# "serving on port 5000"

# Check frontend logs
docker-compose logs frontend

# Test backend API locally on EC2
curl http://localhost:5000/api/products

# Should return JSON with 5 products
```

---

## Step 6: Configure Security Groups

### 6.1 Open Required Ports

1. **Go to EC2 Console**: https://console.aws.amazon.com/ec2/

2. **Select your instance**: Click on your `TechStore-Server`

3. **Click**: "Security" tab

4. **Click**: Your security group (sg-xxxxxxxxxx)

5. **Click**: "Edit inbound rules"

6. **Add these rules** (click "Add rule" for each):

   | Type       | Protocol | Port Range | Source    | Description            |
   | ---------- | -------- | ---------- | --------- | ---------------------- |
   | SSH        | TCP      | 22         | 0.0.0.0/0 | SSH access             |
   | HTTP       | TCP      | 80         | 0.0.0.0/0 | Frontend               |
   | Custom TCP | TCP      | 5000       | 0.0.0.0/0 | Backend API            |
   | Custom TCP | TCP      | 3000       | 0.0.0.0/0 | Frontend (alternative) |

7. **Click**: "Save rules"

---

## Step 7: Access Your Application

### 7.1 Get Your Public IP

```bash
# On EC2 instance, run:
curl http://checkip.amazonaws.com
```

Or get it from AWS Console:

- EC2 → Instances → Select your instance
- Copy "Public IPv4 address"

### 7.2 Access the Application

**Frontend**:

- Open browser: `http://YOUR_EC2_PUBLIC_IP`
- Should see TechStore with all 5 products

**Backend API**:

- `http://YOUR_EC2_PUBLIC_IP:5000/api/products`
- Should return JSON array of products

**Debug Endpoint**:

- `http://YOUR_EC2_PUBLIC_IP:5000/api/debug/db`
- Shows database contents

### 7.3 Test Features

- ✅ Products display on homepage
- ✅ Click on products to view details
- ✅ Add products to cart
- ✅ View cart drawer
- ✅ Browse by categories

---

## Optional Enhancements

### Option 1: Use Custom Domain Name

1. **Buy a domain** (e.g., from Namecheap, GoDaddy, Route53)

2. **Configure DNS**:
   - Add an `A` record pointing to your EC2 Public IP
   - Example: `techstore.yourdomain.com` → `54.123.45.67`

3. **Update nginx.conf**:
   - Change `server_name _;` to `server_name techstore.yourdomain.com;`

4. **Restart frontend**:
   ```bash
   docker-compose restart frontend
   ```

### Option 2: Add SSL/HTTPS with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

### Option 3: Use Elastic IP (Static IP)

1. **EC2 Console** → **Elastic IPs** → **Allocate Elastic IP address**
2. **Associate** the Elastic IP with your instance
3. Your IP will remain the same even if you stop/start the instance

### Option 4: Setup Auto-Deployment from GitHub

Create a deployment script on EC2:

```bash
# Create deploy script
nano ~/techstore/deploy.sh
```

```bash
#!/bin/bash
cd ~/techstore

# Pull latest images
docker pull lakithaviraj/techstore-backend:latest
docker pull lakithaviraj/techstore-frontend:latest

# Restart containers
docker-compose down
docker-compose up -d

echo "Deployment complete!"
```

```bash
# Make executable
chmod +x ~/techstore/deploy.sh

# Run deployment
~/techstore/deploy.sh
```

### Option 5: Use Amazon RDS for MongoDB

Instead of running MongoDB in a container, use AWS DocumentDB (MongoDB-compatible):

1. **Create DocumentDB Cluster** in AWS Console
2. **Update docker-compose.yml** with DocumentDB connection string
3. **Remove** MongoDB container from docker-compose.yml

### Option 6: Use Application Load Balancer

For high availability and SSL termination:

1. **Create Application Load Balancer**
2. **Configure target groups** for frontend and backend
3. **Add SSL certificate** from AWS Certificate Manager
4. **Update security groups**

---

## Cost Management

### Free Tier Limits

- **EC2**: 750 hours/month of `t2.micro` (first 12 months)
- **EBS**: 30 GB of General Purpose SSD storage
- **Data Transfer**: 1 GB out per month

### Cost Estimate (Using t2.medium)

- **t2.medium EC2**: ~$33/month (~$0.0464/hour)
- **20 GB EBS Storage**: ~$2/month
- **Data Transfer**: $0.09/GB after first 1GB
- **Elastic IP** (if not attached): $0.005/hour (~$3.60/month)

**Total**: ~$35-40/month

### Cost Saving Tips

1. **Stop instance when not in use**:

   ```bash
   # Stop instance (keeps data, stops charges for compute)
   aws ec2 stop-instances --instance-ids i-xxxxxxxxxx

   # Start instance
   aws ec2 start-instances --instance-ids i-xxxxxxxxxx
   ```

2. **Use t2.micro for testing** (free tier eligible but slower)

3. **Setup billing alerts**:
   - AWS Console → Billing → Budgets
   - Create budget alert for $10

4. **Use Reserved Instances** for long-term (cheaper than on-demand)

---

## Monitoring and Maintenance

### Check Application Health

```bash
# SSH into EC2
ssh -i ~/.ssh/techstore-key.pem ubuntu@YOUR_EC2_IP

# Check container status
docker-compose ps

# Check logs
docker-compose logs -f

# Check resource usage
docker stats

# Check disk space
df -h
```

### Update Application

```bash
# Pull latest images
docker pull lakithaviraj/techstore-backend:latest
docker pull lakithaviraj/techstore-frontend:latest

# Restart with new images
docker-compose down
docker-compose up -d
```

### Backup MongoDB Data

```bash
# Backup MongoDB
docker exec techstore-mongodb mongodump \
  --username admin \
  --password password123 \
  --authenticationDatabase admin \
  --out /backup

# Copy backup to EC2
docker cp techstore-mongodb:/backup ~/mongodb-backup

# Download to local machine (run from local terminal)
scp -i ~/.ssh/techstore-key.pem -r ubuntu@YOUR_EC2_IP:~/mongodb-backup ./
```

---

## Troubleshooting

### Issue: Cannot connect to EC2 via SSH

**Solution**:

```bash
# Check key permissions
chmod 400 ~/.ssh/techstore-key.pem

# Verify security group allows SSH (port 22) from your IP

# Try verbose mode
ssh -v -i ~/.ssh/techstore-key.pem ubuntu@YOUR_EC2_IP
```

### Issue: Website not accessible

**Solution**:

1. Check security group has port 80 open
2. Verify containers are running: `docker-compose ps`
3. Check nginx logs: `docker-compose logs frontend`

### Issue: "No products found"

**Solution**:

```bash
# Check backend logs
docker-compose logs backend

# Should see "Connected to MongoDB successfully"

# Check MongoDB is running
docker-compose ps mongodb

# Restart backend
docker-compose restart backend
```

### Issue: Out of disk space

**Solution**:

```bash
# Clean up unused Docker images
docker system prune -a

# Check disk usage
df -h

# Remove old containers
docker container prune
```

### Issue: High memory usage

**Solution**:

```bash
# Check resource usage
docker stats

# Restart containers
docker-compose restart

# Consider upgrading to larger instance type
```

---

## Security Best Practices

### 1. Change MongoDB Password

Edit `docker-compose.yml`:

```yaml
MONGO_INITDB_ROOT_PASSWORD: YOUR_STRONG_PASSWORD_HERE
MONGODB_URI: mongodb://admin:YOUR_STRONG_PASSWORD_HERE@mongodb:27017/techstore?authSource=admin
```

### 2. Restrict SSH Access

In Security Group:

- Change SSH source from `0.0.0.0/0` to `YOUR_IP/32`

### 3. Setup Firewall (UFW)

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 5000  # Backend API
sudo ufw enable
```

### 4. Regular Updates

```bash
# Update system packages weekly
sudo apt-get update && sudo apt-get upgrade -y

# Update Docker images monthly
docker pull lakithaviraj/techstore-backend:latest
docker pull lakithaviraj/techstore-frontend:latest
docker-compose up -d
```

---

## Next Steps

After successful deployment:

1. ✅ **Test the application** thoroughly
2. ✅ **Setup domain name** (optional)
3. ✅ **Add SSL certificate** for HTTPS
4. ✅ **Configure monitoring** (CloudWatch)
5. ✅ **Setup automated backups**
6. ✅ **Create CI/CD pipeline** to EC2
7. ✅ **Add analytics** (Google Analytics)

---

## Quick Reference Commands

```bash
# SSH to EC2
ssh -i ~/.ssh/techstore-key.pem ubuntu@YOUR_EC2_IP

# View all containers
docker-compose ps

# View logs
docker-compose logs -f

# Restart application
docker-compose restart

# Stop application
docker-compose down

# Start application
docker-compose up -d

# Update application
docker pull lakithaviraj/techstore-backend:latest
docker pull lakithaviraj/techstore-frontend:latest
docker-compose up -d

# Check system resources
docker stats
df -h
free -h
```

---

## Support Resources

- **AWS Documentation**: https://docs.aws.amazon.com
- **Docker Documentation**: https://docs.docker.com
- **MongoDB Documentation**: https://docs.mongodb.com
- **AWS Free Tier**: https://aws.amazon.com/free
- **AWS Support**: https://console.aws.amazon.com/support

---

## Congratulations! 🎉

Your TechStore application is now live on AWS!

**Share your deployment**:

- URL: `http://YOUR_EC2_PUBLIC_IP`
- DockerHub: https://hub.docker.com/u/lakithaviraj
- GitHub: https://github.com/lakithav/Techstore_docker2.0

You've successfully:

- ✅ Deployed a full-stack MERN application
- ✅ Used Docker and Docker Compose
- ✅ Configured AWS EC2
- ✅ Setup CI/CD pipeline with Jenkins
- ✅ Published Docker images to DockerHub

Great work! 🚀
