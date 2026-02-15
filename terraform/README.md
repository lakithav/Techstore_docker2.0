# TechStore Terraform Configuration

This directory contains Terraform configuration files for deploying TechStore to AWS.

## Quick Start

```bash
# 1. Initialize Terraform
terraform init

# 2. Review what will be created
terraform plan

# 3. Deploy to AWS
terraform apply

# 4. When done, destroy resources
terraform destroy
```

## Files

- **main.tf**: Main infrastructure configuration (VPC, EC2, security groups)
- **variables.tf**: Input variables with defaults
- **outputs.tf**: Outputs displayed after deployment
- **user-data.sh**: Bootstrap script that runs on EC2 instance startup

## Requirements

- Terraform >= 1.0
- AWS CLI configured with credentials
- SSH key pair at `~/.ssh/techstore-key.pub`

## Complete Guide

See [TERRAFORM_DEPLOYMENT_GUIDE.md](../TERRAFORM_DEPLOYMENT_GUIDE.md) for detailed instructions.
