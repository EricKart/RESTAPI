# 03 - Testing with Postman: Complete Guide

> This guide teaches you how to use **Postman** to test every endpoint of our REST API. Postman is the industry-standard tool for API testing.

---

## Table of Contents

1. [What is Postman and Why Use It?](#1-what-is-postman-and-why-use-it)
2. [Setting Up Postman](#2-setting-up-postman)
3. [Creating a Collection](#3-creating-a-collection)
4. [Testing GET - Fetch All Students](#4-testing-get---fetch-all-students)
5. [Testing GET - Fetch Student by ID](#5-testing-get---fetch-student-by-id)
6. [Testing POST - Create a Student](#6-testing-post---create-a-student)
7. [Testing PUT - Full Update](#7-testing-put---full-update)
8. [Testing PATCH - Partial Update](#8-testing-patch---partial-update)
9. [Testing DELETE - Remove a Student](#9-testing-delete---remove-a-student)
10. [Testing Error Scenarios](#10-testing-error-scenarios)
11. [Understanding Postman Response Panel](#11-understanding-postman-response-panel)
12. [Saving and Sharing Collections](#12-saving-and-sharing-collections)

---

## 1. What is Postman and Why Use It?

**Postman** is an application that lets you send HTTP requests to APIs and see the responses.

### Why not just use the browser?

- Browsers can only send **GET** requests from the address bar
- You can't send POST, PUT, PATCH, DELETE from the browser URL bar
- Postman lets you:
  - Set **any HTTP method** (GET, POST, PUT, PATCH, DELETE)
  - Set **request headers** (Content-Type, Authorization, etc.)
  - Set **request body** (JSON data)
  - See **response status codes**
  - See **response headers**
  - See **response time**
  - **Save requests** into collections for reuse

### Postman vs Frontend vs Browser

| Tool | Can Do | Use For |
|------|--------|---------|
| Browser | GET only (address bar) | Quick check if server is running |
| Frontend | All methods (via JavaScript) | End-user interaction |
| Postman | All methods + full control | Development, testing, debugging |

---

## 2. Setting Up Postman

1. Download Postman from [https://www.postman.com/downloads](https://www.postman.com/downloads)
2. Install and open it
3. Create a free account (or skip sign-in for now)
4. You'll see the main Postman workspace

### Postman Interface Overview

```
+---------------------------------------------------+
|  [Collections] [Environments] [History]            |
|---------------------------------------------------|
|  [GET v] [http://localhost:3000/api/students] [Send]|
|---------------------------------------------------|
|  [Params] [Headers] [Body] [Auth]    <- Request    |
|---------------------------------------------------|
|  Response:                           <- Response   |
|  [Body] [Headers] [Status] [Time]                  |
+---------------------------------------------------+
```

---

## 3. Creating a Collection

A **Collection** is a folder that groups related requests together.

1. Click **"Collections"** in the left sidebar
2. Click **"+"** or **"Create Collection"**
3. Name it: **"REST API - Student Manager"**
4. Click **"Save"**

Now we'll add requests to this collection.

---

## 4. Testing GET - Fetch All Students

### Setup

1. Click **"+"** to create a new request tab
2. Method: **GET** (it's the default)
3. URL: `http://localhost:3000/api/students` (or `http://localhost:8000/api/students` for FastAPI)
4. Click **"Send"**

### Expected Response

**Status**: `200 OK`

**Body**:
```json
[
    {
        "id": 1,
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "course": "Computer Science",
        "age": 21,
        "created_at": "2024-01-01 12:00:00",
        "updated_at": "2024-01-01 12:00:00"
    },
    {
        "id": 2,
        "name": "Bob Smith",
        "email": "bob@example.com",
        "course": "Data Science",
        "age": 23,
        "created_at": "2024-01-01 12:00:00",
        "updated_at": "2024-01-01 12:00:00"
    },
    {
        "id": 3,
        "name": "Charlie Brown",
        "email": "charlie@example.com",
        "course": "Web Development",
        "age": 20,
        "created_at": "2024-01-01 12:00:00",
        "updated_at": "2024-01-01 12:00:00"
    }
]
```

### What Happened?

```
Client (Postman)                    Server
     |                                |
     |--- GET /api/students --------->|
     |                                |-- Query database: SELECT * FROM students
     |                                |-- Get results
     |<-- 200 OK + JSON array --------|
     |                                |
```

### Save this request

1. Click **"Save"** (or Ctrl+S)
2. Name: **"GET All Students"**
3. Collection: **"REST API - Student Manager"**

---

## 5. Testing GET - Fetch Student by ID

### Setup

1. Create new request tab
2. Method: **GET**
3. URL: `http://localhost:3000/api/students/1`
4. Click **"Send"**

### Expected Response

**Status**: `200 OK`

**Body**:
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

### Test with non-existent ID

Change URL to: `http://localhost:3000/api/students/999`

**Status**: `404 Not Found`

**Body**:
```json
{
    "error": "Student not found"
}
```

Save as: **"GET Student by ID"**

---

## 6. Testing POST - Create a Student

### Setup

1. Create new request tab
2. Method: **POST** (click the dropdown and change from GET to POST)
3. URL: `http://localhost:3000/api/students`
4. Click the **"Body"** tab below the URL
5. Select **"raw"**
6. Change the dropdown from "Text" to **"JSON"**
7. Enter this body:

```json
{
    "name": "David Wilson",
    "email": "david@example.com",
    "course": "Machine Learning",
    "age": 22
}
```

8. Click **"Send"**

### Expected Response

**Status**: `201 Created`

**Body**:
```json
{
    "id": 4,
    "name": "David Wilson",
    "email": "david@example.com",
    "course": "Machine Learning",
    "age": 22,
    "created_at": "2024-01-01 12:00:00",
    "updated_at": "2024-01-01 12:00:00"
}
```

### Verify it was created

Go back to the "GET All Students" request and click Send. You should now see **4 students**.

### Important: Content-Type Header

When you select "raw" + "JSON" in Postman, it automatically sets:

```
Content-Type: application/json
```

This header tells the server: "The data I'm sending is in JSON format."

Save as: **"POST Create Student"**

---

## 7. Testing PUT - Full Update

### Setup

1. Create new request tab
2. Method: **PUT**
3. URL: `http://localhost:3000/api/students/1`
4. Body > raw > JSON:

```json
{
    "name": "Alice Smith",
    "email": "alice.smith@example.com",
    "course": "Mathematics",
    "age": 22
}
```

5. Click **"Send"**

### Expected Response

**Status**: `200 OK`

**Body**:
```json
{
    "id": 1,
    "name": "Alice Smith",
    "email": "alice.smith@example.com",
    "course": "Mathematics",
    "age": 22,
    "created_at": "2024-01-01 12:00:00",
    "updated_at": "2024-01-02 10:30:00"
}
```

Notice: **ALL fields changed**, including email and course. That's what PUT does - full replacement.

### Test: PUT with Missing Fields

Try sending only partial data:

```json
{
    "name": "Alice Smith"
}
```

**Expected**: `400 Bad Request` - "PUT requires all fields: name, email, and course"

Save as: **"PUT Full Update"**

---

## 8. Testing PATCH - Partial Update

### Setup

1. Create new request tab
2. Method: **PATCH**
3. URL: `http://localhost:3000/api/students/2`
4. Body > raw > JSON:

```json
{
    "course": "Artificial Intelligence"
}
```

5. Click **"Send"**

### Expected Response

**Status**: `200 OK`

**Body**:
```json
{
    "id": 2,
    "name": "Bob Smith",
    "email": "bob@example.com",
    "course": "Artificial Intelligence",
    "age": 23,
    "created_at": "2024-01-01 12:00:00",
    "updated_at": "2024-01-02 10:35:00"
}
```

Notice: **Only `course` changed**. Name, email, and age stayed the same. That's the difference from PUT!

### Try updating just the age

```json
{
    "age": 25
}
```

Only age will change. Everything else stays the same.

Save as: **"PATCH Partial Update"**

---

## 9. Testing DELETE - Remove a Student

### Setup

1. Create new request tab
2. Method: **DELETE**
3. URL: `http://localhost:3000/api/students/3`
4. No body needed
5. Click **"Send"**

### Expected Response

**Status**: `200 OK`

**Body**:
```json
{
    "message": "Student 'Charlie Brown' deleted successfully",
    "deleted": {
        "id": 3,
        "name": "Charlie Brown",
        "email": "charlie@example.com",
        "course": "Web Development",
        "age": 20
    }
}
```

### Verify it was deleted

Run "GET All Students" again. Charlie should be gone.

### Try deleting again

Send the same DELETE request again to `/api/students/3`.

**Expected**: `404 Not Found` - "Student not found"

This makes sense - you can't delete something that doesn't exist.

Save as: **"DELETE Student"**

---

## 10. Testing Error Scenarios

Testing errors is just as important as testing success cases.

### Missing Required Fields (POST)

```
POST /api/students
Body: { "name": "Test" }

Expected: 400 Bad Request
Response: { "error": "Missing required fields: name, email, and course are required" }
```

### Duplicate Email (POST)

```
POST /api/students
Body: { "name": "Test", "email": "alice@example.com", "course": "Test" }

Expected: 409 Conflict
Response: { "error": "A student with this email already exists" }
```

### Invalid ID (GET/PUT/PATCH/DELETE)

```
GET /api/students/9999

Expected: 404 Not Found
Response: { "error": "Student not found" }
```

### No body for PATCH

```
PATCH /api/students/1
Body: {}

Expected: 400 Bad Request
Response: { "error": "No fields provided to update" }
```

---

## 11. Understanding Postman Response Panel

After clicking Send, the response area shows:

### Body Tab

The actual data returned by the server. Can view as:
- **Pretty**: Formatted JSON (easiest to read)
- **Raw**: Unformatted text
- **Preview**: Rendered HTML (not useful for JSON APIs)

### Headers Tab

Response headers sent by the server:
- `Content-Type: application/json` - Format of response
- `Access-Control-Allow-Origin: *` - CORS header

### Status

The HTTP status code (e.g., `200 OK`, `201 Created`, `404 Not Found`)

### Time

How long the request took (e.g., `15ms`). This helps you measure API performance.

### Size

The size of the response body (e.g., `256 B`)

---

## 12. Saving and Sharing Collections

### Your Final Collection Should Have

```
REST API - Student Manager/
  |-- GET All Students
  |-- GET Student by ID
  |-- POST Create Student
  |-- PUT Full Update
  |-- PATCH Partial Update
  |-- DELETE Student
```

### Export Collection

1. Click the three dots (**...**) on the collection
2. Select **"Export"**
3. Choose **"Collection v2.1"** format
4. Save the `.json` file
5. Share it with your team!

### Import Collection

1. Click **"Import"** button (top left)
2. Drag and drop the `.json` file
3. The entire collection with all requests is imported

---

## Summary

| Test | Method | URL | Body Required? | Expected Status |
|------|--------|-----|---------------|----------------|
| Get all students | GET | `/api/students` | No | 200 |
| Get one student | GET | `/api/students/1` | No | 200 |
| Get missing student | GET | `/api/students/999` | No | 404 |
| Create student | POST | `/api/students` | Yes (all fields) | 201 |
| Create with missing fields | POST | `/api/students` | Yes (incomplete) | 400 |
| Create duplicate email | POST | `/api/students` | Yes (dup email) | 409 |
| Full update | PUT | `/api/students/1` | Yes (all fields) | 200 |
| PUT with partial data | PUT | `/api/students/1` | Yes (partial) | 400 |
| Partial update | PATCH | `/api/students/1` | Yes (some fields) | 200 |
| Delete student | DELETE | `/api/students/1` | No | 200 |
| Delete missing student | DELETE | `/api/students/999` | No | 404 |

---

## Next Steps

- [04 - JS Backend Explained](04-JS-BACKEND-EXPLAINED.md) - Understand the Express.js code
- [05 - FastAPI Backend Explained](05-FASTAPI-BACKEND-EXPLAINED.md) - Understand the Python code
