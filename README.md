# 🚀 VibeCoder

### AI-Powered Cloud IDE for Frontend Development

VibeCoder is a cloud-native, AI-powered development platform that automatically provisions isolated frontend workspaces on Kubernetes. Developers can describe an interface in natural language, and an AI agent generates React code, launches a live development environment, provides terminal access, and persists workspaces to the cloud.

---
<img width="1920" height="1080" alt="Screenshot (786)" src="https://github.com/user-attachments/assets/74302a76-6b07-43ac-a92b-9b3d35487293" />
<img width="1920" height="1080" alt="Screenshot (790)" src="https://github.com/user-attachments/assets/f1202ca9-95d5-4032-be72-6ed4a307b9b0" />
<img width="1920" height="1080" alt="Screenshot (789)" src="https://github.com/user-attachments/assets/536bde75-4dd9-4d92-8b68-36180911b6dc" />


## ✨ Overview

VibeCoder combines modern cloud infrastructure with AI-assisted development to create a fully managed frontend engineering experience.

### Core Capabilities

* 🤖 AI-powered code generation
* ☸️ Dynamic Kubernetes sandbox provisioning
* ⚡ Live React + Vite development environments
* 🖥️ Browser-based terminal access
* ☁️ Automatic workspace persistence
* 🔐 Google OAuth authentication
* 🌐 Dedicated preview environments

The result is a complete cloud IDE where developers can build, preview, and iterate on frontend applications without configuring local environments.

---

## 🎯 Key Features

### 🤖 AI-Powered Development

Generate production-ready React applications using natural language.

* LangGraph ReAct agent architecture
* Mistral AI integration
* Server-Sent Events (SSE) streaming
* Automated code generation and file updates

### ☸️ Dynamic Cloud Sandboxes

Every project receives its own isolated Kubernetes environment.

* On-demand pod provisioning
* React + Vite bootstrapping
* Workspace isolation
* Automatic resource cleanup

### ⚡ Live Development Experience

Real-time development without local setup.

* Vite Hot Module Replacement (HMR)
* Instant preview updates
* Live code synchronization
* Browser-based IDE workflow

### 🖥️ Integrated Terminal

Full terminal access directly from the browser.

* PTY-backed shell sessions
* xterm.js interface
* Socket.IO communication
* Support for npm, git, and shell commands

### ☁️ Workspace Persistence

Work is continuously backed up to the cloud.

* AWS S3 synchronization
* Automatic workspace restoration
* Chokidar-based file monitoring
* Survives pod restarts and recreation

### 🔐 Authentication & Security

Secure user authentication and session management.

* Google OAuth 2.0
* JWT authentication
* Secure cookie sessions
* Email login notifications

### 🌐 Smart Routing

Every sandbox receives dedicated endpoints.

* Preview environments
* Agent API endpoints
* WebSocket-aware routing
* Dynamic subdomain management

---

## 🏗️ Architecture

```text
Client Browser
      │
      ▼
NGINX Ingress Controller
      │
 ┌────┼────┐
 │    │    │
 ▼    ▼    ▼
Auth  AI  Sandbox Server
Svc   Svc
            │
            ▼
      Kubernetes API
            │
            ▼
      Vibe Sandbox
 ┌───────────────────────┐
 │ Vite Dev Server       │
 │ Agent API + Terminal  │
 │ Sync Agent (AWS S3)   │
 └───────────────────────┘
```

### External Services

* MongoDB Atlas
* Redis
* RabbitMQ
* AWS S3
* Mistral AI

---

## 🧩 Microservices

### Authentication Service

* Google OAuth authentication
* User registration
* JWT generation
* Session management
* Event publishing

### AI Orchestration Service

* LangGraph workflow execution
* LLM interactions
* Tool orchestration
* Code generation
* Streaming responses

### Sandbox Server

* Kubernetes pod provisioning
* Sandbox lifecycle management
* Resource allocation
* Environment cleanup

### Sandbox Router

* Preview routing
* API routing
* WebSocket proxying
* Session refresh handling

### Notification Service

* RabbitMQ event consumption
* Security notifications
* Login alert emails

---

## 📦 Sandbox Architecture

Each project receives a dedicated Kubernetes pod containing:

| Container            | Purpose                         |
| -------------------- | ------------------------------- |
| sandbox-container    | React + Vite development server |
| agent-container      | File API and terminal service   |
| sync-agent-container | AWS S3 synchronization          |

Shared workspace:

```text
/workspace
```

---

## 🛠 Tech Stack

### Frontend

* React 19
* Vite 8
* Tailwind CSS v4
* Socket.IO Client
* xterm.js
* Lucide Icons

### Backend

* Node.js 20
* Express 5
* Passport.js
* JWT
* Mongoose

### AI

* LangChain
* LangGraph
* Mistral AI SDK

### Infrastructure

* Kubernetes
* Docker
* Skaffold
* NGINX Ingress

### Messaging

* RabbitMQ

### Databases

* MongoDB Atlas
* Redis

### Storage

* AWS S3

---

## 📂 Project Structure

```text
VibeCoder
│
├── frontend/
├── auth/
├── ai-orchestration/
├── notification/
│
├── sandbox/
│   ├── server/
│   ├── router/
│   ├── agent/
│   ├── sync-agent/
│   └── template/
│
├── k8s/
│
├── skaffold.yml
└── README.md
```

---

## 🔄 Workflow

1. User authenticates with Google OAuth
2. Sandbox Server provisions a Kubernetes pod
3. Workspace template is initialized
4. Previous files are restored from AWS S3
5. User describes what they want to build
6. AI generates React code
7. Files are written into the workspace
8. Preview updates instantly through Vite HMR
9. Changes are synchronized to AWS S3
10. Inactive environments are automatically removed

---
 
 

## 📜 License

Licensed under the ISC License.

---

<div align="center">

### Build. Preview. Iterate.

**VibeCoder — AI-Native Frontend Development in the Cloud ☁️**

</div>
