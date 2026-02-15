# TechStore - AWS Deployment with Terraform

Complete guide to deploy TechStore on AWS EC2 using Terraform (Infrastructure as Code).

---

## 🖥️ Your Environment Setup

**You're using Ubuntu/WSL with:**
- ✅ AWS CLI installed (`aws-cli/2.31.32`)
- ✅ Docker installed on Ubuntu/WSL
- ✅ Terraform to be installed on Ubuntu/WSL

**All commands in this guide should be run in your WSL terminal!**

---

## 🎯 What This Does

This Terraform configuration will automatically:
- ✅ Create a VPC with public subnet
- ✅ Set up Internet Gateway and routing
- ✅ Create security groups with proper firewall rules
- ✅ Launch an EC2 instance (t2.medium Ubuntu)
- ✅ Assign an Elastic IP (static IP address)
- ✅ Install Docker and Docker Compose on EC2
- ✅ Deploy your TechStore application
- ✅ Configure everything to start on boot

**Time to deploy**: ~10-15 minutes (mostly automated!)

---

## ⚡ Quick Start (4 Commands)

**Already have AWS CLI and Docker on WSL? Start here:**

```bash
# 1. Install Terraform (one-time)
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt-get update && sudo apt-get install -y terraform

# 2. Configure AWS (one-time)
aws configure  # Enter your AWS Access Key and Secret Key

# 3. Generate SSH key (one-time)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/techstore-key -N ""

# 4. Navigate to project and deploy
cd /mnt/d/Semester\ 05/EC5207_Devops/project3.0/TechStore_docker2.0/terraform
terraform init
terraform apply
```

Type `yes` when prompted. Wait ~10 minutes. Your app will be live! 🎉

**For detailed explanation, continue reading below.**

---

## 📋 Prerequisites

### 1. AWS Account
- Active AWS account (free tier eligible)
- Credit/debit card added for verification

### 2. AWS CLI & Credentials ✅ (Already Installed!)

**You already have AWS CLI installed!** Just configure your credentials.

**⚠️ SECURITY WARNING**: 
- **DO NOT use root user access keys!** 
- AWS will show you a warning if you try to create root user keys
- Instead, create an IAM user with limited permissions (safer)

**Open WSL terminal and run:**
```bash
aws configure
```

You'll be prompted for:
- **AWS Access Key ID**: From IAM user (see below)
- **AWS Secret Access Key**: From IAM user (see below)
- **Default region**: `us-east-1` (recommended)
- **Default output format**: `json` (press Enter for default)

**How to get AWS credentials (IMPORTANT - Security Best Practice):**

**DO NOT use root user credentials!** Instead, create an IAM user:

1. **Go to IAM Console**:
   - Visit https://console.aws.amazon.com
   - Search for "IAM" in the search bar
   - Click "IAM" (Identity and Access Management)

2. **Create IAM User**:
   - Click "Users" in the left sidebar
   - Click "Create user" (or "Add users")
   - Username: `terraform-user` (or any name you prefer)
   - Click "Next"

3. **Set Permissions**:
   - Select "Attach policies directly"
   - Search and select these policies:
     - ✅ `AmazonEC2FullAccess` (for managing EC2 instances)
     - ✅ `AmazonVPCFullAccess` (for managing networking)
   - Click "Next"

4. **Create User**:
   - Review and click "Create user"

5. **Create Access Key**:
   - Click on the newly created user
   - Go to "Security credentials" tab
   - Scroll to "Access keys" section
   - Click "Create access key"
   - Select "Command Line Interface (CLI)"
   - Check "I understand the above recommendation"
   - Click "Next"
   - (Optional) Add description: "Terraform deployment"
   - Click "Create access key"

6. **Save Credentials** (⚠️ IMPORTANT):
   - **Copy the Access Key ID**
   - **Copy the Secret Access Key**
   - Click "Download .csv file" (backup)
   - ⚠️ **You cannot view the secret key again after this!**

7. **Use these credentials in `aws configure`**

**Verify configuration:**
```bash
aws sts get-caller-identity
```
If configured correctly, this shows your IAM user details (not root).

### 3. Terraform Installation

**Install Terraform on Ubuntu/WSL:**

```bash
# Add HashiCorp GPG key
wget -O- https://apt.releases.hashicorp.com/gpg | \
    gpg --dearmor | \
    sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg

# Add HashiCorp repository
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
    https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
    sudo tee /etc/apt/sources.list.d/hashicorp.list

# Update and install Terraform
sudo apt-get update
sudo apt-get install -y terraform
```

