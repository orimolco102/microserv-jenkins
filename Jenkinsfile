pipeline {
    agent any

    stages {

        stage('checkout') {
            steps {
                echo "pull from the cloud"
                checkout scm
            }
        }

        stage('install & test API') {
            steps {
                dir('API') {
                    bat 'npm install'
                    bat 'node --test --experimental-test-coverage --test-coverage-lines=80'
                }
            }
        }

        stage('install & test Web') {
            steps {
                dir('Front') {
                    bat 'npm install'
                    bat 'node --test --experimental-test-coverage --test-coverage-lines=80'
                }
            }
        }

        stage('Integration test') {
            steps {
                dir('integration_test') {
                    bat 'node --test'
                }
            }
        }



        stage('Deploy to dev') {
            when {
                branch 'dev'
            }
            steps{
                echo 'Deploying to branch dev'
                script {
                    env.API_BUILDNUM = "${BUILD_NUMBER}"
                    env.API_COMMNUM = bat (script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.WEB_BUILDNUM = "${BUILD_NUMBER}"
                    env.WEB_COMMNUM = env.API_COMMNUM
                }
                bat 'docker compose -f docker-compose.dev.yml build'
            }
        }

        stage('Deploy to master') {
            when {
                branch 'master'
            }
            steps {
                echo 'Deploying to prod'
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    bat '''
                        echo %DOCKER_PASS%| docker login -u %DOCKER_USER% --password-stdin
                        docker build -t %DOCKER_USER%/web-app:%BUILD_NUMBER% -t %DOCKER_USER%/web-app:latest ./Front
                        docker build -t %DOCKER_USER%/api-service:%BUILD_NUMBER% -t %DOCKER_USER%/api-service:latest ./API
                        docker push %DOCKER_USER%/web-app:%BUILD_NUMBER%
                        docker push %DOCKER_USER%/web-app:latest
                        docker push %DOCKER_USER%/api-service:%BUILD_NUMBER%
                        docker push %DOCKER_USER%/api-service:latest
                    '''
                }    
            }
        }

        stage('Deploy to EC2') {
            when {
                branch 'master'
            }
            steps {
                sshagent(['ec2-deploy-key']) {
                    scp -o StrictHostKeyChecking=no docker-compose.prod.yml deploy@51.20.105.107:~/docker-compose.prod.yml
                    bat 'ssh -o StrictHostKeyChecking=no deploy@51.20.105.107 "docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d --remove-orphans"'
                }
            }
        }
    }
    

    post {
    always {
        echo "Pipeline finished execution."
    }
    success {
        echo "Build succeeded!"
    }
    failure {
        echo "Build failed. Check logs immediately."
    }
    }
}