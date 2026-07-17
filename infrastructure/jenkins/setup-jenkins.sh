#!/bin/bash
# Install Jenkins on AWS EC2 t2.micro (free tier)
# Run: ssh -i key.pem ubuntu@<ip> < setup-jenkins.sh

set -e

echo "=== Installing Jenkins on AWS Free Tier ==="

# Java
sudo apt-get update
sudo apt-get install -y openjdk-17-jre-headless

# Jenkins
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install -y jenkins

# Docker (for building images)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker jenkins
sudo usermod -aG docker ubuntu

# Node.js 20 (for running tests)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Start Jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins

# Get initial admin password
echo ""
echo "=== Jenkins Installed ==="
echo "URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
echo "Initial password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