**Verify installation:**
```bash
terraform version
```

Expected output: `Terraform v1.x.x`

### 4. SSH Key Pair

Generate an SSH key pair to access your EC2 instance.

**In WSL terminal:**
```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh

# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/techstore-key -N ""
```

This creates:
- `~/.ssh/techstore-key` (private key - keep this secure!)
- `~/.ssh/techstore-key.pub` (public key - uploaded to AWS)

**Set correct permissions:**
```bash
chmod 400 ~/.ssh/techstore-key
```

**Important**: Never share your private key!

---

## 🚀 Deployment Steps

### Step 1: Open WSL and Navigate to Project Directory

**Open WSL terminal, then:**

```bash
# Navigate to your project (Windows D: drive is at /mnt/d in WSL)
cd /mnt/d/Semester\ 05/EC5207_Devops/project3.0/TechStore_docker2.0

# Verify you're in the right place
pwd
ls -la
```

You should see `terraform/` directory listed.

### Step 2: Review Variables (Optional)

Check the Terraform variables and customize if needed:

**Default values (already configured for WSL):**
- `aws_region`: `us-east-1`
- `instance_type`: `t2.medium` (~$33/month)
- `key_name`: `techstore-key`
- `public_key_path`: `~/.ssh/techstore-key.pub`

**To use free tier (slower):**
```bash
# Edit variables file
nano terraform/variables.tf

# Change instance_type default from "t2.medium" to "t2.micro"
# Save and exit (Ctrl+X, Y, Enter)
```

### Step 3: Initialize Terraform

```bash
cd terraform
terraform init
```

This will:
- Download AWS provider plugin
- Initialize backend
- Prepare working directory

**Expected output**: `Terraform has been successfully initialized!`

### Step 4: Review the Deployment Plan

```bash
terraform plan
```

This shows what Terraform will create:
- VPC, subnet, Internet Gateway
- Security groups
- EC2 instance
- Elastic IP
- SSH key pair

**Review carefully** - make sure everything looks correct!

### Step 5: Deploy to AWS

```bash
terraform apply
```

**You'll be prompted**: `Do you want to perform these actions?`
- Type: `yes`
- Press Enter

**Wait 5-10 minutes** for AWS to:
1. Create all infrastructure
2. Launch EC2 instance
3. Install Docker
4. Deploy your application

### Step 6: Get Your Application URLs

After deployment completes, Terraform will display:

```
Outputs:

backend_api_url = "http://XX.XX.XX.XX:3000"
frontend_url = "http://XX.XX.XX.XX"
instance_id = "i-xxxxxxxxx"
instance_public_ip = "XX.XX.XX.XX"
ssh_command = "ssh -i ~/.ssh/techstore-key ubuntu@XX.XX.XX.XX"
```

**Save these values!** Your application is now live.

---

## 🌐 Access Your Application

### Get Your Application URLs

**In WSL terminal:**
```bash
cd /mnt/d/Semester\ 05/EC5207_Devops/project3.0/TechStore_docker2.0/terraform
terraform output
```

This shows all your URLs and connection details.

### Frontend (Main Website)
Open in your Windows browser:
```
http://YOUR_PUBLIC_IP
```

### Backend API
```
http://YOUR_PUBLIC_IP:3000
```

### SSH into Server

**From WSL terminal:**
```bash
ssh -i ~/.ssh/techstore-key ubuntu@YOUR_PUBLIC_IP
```

**Note**: It may take 2-3 minutes after deployment for the application to be fully ready.

---

## 📊 Verify Deployment

### Check if Application is Running

```bash
# SSH into your instance
ssh -i ~/.ssh/techstore-key ubuntu@YOUR_PUBLIC_IP

# Check Docker containers
docker ps

# Expected output: 2 containers running
# - techstore-backend
# - techstore-frontend

# Check application logs
cd ~/techstore
docker-compose logs -f

# Check user-data script log
sudo cat /var/log/user-data.log
```

---

## 🔄 Update Your Application

If you update your Docker images on DockerHub:

```bash
# SSH into instance
ssh -i ~/.ssh/techstore-key ubuntu@YOUR_PUBLIC_IP

# Navigate to app directory
cd ~/techstore

# Pull latest images
docker-compose pull

# Restart containers
docker-compose up -d

# Verify
docker ps
```

---

## 🛑 Destroy Infrastructure (Cleanup)

