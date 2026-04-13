# 01 - Setup Guide: Install Dependencies & Run the Project

> This guide walks you through **everything** you need to install and run this project on your machine.

---

## Table of Contents

1. [Prerequisites Check](#1-prerequisites-check)
2. [Clone or Fork the Repository](#2-clone-or-fork-the-repository)
3. [Setup Option A: JavaScript Backend (Express.js)](#3-setup-option-a-javascript-backend-expressjs)
4. [Setup Option B: Python Backend (FastAPI)](#4-setup-option-b-python-backend-fastapi)
5. [Open the Frontend](#5-open-the-frontend)
6. [Verify Everything Works](#6-verify-everything-works)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisites Check

Before starting, you need to check if you have the required software installed.

### Check Node.js (for JS backend)

Open a terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
node --version
```

**Expected output**: `v18.x.x` or higher (e.g., `v20.11.0`)

If you **don't** have Node.js:
1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version (recommended)
3. Run the installer (check "Add to PATH" during installation)
4. Close and reopen your terminal
5. Run `node --version` again to verify

Also check npm (Node Package Manager - comes with Node.js):

```bash
npm --version
```

**Expected output**: `9.x.x` or higher

---

### Check Python (for FastAPI backend)

```bash
python --version
```

**Expected output**: `Python 3.9` or higher (e.g., `Python 3.12.0`)

> **Windows users**: If `python` doesn't work, try `python3` or `py`

If you **don't** have Python:
1. Go to [https://python.org/downloads](https://python.org/downloads)
2. Download the latest version
3. **IMPORTANT**: During installation, check **"Add Python to PATH"**
4. Close and reopen your terminal
5. Run `python --version` again to verify

Also check pip (Python Package Manager - comes with Python):

```bash
pip --version
```

**Expected output**: `pip 23.x` or higher

---

### Check Git

```bash
git --version
```

**Expected output**: `git version 2.x.x`

If you don't have Git:
1. Go to [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Download and install for your OS
3. During installation on Windows, select "Git from the command line and also from 3rd-party software"

---

### Visual Studio Code (Recommended Editor)

1. Download from [https://code.visualstudio.com](https://code.visualstudio.com)
2. Install these helpful extensions:
   - **Live Server** (by Ritwick Dey) - to serve the frontend
   - **REST Client** (by Huachao Mao) - to test APIs from VS Code
   - **Python** (by Microsoft) - Python language support
   - **ESLint** (by Microsoft) - JavaScript linting

---

### Postman (API Testing Tool)

1. Download from [https://www.postman.com/downloads](https://www.postman.com/downloads)
2. Install and create a free account
3. We'll use this to test our API endpoints

---

## 2. Clone or Fork the Repository

### Option A: Clone (just download)

```bash
# Navigate to where you want the project
cd Documents

# Clone the repository
git clone https://github.com/EricKart/RESTAPI.git

# Enter the project folder
cd RESTAPI

# Open in VS Code
code .
```

### Option B: Fork (your own copy on GitHub)

1. Go to [https://github.com/EricKart/RESTAPI](https://github.com/EricKart/RESTAPI)
2. Click the **"Fork"** button (top right)
3. This creates a copy in YOUR GitHub account
4. Clone your forked version:

```bash
git clone https://github.com/YOUR-USERNAME/RESTAPI.git
cd RESTAPI
code .
```

> **Why Fork?** Forking lets you make changes and push to your own repo. Cloning downloads but you can't push to the original repo.

---

## 3. Setup Option A: JavaScript Backend (Express.js)

### Step 1: Navigate to the JS backend folder

```bash
cd js-backend
```

### Step 2: Install dependencies

```bash
npm install
```

**What this does**: Reads `package.json` and downloads all required packages:
- `express` - Web framework for creating the API
- `better-sqlite3` - SQLite database driver
- `cors` - Enables cross-origin requests from the frontend

This creates a `node_modules/` folder (you'll see it appear in the file explorer).

### Step 3: Start the server

```bash
npm start
```

**Expected output**:

```
Sample data inserted!

===========================================
  Express.js REST API Server
  Running on: http://localhost:3000
  API Base:   http://localhost:3000/api/students
  Database:   SQLite (students.db)
===========================================
```

### Step 4: Test it

Open your browser and go to: [http://localhost:3000/api/students](http://localhost:3000/api/students)

You should see JSON data:

```json
[
  { "id": 1, "name": "Alice Johnson", "email": "alice@example.com", ... },
  { "id": 2, "name": "Bob Smith", "email": "bob@example.com", ... },
  { "id": 3, "name": "Charlie Brown", "email": "charlie@example.com", ... }
]
```

> **To stop the server**: Press `Ctrl + C` in the terminal

---

## 4. Setup Option B: Python Backend (FastAPI)

### Step 1: Navigate to the Python backend folder

```bash
cd python-backend
```

### Step 2: (Recommended) Create a virtual environment

A virtual environment keeps Python packages isolated to this project:

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You'll see `(venv)` appear at the beginning of your terminal prompt.

### Step 3: Install dependencies

```bash
pip install -r requirements.txt
```

**What this does**: Reads `requirements.txt` and installs:
- `fastapi` - Modern, fast web framework for building APIs
- `uvicorn` - ASGI server to run FastAPI
- `pydantic` - Data validation (automatically validates request data)

### Step 4: Start the server

```bash
python main.py
```

**Expected output**:

```
Sample data inserted!

===========================================
  FastAPI REST API Server
  Running on: http://localhost:8000
  API Base:   http://localhost:8000/api/students
  Docs:       http://localhost:8000/docs
  Database:   SQLite (students.db)
===========================================
```

### Step 5: Test it

1. Open [http://localhost:8000/api/students](http://localhost:8000/api/students) - You should see JSON data
2. Open [http://localhost:8000/docs](http://localhost:8000/docs) - **Interactive API documentation!**

> FastAPI automatically generates Swagger UI documentation. You can test all endpoints right from the browser!

> **To stop the server**: Press `Ctrl + C` in the terminal

---

## 5. Open the Frontend

The frontend is just static HTML/CSS/JS - no build step needed!

### Method 1: Live Server (Recommended)

1. Open VS Code
2. Open the file `frontend/index.html`
3. Right-click anywhere in the file
4. Select **"Open with Live Server"**
5. Your browser will open automatically

### Method 2: Direct File Open

1. Navigate to the `frontend/` folder in your file explorer
2. Double-click `index.html`
3. It will open in your default browser

### Method 3: Python HTTP Server

```bash
cd frontend
python -m http.server 5500
# Open http://localhost:5500 in your browser
```

---

## 6. Verify Everything Works

### Checklist

- [ ] Backend is running (you see the startup message in terminal)
- [ ] Opening `http://localhost:3000/api/students` (JS) or `http://localhost:8000/api/students` (Python) returns JSON
- [ ] Frontend is open in the browser
- [ ] The connection status dot (in the header) is **green**
- [ ] Clicking "GET - Fetch All" shows 3 sample students
- [ ] The HTTP Request/Response Logger shows the request details

### Running Both Backends Simultaneously

You can run both backends at the same time (they use different ports):

1. Open **Terminal 1**: Start JS backend on port 3000
2. Open **Terminal 2**: Start Python backend on port 8000
3. Use the dropdown in the frontend to switch between them

---

## 7. Troubleshooting

### "npm is not recognized"

- Node.js is not installed or not in PATH
- Reinstall Node.js and make sure to check "Add to PATH"
- Close and reopen your terminal after installation

### "python is not recognized"

- Python is not installed or not in PATH
- On Windows, try `py` instead of `python`
- Reinstall Python and check "Add Python to PATH"

### "Module not found" errors (Python)

- Make sure you're in the `python-backend` directory
- Make sure you ran `pip install -r requirements.txt`
- If using a virtual environment, make sure it's activated

### "EADDRINUSE: address already in use"

- Another process is using the port
- Find and kill it:
  - Windows: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`
  - Mac/Linux: `lsof -i :3000` then `kill -9 <PID>`

### "CORS error" in browser console

- Make sure the backend server is running
- Make sure you're selecting the correct backend in the frontend dropdown

### Frontend shows "Error connecting to backend"

- The backend server is not running
- Start it with `npm start` (JS) or `python main.py` (Python)

### SQLite database issues

- Delete the `students.db` file and restart the server
- It will recreate the database with sample data

---

## Next Steps

Now that everything is running, continue to:
- [02 - REST API Concepts](02-REST-API-CONCEPTS.md) to understand the theory
- [03 - Postman Guide](03-POSTMAN-GUIDE.md) to test your APIs professionally
