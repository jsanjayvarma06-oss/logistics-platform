# Logistics Platform — Microservices

A free-tier logistics platform with inventory management, dispatch planning, and auto-deploy per client.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Argcord   │────▶│  API Gateway │────▶│   Inventory Svc  │ ──▶ Neon (PostgreSQL)
│   Console   │     │  (Render)    │────▶│   Dispatch Svc   │ ──▶ MongoDB Atlas
└─────────────┘     └──────────────┘     └─────────────────┘
       │                                        │
       │            ┌──────────────┐             │
       └───────────▶│   Supabase   │◀────────────┘
                    │  (Auth + RT) │
                    └──────────────┘
                           │
                    ┌──────────────┐
                    │ Upstash Kafka│  (async events)
                    └──────────────┘
```

## Stack

| Layer        | Tool              | Free Tier                     |
|-------------|-------------------|-------------------------------|
| Compute     | Render + AWS      | Free web svcs + t2.micro      |
| DB (Inventory) | Neon           | 512MB PostgreSQL              |
| DB (Dispatch)  | MongoDB Atlas  | 512MB shared cluster          |
| Auth + RT   | Supabase          | 500MB + auth + realtime       |
| Messaging   | Upstash Kafka     | 10K msg/day                   |
| CI          | Jenkins           | Self-hosted on AWS             |
| CD/GitOps   | ArgoCD            | Self-hosted on K3s             |
| IaC         | Terraform         | CLI free                      |
| Monitoring  | Grafana Cloud     | Free tier                     |
| Frontend    | Render/Vercel     | Free tier                     |

## Services

- **inventory-service** — Stock, warehouses, SKUs, inbound/outbound
- **dispatch-service** — Orders, route planning, driver assignment, delivery
- **console** — Argcord dashboard (React)

## Quick Start

```bash
# Install dependencies
cd services/inventory-service && npm install
cd ../dispatch-service && npm install
cd ../../console && npm install

# Run locally with docker-compose
docker-compose up
```

## Auto-Deploy (Per Client)

```bash
cd infrastructure/terraform
terraform init
terraform apply -var="client_name=acme" -var="environment=prod"
```
