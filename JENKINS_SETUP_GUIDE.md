# Jenkins CI/CD Pipeline Setup Guide

## Prerequisites

✅ Jenkins installed and running  
✅ Docker installed on Jenkins server  
✅ DockerHub account (username: lakithaviraj)  
✅ GitHub repository with your code

---

## Step 1: Configure DockerHub Credentials in Jenkins

1. **Login to Jenkins** (usually http://localhost:8080)

2. **Navigate to Credentials**
   - Click: `Manage Jenkins` → `Manage Credentials`
   - Click on `(global)` domain
   - Click `Add Credentials`

3. **Add DockerHub Credentials**
   - **Kind**: Username with password
   - **Scope**: Global
   - **Username**: `lakithaviraj` (your DockerHub username)
   - **Password**: [Your DockerHub password or access token]
   - **ID**: `dockerhub` (IMPORTANT: Must match Jenkinsfile)
   - **Description**: DockerHub credentials
   - Click `Create`

### How to Get DockerHub Access Token (Recommended over password):

1. Login to https://hub.docker.com
2. Click your profile → Account Settings → Security
3. Click "New Access Token"
4. Name: "Jenkins CI/CD"
5. Permissions: Read, Write, Delete
6. Copy the token and use it as the password in Jenkins

---

## Step 2: Add Jenkins User to Docker Group

On your Jenkins server, run:

```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins service
sudo systemctl restart jenkins

# Verify jenkins can run docker
sudo -u jenkins docker ps
```

**For Windows with WSL:**

```bash
wsl sudo usermod -aG docker jenkins
wsl sudo systemctl restart jenkins || wsl sudo service jenkins restart
```

---

## Step 3: Create Jenkins Pipeline Job

1. **Create New Item**
   - Click `New Item` on Jenkins dashboard
   - Enter name: `TechStore-Docker-Pipeline`
   - Select: `Pipeline`
   - Click `OK`

2. **Configure Pipeline**

   **General Section:**
   - ✅ Check `GitHub project`
   - Project URL: `https://github.com/lakithav/Techstore_docker2.0/`

   **Build Triggers:**
   - ✅ Check `GitHub hook trigger for GITScm polling` (for automatic builds)
   - OR ✅ Check `Poll SCM` and set schedule: `H/5 * * * *` (check every 5 minutes)

   **Pipeline Section:**
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/lakithav/Techstore_docker2.0.git`
   - **Credentials**: (Add your GitHub credentials if private repo)
   - **Branch**: `*/main`
   - **Script Path**: `Jenkinsfile`

3. **Save** the configuration

---

## Step 4: Install Required Jenkins Plugins

1. **Go to**: `Manage Jenkins` → `Manage Plugins`

2. **Install these plugins** (if not already installed):
   - Docker Pipeline
   - Docker Commons Plugin
   - Git Plugin
   - Pipeline Plugin
   - Credentials Binding Plugin

3. **Restart Jenkins** after installation

---

## Step 5: Push Your Code to GitHub

```bash
# Navigate to your project directory
cd "D:\Semester 05\EC5207_Devops\project3.0\TechStore_docker2.0"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Updated Jenkinsfile for CI/CD pipeline"

# Add remote (if not already added)
git remote add origin https://github.com/lakithav/Techstore_docker2.0.git

# Push to main branch
git push -u origin main
```

---

## Step 6: Manually Push Initial Images to DockerHub (Optional)

Before running the pipeline, you can manually push your working images:

```bash
# Tag your current images
docker tag techstore_docker20-backend:latest lakithaviraj/techstore-backend:latest
docker tag techstore_docker20-frontend:latest lakithaviraj/techstore-frontend:latest

# Login to DockerHub
docker login

# Push images
docker push lakithaviraj/techstore-backend:latest
docker push lakithaviraj/techstore-frontend:latest
```

---

## Step 7: Run the Jenkins Pipeline

1. **Go to your pipeline job**: `TechStore-Docker-Pipeline`

2. **Click**: `Build Now`

3. **Monitor the build**:
   - Click on the build number (e.g., #1)
   - Click `Console Output` to see live logs
   - Or click `Pipeline Steps` for stage-by-stage view

4. **Pipeline Stages**:
   - ✅ Checkout (pulls code from GitHub)
   - ✅ Build Docker Images (builds backend & frontend)
   - ✅ Test Images (verifies images exist)
   - ✅ Push to DockerHub (pushes to your DockerHub repo)
   - ✅ Cleanup Local Images (saves disk space)
   - ✅ Deploy (runs docker compose)
   - ✅ Verify Deployment (checks if services are running)

---

## Step 8: Verify Deployment

After successful pipeline execution:

### Check Docker Images on DockerHub:

1. Visit: https://hub.docker.com/u/lakithaviraj
2. You should see:
   - `lakithaviraj/techstore-backend`
   - `lakithaviraj/techstore-frontend`

### Check Local Deployment:

```bash
# Check running containers
docker compose ps

# Check logs
docker compose logs

# Test backend
curl http://localhost:5000/api/debug/db

# Test frontend
curl http://localhost:3000
```

### Access Application:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/products
- **Debug Endpoint**: http://localhost:5000/api/debug/db

---

## Step 9: Setup GitHub Webhook (Automated Builds)

For automatic pipeline triggers when you push code:

1. **Go to GitHub Repository**:
   - https://github.com/lakithav/Techstore_docker2.0

2. **Settings** → **Webhooks** → **Add webhook**

3. **Configure Webhook**:
   - **Payload URL**: `http://YOUR_JENKINS_URL/github-webhook/`
     - Example: `http://192.168.1.100:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Which events**: Just the push event
   - ✅ Active
   - Click `Add webhook`

**Note**: Jenkins must be accessible from the internet or use ngrok for local Jenkins:

```bash
ngrok http 8080
# Use the ngrok URL in webhook
```

---

## Troubleshooting

### Issue: "docker: command not found" in Jenkins

**Solution**: Ensure Docker is installed and jenkins user has permissions:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue: "Permission denied" when accessing docker.sock

**Solution**:

```bash
sudo chmod 666 /var/run/docker.sock
# OR
sudo chown jenkins:docker /var/run/docker.sock
```

### Issue: "Credentials not found"

**Solution**: Check the credential ID in Jenkinsfile matches Jenkins:

- Jenkinsfile: `credentials('dockerhub')`
- Jenkins Credentials ID must be: `dockerhub`

### Issue: Pipeline fails at "Push to DockerHub"

**Solution**:

1. Verify DockerHub credentials are correct
2. Manually test: `docker login` on Jenkins server
3. Check DockerHub repository names match

### Issue: "Port already in use"

**Solution**:

```bash
docker compose down
docker ps -a  # Check for orphaned containers
docker rm -f $(docker ps -aq)  # Remove all containers
```

---

## Pipeline Environment Variables

You can customize these in the Jenkinsfile:

```groovy
environment {
    DOCKERHUB_USERNAME = 'lakithaviraj'  // Change to your username
    BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/techstore-backend"
    FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/techstore-frontend"
    TAG = "${BUILD_NUMBER}"  // Each build gets unique tag
    LATEST_TAG = "latest"    // Also tag as latest
}
```

---

## What Happens on Each Build?

1. **Checkout**: Pulls latest code from GitHub main branch
2. **Build**: Creates Docker images for backend and frontend
3. **Test**: Verifies images were created successfully
4. **Push**: Uploads images to DockerHub with build number and 'latest' tags
5. **Cleanup**: Removes old images to save disk space
6. **Deploy**: Stops old containers, pulls new images, starts fresh containers
7. **Verify**: Tests if backend and frontend are responding

---

## Next Steps

1. ✅ Setup Jenkins credentials
2. ✅ Create pipeline job
3. ✅ Push code to GitHub
4. ✅ Run first build
5. ✅ Setup GitHub webhook for automated builds
6. 🎉 Enjoy automated CI/CD!

---

## Useful Commands

```bash
# View Jenkins logs
sudo journalctl -u jenkins -f

# Check Docker on Jenkins server
sudo -u jenkins docker ps
sudo -u jenkins docker images

# Restart Jenkins
sudo systemctl restart jenkins

# View pipeline logs
# Go to Jenkins → Your Job → Build Number → Console Output
```

---

## Docker Compose Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Rebuild and restart
docker compose up -d --build

# Pull latest images from DockerHub
docker compose pull
```

---

## Success Checklist

- [ ] DockerHub credentials added to Jenkins
- [ ] Jenkins user added to docker group
- [ ] Required plugins installed
- [ ] Pipeline job created and configured
- [ ] Code pushed to GitHub
- [ ] First build successful
- [ ] Images visible on DockerHub
- [ ] Application running on localhost:3000
- [ ] GitHub webhook configured (optional)

---

## Support

If you encounter issues:

1. Check Jenkins Console Output for detailed errors
2. Verify Docker is running: `docker ps`
3. Check DockerHub credentials are correct
4. Ensure GitHub repository URL is correct
5. Review Jenkinsfile syntax for typos
