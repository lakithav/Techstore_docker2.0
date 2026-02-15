variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro" # Free tier eligible
}

variable "key_name" {
  description = "Name for the SSH key pair"
  type        = string
  default     = "techstore-key"
}

variable "public_key_path" {
  description = "Path to your SSH public key file"
  type        = string
  default     = "~/.ssh/techstore-key.pub"
}

variable "docker_username" {
  description = "DockerHub username for pulling images"
  type        = string
  default     = "lakithaviraj"
}
