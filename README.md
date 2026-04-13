# REST API - Complete Teaching Project

> **Learn REST APIs from scratch** using **JavaScript (Express.js)** and **Python (FastAPI)** with a local SQLite database, a real frontend, and Postman testing.

---

## What Is This Project?

This project is a **Student Manager** application built to teach you how REST APIs work **end-to-end**. You will learn:

- What REST APIs are and why they matter
- How HTTP methods (GET, POST, PUT, PATCH, DELETE) work
- How a frontend talks to a backend
- How a backend talks to a database
- How to test APIs using Postman
- Two backend implementations: **JavaScript (Express.js)** and **Python (FastAPI)**

---

## Project Structure

```
RESTAPI/
|
|-- frontend/               # The UI (HTML + CSS + JavaScript)
|   |-- index.html          # Main webpage
|   |-- style.css           # Styling
|   |-- app.js              # Frontend JavaScript (sends HTTP requests)
|
|-- js-backend/             # Backend Option 1: Node.js + Express
|   |-- server.js           # Express server with all REST routes
|   |-- package.json        # Node.js dependencies
|   |-- students.db         # SQLite database (auto-created)
|
|-- python-backend/         # Backend Option 2: Python + FastAPI
|   |-- main.py             # FastAPI server with all REST routes
|   |-- requirements.txt    # Python dependencies
|   |-- students.db         # SQLite database (auto-created)
|
|-- docs/                   # Documentation
|   |-- 01-SETUP.md         # Setup & installation guide
|   |-- 02-REST-API-CONCEPTS.md  # REST API theory
|   |-- 03-POSTMAN-GUIDE.md      # Testing with Postman
|   |-- 04-JS-BACKEND-EXPLAINED.md   # Express.js code walkthrough
|   |-- 05-FASTAPI-BACKEND-EXPLAINED.md  # FastAPI code walkthrough
|   |-- 06-FRONTEND-EXPLAINED.md      # Frontend code walkthrough
|
|-- .gitignore
|-- README.md               # This file
```

---

## Quick Start (TL;DR)

### Step 1: Clone the Repository

```bash
git clone https://github.com/EricKart/RESTAPI.git
cd RESTAPI
```

### Step 2: Run One of the Backends

**Option A - JavaScript (Express.js):**

```bash
cd js-backend
npm install
npm start
# Server runs on http://localhost:3000
```

**Option B - Python (FastAPI):**

```bash
cd python-backend
pip install -r requirements.txt
python main.py
# Server runs on http://localhost:8000
# Swagger Docs at http://localhost:8000/docs
```

### Step 3: Open the Frontend

Open `frontend/index.html` in your browser (just double-click it or use Live Server in VS Code).

### Step 4: Start Interacting!

- Select which backend to use from the dropdown
- Add, edit, delete students
- Watch the HTTP Request/Response logger at the top

---

## Complete Documentation

Read these docs **in order** for the best learning experience:

| # | Document | What You'll Learn |
|---|----------|------------------|
| 1 | [Setup Guide](docs/01-SETUP.md) | Install dependencies, clone repo, run everything |
| 2 | [REST API Concepts](docs/02-REST-API-CONCEPTS.md) | What REST is, HTTP methods, status codes, headers |
| 3 | [Postman Guide](docs/03-POSTMAN-GUIDE.md) | Test every API endpoint with Postman |
| 4 | [JS Backend Explained](docs/04-JS-BACKEND-EXPLAINED.md) | Line-by-line Express.js code walkthrough |
| 5 | [FastAPI Backend Explained](docs/05-FASTAPI-BACKEND-EXPLAINED.md) | Line-by-line FastAPI code walkthrough |
| 6 | [Frontend Explained](docs/06-FRONTEND-EXPLAINED.md) | How the frontend sends requests to the backend |

---

## API Endpoints Summary

Both backends expose the **exact same API**:

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|-------------|
| `GET` | `/api/students` | Get all students | None |
| `GET` | `/api/students/:id` | Get student by ID | None |
| `POST` | `/api/students` | Create new student | `{ name, email, course, age }` |
| `PUT` | `/api/students/:id` | Full update (replace) | `{ name, email, course, age }` |
| `PATCH` | `/api/students/:id` | Partial update | `{ field: value }` |
| `DELETE` | `/api/students/:id` | Delete a student | None |

---

## Why Two Backends?

| Feature | Express.js (JavaScript) | FastAPI (Python) |
|---------|----------------------|-----------------|
| Language | JavaScript | Python |
| Speed | Fast | Very Fast (async) |
| Auto Docs | No (manual setup) | Yes! (`/docs` endpoint) |
| Type Safety | No (runtime) | Yes (Pydantic models) |
| Learning Curve | Easy | Easy |
| Ecosystem | npm (huge) | pip (huge) |
| Best For | Full-stack JS devs | Data/ML + API devs |

Both are excellent choices. This project lets you **compare them side-by-side**.

---

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (no frameworks)
- **JS Backend**: Node.js, Express.js, better-sqlite3
- **Python Backend**: Python, FastAPI, Uvicorn, Pydantic, sqlite3
- **Database**: SQLite (file-based, no setup needed)
- **Testing**: Postman (API client)

---

## License

This project is for educational purposes. Feel free to use, modify, and share.