**⚠️ WARNING**: This will permanently delete all AWS resources and data!

```bash
cd terraform
terraform destroy
```

Type `yes` to confirm.

This will:
- Terminate EC2 instance
- Delete VPC and networking
- Remove security groups
- Release Elastic IP
- Delete SSH key pair from AWS

**Cost savings**: Use this when you're done to avoid charges!

---

## 💰 Cost Estimate

### Resources Created:
- **EC2 t2.medium**: ~$0.0464/hour (~$33/month)
- **Elastic IP**: Free while attached
- **Storage (20GB)**: ~$2/month
- **Data transfer**: First 100GB free/month

**Total monthly estimate**: ~$35/month

**Cost-saving tips**:
1. Use `t2.micro` for testing (free tier, but slower)
2. Stop instance when not in use (still charges for storage)
3. Destroy completely when done: `terraform destroy`

---

## 🔧 Troubleshooting

### Issue: "Error creating EC2 Key Pair"

**Solution**: Your public key file might not exist.

```bash
# In WSL, check if key exists
ls ~/.ssh/techstore-key.pub

# If not, generate it
ssh-keygen -t rsa -b 4096 -f ~/.ssh/techstore-key -N ""
chmod 400 ~/.ssh/techstore-key
```

### Issue: "command not found: terraform"

**Solution**: Terraform not installed or not in PATH.

```bash
# Verify installation
terraform version

# If not installed, install it
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt-get update && sudo apt-get install -y terraform
```

### Issue: "Root user access keys are not recommended" warning

**This is correct!** AWS is protecting you from a security risk.

**Solution**: Create an IAM user instead of using root user credentials.

```bash
# Follow the IAM user creation steps in the Prerequisites section
# Then use the IAM user's access keys for aws configure
```

**Why this matters:**
- Root user has unlimited access to everything (dangerous if compromised)
- IAM users have limited permissions (follows principle of least privilege)
- You can delete/rotate IAM user keys without affecting your root account

### Issue: "Unable to locate credentials"

**Solution**: AWS credentials not configured.

```bash
# Configure AWS credentials
aws configure

# Verify configuration
aws sts get-caller-identity
```

### Issue: Can't find project directory in WSL

**Solution**: Windows drives are mounted at `/mnt/` in WSL.

```bash
# Windows D: drive is at /mnt/d in WSL
cd /mnt/d/Semester\ 05/EC5207_Devops/project3.0/TechStore_docker2.0

# Note: Escape spaces with backslash or use quotes
cd "/mnt/d/Semester 05/EC5207_Devops/project3.0/TechStore_docker2.0"
```

### Issue: "InvalidAMIID.NotFound"

**Solution**: Change AWS region in `variables.tf` or use different region:

```bash
terraform apply -var="aws_region=us-west-2"
```

### Issue: Application not accessible after deployment

**Solutions**:
1. **Wait 2-3 minutes** - instance needs time to start and deploy
2. **Check security group** - should allow ports 80, 443, 3000
3. **SSH and check logs**:
   ```bash
   ssh -i ~/.ssh/techstore-key ubuntu@YOUR_PUBLIC_IP
   sudo cat /var/log/user-data.log
   docker-compose logs
   ```

### Issue: "Error acquiring the state lock"

**Solution**: Another Terraform process is running or crashed.

```bash
# Force unlock (use with caution)
terraform force-unlock LOCK_ID
```

### Issue: Container health check failing

**Solution**: Backend might need more time to start.

```bash
# SSH into instance
ssh -i ~/.ssh/techstore-key ubuntu@YOUR_PUBLIC_IP

# Check backend logs
docker logs techstore-backend

# Restart if needed
cd ~/techstore
docker-compose restart backend
```

---

## 📝 Terraform Commands Reference

**All commands run from WSL terminal in terraform directory:**

```bash
# Navigate to terraform directory first
cd /mnt/d/Semester\ 05/EC5207_Devops/project3.0/TechStore_docker2.0/terraform

# Initialize Terraform
terraform init

# Format Terraform files
terraform fmt

# Validate configuration
terraform validate

# Plan deployment (preview)
terraform plan

# Apply changes
terraform apply

# Apply without confirmation prompt
terraform apply -auto-approve

# Show current state
terraform show

# List all resources
terraform state list

# Get output values
terraform output

# Get specific output
terraform output instance_public_ip

# Destroy all resources
terraform destroy

# Destroy without confirmation
terraform destroy -auto-approve
```

