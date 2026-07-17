#!/bin/bash
# Setup Grafana Cloud monitoring agent on K3s nodes
# Free tier: 10K metrics, 50GB logs, 50GB traces

set -e

GRAFANA_CLOUD_API_KEY="${1:?"Usage: $0 <grafana_cloud_api_key>"}"
GRAFANA_CLOUD_STACK="${2:?"Usage: $0 <api_key> <stack_name>"}"

echo "=== Setting up Grafana Agent ==="

# Install Grafana Alloy (replaces Grafana Agent)
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: alloy-config
  namespace: monitoring
data:
  config.alloy: |
    // Scrape K8s pods with prometheus.io annotations
    prometheus.scrape "pods" {
      targets = discovery.kubernetes.pods.targets
      forward_to = [prometheus.remote_write.grafana_cloud.receiver]
    }

    discovery.kubernetes "pods" {
      role = "pod"
    }

    // Ship to Grafana Cloud
    prometheus.remote_write "grafana_cloud" {
      endpoint {
        url = "https://prometheus-${GRAFANA_CLOUD_STACK}.grafana.net/api/prom/push"
        basic_auth {
          username = "${GRAFANA_CLOUD_STACK}"
          password = "${GRAFANA_CLOUD_API_KEY}"
        }
      }
    }

    // Collect logs
    loki.source.kubernetes "pods" {
      targets = discovery.kubernetes.pods.targets
      forward_to = [loki.write.grafana_cloud.receiver]
    }

    loki.write "grafana_cloud" {
      endpoint {
        url = "https://logs-${GRAFANA_CLOUD_STACK}.grafana.net/loki/api/v1/push"
        basic_auth {
          username = "${GRAFANA_CLOUD_STACK}"
          password = "${GRAFANA_CLOUD_API_KEY}"
        }
      }
    }
EOF

echo "✓ Grafana Cloud monitoring configured"
echo "  Dashboard: https://${GRAFANA_CLOUD_STACK}.grafana.net"
