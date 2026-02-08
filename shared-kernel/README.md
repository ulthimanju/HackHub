# EHub Common Services

The Common Services microservice provides shared utilities and system-wide configurations for the EHub ecosystem.

## Tech Stack
- **Java 17**
- **Spring Boot 3.2.0**
- **Maven**
- **Lombok**
- **Docker & Docker Compose**

## Base URL
`http://localhost:8083` (Direct)
`http://localhost:8000/common/**` (via API Gateway)

---

## API Endpoints

### 1. Status Check
Returns the health status of the service.
- **URL:** `/common/status`
- **Method:** `GET`
- **Response:** `200 OK`
  ```text
  Common Services is UP and Running
  ```

---

## Running with Docker
Use the root `docker-compose.yml`:
```bash
docker-compose up --build -d
```
