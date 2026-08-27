pipeline {
    agent any

    stages {

        stage('install & test API') {
            steps {
                dir('API') {
                    sh 'npm install'
                    sh 'node --test --experimental-test-coverage --test-coverage-line=80'
                }
            }
        }

        stage('install & test Web') {
            steps {
                dir('Front') {
                    sh 'npm install'
                    sh 'node --test --experimental-test-coverage --test-coverage-lines=80'
                }
            }
        }

        stage('Integration test') {
            steps {
                dir('integration_test') {
                    sh 'node --test'
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'master'
            }
            steps {
                echo 'blue-green'
            }
        }
    }
}