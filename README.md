# 🚀 Smart Study Planner — Production DevOps Pipeline

![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Azure](https://img.shields.io/badge/Cloud-Microsoft%20Azure-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![MERN](https://img.shields.io/badge/Stack-MERN-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![HAProxy](https://img.shields.io/badge/Proxy-HAProxy-E8A000?style=for-the-badge&logo=haproxy&logoColor=white)
![SSL](https://img.shields.io/badge/SSL-Let's%20Encrypt-003A70?style=for-the-badge&logo=letsencrypt&logoColor=white)

> **A production-grade DevOps implementation** — a full MERN stack application (React.js, Node.js, Express, MongoDB) deployed on Microsoft Azure with automated SSL termination, reverse proxy routing, microservices containerization, and a zero-touch CI/CD pipeline.

🌐 **Live:** `https://smart-study-akshat.duckdns.org`

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture Diagram](#-architecture-diagram)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Deployment Pipeline (5 Levels)](#-deployment-pipeline-5-levels)
- [Getting Started](#-getting-started)
- [Containerized Deployment Steps](#-containerized-deployment-steps)
- [HAProxy & SSL Configuration](#-haproxy--ssl-configuration)
- [CI/CD Workflow](#-cicd-workflow)
- [Azure NSG Firewall Rules](#-azure-nsg-firewall-rules)
- [Environment Variables & Secrets](#-environment-variables--secrets)
- [Debugging War Stories](#-debugging-war-stories)
- [Resume Impact](#-resume-impact)

---

## 🎯 Project Overview

**Smart Study Planner** is a full-stack **MERN** (React.js, Node.js, Express, MongoDB) web application deployed on Microsoft Azure with a complete production-grade infrastructure stack.

| Competency | Implementation |
|---|---|
| Cloud & DNS | Azure Ubuntu VM + DuckDNS domain mapping |
| Security & Routing | HAProxy reverse proxy + Let's Encrypt SSL (HTTPS) |
| Containerization | Docker microservices + Docker Compose orchestration |
| Data Persistence | MongoDB with named Docker volumes (`mongo_data`) |
| CI/CD Automation | GitHub Actions + GHCR zero-touch pipeline |
| Self-Healing | Bash `monitor.sh` auto-restart on container failure |
| Cloud Security | Azure NSG inbound firewall rules (ports 22, 80, 443) |
| Debugging | CORS fixes, HTTPS protocol conflicts, Docker engine migration |

---

## 🏗️ Architecture Diagram

```
  Developer Machine
        │
        │  git push origin main
        ▼
┌──────────────────────────────────────────────────────┐
│                      GitHub                          │
│  ┌─────────────────┐    ┌────────────────────────┐   │
│  │  Source Code    │───▶│  GitHub Actions CI/CD  │   │
│  │  Repository     │    │  (.github/workflows/   │   │
│  └─────────────────┘    │   deploy.yml)          │   │
│                         └────────────┬───────────┘   │
│  ┌──────────────────────────────┐    │               │
│  │  GitHub Container Registry   │◀───┘  docker push  │
│  │  (GHCR)                      │                    │
│  │  ghcr.io/<user>/frontend     │                    │
│  │  ghcr.io/<user>/backend      │                    │
│  └──────────────┬───────────────┘                    │
└─────────────────┼──────────────────────────────────--┘
                  │  SSH + docker pull & run
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Microsoft Azure Ubuntu VM                  │
│         smart-study-akshat.duckdns.org                  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Azure NSG Firewall                      │  │
│  │   Inbound Rules: Port 22 (SSH) ✓                  │  │
│  │                  Port 80 (HTTP) ✓                 │  │
│  │                  Port 443 (HTTPS) ✓               │  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │                              │
│  ┌───────────────────────▼───────────────────────────┐  │
│  │              HAProxy (Reverse Proxy)              │  │
│  │                                                   │  │
│  │  Port 80 (HTTP) ──────────────────▶ 301 Redirect  │  │
│  │                                    to HTTPS       │  │
│  │  Port 443 (HTTPS) ─▶ SSL Termination              │  │
│  │   (fullchain.pem + privkey.pem)    │              │  │
│  │                                    │              │  │
│  │  /api/* ───────────────────────────▶ :5000        │  │
│  │  /*     ───────────────────────────▶ :5173        │  │
│  └───────────────────────────────────────────────────┘  │
│            │ (internal Docker network)  │               │
│            ▼                            ▼               │
│  ┌──────────────────┐      ┌──────────────────────────┐ │
│  │  Frontend        │      │  Backend                 │ │
│  │  React.js        │◀────▶│  Node.js + Express       │ │
│  │  Container       │      │  Container               │ │
│  │  Port: 5173      │      │  Port: 5000              │ │
│  └──────────────────┘      └────────────┬─────────────┘ │
│                                         │               │
│                             ┌───────────▼─────────────┐ │
│                             │  MongoDB Container      │ │
│                             │  Port: 27017            │ │
│                             │  Volume: mongo_data ───▶│ │
│                             │  (persistent storage)   │ │
│                             └─────────────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  monitor.sh (Bash Self-Healing)                 │    │
│  │  Every 30s: check containers → auto-restart     │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
        ▲
        │  DuckDNS (DNS Mapping)
        │  smart-study-akshat.duckdns.org → VM Public IP
        │
   End User Browser (HTTPS)
```

---

## 🛠️ Tech Stack

### Application Layer (MERN Stack)
| Technology | Role |
|---|---|
| **React.js** | Frontend SPA (Vite, Port 5173) |
| **Node.js + Express.js** | REST API backend (Port 5000) |
| **MongoDB** | NoSQL database with persistent volume |

### Networking & Security Layer
| Technology | Role |
|---|---|
| **HAProxy** | Reverse proxy — routes HTTP/HTTPS traffic to containers |
| **Let's Encrypt (Certbot)** | Free SSL certificate generation & auto-renewal |
| **DuckDNS** | Free DNS — maps domain to Azure VM public IP |
| **Azure NSG** | Cloud firewall — inbound rules for ports 22, 80, 443 |

### DevOps & Infrastructure Layer
| Technology | Role |
|---|---|
| **Git & GitHub** | Source control & remote repository |
| **Docker** | Application containerization (microservices) |
| **Docker Compose** | Multi-container orchestration + internal networking |
| **GitHub Container Registry (GHCR)** | Private Docker image registry |
| **GitHub Actions** | CI/CD automation pipeline |
| **Microsoft Azure (Ubuntu VM)** | Cloud production environment |
| **Bash Scripting** | Health monitoring & auto-restart (`monitor.sh`) |
| **SSH Keys** | Secure, passwordless server access |

### Local Development Environment
- **OS:** Ubuntu Linux | **Hardware:** 18-core CPU, 15GB RAM

---

## 📁 Project Structure

```
smart-study-planner/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD pipeline
├── client/                       # React.js frontend (Vite)
│   ├── Dockerfile
│   ├── src/
│   └── package.json
├── server/                       # Node.js + Express backend
│   ├── Dockerfile
│   ├── routes/
│   ├── models/
│   └── package.json
├── haproxy/
│   └── haproxy.cfg               # Reverse proxy + SSL config
├── ssl/
│   ├── fullchain.pem             # Let's Encrypt public cert
│   └── privkey.pem               # Let's Encrypt private key
├── scripts/
│   └── monitor.sh                # Bash container health monitor
├── docker-compose.yml            # Orchestrates all containers
├── .gitignore
└── README.md
```

---

## 🔄 Deployment Pipeline (5 Levels)

```
Level 1: Source Code Management
   └─ Git init → .gitignore (node_modules) → commit → push to GitHub

Level 2: Application Containerization (Docker)
   └─ Dockerfile (React frontend) + Dockerfile (Node backend)
   └─ docker-compose.yml → internal network + mongo_data volume
   └─ Local multi-container testing

Level 3: System Automation (Bash)
   └─ monitor.sh → checks container health every 30s → auto-restart

Level 4: Cloud Provisioning (Azure + DNS + Security)
   └─ Azure Ubuntu VM → NSG rules (22, 80, 443)
   └─ DuckDNS → domain mapped to VM public IP
   └─ Certbot → SSL certs (fullchain.pem + privkey.pem)
   └─ HAProxy → HTTP→HTTPS redirect + reverse proxy routing

Level 5: Zero-Touch Deployment (GitHub Actions)
   └─ git push main → Actions triggered → docker build
   └─ Push images to GHCR → SSH into Azure VM
   └─ docker pull latest → containers restarted automatically
```

---

## 🚀 Getting Started

### Prerequisites

```bash
git --version
docker --version
docker compose version   # Use modern Go-based plugin, not legacy python
```

### Clone & Run Locally

```bash
git clone https://github.com/Akshat7860/smart-study-planner.git
cd smart-study-planner

# Start all containers (frontend, backend, mongodb)
docker compose up --build

# Access locally
# Frontend : http://localhost:5173
# Backend  : http://localhost:5000
# MongoDB  : localhost:27017
```

---

## 🐳 Containerized Deployment Steps

### Step 1 — Build Images

```bash
docker build -t smart-study-frontend ./client
docker build -t smart-study-backend  ./server
```

### Step 2 — Tag & Push to GHCR

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u Akshat7860 --password-stdin

docker tag smart-study-frontend ghcr.io/Akshat7860/smart-study-frontend:latest
docker tag smart-study-backend  ghcr.io/Akshat7860/smart-study-backend:latest

docker push ghcr.io/Akshat7860/smart-study-frontend:latest
docker push ghcr.io/Akshat7860/smart-study-backend:latest
```

### Step 3 — SSH into Azure VM & Deploy

```bash
ssh -i ~/.ssh/azure_key azureuser@<vm-ip>

docker compose pull
docker compose down
docker compose up -d

docker ps   # verify all 3 containers are running
```

### Step 4 — Persistent Data (MongoDB Volume)

```yaml
# docker-compose.yml snippet
volumes:
  mongo_data:          # named volume — data survives container restarts

services:
  mongodb:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
```

### Step 5 — Self-Healing Monitor

```bash
chmod +x scripts/monitor.sh
nohup ./scripts/monitor.sh &   # runs in background

# monitor.sh checks every 30s:
# docker inspect --format='{{.State.Running}}' <container>
# if not running → docker compose restart <service>
```

---

## 🔒 HAProxy & SSL Configuration

### How Traffic Flows

```
User Browser
    │
    ├── HTTP  :80  ──▶  HAProxy ──▶  301 Redirect to HTTPS
    │
    └── HTTPS :443 ──▶  HAProxy (SSL Termination)
                             │
                             ├── /api/*  ──▶  backend:5000
                             └── /*      ──▶  frontend:5173
```

### Generate SSL Certificate (Certbot)

```bash
# On Azure VM
sudo apt install certbot
sudo certbot certonly --standalone -d smart-study-akshat.duckdns.org

# Combine certs for HAProxy
sudo cat /etc/letsencrypt/live/smart-study-akshat.duckdns.org/fullchain.pem \
         /etc/letsencrypt/live/smart-study-akshat.duckdns.org/privkey.pem \
         > /etc/haproxy/certs/smart-study.pem
```

### `haproxy.cfg` (Key Sections)

```haproxy
frontend http_in
    bind *:80
    redirect scheme https code 301 if !{ ssl_fc }

frontend https_in
    bind *:443 ssl crt /etc/haproxy/certs/smart-study.pem
    acl is_api path_beg /api
    use_backend backend_node if is_api
    default_backend backend_react

backend backend_react
    server frontend 127.0.0.1:5173 check

backend backend_node
    server backend 127.0.0.1:5000 check
```

---

## ⚙️ CI/CD Workflow

Every `git push` to `main` triggers the full pipeline automatically:

```yaml
name: Deploy Smart Study Planner

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Login to GHCR
        run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin

      - name: Build & Push Frontend
        run: |
          docker build -t ghcr.io/${{ github.repository_owner }}/smart-study-frontend:latest ./client
          docker push ghcr.io/${{ github.repository_owner }}/smart-study-frontend:latest

      - name: Build & Push Backend
        run: |
          docker build -t ghcr.io/${{ github.repository_owner }}/smart-study-backend:latest ./server
          docker push ghcr.io/${{ github.repository_owner }}/smart-study-backend:latest

      - name: Deploy to Azure VM
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.AZURE_VM_IP }}
          username: azureuser
          key: ${{ secrets.AZURE_SSH_KEY }}
          script: |
            cd ~/smart-study-planner
            docker compose pull
            docker compose down
            docker compose up -d
```

---

## 🛡️ Azure NSG Firewall Rules

Configured in **Azure Portal → VM → Networking → Inbound Security Rules**:

| Priority | Port | Protocol | Source | Action | Purpose |
|---|---|---|---|---|---|
| 300 | 22 | TCP | My IP | Allow | SSH access |
| 310 | 80 | TCP | Any | Allow | HTTP traffic (redirected to HTTPS) |
| 320 | 443 | TCP | Any | Allow | HTTPS traffic (SSL) |
| 65000 | * | Any | Any | Deny | Default deny all |

> All other ports (5000, 5173, 27017) remain **closed to the internet** — only HAProxy can route to them internally. This is the correct production security posture.

---

## 🔐 Environment Variables & Secrets

Set in **GitHub → Settings → Secrets → Actions**:

| Secret | Description |
|---|---|
| `AZURE_VM_IP` | Public IP of Azure Ubuntu VM |
| `AZURE_SSH_KEY` | Private SSH key for passwordless VM access |
| `GITHUB_TOKEN` | Auto-provided by GitHub for GHCR auth |

> ⚠️ Never commit `.env`, `*.pem`, or private keys. All sensitive values go in GitHub Secrets.

---

## 🐛 Debugging War Stories

Real problems solved during this project — demonstrating production-level troubleshooting skills:

### 1. CORS Errors After HTTPS Migration
**Problem:** After switching from HTTP to HTTPS, browser blocked API calls with `CORS policy: origin mismatch`.

**Root Cause:** Backend `CORS` config still had `http://` origin hardcoded. After SSL, the frontend origin changed to `https://`.

**Fix:**
```javascript
// server/index.js
app.use(cors({
  origin: "https://smart-study-akshat.duckdns.org",
  credentials: true
}));
```
**Diagnosis Method:** `docker compose logs backend` + Chrome DevTools Console.

---

### 2. `docker-compose` vs `docker compose` Engine Bug
**Problem:** Old Python-based `docker-compose` v1 threw internal errors on the Azure VM during multi-container startup.

**Root Cause:** Legacy Python binary had known bugs with newer Docker Engine versions.

**Fix:** Uninstalled `docker-compose` (Python), installed modern **Docker Compose Plugin** (Go-based):
```bash
sudo apt remove docker-compose
sudo apt install docker-compose-plugin
docker compose version   # v2.x.x ✓
```

---

## 📄 Resume Impact

> *ATS-optimized — use under **"Projects"** or **"Hands-on Lab Experience"**:*

**DevOps & Cloud Engineering Lab Project** *(MERN Stack: React.js, Node.js, Express, MongoDB)*
- Architected and deployed a production-grade end-to-end CI/CD pipeline for a **MERN stack** application using **GitHub Actions**, enabling zero-touch cloud deployments on **Microsoft Azure**.
- Configured **HAProxy** as a reverse proxy to route HTTP/HTTPS traffic (ports 80/443) to isolated **Docker** microservice containers (React.js frontend on :5173, Node.js/Express backend on :5000), keeping all application ports hidden from the internet.
- Automated **SSL/TLS termination** using **Let's Encrypt (Certbot)**; combined `fullchain.pem` + `privkey.pem` certificates and enforced HTTP→HTTPS redirect via HAProxy configuration.
- Mapped a custom domain (`smart-study-akshat.duckdns.org`) to the Azure VM public IP using **DuckDNS** and configured **Azure NSG** inbound firewall rules to allow only ports 22, 80, and 443.
- Orchestrated **microservices** (frontend, backend, MongoDB) using **Docker Compose** with persistent named volumes (`mongo_data`) for zero-data-loss database restarts.
- Diagnosed and resolved production **CORS policy conflicts** after HTTPS migration by inspecting Docker logs (`docker compose logs`) and browser console errors; migrated from legacy Python `docker-compose` to Go-based Docker Compose Plugin to eliminate engine-level deployment bugs.
- Implemented a **Bash self-healing monitoring script** (`monitor.sh`) for automated container health checks and restarts.

---

## 📬 Contact

**Akshat** — DevOps & Cloud Engineer

[![GitHub](https://img.shields.io/badge/GitHub-Akshat7860-181717?style=flat&logo=github)](https://github.com/Akshat7860)

---

> *"It works on my machine" → **"It works everywhere, securely, automatically."***
