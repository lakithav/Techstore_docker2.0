# TechStore AWS Deployment Helper Script (PowerShell)
# This script provides shortcuts for common Terraform operations

$ErrorActionPreference = "Stop"
$TerraformDir = "terraform"

function Print-Header {
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host "  TechStore AWS Deployment Script" -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
}

function Check-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Green
    
    # Check Terraform
    try {
        $tfVersion = terraform version -json | ConvertFrom-Json
        Write-Host "[OK] Terraform installed: $($tfVersion.terraform_version)" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Terraform is not installed" -ForegroundColor Red
        Write-Host "Install from: https://www.terraform.io/downloads"
        exit 1
    }
    
    # Check AWS CLI
    try {
        aws --version | Out-Null
        Write-Host "[OK] AWS CLI installed" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] AWS CLI is not installed" -ForegroundColor Yellow
        Write-Host "Install from: https://aws.amazon.com/cli/"
    }
    
    # Check SSH key
    $sshKeyPath = Join-Path $env:USERPROFILE ".ssh\techstore-key.pub"
    if (Test-Path $sshKeyPath) {
        Write-Host "[OK] SSH key found" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] SSH public key not found at $sshKeyPath" -ForegroundColor Yellow
        Write-Host "Generate with: ssh-keygen -t rsa -b 4096 -f ~/.ssh/techstore-key -N `"`""
    }
    
    Write-Host ""
}

function Deploy-Infrastructure {
    Print-Header
    Check-Prerequisites
    
    Write-Host "Starting deployment..." -ForegroundColor Green
    Push-Location $TerraformDir
    
    try {
        # Initialize
        Write-Host "Step 1: Initializing Terraform..." -ForegroundColor Blue
        terraform init
        
        # Plan
        Write-Host "Step 2: Creating deployment plan..." -ForegroundColor Blue
        terraform plan -out=tfplan
        
        # Apply
        Write-Host "Step 3: Applying configuration..." -ForegroundColor Blue
        terraform apply tfplan
        
        # Show outputs
        Write-Host ""
        Write-Host "Deployment complete!" -ForegroundColor Green
        Write-Host "Application URLs:" -ForegroundColor Blue
        terraform output
        
    } finally {
        Pop-Location
    }
}

function Destroy-Infrastructure {
    Print-Header
    
    Write-Host "WARNING: This will destroy all AWS resources!" -ForegroundColor Red
    $confirm = Read-Host "Are you sure? (yes/no)"
    
    if ($confirm -ne "yes") {
        Write-Host "Aborted."
        exit 0
    }
    
    Push-Location $TerraformDir
    try {
        terraform destroy
        Write-Host "Resources destroyed." -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

function Show-Status {
    Print-Header
    
    Push-Location $TerraformDir
    try {
        Write-Host "Current infrastructure:" -ForegroundColor Blue
        terraform show
    } finally {
        Pop-Location
    }
}

function Show-Outputs {
    Print-Header
    
    Push-Location $TerraformDir
    try {
        Write-Host "Deployment outputs:" -ForegroundColor Blue
        terraform output
    } finally {
        Pop-Location
    }
}

function Connect-SSH {
    Print-Header
    
    Push-Location $TerraformDir
    try {
        $IP = terraform output -raw instance_public_ip 2>$null
        
        if ([string]::IsNullOrEmpty($IP)) {
            Write-Host "Error: No instance deployed" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "Connecting to EC2 instance..." -ForegroundColor Green
        $sshKeyPath = Join-Path $env:USERPROFILE ".ssh\techstore-key"
        ssh -i $sshKeyPath ubuntu@$IP
        
    } finally {
        Pop-Location
    }
}

function Show-Help {
    Print-Header
    
    Write-Host "Usage: .\deploy.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  deploy    - Deploy TechStore to AWS"
    Write-Host "  destroy   - Destroy all AWS resources"
    Write-Host "  status    - Show current infrastructure status"
    Write-Host "  outputs   - Show deployment outputs (IPs, URLs)"
    Write-Host "  ssh       - SSH into the EC2 instance"
    Write-Host "  help      - Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy.ps1 deploy    # Deploy to AWS"
    Write-Host "  .\deploy.ps1 outputs   # View application URLs"
    Write-Host "  .\deploy.ps1 ssh       # Connect to server"
    Write-Host "  .\deploy.ps1 destroy   # Clean up resources"
    Write-Host ""
}

# Main script logic
$command = $args[0]

switch ($command) {
    "deploy" {
        Deploy-Infrastructure
    }
    "destroy" {
        Destroy-Infrastructure
    }
    "status" {
        Show-Status
    }
    "outputs" {
        Show-Outputs
    }
    "ssh" {
        Connect-SSH
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
    }
}
