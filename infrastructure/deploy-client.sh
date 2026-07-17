#!/bin/bash
# Auto-deploy a new client environment
# Usage: ./deploy-client.sh <client_name> <environment>

set -e

CLIENT_NAME=${1:?"Usage: $0 <client_name> <environment>"}
ENVIRONMENT=${2:-"prod"}

echo "=== Deploying ${CLIENT_NAME} (${ENVIRONMENT}) ==="

cd "$(dirname "$0")/terraform"

# Create client workspace
terraform workspace new "${CLIENT_NAME}-${ENVIRONMENT}" 2>/dev/null || \
  terraform workspace select "${CLIENT_NAME}-${ENVIRONMENT}"

# Generate SSH key for the instance
if [ ! -f "${CLIENT_NAME}-key.pem" ]; then
  aws ec2 create-key-pair \
    --key-name "${CLIENT_NAME}-key" \
    --query 'KeyMaterial' \
    --output text > "${CLIENT_NAME}-key.pem"
  chmod 400 "${CLIENT_NAME}-key.pem"
fi

# Deploy infrastructure
terraform init
terraform apply \
  -var="client_name=${CLIENT_NAME}" \
  -var="environment=${ENVIRONMENT}" \
  -auto-approve

# Get outputs
INSTANCE_IP=$(terraform output -raw instance_ip)
ARGOCD_URL=$(terraform output -raw argocd_url)

echo ""
echo "=== Deployment Complete ==="
echo "Instance IP:  ${INSTANCE_IP}"
echo "ArgoCD URL:   ${ARGOCD_URL}"
echo "SSH:          ssh -i ${CLIENT_NAME}-key.pem ubuntu@${INSTANCE_IP}"
echo ""
echo "Next: Apply ArgoCD applications with:"
echo "  kubectl apply -f ../argocd/applications/${CLIENT_NAME}-${ENVIRONMENT}.yaml"
