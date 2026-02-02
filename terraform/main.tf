terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 2.15.0"
    }
  }
}

provider "docker" {}

resource "docker_image" "backend" {
  name         = "lakithaviraj/techstore-backend:latest"
  keep_locally = false
}

resource "docker_image" "frontend" {
  name         = "lakithaviraj/techstore-frontend:latest"
  keep_locally = false
}

resource "docker_container" "backend" {
  image = docker_image.backend.latest
  name  = "techstore-backend"
  ports {
    internal = 3000
    external = 3000
  }
}

resource "docker_container" "frontend" {
  image = docker_image.frontend.latest
  name  = "techstore-frontend"
  ports {
    internal = 5173
    external = 80
  }
  depends_on = [docker_container.backend]
}
