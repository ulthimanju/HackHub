# EHub Setup Guide

Follow these instructions to set up and run the EHub Unified Hackathon Platform on your system.

## 📋 Prerequisites

Ensure you have the following installed:
- **Docker & Docker Compose** (The system is optimized for a container-first, platform-independent workflow)
- **Java 17 JDK** (For local development)
- **Node.js 18+** (For local frontend development)
- **Git**
- **Google Gemini CLI authenticated on the host** (`@google/gemini-cli` logged in via `gemini auth login`)

---

## 📥 Step 0: Clone the Repository (v3.0)

```bash
git clone -b v3.0 https://github.com/ulthimanju/EHub.git
cd EHub
```

> **Note:** All active development is on the `v3.0` branch. Do not use `main`.

---

## 🛠️ Step 1: Configuration (Secrets)

EHub uses a deterministic, file-based secrets management system that is platform-independent.

1. Ensure the `.secrets` directory exists in the root:
   ```bash
   mkdir .secrets
   ```

2. Populate the following files in `.secrets/` with your actual credentials:
   - `db-password.txt`: Password for PostgreSQL databases.
   - `gmail-username.txt`: Your Gmail address (e.g., `user@gmail.com`).
   - `gmail-app-password.txt`: Gmail App Password (not your account password). See [Google App Passwords](https://support.google.com/accounts/answer/185833).
   - `jwt-secret.txt`: A random 64-character hex string for signing tokens.
   - `internal-secret.txt`: A shared secret string used for service-to-service authentication.
   - `app-item-limit.txt`: OTP rate limit (e.g., `5`).
   - `app-time-limit.txt`: OTP rate limit time window in minutes (e.g., `30`).

   > **Note:** `gemini-api-key.txt` is **not required**. The AI service authenticates via Google OAuth credentials mounted from your host (see Step 1b).


### Step 1b: Gemini CLI Authentication (Required for AI Evaluation)

The AI service invokes the Gemini CLI directly inside its container using OAuth credentials from your host machine.

1. Install the Gemini CLI on your host:
   ```bash
   npm install -g @google/gemini-cli
   ```

2. Authenticate with your Google account:
   ```bash
   gemini auth login
   ```
   This stores credentials in `~/.gemini/` (Linux/macOS) or `C:\Users\<you>\.gemini\` (Windows).

3. Add the container workspace paths to your trusted folders. Edit `~/.gemini/trustedFolders.json` (create if absent):
   ```json
   {
     "trustedFolders": [
       "/app/workspaces",
       "/root"
     ]
   }
   ```
   > **Windows path:** `C:\Users\<you>\.gemini\trustedFolders.json`

4. Verify the `docker-compose.yml` mounts your credentials correctly (already configured on v3.0):
   ```yaml
   volumes:
     - C:/Users/<you>/.gemini:/root/.gemini:ro
   ```
   Update the host path in `docker-compose.yml` → `ai-service` → `volumes` if your username differs.

---

## 🐳 Step 2: Running with Docker (Recommended)

EHub is fully containerized and deterministic. All dependencies are explicitly defined in the `docker-compose.yml`.

1. **Ensure you are on the `v3.0` branch**:
   ```bash
   git checkout v3.0
   git pull origin v3.0
   ```

2. **Build and Start Services**:
   ```bash
   docker compose up -d --build --quiet-pull
   ```

3. **Verify Containers**:
   Wait for the databases to initialize (health checks are built-in):
   ```bash
   docker compose ps
   ```
   All services should show `running` or `healthy`. The databases (`auth-db`, `event-db`) must be `healthy` before dependent services start.

4. **Access the Application**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **API Gateway**: [http://localhost:8000](http://localhost:8000)

5. **Monitor Logs**:
   ```bash
   docker compose logs -f [service-name]
   ```
   Available service names: `api-gateway`, `auth-service`, `event-service`, `ai-service`, `notification-service`, `client-service`, `auth-db`, `event-db`, `ehub-redis`

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
- **Port Conflicts**: Ensure ports `8000`, `3000`, `8081`, `8082`, `8084`, `8085`, `6379`, and `5432` are not being used. Internal ports are isolated within the Docker network.
- **AI Evaluation Not Running**: Verify `~/.gemini/trustedFolders.json` includes `/app/workspaces` and `/root`. The Gemini CLI silently exits if the working directory is not trusted.
- **Gemini CLI Timeout**: Check `docker logs ai-service` for `[GeminiCLI]` output. If the process hangs, re-run `gemini auth login` on your host to refresh OAuth tokens.
- **Wrong Branch**: Confirm you are on `v3.0` with `git branch`. The `main` branch is outdated.
- **Service Logs**:
  ```bash
  docker compose logs -f [service-name]
  ```
