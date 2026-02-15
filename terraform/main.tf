terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data source to get latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical (Ubuntu)

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Create VPC
resource "aws_vpc" "techstore_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "techstore-vpc"
  }
}

# Create Internet Gateway
resource "aws_internet_gateway" "techstore_igw" {
  vpc_id = aws_vpc.techstore_vpc.id

  tags = {
    Name = "techstore-igw"
  }
}

# Create Public Subnet
resource "aws_subnet" "techstore_public_subnet" {
  vpc_id                  = aws_vpc.techstore_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "techstore-public-subnet"
  }
}

# Create Route Table
resource "aws_route_table" "techstore_public_rt" {
  vpc_id = aws_vpc.techstore_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.techstore_igw.id
  }

  tags = {
    Name = "techstore-public-rt"
  }
}

# Associate Route Table with Subnet
resource "aws_route_table_association" "techstore_public_rt_assoc" {
  subnet_id      = aws_subnet.techstore_public_subnet.id
  route_table_id = aws_route_table.techstore_public_rt.id
}

# Security Group
resource "aws_security_group" "techstore_sg" {
  name        = "techstore-security-group"
  description = "Security group for TechStore application"
  vpc_id      = aws_vpc.techstore_vpc.id

  # SSH access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP access (Frontend)
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API (port 3000)
  ingress {
    description = "Backend API (3000)"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API (port 5000)
  ingress {
    description = "Backend API (5000)"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Frontend Dev Server (if needed)
  ingress {
    description = "Frontend"
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound traffic
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "techstore-sg"
  }
}

# Create Key Pair
resource "aws_key_pair" "techstore_key" {
  key_name   = var.key_name
  public_key = file(var.public_key_path)

  tags = {
    Name = "techstore-key"
  }
}

# EC2 Instance
resource "aws_instance" "techstore_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name              = aws_key_pair.techstore_key.key_name
  vpc_security_group_ids = [aws_security_group.techstore_sg.id]
  subnet_id             = aws_subnet.techstore_public_subnet.id

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = file("${path.module}/user-data.sh")

  tags = {
    Name = "TechStore-Server"
  }

  # Wait for instance to be ready
  depends_on = [aws_internet_gateway.techstore_igw]
}

# Elastic IP (optional but recommended for stable IP)
resource "aws_eip" "techstore_eip" {
  instance = aws_instance.techstore_server.id
  domain   = "vpc"

  tags = {
    Name = "techstore-eip"
  }

  depends_on = [aws_internet_gateway.techstore_igw]
}
