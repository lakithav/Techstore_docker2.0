pipeline {
    agent {
        docker {
            image 'docker:latest'
            args '-v /var/run/docker.sock:/var/run/docker.sock -v /tmp:/tmp'
            // Run as the root user within the container to have necessary permissions
            // and set a HOME directory to avoid permission issues with .docker config
            customWorkspace '/tmp'
            args '--user root -e HOME=/tmp'
        }
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        BACKEND_IMAGE = "lakithaviraj/techstore_mern-backend"
        FRONTEND_IMAGE = "lakithaviraj/techstore_mern-frontend"
        TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout the main branch of the repository
                git branch: 'main', url: 'https://github.com/lakithav/Techstore_docker2.0.git'
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
