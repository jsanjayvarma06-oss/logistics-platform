terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Free tier: local backend. Move to S3 when ready.
  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "aws" {
  region = var.aws_region
}

# --- Variables ---

variable "aws_region" {
  default = "ap-south-1" # Mumbai — closest to Hyderabad
}

variable "client_name" {
  description = "Client/tenant identifier for auto-deploy"
  type        = string
}

variable "environment" {
  description = "Environment: dev, staging, prod"
  type        = string
  default     = "dev"
}

variable "inventory_image" {
  default = "ghcr.io/your-org/inventory-service:latest"
}

variable "dispatch_image" {
  default = "ghcr.io/your-org/dispatch-service:latest"
}

# --- Networking (free tier) ---

resource "aws_default_vpc" "main" {}

resource "aws_security_group" "services" {
  name        = "${var.client_name}-${var.environment}-sg"
  description = "Allow HTTP and SSH"
  vpc_id      = aws_default_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3001
    to_port     = 3002
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name   = "${var.client_name}-${var.environment}"
    Client = var.client_name
    Env    = var.environment
  }
}

# --- EC2 Free Tier Instance (K3s node) ---

resource "aws_instance" "k3s_node" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro" # Free tier
  vpc_security_group_ids = [aws_security_group.services.id]
  key_name               = "${var.client_name}-key"

  user_data = <<-EOF
    #!/bin/bash
    set -e

    # Install K3s (lightweight Kubernetes)
    curl -sfL https://get.k3s.io | sh -

    # Wait for K3s
    sleep 30

    # Install ArgoCD
    kubectl create namespace argocd || true
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

    # Expose ArgoCD (NodePort for free tier — no LB cost)
    kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort", "ports": [{"port": 443, "nodePort": 30443}]}}'

    # Create namespace for services
    kubectl create namespace ${var.client_name}-${var.environment} || true

    echo "K3s + ArgoCD installed for ${var.client_name}"
  EOF

  tags = {
    Name   = "${var.client_name}-${var.environment}-k3s"
    Client = var.client_name
    Env    = var.environment
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# --- Outputs ---

output "instance_ip" {
  value = aws_instance.k3s_node.public_ip
}

output "argocd_url" {
  value = "https://${aws_instance.k3s_node.public_ip}:30443"
}

output "ssh_command" {
  value = "ssh -i ${var.client_name}-key.pem ubuntu@${aws_instance.k3s_node.public_ip}"
}
