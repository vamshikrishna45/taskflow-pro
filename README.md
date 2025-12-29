# 🚀 TaskFlow Pro

**Real-Time Task Management Backend (Clean & Practical Architecture)**

TaskFlow Pro is a **scalable, event-driven backend system** designed for managing tasks in team-based applications with **real-time notifications**.

This project focuses on **real-world backend design**, not just basic CRUD APIs.

---

## 📌 What This Project Is About

TaskFlow Pro allows users to:

- Create and manage tasks
- Assign tasks to other users
- Track task status and deadlines
- Receive **instant real-time notifications**
- Handle background jobs without blocking APIs

The goal is to demonstrate **clean separation of concerns**, **performance-first design**, and **production-style architecture**.

---

## ❓ Why This Project Exists

In real-world applications:

- Users expect **fast responses**
- Notifications must be **instant**
- Slow operations should **never block APIs**
- A single backend becomes hard to maintain as features grow

**TaskFlow Pro solves this by:**

- Keeping business logic centralized
- Offloading slow work to background workers
- Using event-driven communication for real-time updates

---

## 🧠 High-Level Idea (One Line)

> **Django handles core logic and data, FastAPI handles real-time delivery, Redis connects them, and Celery runs background work.**

---

## 🛠️ Tech Stack & Why It’s Used

### 🔹 Backend Frameworks

| Tool | Purpose |
|-----|--------|
| **Django + DRF** | Core APIs, authentication, data integrity |
| **FastAPI** | Real-time WebSocket notifications |

- **Django = Brain**
- **FastAPI = Messenger**

---

### 🔹 Supporting Tools

| Tool | Real Purpose |
|-----|-------------|
| **PostgreSQL** | Primary database |
| **Redis** | Event messaging & caching |
| **Celery** | Background jobs (emails, reminders) |
| **NGINX** | API gateway & routing |
| **Docker** | Consistent service orchestration |

Each tool exists for a **clear, justified reason** — nothing is over-engineered.

---

## 🔍 Responsibilities Breakdown

### 🟦 Django (Core Backend)

Responsible for:
- User authentication (JWT)
- Task creation & updates
- Assigning tasks
- Data validation
- Database writes

📌 **Single source of truth**  
📌 Only Django modifies task data

---

### 🟩 FastAPI (Realtime Service)

Responsible for:
- WebSocket connections
- Instant notifications
- Deadline alerts
- High-concurrency async handling

📌 FastAPI **never changes data**  
📌 It only reacts to events

---

### 🔴 Redis (Event Bridge)

Used for:
- Publishing task-related events
- Allowing FastAPI to react instantly
- Optional caching

📌 No permanent data storage

---

### 🔵 Celery (Background Worker)

Handles:
- Email notifications
- Deadline reminders
- Retry logic for failures

📌 Keeps APIs fast  
📌 Runs slow work asynchronously

---

## 🏗️ Architecture Overview

### Request Flow

