# 🚀 TaskFlow Pro

**Real-Time Task Management Backend — Clean, Scalable, Production-Oriented**

TaskFlow Pro is a **real-world backend system** built to manage tasks for teams with **instant notifications**, **high performance**, and **clean architecture**.

This project goes beyond simple CRUD APIs and demonstrates **how modern backend systems are designed in production**.

---

## 📌 What This Project Does

TaskFlow Pro enables users to:

- Create and manage tasks
- Assign tasks to other users
- Track task status and deadlines
- Receive **real-time notifications**
- Process background jobs without blocking APIs

The primary focus is **architecture clarity, scalability, and responsiveness**.

---

## ❓ Why This Project Exists

In real applications:

- Users expect **fast APIs**
- Notifications must be **instant**
- Slow operations (emails, reminders) should **never block requests**
- Monolithic backends become hard to maintain as features grow

**TaskFlow Pro solves this by:**

- Separating responsibilities cleanly
- Using event-driven communication
- Offloading slow work to background workers
- Keeping data ownership strict and clear

---

## 🧠 High-Level Idea (One Line)

> **Django handles business logic and data, FastAPI delivers real-time updates, Redis connects services, and Celery runs background tasks.**

---

## 🛠️ Tech Stack & Rationale

### 🔹 Backend Frameworks

| Tool | Why It’s Used |
|----|--------------|
| **Django + DRF** | Core APIs, authentication, data integrity |
| **FastAPI** | High-performance real-time WebSocket notifications |

- **Django = Brain**
- **FastAPI = Messenger**

---

### 🔹 Supporting Infrastructure

| Tool | Purpose |
|----|--------|
| **PostgreSQL** | Primary relational database |
| **Redis** | Event messaging & lightweight caching |
| **Celery** | Background processing (emails, reminders) |
| **NGINX** | API gateway & request routing |
| **Docker** | Consistent multi-service environment |

Each tool is used only where it makes **practical sense**.

---

## 🔍 Clear Responsibility Split

### 🟦 Django (Core Backend)

Handles:
- User authentication (JWT)
- Task creation & updates
- Assigning tasks
- Business rules & validation
- Database writes

📌 **Single source of truth**  
📌 Only service allowed to modify task data

---

### 🟩 FastAPI (Realtime Service)

Handles:
- WebSocket connections
- Real-time notifications
- Deadline alerts
- Async high-concurrency delivery

📌 Never writes to the database  
📌 Reacts only to events

---

### 🔴 Redis (Event Bridge)

Used for:
- Publishing task-related events
- Allowing FastAPI & Celery to react instantly

📌 No permanent storage  
📌 Lightweight and fast

---

### 🔵 Celery (Background Workers)

Handles:
- Email notifications
- Deadline reminders
- Retry logic for failures

📌 Keeps APIs fast  
📌 Runs silently in the background

---

## 🏗️ Architecture Overview

### Request Flow

User
↓
Single API URL
↓
NGINX (Gateway)
├─ /api → Django (Core APIs)
└─ /ws → FastAPI (WebSockets)

yaml
Copy code

👉 Internal services are completely hidden from the client.

---

## ✅ Functional Requirements

### 👤 User Management
- User registration & login
- JWT-based authentication

### 📝 Task Management
- Create tasks
- Update tasks
- Assign tasks
- Change task status
- Set deadlines

### 🔔 Notifications
Users are notified when:
- A task is assigned
- Task status changes
- A deadline is approaching

Notifications are:
- Delivered via **WebSockets**
- Stored as **read/unread records**

---

## ⚙️ Non-Functional Requirements

| Requirement | Description |
|-----------|------------|
| Performance | Fast API responses |
| Scalability | Handles many concurrent users |
| Reliability | Background retries via Celery |
| Maintainability | Clean separation of concerns |
| Security | JWT authentication & permissions |

---

## 🔁 Event Flow Example (Task Assignment)

1. Manager assigns task (Django)
2. Task saved to PostgreSQL
3. Django publishes event to Redis
4. FastAPI receives event
5. WebSocket notification sent
6. Celery sends email notification (optional)

---

## 🗄️ Database Design

### Tables

**User**
- id
- name
- email

**Task**
- id
- title
- status
- deadline
- assigned_to

**Notification**
- id
- user
- message
- is_read
- created_at

---

## 🌐 API Overview

### Django REST APIs
POST /api/tasks
GET /api/tasks
PATCH /api/tasks/{id}

shell
Copy code

### FastAPI APIs
WS /ws/notifications
POST /notify/deadline

yaml
Copy code

---

## 📁 Project Structure

taskflow-pro/
│
├── gateway/
│ └── nginx.conf
│
├── django-core/
│ ├── users/
│ ├── tasks/
│ ├── notifications/
│ └── common/
│
├── fastapi-realtime/
│ ├── main.py
│ ├── websocket/
│ ├── events/
│ └── workers/
│
├── docker-compose.yml
└── README.md

markdown
Copy code

---

## 🧾 Resume Highlights

- Designed and built a **real-time task management backend** using Django and FastAPI
- Implemented **WebSocket-based notifications** for instant updates
- Used **Redis for event-driven communication** between services
- Integrated **Celery for background processing** of emails and reminders
- Created a **scalable, maintainable backend architecture** using Docker

---

## 🏁 Final Summary

- **Django** → decides & updates data  
- **Redis** → broadcasts events  
- **Celery** → handles background work  
- **FastAPI** → delivers instant updates  
- **PostgreSQL** → stores everything  

> **TaskFlow Pro demonstrates how modern backend systems are designed — clean, scalable, and real-time.**
