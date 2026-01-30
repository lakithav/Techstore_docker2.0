pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        BACKEND_IMAGE = "lakithaviraj/techstore-backend"
        FRONTEND_IMAGE = "lakithaviraj/techstore-frontend"
        TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    docker.build(BACKEND_IMAGE, "-f Dockerfile.backend .")
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    docker.build(FRONTEND_IMAGE, "-f Dockerfile.frontend .")
                }
            }
        }

        stage('Push Backend Image') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKERHUB_CREDENTIALS) {
                        docker.image(BACKEND_IMAGE).push(TAG)
                    }
                }
            }
        }

        stage('Push Frontend Image') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKERHUB_CREDENTIALS) {
                        docker.image(FRONTEND_IMAGE).push(TAG)
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                // This is a placeholder for your deployment steps.
                // You would typically use kubectl, helm, or another tool to deploy to your cluster.
                // Example: sh 'kubectl apply -f kubernetes/'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}
