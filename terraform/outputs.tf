output "backend_container_id" {
  value = docker_container.backend.id
}

output "frontend_container_id" {
  value = docker_container.frontend.id
}

output "frontend_url" {
  value = "http://localhost"
}
