#!/bin/bash
# EduSaaS Kubernetes Deployment Script

set -e

NAMESPACE="edusaas"
REGISTRY="edusaas"
TAG="${1:-latest}"

echo "=========================================="
echo "EduSaaS Platform - K8s Deployment"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    command -v kubectl >/dev/null 2>&1 || { log_error "kubectl not found"; exit 1; }
    command -v helm >/dev/null 2>&1 || { log_warn "helm not found, some features may not work"; }
    
    log_info "Prerequisites check passed"
}

# Create namespace
create_namespace() {
    log_info "Creating namespace: $NAMESPACE"
    kubectl apply -f k8s/namespace-secrets.yaml
}

# Build and push images
build_images() {
    log_info "Building Docker images..."
    
    # Build backend
    log_info "Building backend image..."
    docker build -t $REGISTRY/backend:$TAG ./backend
    docker push $REGISTRY/backend:$TAG
    
    # Build frontend
    log_info "Building frontend image..."
    docker build -t $REGISTRY/frontend:$TAG ./frontend
    docker push $REGISTRY/frontend:$TAG
    
    log_info "Images built and pushed successfully"
}

# Deploy databases
deploy_databases() {
    log_info "Deploying databases..."
    kubectl apply -f k8s/database.yaml
    log_info "Waiting for databases to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s
}

# Deploy backend
deploy_backend() {
    log_info "Deploying backend..."
    sed "s/latest/$TAG/g" k8s/backend-deployment.yaml | kubectl apply -f -
    log_info "Waiting for backend to be ready..."
    kubectl wait --for=condition=available deployment/edusaas-backend -n $NAMESPACE --timeout=600s
}

# Deploy frontend
deploy_frontend() {
    log_info "Deploying frontend..."
    sed "s/latest/$TAG/g" k8s/frontend-ingress.yaml | kubectl apply -f -
    log_info "Waiting for frontend to be ready..."
    kubectl wait --for=condition=available deployment/edusaas-frontend -n $NAMESPACE --timeout=600s
}

# Deploy monitoring (optional)
deploy_monitoring() {
    if [ "$DEPLOY_MONITORING" = "true" ]; then
        log_info "Deploying monitoring stack..."
        kubectl apply -f k8s/monitoring/
    fi
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Check pods
    kubectl get pods -n $NAMESPACE
    
    # Check services
    kubectl get svc -n $NAMESPACE
    
    log_info "Health check completed"
}

# Rollback function
rollback() {
    log_warn "Rolling back to previous version..."
    kubectl rollout undo deployment/edusaas-backend -n $NAMESPACE
    kubectl rollout undo deployment/edusaas-frontend -n $NAMESPACE
}

# Main deployment
main() {
    check_prerequisites
    
    case "$1" in
        deploy)
            create_namespace
            deploy_databases
            deploy_backend
            deploy_frontend
            health_check
            log_info "Deployment completed successfully!"
            ;;
        update)
            build_images
            deploy_backend
            deploy_frontend
            health_check
            log_info "Update completed successfully!"
            ;;
        rollback)
            rollback
            ;;
        delete)
            log_warn "Deleting all resources..."
            kubectl delete namespace $NAMESPACE
            ;;
        *)
            echo "Usage: $0 {deploy|update|rollback|delete}"
            echo ""
            echo "  deploy    - Full deployment"
            echo "  update    - Build and update images"
            echo "  rollback  - Rollback to previous version"
            echo "  delete    - Delete all resources"
            exit 1
            ;;
    esac
}

main "$@"