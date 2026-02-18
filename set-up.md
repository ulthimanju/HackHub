# EHub Setup Guide

Follow these instructions to set up and run the EHub Unified Hackathon Platform on your system.

## 📋 Prerequisites

Ensure you have the following installed:
- **Docker & Docker Compose** (The system is optimized for a container-first, platform-independent workflow)
- **Java 17 JDK** (For local development)
- **Node.js 18+** (For local frontend development)
- **Git**

---

## 🛠️ Step 1: Configuration (Secrets)

EHub uses a deterministic, file-based secrets management system that is platform-independent.

1. Ensure the `.secrets` directory exists in the root:
   ```bash
   mkdir .secrets
   ```

2. Populate the following files in `.secrets/` with your actual credentials:
   - `db-password.txt`: Password for PostgreSQL databases.
   - `gemini-api-key.txt`: Obtain from [Google AI Studio](https://aistudio.google.com/app/apikey).
   - `gmail-username.txt`: Your Gmail address (e.g., `user@gmail.com`).
   - `gmail-app-password.txt`: Gmail App Password (not your account password).
   - `jwt-secret.txt`: A random 64-character hex string for signing tokens.
   - `app-item-limit.txt`: OTP rate limit (e.g., `5`).
   - `app-time-limit.txt`: OTP rate limit time window in minutes (e.g., `30`).

---

## 🐳 Step 2: Running with Docker (Recommended)

EHub is fully containerized and deterministic. All dependencies are explicitly defined in the `docker-compose.yml`.

1. **Build and Start Services**:
   ```bash
   docker compose up -d --build --quiet-pull
   ```

2. **Verify Containers**:
   Wait for the databases to initialize (health checks are built-in):
   ```bash
   docker compose ps
   ```

3. **Access the Application**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **API Gateway**: [http://localhost:8000](http://localhost:8000)

---

## 🏗️ Step 3: Local Development (Non-Docker)

While Docker is preferred for consistency, you can run services locally if Java 17 and Maven are installed.

### Backend Services (Spring Boot)
1. Navigate to the service folder (e.g., `event-service`).
2. Run the application (Note: Local environment must mimic Docker secrets via properties if not using Docker):
   ```bash
   mvn spring-boot:run
   ```

### Web Client (React)
1. Navigate to `client-service`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🔍 Troubleshooting

- **Configuration Errors**: Ensure all files in `.secrets/` are present and contain exact values without trailing newlines.
- **Port Conflicts**: Ensure ports `8000`, `3000`, `8081`, `8082`, `8084`, `8085`, `6379`, and `5432` are not being used. (Note: Internal ports are isolated within the Docker network).
- **Service Logs**: Monitor real-time logs:
  ```bash
  docker compose logs -f [service-name]
  ```
