# 04 - JavaScript Backend Explained (Express.js + SQLite)

> A **line-by-line walkthrough** of the Express.js backend code. Every function, every line, explained.

---

## Table of Contents

1. [What is Node.js?](#1-what-is-nodejs)
2. [What is Express.js?](#2-what-is-expressjs)
3. [What is SQLite?](#3-what-is-sqlite)
4. [File: package.json Explained](#4-file-packagejson-explained)
5. [File: server.js - Full Walkthrough](#5-file-serverjs---full-walkthrough)
6. [How Middleware Works](#6-how-middleware-works)
7. [How Routing Works](#7-how-routing-works)
8. [How the Database Works](#8-how-the-database-works)
9. [Error Handling Patterns](#9-error-handling-patterns)
10. [Request and Response Objects](#10-request-and-response-objects)

---

## 1. What is Node.js?

**Node.js** is a **JavaScript runtime** that lets you run JavaScript **outside the browser**.

Normally, JavaScript only runs in web browsers (Chrome, Firefox, etc.). Node.js uses Chrome's V8 engine to run JavaScript on your computer, just like Python or Java.

```
Browser JavaScript:
  - Can manipulate HTML (DOM)
  - Can't access files or databases directly

Node.js JavaScript:
  - CAN read/write files
  - CAN connect to databases
  - CAN create web servers
  - Can't manipulate HTML (no DOM)
```

### How Node.js Runs Code

```
You write: server.js
You run:   node server.js
Node.js:   Reads server.js, executes it using V8 engine
Result:    Server starts listening on port 3000
```

---

## 2. What is Express.js?

**Express.js** is a **web framework** for Node.js. It makes it easy to create web servers and APIs.

Without Express, creating a server in pure Node.js is verbose:

```javascript
// Pure Node.js (hard way)
const http = require('http');
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/api/students') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([...]));
    }
});
server.listen(3000);
```

With Express, it's much simpler:

```javascript
// Express.js (easy way)
const express = require('express');
const app = express();

app.get('/api/students', (req, res) => {
    res.json([...]);
});

app.listen(3000);
```

Express handles routing, middleware, request/response parsing, and more.

---

## 3. What is SQLite?

**SQLite** is a **file-based database**. Unlike MySQL or PostgreSQL, it doesn't need a separate server process.

```
MySQL/PostgreSQL:          SQLite:
  Your App                   Your App
     |                          |
  Network                   Direct
     |                          |
  DB Server                 students.db (a file)
     |
  Database Files
```

**Advantages for learning:**
- No installation needed (comes built-in)
- No configuration
- Database is a single file (`students.db`)
- Delete the file to reset everything
- Perfect for development and learning

We use the `better-sqlite3` npm package to interact with SQLite from Node.js.

---

## 4. File: package.json Explained

```json
{
  "name": "restapi-js-backend",         // Project name
  "version": "1.0.0",                    // Version number
  "description": "REST API Backend...",   // Description
  "main": "server.js",                   // Entry point file
  "scripts": {
    "start": "node server.js",           // `npm start` runs this command
    "dev": "node server.js"              // `npm run dev` runs this command
  },
  "dependencies": {                      // Packages this project needs
    "express": "^4.18.2",               // Web framework
    "better-sqlite3": "^11.0.0",         // SQLite database driver
    "cors": "^2.8.5"                     // Cross-origin resource sharing
  }
}
```

### What happens when you run `npm install`?

1. npm reads `package.json`
2. Downloads `express`, `better-sqlite3`, and `cors` from the npm registry
3. Stores them in `node_modules/` folder
4. Creates `package-lock.json` (locks exact versions)

### What is `node_modules/`?

It's a folder containing ALL downloaded packages and their dependencies. It can be huge (hundreds of MBs). That's why it's in `.gitignore` - we never push it to GitHub. Anyone who clones the repo runs `npm install` to recreate it.

---

## 5. File: server.js - Full Walkthrough

Let's go through every section of the code.

### Section 1: Imports (require)

```javascript
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
```

**What is `require()`?**

`require()` is Node.js's way of importing modules (packages). Each line loads a package:

| Import | What It Does |
|--------|-------------|
| `express` | Web framework - creates the server and handles routes |
| `cors` | Middleware that allows cross-origin requests |
| `better-sqlite3` | SQLite database driver for Node.js |
| `path` | Built-in Node.js module for file path handling |

### Section 2: App Initialization

```javascript
const app = express();
const PORT = 3000;
```

- `express()` creates an Express application instance
- `PORT = 3000` defines which port the server will listen on
- `app` is the central object - we add routes and middleware to it

### Section 3: Middleware

```javascript
app.use(cors());
app.use(express.json());
```

`app.use()` adds **middleware** - functions that run on EVERY request before reaching route handlers.

| Middleware | Purpose |
|-----------|---------|
| `cors()` | Adds `Access-Control-Allow-Origin` header to responses, allowing the frontend to call this API |
| `express.json()` | Parses JSON request bodies. Without this, `req.body` would be `undefined` |

### Section 4: Database Setup

```javascript
const dbPath = path.join(__dirname, "students.db");
const db = new Database(dbPath);
```

- `__dirname` = the directory where `server.js` is located
- `path.join()` creates a proper file path: `C:\...\js-backend\students.db`
- `new Database(dbPath)` opens (or creates) the SQLite database file

```javascript
db.pragma("journal_mode = WAL");
```

WAL (Write-Ahead Logging) mode improves performance for concurrent reads/writes.

```javascript
db.exec(`
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        course TEXT NOT NULL,
        age INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);
```

This SQL creates the `students` table if it doesn't already exist:

| Column | Type | Constraints | Purpose |
|--------|------|------------|---------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ID, auto-increments |
| `name` | TEXT | NOT NULL | Student's name, required |
| `email` | TEXT | NOT NULL UNIQUE | Email, required, must be unique |
| `course` | TEXT | NOT NULL | Course name, required |
| `age` | INTEGER | (none) | Age, optional |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Auto-set when created |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Updated on modifications |

### Section 5: Sample Data

```javascript
const count = db.prepare("SELECT COUNT(*) as count FROM students").get();
if (count.count === 0) {
    const insert = db.prepare(
        "INSERT INTO students (name, email, course, age) VALUES (?, ?, ?, ?)"
    );
    insert.run("Alice Johnson", "alice@example.com", "Computer Science", 21);
    insert.run("Bob Smith", "bob@example.com", "Data Science", 23);
    insert.run("Charlie Brown", "charlie@example.com", "Web Development", 20);
}
```

- `db.prepare()` creates a **prepared statement** (a reusable SQL template)
- `?` are **placeholders** - values are passed separately (prevents SQL injection!)
- `.get()` returns one row, `.all()` returns all rows, `.run()` executes without returning data
- This only inserts data if the table is empty (first run)

### Section 6: GET All Students

```javascript
app.get("/api/students", (req, res) => {
    try {
        const students = db.prepare("SELECT * FROM students ORDER BY id").all();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
});
```

**Breaking it down:**

- `app.get("/api/students", ...)` - Register a handler for GET requests to `/api/students`
- `(req, res) => { ... }` - Arrow function with request and response objects
- `db.prepare("SELECT * FROM students ORDER BY id").all()` - Execute SQL, get all rows
- `res.status(200).json(students)` - Set status to 200, send JSON response
- `try/catch` - Catch any errors and return a 500 error

### Section 7: GET Student by ID

```javascript
app.get("/api/students/:id", (req, res) => {
    const student = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
    if (!student) {
        return res.status(404).json({ error: "Student not found" });
    }
    res.status(200).json(student);
});
```

- `:id` is a **route parameter** - it captures the value from the URL
- `req.params.id` - Accesses the captured value (e.g., for `/api/students/5`, `req.params.id` = `"5"`)
- `WHERE id = ?` - The `?` is replaced by `req.params.id` (safely, preventing SQL injection)
- If no student found, return 404

### Section 8: POST Create Student

```javascript
app.post("/api/students", (req, res) => {
    const { name, email, course, age } = req.body;

    if (!name || !email || !course) {
        return res.status(400).json({
            error: "Missing required fields: name, email, and course are required",
        });
    }

    const result = db.prepare(
        "INSERT INTO students (name, email, course, age) VALUES (?, ?, ?, ?)"
    ).run(name, email, course, age || null);

    const newStudent = db.prepare("SELECT * FROM students WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(newStudent);
});
```

- `const { name, email, course, age } = req.body` - **Destructuring**: extracts fields from the JSON body
- Validation: Check if required fields are present
- `.run()` executes the INSERT and returns `{ lastInsertRowid, changes }`
- `result.lastInsertRowid` gives the auto-generated ID
- Fetch the newly created student and return it with status 201

### Section 9: PUT Full Update

```javascript
app.put("/api/students/:id", (req, res) => {
    const { name, email, course, age } = req.body;

    if (!name || !email || !course) {
        return res.status(400).json({ error: "PUT requires all fields..." });
    }

    const existing = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
    if (!existing) {
        return res.status(404).json({ error: "Student not found" });
    }

    db.prepare(
        `UPDATE students SET name = ?, email = ?, course = ?, age = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(name, email, course, age || null, req.params.id);

    const updated = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
    res.status(200).json(updated);
});
```

Key difference from PATCH: **ALL fields are required**. If any are missing, it returns 400.

### Section 10: PATCH Partial Update

```javascript
app.patch("/api/students/:id", (req, res) => {
    // Check if student exists
    const existing = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Student not found" });

    // Only update provided fields
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.email !== undefined) updates.email = req.body.email;
    if (req.body.course !== undefined) updates.course = req.body.course;
    if (req.body.age !== undefined) updates.age = req.body.age;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields provided to update" });
    }

    // Build dynamic SQL
    const setClauses = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(updates);

    db.prepare(`UPDATE students SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(...values, req.params.id);
});
```

**The dynamic SQL building is key here:**

If you send `{ "name": "Alice", "age": 22 }`:
- `setClauses` becomes `"name = ?, age = ?"`
- `values` becomes `["Alice", 22]`
- Final SQL: `UPDATE students SET name = ?, age = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`

### Section 11: DELETE

```javascript
app.delete("/api/students/:id", (req, res) => {
    const existing = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Student not found" });

    db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
    res.status(200).json({ message: `Student '${existing.name}' deleted successfully`, deleted: existing });
});
```

We fetch the student first to check it exists AND to include it in the response (so the client knows what was deleted).

### Section 12: Start Server

```javascript
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

`app.listen()` starts the HTTP server. The callback function runs once the server is ready.

---

## 6. How Middleware Works

Middleware are functions that run **in sequence** before reaching the route handler:

```
Request arrives
     |
     v
  cors()          <- Step 1: Add CORS headers
     |
     v
  express.json()  <- Step 2: Parse JSON body
     |
     v
  Route Handler   <- Step 3: Your GET/POST/PUT/PATCH/DELETE handler
     |
     v
  Response sent
```

Middleware can:
- Modify the request (`req`)
- Modify the response (`res`)
- End the request-response cycle
- Call `next()` to pass to the next middleware

---

## 7. How Routing Works

Express matches requests to handlers in the **order they're defined**:

```javascript
// Request: GET /api/students
// Express checks each route:
app.get("/api/students", ...)      // MATCH! Run this handler
app.get("/api/students/:id", ...)  // Not checked (already matched)
app.post("/api/students", ...)     // Not checked (wrong method)
```

Route parameters (`:id`) match any value:

```javascript
app.get("/api/students/:id", (req, res) => {
    // /api/students/1   -> req.params.id = "1"
    // /api/students/42  -> req.params.id = "42"
    // /api/students/abc -> req.params.id = "abc"
});
```

---

## 8. How the Database Works

### Prepared Statements

```javascript
// BAD - SQL Injection vulnerability!
db.exec(`SELECT * FROM students WHERE id = ${userInput}`);

// GOOD - Parameterized query (safe!)
db.prepare("SELECT * FROM students WHERE id = ?").get(userInput);
```

The `?` placeholder is replaced safely by the database driver. Even if `userInput` contains malicious SQL, it's treated as a plain value.

### Return Values

| Method | Returns | Use When |
|--------|---------|----------|
| `.all()` | Array of rows | You want multiple results (SELECT all) |
| `.get()` | Single row or undefined | You want one result (SELECT by ID) |
| `.run()` | `{ changes, lastInsertRowid }` | INSERT, UPDATE, DELETE |

---

## 9. Error Handling Patterns

```javascript
try {
    // Try the operation
    const result = db.prepare("INSERT ...").run(data);
    res.status(201).json(result);
} catch (error) {
    // Handle specific errors
    if (error.message.includes("UNIQUE constraint failed")) {
        return res.status(409).json({ error: "Duplicate email" });
    }
    // Generic error
    res.status(500).json({ error: "Internal server error" });
}
```

**Pattern**: Try the happy path, catch specific errors, return appropriate status codes.

---

## 10. Request and Response Objects

### Request (`req`)

| Property | Contains | Example |
|----------|----------|---------|
| `req.params` | URL parameters | `req.params.id` from `/students/:id` |
| `req.body` | Request body (JSON) | `req.body.name` from POST data |
| `req.query` | Query string | `req.query.page` from `?page=1` |
| `req.method` | HTTP method | `"GET"`, `"POST"`, etc. |
| `req.headers` | Request headers | `req.headers["content-type"]` |

### Response (`res`)

| Method | Purpose | Example |
|--------|---------|---------|
| `res.json(data)` | Send JSON response | `res.json({ id: 1 })` |
| `res.status(code)` | Set status code | `res.status(201)` |
| `res.send(text)` | Send text response | `res.send("Hello")` |

These can be chained: `res.status(201).json(data)`

---

## Next Steps

- [05 - FastAPI Backend Explained](05-FASTAPI-BACKEND-EXPLAINED.md) - See the same concepts in Python
- [06 - Frontend Explained](06-FRONTEND-EXPLAINED.md) - How the frontend calls these APIs
