# Full Stack Todo Application – Enterprise‑Grade Setup (Java + React)

A **production‑ready, enterprise‑level full stack Todo application** built with **Spring Boot (Java 17)** and **React (Vite + TypeScript)**, fully containerized and deployed on **AWS ECS** using a **secure CI/CD pipeline**.

This project demonstrates **real‑world DevOps practices** including Docker, GitHub Actions, security scanning, AWS ECR, ECS task definitions, environment variables, and scalable cloud deployment.

---

## 🔧 Tech Stack

### Frontend

* React + TypeScript (Vite)
* REST API integration
* Environment‑based configuration
* Dockerized for production

### Backend

* Java 17
* Spring Boot (REST API)
* Maven
* JPA Repository layer
* Dockerized microservice

### DevOps & Cloud

* Docker & Docker Compose
* GitHub Actions CI/CD
* AWS ECR (Image Registry)
* AWS ECS (Fargate)
* IAM (OIDC – no secrets)

### Security

* npm audit (Frontend)
* OWASP Dependency Check (Backend)
* Trivy image vulnerability scanning

---

## 📁 Project Structure

```
Full_Stack_Todo_Java_React
├── backend
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/example/todoapi
│       ├── controller
│       ├── model
│       ├── repository
│       └── TodoApiApplication.java
├── frontend
│   ├── Dockerfile
│   ├── App.tsx
│   ├── services/todoService.ts
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yaml
├── .github/workflows/ci-cd.yml
└── README.md
```

---

## 🐳 Running Locally Using Docker

### Prerequisites

* Docker
* Docker Compose

### Build & Run

```bash
docker-compose up --build
```

### Access Application

* Frontend: `http://localhost:3000`
* Backend API: `http://localhost:8080/api/todos`

---

## 🐳 Docker Explanation

### Backend Dockerfile

* Uses **OpenJDK 17**
* Builds Spring Boot JAR using Maven
* Runs backend on port **8080**

### Frontend Dockerfile

* Uses **Node 18** for build
* Produces optimized static build
* Serves React app on port **3000**

### Docker Compose

* Creates isolated network
* Runs backend and frontend services
* Ensures frontend depends on backend

---

## 🔁 CI/CD Pipeline (GitHub Actions)

**Pipeline Name:** `Full Stack CI/CD with Security`

### What Happens on Every Push

1. Checkout source code
2. Authenticate to AWS using **OIDC**
3. Frontend dependency installation & security audit
4. Backend Maven build
5. OWASP Dependency Check
6. Docker image build
7. Trivy vulnerability scanning
8. Push images to **Amazon ECR**
9. Deploy to **AWS ECS**

---

## ☁️ AWS Deployment – Step by Step (ECS)

### Step 1: Create ECR Repository

Create one repository (or separate repos):

```
hafiz-repo
```

Images:

* `frontend-latest`
* `backend-latest`

---

### Step 2: Create ECS Cluster

1. Go to **ECS → Clusters → Create Cluster**
2. Select **Networking only (Fargate)**
3. Name: `todo-cluster`
4. Create cluster

---

### Step 3: Backend Task Definition

1. ECS → Task Definitions → Create
2. Launch type: **Fargate**
3. Task name: `todo-backend-task`
4. CPU: `256`, Memory: `512`

#### Container Configuration

* Image:

```
971422673599.dkr.ecr.us-east-1.amazonaws.com/hafiz-repo:backend-latest
```

* Container port: `8080`
* Protocol: TCP

#### Environment Variables

```
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
```

---

### Step 4: Frontend Task Definition

1. Create new task definition
2. Name: `todo-frontend-task`
3. CPU: `256`, Memory: `512`

#### Container Configuration

* Image:

```
971422673599.dkr.ecr.us-east-1.amazonaws.com/hafiz-repo:frontend-latest
```

* Container port: `3000`

#### Environment Variable (IMPORTANT)

```
VITE_API_BASE_URL=http://<BACKEND_SERVICE_IP>:8080/api/todos
```

> Replace `<BACKEND_SERVICE_IP>` with backend **ECS Service Load Balancer DNS**

---

### Step 5: Create ECS Services

#### Backend Service

* Service name: `todo-backend-service`
* Task: `todo-backend-task`
* Desired tasks: `1`
* Enable **Application Load Balancer**

#### Frontend Service

* Service name: `todo-frontend-service`
* Task: `todo-frontend-task`
* Desired tasks: `1`
* Public Load Balancer enabled

---

## 🌐 Networking Flow

```
User Browser
   ↓
Frontend ALB (Port 80)
   ↓
Frontend ECS Task
   ↓  (API Calls)
Backend ALB (Port 8080)
   ↓
Backend ECS Task
```

---

## 🔐 Security Best Practices Used

* No hardcoded AWS credentials
* OIDC‑based GitHub authentication
* Container vulnerability scanning
* Dependency scanning
* IAM least‑privilege roles

---

## 📈 Scalability

* ECS Service Auto Scaling supported
* Stateless containers
* Easily extendable to RDS / DynamoDB

---

## 🚀 Future Enhancements

* Add PostgreSQL / RDS
* Terraform infrastructure
* Blue‑Green ECS deployments
* Monitoring (Prometheus + Grafana)
* Centralized logging (CloudWatch)

---

## 👨‍💻 Author

**Hafiz Umair**
DevOps Engineer | AWS Expert

---

⭐ This project demonstrates **real production‑level DevOps & cloud deployment skills**
