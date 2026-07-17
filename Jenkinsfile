pipeline {
    agent any

    environment {
        REGISTRY = 'ghcr.io/your-org'
        INVENTORY_IMAGE = "${REGISTRY}/inventory-service"
        DISPATCH_IMAGE = "${REGISTRY}/dispatch-service"
        CONSOLE_IMAGE = "${REGISTRY}/argcord-console"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    def changes = sh(script: 'git diff --name-only HEAD~1', returnStdout: true).trim()
                    env.BUILD_INVENTORY = changes.contains('services/inventory-service') ? 'true' : 'false'
                    env.BUILD_DISPATCH = changes.contains('services/dispatch-service') ? 'true' : 'false'
                    env.BUILD_CONSOLE = changes.contains('console/') ? 'true' : 'false'
                    env.BUILD_INFRA = changes.contains('infrastructure/') ? 'true' : 'false'
                }
            }
        }

        stage('Test Inventory Service') {
            when { environment name: 'BUILD_INVENTORY', value: 'true' }
            steps {
                dir('services/inventory-service') {
                    sh 'npm ci'
                    sh 'npm test'
                }
            }
        }

        stage('Test Dispatch Service') {
            when { environment name: 'BUILD_DISPATCH', value: 'true' }
            steps {
                dir('services/dispatch-service') {
                    sh 'npm ci'
                    sh 'npm test'
                }
            }
        }

        stage('Test Console') {
            when { environment name: 'BUILD_CONSOLE', value: 'true' }
            steps {
                dir('console') {
                    sh 'npm ci'
                    sh 'npm test -- --passWithNoTests'
                }
            }
        }

        stage('Build & Push Images') {
            parallel {
                stage('Inventory Image') {
                    when { environment name: 'BUILD_INVENTORY', value: 'true' }
                    steps {
                        dir('services/inventory-service') {
                            sh "docker build -t ${INVENTORY_IMAGE}:${BUILD_NUMBER} -t ${INVENTORY_IMAGE}:latest ."
                            sh "docker push ${INVENTORY_IMAGE}:${BUILD_NUMBER}"
                            sh "docker push ${INVENTORY_IMAGE}:latest"
                        }
                    }
                }
                stage('Dispatch Image') {
                    when { environment name: 'BUILD_DISPATCH', value: 'true' }
                    steps {
                        dir('services/dispatch-service') {
                            sh "docker build -t ${DISPATCH_IMAGE}:${BUILD_NUMBER} -t ${DISPATCH_IMAGE}:latest ."
                            sh "docker push ${DISPATCH_IMAGE}:${BUILD_NUMBER}"
                            sh "docker push ${DISPATCH_IMAGE}:latest"
                        }
                    }
                }
                stage('Console Image') {
                    when { environment name: 'BUILD_CONSOLE', value: 'true' }
                    steps {
                        dir('console') {
                            sh "docker build -t ${CONSOLE_IMAGE}:${BUILD_NUMBER} -t ${CONSOLE_IMAGE}:latest ."
                            sh "docker push ${CONSOLE_IMAGE}:${BUILD_NUMBER}"
                            sh "docker push ${CONSOLE_IMAGE}:latest"
                        }
                    }
                }
            }
        }

        stage('Update K8s Manifests') {
            steps {
                script {
                    if (env.BUILD_INVENTORY == 'true') {
                        sh """
                            sed -i 's|${INVENTORY_IMAGE}:.*|${INVENTORY_IMAGE}:${BUILD_NUMBER}|' \
                                infrastructure/k8s/base/deployments.yaml
                        """
                    }
                    if (env.BUILD_DISPATCH == 'true') {
                        sh """
                            sed -i 's|${DISPATCH_IMAGE}:.*|${DISPATCH_IMAGE}:${BUILD_NUMBER}|' \
                                infrastructure/k8s/base/deployments.yaml
                        """
                    }
                    // Commit updated manifests — ArgoCD will detect and sync
                    sh '''
                        git config user.email "jenkins@logistics.local"
                        git config user.name "Jenkins CI"
                        git add infrastructure/k8s/
                        git diff --cached --quiet || git commit -m "ci: update images to build ${BUILD_NUMBER}"
                        git push origin main
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline complete. ArgoCD will auto-sync the new images."
        }
        failure {
            echo "Pipeline failed. Check logs above."
        }
    }
}
