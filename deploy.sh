#!/bin/bash

# TechStore AWS Deployment Helper Script
# This script provides shortcuts for common Terraform operations

set -e

TERRAFORM_DIR="terraform"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  TechStore AWS Deployment Script${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

check_prerequisites() {
    echo -e "${GREEN}Checking prerequisites...${NC}"
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}Error: Terraform is not installed${NC}"
        echo "Install from: https://www.terraform.io/downloads"
        exit 1
    fi
    echo "✓ Terraform installed: $(terraform version -json | grep -o '"terraform_version":"[^"]*' | cut -d'"' -f4)"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}Warning: AWS CLI is not installed${NC}"
        echo "Install from: https://aws.amazon.com/cli/"
    else
        echo "✓ AWS CLI installed"
    fi
    
    # Check SSH key
    if [ ! -f ~/.ssh/techstore-key.pub ]; then
        echo -e "${RED}Warning: SSH public key not found at ~/.ssh/techstore-key.pub${NC}"
        echo "Generate with: ssh-keygen -t rsa -b 4096 -f ~/.ssh/techstore-key -N \"\""
    else
        echo "✓ SSH key found"
    fi
    
    echo ""
}

deploy() {
    print_header
    check_prerequisites
    
    echo -e "${GREEN}Starting deployment...${NC}"
    cd $TERRAFORM_DIR
    
    # Initialize
    echo -e "${BLUE}Step 1: Initializing Terraform...${NC}"
    terraform init
    
    # Plan
    echo -e "${BLUE}Step 2: Creating deployment plan...${NC}"
    terraform plan -out=tfplan
    
    # Apply
    echo -e "${BLUE}Step 3: Applying configuration...${NC}"
    terraform apply tfplan
    
    # Show outputs
    echo ""
    echo -e "${GREEN}Deployment complete!${NC}"
    echo -e "${BLUE}Application URLs:${NC}"
    terraform output
    
    cd ..
}

destroy() {
    print_header
    
    echo -e "${RED}WARNING: This will destroy all AWS resources!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "Aborted."
        exit 0
    fi
    
    cd $TERRAFORM_DIR
    terraform destroy
    cd ..
    
    echo -e "${GREEN}Resources destroyed.${NC}"
}

status() {
    print_header
    
    cd $TERRAFORM_DIR
    echo -e "${BLUE}Current infrastructure:${NC}"
    terraform show
    cd ..
}

outputs() {
    print_header
    
    cd $TERRAFORM_DIR
    echo -e "${BLUE}Deployment outputs:${NC}"
    terraform output
    cd ..
}

ssh_connect() {
    print_header
    
    cd $TERRAFORM_DIR
    IP=$(terraform output -raw instance_public_ip 2>/dev/null)
    
    if [ -z "$IP" ]; then
        echo -e "${RED}Error: No instance deployed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Connecting to EC2 instance...${NC}"
    ssh -i ~/.ssh/techstore-key ubuntu@$IP
    cd ..
}

show_help() {
    print_header
    
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  deploy    - Deploy TechStore to AWS"
    echo "  destroy   - Destroy all AWS resources"
    echo "  status    - Show current infrastructure status"
    echo "  outputs   - Show deployment outputs (IPs, URLs)"
    echo "  ssh       - SSH into the EC2 instance"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh deploy    # Deploy to AWS"
    echo "  ./deploy.sh outputs   # View application URLs"
    echo "  ./deploy.sh ssh       # Connect to server"
    echo "  ./deploy.sh destroy   # Clean up resources"
    echo ""
}

# Main script logic
case "$1" in
    deploy)
        deploy
        ;;
    destroy)
        destroy
        ;;
    status)
        status
        ;;
    outputs)
        outputs
        ;;
    ssh)
        ssh_connect
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        show_help
        ;;
esac
