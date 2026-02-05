pipeline {
    agent any

    environment {
        // DockerHub credentials (configured in Jenkins)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        DOCKERHUB_USERNAME = 'lakithaviraj'
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/techstore-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/techstore-frontend"
        MONGODB_IMAGE = "mongo:7"
        TAG = "${BUILD_NUMBER}"
        LATEST_TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo 'Building backend Docker image...'
                    sh """
                        docker build -t ${BACKEND_IMAGE}:${TAG} \
                                     -t ${BACKEND_IMAGE}:${LATEST_TAG} \
                                     -f Dockerfile.backend .
                    """
                    
                    echo 'Building frontend Docker image...'
                    sh """
                        docker build -t ${FRONTEND_IMAGE}:${TAG} \
                                     -t ${FRONTEND_IMAGE}:${LATEST_TAG} \
                                     -f Dockerfile.frontend .
                    """
                }
            }
        }

        stage('Test Images') {
            steps {
                script {
                    echo 'Testing Docker images...'
                    // Verify images were built successfully
                    sh "docker images | grep ${DOCKERHUB_USERNAME}/techstore"
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                script {
                    echo 'Logging into DockerHub...'
                    sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                    
                    echo 'Pushing backend images...'
                    sh """
                        docker push ${BACKEND_IMAGE}:${TAG}
                        docker push ${BACKEND_IMAGE}:${LATEST_TAG}
                    """
                    
                    echo 'Pushing frontend images...'
                    sh """
                        docker push ${FRONTEND_IMAGE}:${TAG}
                        docker push ${FRONTEND_IMAGE}:${LATEST_TAG}
                    """
                }
            }
        }

        stage('Cleanup Local Images') {
            steps {
                script {
                    echo 'Cleaning up local Docker images...'
                    sh """
                        docker rmi ${BACKEND_IMAGE}:${TAG} || true
                        docker rmi ${FRONTEND_IMAGE}:${TAG} || true
                    """
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying application with Docker Compose...'
                    // Stop existing containers
                    sh 'docker compose down || true'
                    
                    // Pull latest images from DockerHub
                    sh """
                        docker pull ${BACKEND_IMAGE}:${LATEST_TAG}
                        docker pull ${FRONTEND_IMAGE}:${LATEST_TAG}
                    """
                    
                    // Start containers with docker-compose
                    sh 'docker compose up -d'
                    
                    // Wait for services to be healthy
                    sleep(time: 10, unit: 'SECONDS')
                    
                    // Check container status
                    sh 'docker compose ps'
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    echo 'Verifying deployment...'
                    sh '''
                        echo "Checking backend health..."
                        curl -f http://localhost:5000/api/debug/db || echo "Backend check failed"
                        
                        echo "Checking frontend..."
                        curl -f http://localhost:3000 || echo "Frontend check failed"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo "Backend Image: ${BACKEND_IMAGE}:${TAG}"
            echo "Frontend Image: ${FRONTEND_IMAGE}:${TAG}"
        }
        failure {
            echo '❌ Pipeline failed!'
            sh 'docker compose logs || true'
        }
        always {
            echo 'Logging out from DockerHub...'
            sh 'docker logout || true'
        }
    }
}
