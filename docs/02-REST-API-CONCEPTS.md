# 02 - REST API Concepts: Everything You Need to Know

> This document explains **what REST APIs are**, **how they work**, and **why they matter** from the ground up.

---

## Table of Contents

1. [What is an API?](#1-what-is-an-api)
2. [What is REST?](#2-what-is-rest)
3. [How the Web Works (HTTP Basics)](#3-how-the-web-works-http-basics)
4. [HTTP Methods (Verbs)](#4-http-methods-verbs)
5. [HTTP Status Codes](#5-http-status-codes)
6. [Request and Response Structure](#6-request-and-response-structure)
7. [CRUD Operations](#7-crud-operations)
8. [JSON - The Data Format](#8-json---the-data-format)
9. [URL Structure and Endpoints](#9-url-structure-and-endpoints)
10. [Headers](#10-headers)
11. [PUT vs PATCH - The Key Difference](#11-put-vs-patch---the-key-difference)
12. [CORS - Cross-Origin Resource Sharing](#12-cors---cross-origin-resource-sharing)
13. [The Full Flow: Frontend to Database](#13-the-full-flow-frontend-to-database)
14. [REST API Best Practices](#14-rest-api-best-practices)
15. [Why FastAPI? Why Express.js?](#15-why-fastapi-why-expressjs)

---

## 1. What is an API?

**API** stands for **Application Programming Interface**.

Think of it like a **waiter in a restaurant**:

```
You (Client)  -->  Waiter (API)  -->  Kitchen (Server/Database)
                                          |
You (Client)  <--  Waiter (API)  <--  Kitchen (Server/Database)
```

- **You** are the frontend (or Postman, or any client)
- **The waiter (API)** takes your order, brings it to the kitchen, and returns food
- **The kitchen** is the backend + database

An API is a **set of rules** that defines how software components should communicate. You don't need to know how the kitchen works - you just need to know **what to ask for** and **how to ask for it**.

### Real-World API Examples

- **Google Maps API**: Your app asks Google for map data
- **Twitter API**: An app posts tweets on your behalf
- **Payment APIs (Stripe)**: An app charges your credit card
- **Weather APIs**: Your app gets weather data for a city

---

## 2. What is REST?

**REST** stands for **Representational State Transfer**.

It's a set of **rules/conventions** for building web APIs. REST is NOT a technology or protocol - it's an **architectural style** (a way of designing APIs).

### The 6 Principles of REST

1. **Client-Server**: Frontend and backend are separate. They communicate over HTTP.
2. **Stateless**: Each request is independent. The server doesn't remember previous requests.
3. **Uniform Interface**: Consistent URL patterns and HTTP methods.
4. **Resource-Based**: Everything is a "resource" (student, product, user) with a unique URL.
5. **Cacheable**: Responses can be cached for performance.
6. **Layered System**: The client doesn't know if it's talking to the final server or a middle layer.

### What is a "Resource"?

In REST, a **resource** is any entity you want to manage. In our app:

- A **student** is a resource
- The **collection of all students** is also a resource

Each resource has a **unique URL** (endpoint):

```
/api/students      -> The collection of all students
/api/students/1    -> A specific student with ID 1
/api/students/2    -> A specific student with ID 2
```

---

## 3. How the Web Works (HTTP Basics)

**HTTP** (HyperText Transfer Protocol) is the protocol used for communication between clients and servers on the web.

### The Request-Response Cycle

Every HTTP interaction follows this pattern:

```
1. Client sends a REQUEST  -->  Server
2. Server processes it
3. Server sends a RESPONSE  -->  Client
```

Example:

```
Client: "Hey server, give me all students"
        GET /api/students HTTP/1.1

Server: "Here are all students"
        HTTP/1.1 200 OK
        [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
```

---

## 4. HTTP Methods (Verbs)

HTTP methods tell the server **what action** you want to perform. Think of them as **verbs** - they describe what to do.

### The 5 Main Methods

| Method | Purpose | Analogy | Safe? | Idempotent? |
|--------|---------|---------|-------|-------------|
| `GET` | Read/retrieve data | "Show me the menu" | Yes | Yes |
| `POST` | Create new data | "I'd like to order a new dish" | No | No |
| `PUT` | Replace/update entirely | "Replace my entire order" | No | Yes |
| `PATCH` | Update partially | "Add extra cheese to my order" | No | Yes |
| `DELETE` | Remove data | "Cancel my order" | No | Yes |

### What is "Safe"?

A **safe** method does NOT change data on the server. GET is safe because it only reads data.

### What is "Idempotent"?

An **idempotent** method produces the **same result** no matter how many times you call it.

- `GET /students/1` - Returns the same student every time (idempotent)
- `DELETE /students/1` - First call deletes it, second call returns 404. But the end state is the same - student is deleted (idempotent)
- `POST /students` - Each call creates a NEW student. Calling it 3 times creates 3 students (NOT idempotent)

### Method Details

#### GET - Read Data

```
GET /api/students           -> Get ALL students
GET /api/students/1         -> Get student with ID 1

- No request body
- Returns data in response body
- Never changes data on the server
```

#### POST - Create Data

```
POST /api/students
Body: { "name": "Alice", "email": "alice@example.com", "course": "CS" }

- Sends data in request body
- Server creates a new record
- Returns the created record with a new ID
- Returns status 201 Created
```

#### PUT - Replace Data (Full Update)

```
PUT /api/students/1
Body: { "name": "Alice Updated", "email": "alice@new.com", "course": "Math", "age": 22 }

- Must send ALL fields (even unchanged ones)
- Replaces the entire record
- Returns the updated record
```

#### PATCH - Modify Data (Partial Update)

```
PATCH /api/students/1
Body: { "name": "Alice Updated" }

- Send ONLY the fields you want to change
- Other fields remain unchanged
- Returns the updated record
```

#### DELETE - Remove Data

```
DELETE /api/students/1

- No request body needed
- Removes the record from the database
- Returns confirmation message
```

---

## 5. HTTP Status Codes

Status codes tell the client **what happened** with their request. They are 3-digit numbers grouped by category.

### Categories

| Range | Category | Meaning |
|-------|----------|---------|
| `1xx` | Informational | Request received, continuing |
| `2xx` | Success | Request was successful |
| `3xx` | Redirection | Further action needed |
| `4xx` | Client Error | Problem with the request |
| `5xx` | Server Error | Problem with the server |

### Common Status Codes (Used in This Project)

| Code | Name | When It's Used |
|------|------|---------------|
| `200` | OK | Successful GET, PUT, PATCH, DELETE |
| `201` | Created | Successful POST (new resource created) |
| `400` | Bad Request | Client sent invalid data (missing fields) |
| `404` | Not Found | Resource doesn't exist (wrong ID) |
| `409` | Conflict | Resource already exists (duplicate email) |
| `500` | Internal Server Error | Something went wrong on the server |

### How to Remember

- **2xx** = "Everything is fine"
- **4xx** = "You (client) messed up"
- **5xx** = "I (server) messed up"

---

## 6. Request and Response Structure

### HTTP Request Structure

Every HTTP request has these parts:

```
[METHOD] [URL] HTTP/1.1        <- Request Line
Host: localhost:3000            <- Headers
Content-Type: application/json  <- Headers
                                <- Empty line
{ "name": "Alice" }            <- Body (optional, for POST/PUT/PATCH)
```

**Example - Creating a student:**

```http
POST /api/students HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "course": "Computer Science",
    "age": 21
}
```

### HTTP Response Structure

```
HTTP/1.1 201 Created            <- Status Line
Content-Type: application/json   <- Headers
                                 <- Empty line
{                                <- Body
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "course": "Computer Science",
    "age": 21,
    "created_at": "2024-01-01T12:00:00"
}
```

---

## 7. CRUD Operations

CRUD is an acronym for the four basic operations you can do with data:

| CRUD | Meaning | HTTP Method | SQL Equivalent |
|------|---------|-------------|---------------|
| **C** | Create | POST | INSERT |
| **R** | Read | GET | SELECT |
| **U** | Update | PUT / PATCH | UPDATE |
| **D** | Delete | DELETE | DELETE |

### How It Maps in Our App

```
Create a student   -> POST   /api/students      -> INSERT INTO students
Read all students  -> GET    /api/students       -> SELECT * FROM students
Read one student   -> GET    /api/students/1     -> SELECT * FROM students WHERE id = 1
Update a student   -> PUT    /api/students/1     -> UPDATE students SET ... WHERE id = 1
Partial update     -> PATCH  /api/students/1     -> UPDATE students SET name = ... WHERE id = 1
Delete a student   -> DELETE /api/students/1     -> DELETE FROM students WHERE id = 1
```

---

## 8. JSON - The Data Format

**JSON** (JavaScript Object Notation) is the standard data format for REST APIs.

### JSON Syntax Rules

```json
{
    "string": "Hello World",
    "number": 42,
    "decimal": 3.14,
    "boolean": true,
    "null_value": null,
    "array": [1, 2, 3],
    "object": {
        "nested": "value"
    }
}
```

**Rules:**
- Keys must be in **double quotes** (`"name"`, not `'name'`)
- Strings use **double quotes**
- No trailing commas
- No comments allowed

### Why JSON?

- **Human-readable**: Easy to read and write
- **Language-independent**: Works with JavaScript, Python, Java, C#, etc.
- **Lightweight**: Less verbose than XML
- **Native to JavaScript**: `JSON.parse()` and `JSON.stringify()`

### Our Student JSON

```json
{
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "course": "Computer Science",
    "age": 21,
    "created_at": "2024-01-01 12:00:00",
    "updated_at": "2024-01-01 12:00:00"
}
```

---

## 9. URL Structure and Endpoints

### API URL Anatomy

```
http://localhost:3000/api/students/1
|___|  |_________|___||___|________|_|
  |        |      |    |      |     |
protocol  host   port  path  resource  id
```

### RESTful URL Conventions

Good RESTful URLs are:

```
GET    /api/students          <- Plural nouns for collections
GET    /api/students/1        <- ID for specific resource
POST   /api/students          <- Same URL as collection, POST implies creation
PUT    /api/students/1        <- ID for which resource to update
DELETE /api/students/1        <- ID for which resource to delete
```

**Bad URLs (avoid these):**

```
GET /api/getStudents          <- Don't use verbs
GET /api/student/getById/1    <- Don't use getById
POST /api/createStudent       <- Don't use create in URL
DELETE /api/deleteStudent/1   <- Don't use delete in URL
```

The HTTP **method** already tells you the action. The URL should only describe the **resource**.

---

## 10. Headers

HTTP headers provide **metadata** about the request or response. They are key-value pairs.

### Important Request Headers

| Header | Purpose | Example |
|--------|---------|---------|
| `Content-Type` | Format of request body | `application/json` |
| `Accept` | Desired response format | `application/json` |
| `Authorization` | Authentication credentials | `Bearer <token>` |
| `User-Agent` | Client identification | `Mozilla/5.0...` |

### Important Response Headers

| Header | Purpose | Example |
|--------|---------|---------|
| `Content-Type` | Format of response body | `application/json` |
| `Content-Length` | Size of response body | `256` |
| `Access-Control-Allow-Origin` | CORS permission | `*` |

### In Our App

When the frontend sends a POST request:

```http
Content-Type: application/json    <- "I'm sending JSON data"
```

The server responds with:

```http
Content-Type: application/json    <- "I'm returning JSON data"
Access-Control-Allow-Origin: *    <- "Any frontend can access this"
```

---

## 11. PUT vs PATCH - The Key Difference

This is one of the most commonly confused topics. Let's clarify.

### Current Student Data

```json
{
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "course": "Computer Science",
    "age": 21
}
```

### PUT - Full Replacement

To change just the name, you must send **ALL fields**:

```json
PUT /api/students/1
{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "course": "Computer Science",
    "age": 21
}
```

If you send only the name:

```json
PUT /api/students/1
{ "name": "Alice Smith" }
```

The server will return a **400 Bad Request** because PUT expects ALL fields.

### PATCH - Partial Update

You only send the fields you want to change:

```json
PATCH /api/students/1
{ "name": "Alice Smith" }
```

Result: Only name changes. Email, course, and age remain the same.

### When to Use Which?

| Use | When |
|-----|------|
| PUT | You want to replace the entire resource (like overwriting a file) |
| PATCH | You want to update just one or two fields (like editing a cell in a spreadsheet) |

---

## 12. CORS - Cross-Origin Resource Sharing

### What is CORS?

CORS is a **security feature** built into browsers. It prevents a webpage from making requests to a different domain/port unless the server explicitly allows it.

### The Problem

```
Frontend: http://localhost:5500  (Live Server)
Backend:  http://localhost:3000  (Express)

These are different ORIGINS (different ports)!
```

Without CORS, the browser blocks the frontend from calling the backend:

```
Browser: "Hey, you (frontend on port 5500) are trying to call 
          port 3000. That's a different origin! BLOCKED!"
```

### The Solution

The backend tells the browser: "I allow requests from other origins"

**Express.js:**
```javascript
const cors = require("cors");
app.use(cors()); // Allow all origins
```

**FastAPI:**
```python
app.add_middleware(CORSMiddleware, allow_origins=["*"])
```

The server responds with a header:
```
Access-Control-Allow-Origin: *
```

The browser sees this and says: "OK, the server allows it. Request permitted."

---

## 13. The Full Flow: Frontend to Database

Let's trace what happens when you click "POST - Create Student":

```
Step 1: USER clicks "Create Student" button

Step 2: FRONTEND (app.js)
        - Collects form data: { name, email, course, age }
        - Calls fetch("http://localhost:3000/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(studentData)
          })
        - Browser sends HTTP request over the network

Step 3: NETWORK
        - HTTP request travels from browser to server
        - POST http://localhost:3000/api/students

Step 4: BACKEND (server.js or main.py)
        - Express/FastAPI receives the request
        - Middleware runs (CORS check, JSON parsing)
        - Route handler matches: POST /api/students
        - Validates the data (are required fields present?)
        - If invalid: returns 400 Bad Request
        - If valid: continues to database

Step 5: DATABASE (SQLite)
        - Server executes SQL:
          INSERT INTO students (name, email, course, age)
          VALUES ('Alice', 'alice@example.com', 'CS', 21)
        - Database creates the record
        - Returns the new ID (e.g., 4)

Step 6: BACKEND
        - Fetches the newly created record from database
        - Creates JSON response
        - Sends HTTP Response:
          Status: 201 Created
          Body: { "id": 4, "name": "Alice", ... }

Step 7: NETWORK
        - Response travels back to browser

Step 8: FRONTEND
        - fetch() resolves with the response
        - .json() parses the response body
        - Logs the request/response in the logger panel
        - Shows success alert
        - Calls fetchStudents() to refresh the student list
        - The new student appears in the list!
```

This is the **complete lifecycle** of a REST API request. Every CRUD operation follows this same pattern.

---

## 14. REST API Best Practices

### URL Design

- Use **plural nouns** for resources: `/students`, not `/student`
- Use **lowercase**: `/api/students`, not `/api/Students`
- Use **hyphens** for multi-word: `/api/course-enrollments`
- **Don't use verbs** in URLs: `/api/students`, not `/api/getStudents`

### Response Design

- Always return **JSON**
- Include meaningful **error messages**
- Use proper **status codes** (don't always return 200)
- Return the **created/updated resource** after POST/PUT/PATCH

### Validation

- Validate **all input** on the server (never trust the client)
- Return **400 Bad Request** with details about what's wrong
- Check for required fields before processing

### Error Handling

- Never expose internal errors to clients (no stack traces!)
- Return consistent error format:

```json
{
    "error": "Student not found"
}
```

---

## 15. Why FastAPI? Why Express.js?

### Why Do We Use FastAPI?

**FastAPI** is a modern Python web framework. Here's why it's great for learning:

1. **Automatic Documentation**: Visit `/docs` and you get a full interactive API tester
2. **Type Safety**: Pydantic models validate data automatically
3. **Clear Errors**: If you send wrong data, it tells you exactly what's wrong
4. **Python**: If you're learning data science/ML, Python is your language
5. **Fast**: One of the fastest Python frameworks (async support)
6. **Modern**: Uses modern Python features (type hints, async/await)

### How Does JavaScript (Express.js) Work?

**Express.js** runs on **Node.js**, which lets JavaScript run outside the browser.

1. **Node.js** is a JavaScript runtime (like Python is a runtime for .py files)
2. **Express.js** is a framework that makes building APIs easy
3. **npm** is the package manager (like pip for Python)
4. JavaScript is **event-driven** and **non-blocking** (single thread, but efficient)
5. **Same Language**: Frontend (browser JS) and Backend (Node.js) use the same language

### Side-by-Side Comparison

**Creating a GET endpoint:**

Express.js:
```javascript
app.get("/api/students", (req, res) => {
    const students = db.prepare("SELECT * FROM students").all();
    res.status(200).json(students);
});
```

FastAPI:
```python
@app.get("/api/students")
def get_all_students():
    conn = get_db()
    students = conn.execute("SELECT * FROM students").fetchall()
    conn.close()
    return [dict(s) for s in students]
```

**Key differences:**
- Express uses `req, res` objects; FastAPI uses return values and type hints
- Express requires manual JSON response (`res.json()`); FastAPI auto-converts to JSON
- Express has no built-in validation; FastAPI uses Pydantic models
- FastAPI generates documentation automatically; Express needs manual setup

Both achieve the **same result** - a working REST API. The choice depends on your team, project, and preference.

---

## Summary Cheat Sheet

```
REST API = Rules for building web APIs

HTTP Methods:
  GET    = Read    (safe, idempotent)
  POST   = Create  (not safe, not idempotent)
  PUT    = Replace (not safe, idempotent)
  PATCH  = Modify  (not safe, idempotent)
  DELETE = Remove  (not safe, idempotent)

Status Codes:
  200 = OK
  201 = Created
  400 = Bad Request (your fault)
  404 = Not Found
  409 = Conflict (duplicate)
  500 = Server Error (our fault)

CRUD = Create(POST) Read(GET) Update(PUT/PATCH) Delete(DELETE)

JSON = Data format for APIs

URL Pattern:
  /api/resources     = Collection
  /api/resources/:id = Specific item

Headers:
  Content-Type: application/json
  (tells the server what format you're sending)
```

---

## Next Steps

- [03 - Postman Guide](03-POSTMAN-GUIDE.md) - Test all these concepts with Postman
- [04 - JS Backend Explained](04-JS-BACKEND-EXPLAINED.md) - See how Express.js implements these concepts
- [05 - FastAPI Backend Explained](05-FASTAPI-BACKEND-EXPLAINED.md) - See how FastAPI implements these concepts
