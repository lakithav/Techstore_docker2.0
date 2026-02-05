pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        BACKEND_IMAGE = "lakithaviraj/techstore_mern-backend"
        FRONTEND_IMAGE = "lakithaviraj/techstore_mern-frontend"
        TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/lakithav/Techstore_docker2.0.git'
            }
        }

        stage('Build and Push Images') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKERHUB_CREDENTIALS) {
                        // Use docker.inside to run build and push commands in a container with correct permissions
                        docker.image('docker:latest').inside('--user root') {
                            // Build Backend
                            sh "docker build -t ${BACKEND_IMAGE}:${TAG} -f Dockerfile.backend ."
                            
                            // Push Backend
                            sh "docker push ${BACKEND_IMAGE}:${TAG}"

                            // Build Frontend
                            sh "docker build -t ${FRONTEND_IMAGE}:${TAG} -f Dockerfile.frontend ."

                            // Push Frontend
                            sh "docker push ${FRONTEND_IMAGE}:${TAG}"
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                // Your deployment steps will go here
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}
