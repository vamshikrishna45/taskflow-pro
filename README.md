# TaskFlow Pro

### A Real-Time, Event-Driven Task Management Platform

TaskFlow Pro is a production-oriented, event-driven task management system designed to demonstrate modern backend and frontend architecture patterns used in real-world applications.

The platform emphasizes **scalability, separation of concerns, real-time communication, background processing, and responsible AI integration**, rather than simple CRUD functionality.

---

## Overview

TaskFlow Pro enables teams to manage tasks efficiently with real-time updates and non-blocking operations.

Core capabilities include:

- Task creation, updates, and assignment
- Status and deadline tracking
- Real-time notifications
- Asynchronous background processing
- AI-assisted task description enhancement
- Automated (optional) priority suggestions

The system is intentionally designed to reflect **industry-grade architecture decisions** commonly seen in scalable backend systems.

---

## Design Goals

- Fast, non-blocking APIs
- Clear ownership of data and business logic
- Real-time communication without polling
- Decoupled services with minimal tight coupling
- AI used as an assistant, not an authority
- Easy local and production deployment
- Maintainable and extensible codebase

---

## High-Level Architecture

TaskFlow Pro follows a layered, event-driven architecture:

- **Django** owns business logic and data integrity
- **Redis** distributes events between services
- **Celery** executes background jobs
- **FastAPI** delivers real-time notifications
- **Next.js** provides a modern, scalable user interface
- **AI services** enhance user input without altering system authority

---

## Technology Stack

### Frontend

| Technology | Responsibility                   |
| ---------- | -------------------------------- |
| Next.js 14 | User interface, routing, layouts |
| TypeScript | Type-safe frontend development   |
| WebSockets | Real-time UI updates             |

### Backend

| Component    | Responsibility                                          |
| ------------ | ------------------------------------------------------- |
| Django + DRF | Core APIs, authentication, validation, data persistence |
| FastAPI      | WebSocket-based real-time notifications                 |
| PostgreSQL   | Primary relational database                             |
| Redis        | Event messaging and lightweight caching                 |
| Celery       | Background task execution                               |
| NGINX        | Reverse proxy and API gateway                           |
| Docker       | Multi-service orchestration                             |

Each technology is used only where it provides **clear architectural value**.

---

## Service Responsibilities

### Django (Core Backend)

Responsible for:

- User authentication (JWT)
- Task lifecycle management
- Business rules and validation
- Database persistence
- Coordinating AI-assisted features

Django is the **single source of truth** for all task data.

---

### FastAPI (Real-Time Service)

Responsible for:

- Managing WebSocket connections
- Delivering instant notifications
- Handling high-concurrency async communication

FastAPI **never writes to the database** and reacts only to published events.

---

### Redis (Event Bus)

Used as:

- An event bridge between services
- A low-latency messaging layer

Redis stores **no permanent data** and is used only for transient communication.

---

### Celery (Background Workers)

Handles:

- Email notifications
- Deadline reminders
- Retry logic for transient failures

This ensures API responses remain fast and non-blocking.

---

## Request Flow

Client
↓
NGINX (Single Entry Point)
├── /api → Django (REST APIs)
└── /ws → FastAPI (WebSockets)

Internal services are never exposed directly to clients.

---

## AI-Powered Features

### Task Description Enhancement (LLM-Based)

When a user creates or edits a task, the system can optionally:

- Improve grammar and clarity
- Preserve original intent and meaning
- Allow the user to accept or ignore suggestions

**Model**

- Groq-hosted LLM
- `llama-3.3-70b-versatile`

**Design Principles**

- Safe synchronous execution
- Failure does not affect task creation
- AI suggestions never overwrite user intent

---

### Priority Suggestion (Lightweight NLP)

The system can suggest task priority based on wording and urgency cues.

**Signals**

- Urgent language → High
- Neutral wording → Medium
- Casual or optional wording → Low

**Model**

- Hugging Face Inference API
- `distilbert-base-uncased-finetuned-sst-2-english`

**Key Rule**

- Priority is a suggestion only
- Users can override at any time

---

## Notifications

Users receive notifications when:

- A task is assigned
- Task status changes
- A deadline is approaching

Notifications are:

- Delivered in real time via WebSockets
- Persisted as read/unread records
- Processed asynchronously where required

---

## Non-Functional Characteristics

| Aspect          | Implementation                    |
| --------------- | --------------------------------- |
| Performance     | Async APIs and background workers |
| Scalability     | Stateless services with Redis     |
| Reliability     | Task retries and isolation        |
| Maintainability | Clear service boundaries          |
| Security        | JWT-based authentication          |

---

## Project Structure

taskflow-pro/
│
├── frontend/ # Next.js UI
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
│ └── events/
│
├── docker-compose.yml
└── README.md

---

## Summary

TaskFlow Pro demonstrates:

- Clean separation of concerns
- Event-driven backend design
- Real-time communication at scale
- Responsible, assistive AI integration
- Production-ready architecture patterns

This project is designed to reflect **how modern systems are built and reasoned about**, not just how APIs are written.
