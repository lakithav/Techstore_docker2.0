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
                // Replace this with the URL to your git repository
                git 'https://your-git-repository-url.git'
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
                
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}
