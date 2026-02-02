# TechStore MERN - Docker Setup

This project has been dockerized with separate containers for frontend, backend, and MongoDB.

## 🐳 Docker Images

- **Backend**: Node.js 20 Alpine-based image
- **Frontend**: Nginx Alpine-based image serving static build
- **Database**: MongoDB 7

## 🚀 Quick Start

### Prerequisites
- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)

### Build and Run

1. **Build all containers:**
   ```bash
   docker-compose build
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - MongoDB: mongodb://admin:password123@localhost:27017

### Stop Services

```bash
docker-compose down
```

To remove volumes as well:
```bash
docker-compose down -v
```

## 📦 Individual Container Commands

### Backend Only
```bash
# Build
docker build -t techstore-backend -f Dockerfile.backend .

# Run
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://admin:password123@mongodb:27017/techstore \
  techstore-backend
```

### Frontend Only
```bash
# Build
docker build -t techstore-frontend -f Dockerfile.frontend .

# Run
docker run -p 80:80 techstore-frontend
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file from `.env.docker.example`:
```bash
cp .env.docker.example .env
```

Update the following variables:
- `MONGODB_URI`: MongoDB connection string
- `SESSION_SECRET`: Secret key for session management
- `PORT`: Backend server port (default: 5000)

### MongoDB Configuration

Default credentials (change in production):
- Username: `admin`
- Password: `password123`
- Database: `techstore`

## 📊 Monitoring

### Check container status
```bash
docker-compose ps
```

### View resource usage
```bash
docker stats
```

### Access container shell
```bash
# Backend
docker exec -it techstore-backend sh

# Frontend
docker exec -it techstore-frontend sh

# MongoDB
docker exec -it techstore-mongodb mongosh
```

## 🔄 Development Workflow

1. Make changes to your code
2. Rebuild the affected service:
   ```bash
   docker-compose build backend  # or frontend
   ```
3. Restart the service:
   ```bash
   docker-compose up -d backend  # or frontend
   ```

## 🛠️ Troubleshooting

### Ports already in use
If ports 80, 5000, or 27017 are already in use, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Frontend
  - "5001:5000"  # Backend
  - "27018:27017"  # MongoDB
```

### MongoDB connection issues
Ensure MongoDB is fully started before backend:
```bash
docker-compose up mongodb
# Wait for "Waiting for connections" message
docker-compose up backend
```

### Clear all data and restart
```bash
docker-compose down -v
docker-compose up -d
```

## 📝 Production Deployment

For production deployment:

1. Update `.env` file with production values
2. Change MongoDB credentials in `docker-compose.yml`
3. Use a managed MongoDB service (MongoDB Atlas) instead of local container
4. Set up SSL/TLS certificates for HTTPS
5. Configure proper firewall rules
6. Enable logging and monitoring

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP
       ↓
┌─────────────┐
│  Frontend   │
│  (Nginx)    │──┐
└─────────────┘  │
                 │ API Requests
                 ↓
            ┌─────────────┐
            │   Backend   │
            │  (Node.js)  │
            └──────┬──────┘
                   │
                   ↓
            ┌─────────────┐
            │  MongoDB    │
            └─────────────┘
```

## 🔐 Security Notes

- Change default MongoDB credentials before production deployment
- Update SESSION_SECRET with a strong random value
- Use environment-specific .env files
- Never commit .env files to version control
- Implement rate limiting for API endpoints
- Use HTTPS in production with proper SSL certificates