---

## 🔐 Security Best Practices

1. **SSH Key Protection**:
   - Never commit private keys to Git
   - Set proper permissions: `chmod 400 ~/.ssh/techstore-key`

2. **AWS Credentials**:
   - Never hardcode in Terraform files
   - Use AWS CLI configuration or environment variables
   - Consider using IAM roles for production

3. **Security Groups**:
   - Current config allows global access (0.0.0.0/0)
   - For production, restrict to your IP:
     ```hcl
     cidr_blocks = ["YOUR_IP/32"]
     ```

4. **Terraform State**:
   - Contains sensitive data
   - For teams, use remote backend (S3 + DynamoDB)
   - Never commit `terraform.tfstate` to Git

---

## 🎓 Learning Resources

- **Terraform AWS Provider**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- **AWS EC2 Documentation**: https://docs.aws.amazon.com/ec2/
- **Terraform Tutorials**: https://learn.hashicorp.com/terraform

---

## 🆚 Terraform vs Manual Deployment

| Feature | Terraform | Manual |
|---------|-----------|--------|
| **Setup Time** | 10-15 min | 30-45 min |
| **Reproducibility** | ✅ Perfect | ❌ Error-prone |
| **Destroy/Recreate** | One command | Manual cleanup |
| **Documentation** | Code is docs | Need separate docs |
| **Version Control** | ✅ Git-friendly | ❌ Not trackable |
| **Learning Curve** | Moderate | Easy |
| **Multi-Environment** | ✅ Easy | ❌ Tedious |
| **Team Collaboration** | ✅ Excellent | ❌ Difficult |

---

## 📂 Files Created

```
terraform/
├── main.tf              # Main infrastructure configuration
├── variables.tf         # Input variables (customizable)
├── outputs.tf          # Output values after deployment
└── user-data.sh        # Automated setup script for EC2
```

---

## ✅ Success Checklist

**Before deployment:**

- [ ] AWS account created and verified
- [ ] AWS CLI configured: `aws sts get-caller-identity` works
- [ ] Terraform installed: `terraform version` shows version
- [ ] SSH key generated: `ls ~/.ssh/techstore-key.pub` shows file
- [ ] In project directory: `pwd` shows correct path

**After running `terraform apply`:**

- [ ] Terraform completed without errors
- [ ] Outputs displayed with IP address
- [ ] Frontend accessible at `http://YOUR_IP` (wait 2-3 minutes)
- [ ] Backend API accessible at `http://YOUR_IP:3000`
- [ ] Can SSH into instance from WSL: `ssh -i ~/.ssh/techstore-key ubuntu@YOUR_IP`
- [ ] Docker containers running: SSH to server, run `docker ps` shows 2 containers
- [ ] No errors in logs: `docker-compose logs` shows no critical errors

---

## 📝 Complete Deployment Steps Summary

**Run all commands in WSL terminal:**

1. **Configure AWS** (one-time):
   ```bash
   aws configure
   ```

2. **Install Terraform** (one-time):
   ```bash
   wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
   echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
   sudo apt-get update && sudo apt-get install -y terraform
   ```

3. **Generate SSH key** (one-time):
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/techstore-key -N ""
   chmod 400 ~/.ssh/techstore-key
   ```

4. **Deploy to AWS**:
   ```bash
   cd /mnt/d/Semester\ 05/EC5207_Devops/project3.0/TechStore_docker2.0/terraform
   terraform init
   terraform plan
   terraform apply
   # Type 'yes' when prompted
   ```

5. **Get your app URL**:
   ```bash
   terraform output frontend_url
   ```

6. **Access in browser**: Open the URL shown above

7. **When done, cleanup**:
   ```bash
   terraform destroy
   # Type 'yes' when prompted
   ```

---

## 🎉 Next Steps

1. **Access your live application** at the provided URL
2. **Test all features** (browse products, add to cart, etc.)
3. **Monitor AWS costs** in AWS Console → Billing
4. **Consider enhancements**:
   - Add domain name (Route 53)
   - Add SSL certificate (Let's Encrypt)
   - Set up CloudWatch monitoring
   - Configure auto-scaling
   - Add load balancer for high availability

---

## 📞 Need Help?

If you encounter issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review Terraform error messages carefully
3. Check AWS CloudWatch logs
4. Verify AWS credentials and permissions
5. Ensure your SSH key pair is correctly configured

---

**Happy Deploying! 🚀**
