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
                script {
                    env.API_COMMNUM = bat(script: '@git rev-parse --short HEAD', returnStdout: true).trim()
                    env.WEB_COMMNUM = env.API_COMMNUM
                }
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    bat '''
                        echo %DOCKER_PASS%| docker login -u %DOCKER_USER% --password-stdin
                        docker build --build-arg WEB_BUILDNUM=%BUILD_NUMBER% --build-arg WEB_COMMNUM=%WEB_COMMNUM% -t %DOCKER_USER%/web-app:%BUILD_NUMBER% -t %DOCKER_USER%/web-app:latest ./Front
                        docker build --build-arg API_BUILDNUM=%BUILD_NUMBER% --build-arg API_COMMNUM=%API_COMMNUM% -t %DOCKER_USER%/api-service:%BUILD_NUMBER% -t %DOCKER_USER%/api-service:latest ./API
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
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-deploy-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    bat '''
                        icacls "%SSH_KEY%" /inheritance:r
                        icacls "%SSH_KEY%" /grant:r %USERNAME%:F
                    '''
        
                    retry(5) {
                        bat '''
                            scp -4 -o StrictHostKeyChecking=no -o ConnectTimeout=15 -i "%SSH_KEY%" docker-compose.prod.yml %SSH_USER%@51.20.105.107:~/docker-compose.prod.yml
                            scp -4 -o StrictHostKeyChecking=no -o ConnectTimeout=15 -i "%SSH_KEY%" deploy.sh %SSH_USER%@51.20.105.107:~/deploy.sh
                            ssh -4 -o StrictHostKeyChecking=no -o ConnectTimeout=15 -i "%SSH_KEY%" %SSH_USER%@51.20.105.107 "rm -rf ~/nginx"
                            scp -4 -o StrictHostKeyChecking=no -r -o ConnectTimeout=15 -i "%SSH_KEY%" nginx %SSH_USER%@51.20.105.107:~/nginx
                        '''
                    }
        
                    script {
                        retry(5) {
                            try {
                                bat '''
                                    ssh -4 -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -o ServerAliveCountMax=10 -o ConnectTimeout=15 -i "%SSH_KEY%" %SSH_USER%@51.20.105.107 "tr -d '\\r' < ~/deploy.sh > ~/deploy_fixed.sh && mv ~/deploy_fixed.sh ~/deploy.sh && chmod +x ~/deploy.sh && cd ~ && ./deploy.sh"
                                '''
                            } catch (e) {
                                sleep(time: 20, unit: 'SECONDS')
                                throw e
                            }
                        }
                    }
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
        echo "Build failed. Check logs immediately!"
    }
    }
}