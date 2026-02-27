# EHub Project Context

EHub is a microservices-based event management platform built with Java Spring Boot (backend) and React/Vite (frontend), orchestrated with Docker Compose.

## Architecture

| Service | Port | Description |
|---|---|---|
| `api-gateway` | 8000 | Spring Cloud Gateway — single entry point for all client traffic |
| `auth-service` | — | JWT authentication, user management (PostgreSQL + Redis) |
| `event-service` | 8084 | Event CRUD, registration, status broadcasting via Redis |
| `notification-service` | 8082 | Email notifications via Gmail SMTP, triggered from Redis |
| `ai-service` | — | Spawns Gemini CLI containers in Docker-in-Docker workspaces |
| `client-service` | 3000 | React/Vite SPA |

## Key Conventions

- All services communicate internally over `ehub-network` (bridge).
- Secrets are injected via Docker secrets (files under `.secrets/`) and read through `SPRING_CONFIG_IMPORT: "optional:configtree:/run/secrets/"`.
- Redis (`ehub-redis`) is used for session caching and cross-service pub/sub.
- Both `auth-db` and `event-db` are PostgreSQL 15 containers with health checks.
- The `ai-service` mounts `/var/run/docker.sock` to spin up `gemini-cli:latest` containers per workspace.

## Guidelines

- Follow existing Spring Boot package structure in each service.
- New API routes must go through the `api-gateway` and respect the internal secret header.
- Do not commit secrets; use the `.secrets/` directory (git-ignored).
- Frontend API calls use `VITE_API_URL` (default: `http://localhost:8000`).
