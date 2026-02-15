output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.techstore_server.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.techstore_eip.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.techstore_server.public_dns
}

output "frontend_url" {
  description = "URL to access the TechStore frontend"
  value       = "http://${aws_eip.techstore_eip.public_ip}"
}

output "backend_api_url" {
  description = "URL to access the backend API"
  value       = "http://${aws_eip.techstore_eip.public_ip}:3000"
}

output "ssh_command" {
  description = "Command to SSH into the instance"
  value       = "ssh -i ~/.ssh/techstore-key ubuntu@${aws_eip.techstore_eip.public_ip}"
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.techstore_sg.id
}
