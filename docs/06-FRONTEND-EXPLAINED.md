# 06 - Frontend Explained (HTML + CSS + JavaScript)

> A complete walkthrough of how the frontend works, how JavaScript sends HTTP requests, and how it all connects.

---

## Table of Contents

1. [Overview: What Does the Frontend Do?](#1-overview-what-does-the-frontend-do)
2. [File: index.html Explained](#2-file-indexhtml-explained)
3. [File: style.css Explained](#3-file-stylecss-explained)
4. [File: app.js - Full Walkthrough](#4-file-appjs---full-walkthrough)
5. [How fetch() Works](#5-how-fetch-works)
6. [How the Frontend Talks to the Backend](#6-how-the-frontend-talks-to-the-backend)
7. [The Request Logger](#7-the-request-logger)
8. [XSS Prevention](#8-xss-prevention)
9. [Async/Await in JavaScript](#9-asyncawait-in-javascript)

---

## 1. Overview: What Does the Frontend Do?

The frontend is a **single-page application** (SPA) built with plain HTML, CSS, and JavaScript - no frameworks like React or Angular.

It does three things:
1. **Displays a form** to create/edit students (triggers POST/PUT)
2. **Displays a list** of students (fetched via GET)
3. **Logs all HTTP requests** so you can see exactly what's happening

```
+-------------------------------------------+
|  Header (Backend selector)                |
+-------------------------------------------+
|  HTTP Request Logger                       |
|  (Shows every request/response live)       |
+-------------------------------------------+
|  Form Section      |  Student List        |
|  - Create (POST)   |  - Fetch All (GET)   |
|  - Edit (PUT)      |  - Fetch by ID (GET) |
|  - Patch (PATCH)   |  - Delete (DELETE)   |
+-------------------------------------------+
```

---

## 2. File: index.html Explained

### The Structure

The HTML file has these main sections:

1. **Header**: Title + backend selector dropdown + connection status indicator
2. **Request Logger**: Dark-themed panel showing HTTP requests and responses
3. **Form Section**: Input form for creating/editing students + PATCH form
4. **Student List**: Cards showing each student with Edit and Delete buttons
5. **Footer**: Links and credits

### Key HTML Elements

```html
<select id="backendSelect">
    <option value="js">JavaScript (Express) - Port 3000</option>
    <option value="python">Python (FastAPI) - Port 8000</option>
</select>
```

This dropdown lets you switch between backends. The JavaScript reads this value to know which URL to send requests to.

```html
<span id="connectionStatus" class="status-dot status-disconnected"></span>
```

A colored dot (green = connected, red = disconnected) that shows if the selected backend is running.

```html
<form id="studentForm">
    <input type="hidden" id="studentId">
    ...
</form>
```

The hidden `studentId` input is the trick for reusing the same form for both CREATE (POST) and EDIT (PUT):
- If `studentId` is empty -> POST (create new)
- If `studentId` has a value -> PUT (update existing)

---

## 3. File: style.css Explained

The CSS uses modern techniques:

### CSS Grid for Layout

```css
.content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;  /* Two equal columns */
    gap: 20px;
}
```

This creates a responsive two-column layout. On mobile (< 768px), it switches to one column:

```css
@media (max-width: 768px) {
    .content-grid {
        grid-template-columns: 1fr;
    }
}
```

### Color-Coded HTTP Methods

```css
.log-method.GET { background: #2ecc71; }     /* Green */
.log-method.POST { background: #f39c12; }    /* Orange */
.log-method.PUT { background: #3498db; }     /* Blue */
.log-method.PATCH { background: #9b59b6; }   /* Purple */
.log-method.DELETE { background: #e74c3c; }   /* Red */
```

Each HTTP method has a distinct color in the logger, making it easy to identify requests at a glance.

---

## 4. File: app.js - Full Walkthrough

### Section 1: Backend Configuration

```javascript
const BACKENDS = {
    js: "http://localhost:3000/api/students",
    python: "http://localhost:8000/api/students",
};

function getBaseUrl() {
    const select = document.getElementById("backendSelect");
    return BACKENDS[select.value];
}
```

- `BACKENDS` is an object mapping backend names to their URLs
- `getBaseUrl()` reads the dropdown value and returns the correct URL
- When you select "Python (FastAPI)", `getBaseUrl()` returns `http://localhost:8000/api/students`

### Section 2: The API Call Helper

```javascript
async function apiCall(method, url, body = null) {
    const options = {
        method: method,
        headers: { "Content-Type": "application/json" },
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        logRequest(method, url, body, data, response.status);
        return { data, status: response.status };
    } catch (error) {
        logRequest(method, url, body, { error: error.message }, 0);
        alert("Error connecting to backend. Make sure the server is running!");
        return { data: null, status: 0 };
    }
}
```

This is the **central function** that all CRUD operations use. Let's break it down:

1. **`method`**: The HTTP method ("GET", "POST", etc.)
2. **`url`**: The full API URL
3. **`body`**: Optional JSON data for POST/PUT/PATCH
4. **`options`**: Configuration object for `fetch()`:
   - `method`: Which HTTP method to use
   - `headers`: Tells the server we're sending JSON
   - `body`: The actual data (converted from object to JSON string)
5. **`JSON.stringify(body)`**: Converts JavaScript object to JSON string:
   ```javascript
   { name: "Alice", age: 21 }  ->  '{"name":"Alice","age":21}'
   ```
6. **`await fetch(url, options)`**: Sends the HTTP request and waits for response
7. **`await response.json()`**: Parses the response body as JSON
8. **`logRequest(...)`**: Logs everything to the Request Logger panel

### Section 3: CRUD Functions

#### GET - Fetch All Students

```javascript
async function fetchStudents() {
    const { data, status } = await apiCall("GET", getBaseUrl());
    if (data) {
        renderStudents(data);
    }
}
```

1. Calls `apiCall("GET", "http://localhost:3000/api/students")`
2. `apiCall` sends the request and returns `{ data, status }`
3. If data exists, render the student cards

#### GET - Fetch by ID

```javascript
async function fetchStudentById() {
    const id = document.getElementById("searchId").value;
    if (!id) { alert("Please enter a Student ID"); return; }

    const { data, status } = await apiCall("GET", `${getBaseUrl()}/${id}`);
    if (data && status === 200) {
        renderStudents(Array.isArray(data) ? data : [data]);
    }
}
```

- Reads the ID from the input field
- Appends it to the URL: `http://localhost:3000/api/students/5`
- Wraps single student in array for consistent rendering

#### POST - Create Student

```javascript
async function createStudent(studentData) {
    const { data, status } = await apiCall("POST", getBaseUrl(), studentData);
    if (status === 201) {
        alert("Student created successfully!");
        fetchStudents(); // Refresh the list
    }
}
```

- Sends student data as the request body
- On success (201), shows alert and refreshes the list

#### PUT - Full Update

```javascript
async function updateStudent(id, studentData) {
    const { data, status } = await apiCall("PUT", `${getBaseUrl()}/${id}`, studentData);
    if (status === 200) {
        alert("Student updated successfully!");
        cancelEdit();    // Reset form
        fetchStudents(); // Refresh list
    }
}
```

- Sends ALL student fields to the specific student URL
- After success, resets the form back to "Create" mode

#### PATCH - Partial Update

```javascript
async function patchStudent() {
    const id = document.getElementById("patchId").value;
    const field = document.getElementById("patchField").value;
    let value = document.getElementById("patchValue").value;

    if (field === "age") value = parseInt(value, 10);

    const patchData = { [field]: value };  // Dynamic key!
    const { data, status } = await apiCall("PATCH", `${getBaseUrl()}/${id}`, patchData);
}
```

**Key trick**: `{ [field]: value }` creates a dynamic key:
- If `field = "name"` and `value = "Alice"`, result is `{ "name": "Alice" }`
- If `field = "age"` and `value = 25`, result is `{ "age": 25 }`

This is how PATCH sends only the selected field.

#### DELETE - Remove Student

```javascript
async function deleteStudent(id) {
    if (!confirm(`Are you sure you want to delete student #${id}?`)) return;

    const { data, status } = await apiCall("DELETE", `${getBaseUrl()}/${id}`);
    if (status === 200) {
        alert("Student deleted successfully!");
        fetchStudents();
    }
}
```

- `confirm()` shows a browser confirmation dialog
- If the user clicks "Cancel", the function returns early
- After deletion, refreshes the student list

### Section 4: Form Handling

```javascript
document.getElementById("studentForm").addEventListener("submit", function (e) {
    e.preventDefault();  // Prevent page reload!

    const id = document.getElementById("studentId").value;
    const studentData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        course: document.getElementById("course").value,
        age: parseInt(document.getElementById("age").value) || null,
    };

    if (id) {
        updateStudent(id, studentData);  // PUT (editing)
    } else {
        createStudent(studentData);       // POST (creating)
    }
});
```

**`e.preventDefault()`** is critical! Without it, the browser would:
1. Submit the form normally (reload the page)
2. Send data as URL-encoded (not JSON)
3. Navigate away from the current page

With it, we handle submission in JavaScript and send the data via `fetch()`.

**The POST/PUT switch**: The hidden `studentId` field determines which operation to perform.

### Section 5: Edit Mode

```javascript
function editStudent(student) {
    document.getElementById("studentId").value = student.id;
    document.getElementById("name").value = student.name;
    document.getElementById("email").value = student.email;
    document.getElementById("course").value = student.course;
    document.getElementById("age").value = student.age || "";

    document.getElementById("formTitle").textContent = `Edit Student #${student.id}`;
    document.getElementById("submitBtn").textContent = "PUT - Update Student";
    document.getElementById("cancelBtn").style.display = "inline-block";
}
```

When you click "Edit" on a student card:
1. Fills the form with the student's current data
2. Sets the hidden `studentId` (so submit knows to use PUT)
3. Changes the button text to "PUT - Update Student"
4. Shows the "Cancel" button

### Section 6: Rendering Students

```javascript
function renderStudents(students) {
    let html = "";
    for (const s of students) {
        html += `
        <div class="student-card">
            <div class="card-header">
                <h3>${escapeHtml(s.name)}</h3>
                <span class="student-id">ID: ${s.id}</span>
            </div>
            <div class="card-body">
                <p><span>Email:</span> ${escapeHtml(s.email)}</p>
                <p><span>Course:</span> ${escapeHtml(s.course)}</p>
                <p><span>Age:</span> ${s.age || "N/A"}</p>
            </div>
            <div class="card-actions">
                <button onclick='editStudent(${JSON.stringify(s)})'>PUT - Edit</button>
                <button onclick="deleteStudent(${s.id})">DELETE</button>
            </div>
        </div>`;
    }
    container.innerHTML = html;
}
```

**Template literals** (backtick strings) allow embedding expressions with `${}`:
- `${s.name}` inserts the student's name
- `${JSON.stringify(s)}` passes the entire student object to the edit function

---

## 5. How fetch() Works

`fetch()` is the modern browser API for making HTTP requests. It replaced the older `XMLHttpRequest`.

### Basic Syntax

```javascript
const response = await fetch(url, options);
```

### GET Request (no body)

```javascript
const response = await fetch("http://localhost:3000/api/students");
const data = await response.json();  // Parse JSON body
console.log(data);  // Array of students
```

### POST Request (with body)

```javascript
const response = await fetch("http://localhost:3000/api/students", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"  // Tell server it's JSON
    },
    body: JSON.stringify({
        name: "Alice",
        email: "alice@example.com",
        course: "CS",
        age: 21
    })
});
const data = await response.json();
console.log(data);  // Created student with ID
```

### The Response Object

```javascript
const response = await fetch(url);

response.status;      // 200, 201, 404, etc.
response.ok;          // true if status is 200-299
response.headers;     // Response headers
response.json();      // Parse body as JSON (returns a Promise)
response.text();      // Parse body as text (returns a Promise)
```

---

## 6. How the Frontend Talks to the Backend

### The Complete Data Flow

```
User clicks "POST - Create Student"
        |
        v
Form submit event fires
        |
        v
e.preventDefault() stops page reload
        |
        v
Collect form data into a JavaScript object
{ name: "Alice", email: "alice@example.com", ... }
        |
        v
JSON.stringify() converts to JSON string
'{"name":"Alice","email":"alice@example.com",...}'
        |
        v
fetch() sends HTTP request
POST http://localhost:3000/api/students
Content-Type: application/json
Body: '{"name":"Alice",...}'
        |
        v
--- NETWORK ---
        |
        v
Backend receives request
express.json() middleware parses body
req.body = { name: "Alice", ... }
        |
        v
Route handler runs
INSERT INTO students ... (SQL)
        |
        v
Backend sends response
Status: 201 Created
Body: { id: 4, name: "Alice", ... }
        |
        v
--- NETWORK ---
        |
        v
fetch() resolves with Response object
        |
        v
response.json() parses JSON body
        |
        v
logRequest() logs to the logger panel
        |
        v
fetchStudents() refreshes the student list
        |
        v
User sees the new student in the list!
```

---

## 7. The Request Logger

The logger panel at the top shows **every HTTP request** in real-time.

```javascript
function logRequest(method, url, body, response, status) {
    const panel = document.getElementById("logPanel");
    const time = new Date().toLocaleTimeString();

    let html = `<div class="log-entry">`;
    html += `<span class="log-time">${time}</span> `;
    html += `<span class="log-method ${method}">${method}</span> `;
    html += `<span class="log-url">${url}</span> `;
    html += `<span class="log-status">Status: ${status}</span>`;
    if (body) html += `<div class="log-body">Request Body: ${JSON.stringify(body)}</div>`;
    html += `<div class="log-response">Response: ${JSON.stringify(response)}</div>`;
    html += `</div>`;

    panel.insertAdjacentHTML("afterbegin", html);  // Add to TOP
}
```

This is like a mini version of the Postman response panel, built right into the app. Students can see:
- The **time** the request was made
- The **HTTP method** (color-coded)
- The **URL** that was called
- The **status code** returned
- The **request body** (for POST/PUT/PATCH)
- The **response data** from the server

---

## 8. XSS Prevention

```javascript
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
```

**XSS** (Cross-Site Scripting) is a security vulnerability where malicious scripts are injected into web pages.

Without escaping, if a student's name is `<script>alert('Hacked!')</script>`, it would execute as JavaScript!

`escapeHtml()` converts special characters:
- `<` becomes `&lt;`
- `>` becomes `&gt;`
- `"` becomes `&quot;`

So the script tag becomes harmless text instead of executable code.

---

## 9. Async/Await in JavaScript

### What is Asynchronous?

When JavaScript sends a network request, it takes time. Instead of **blocking** (stopping everything until the request finishes), JavaScript continues running other code.

```javascript
// Without async/await (callbacks - old way)
fetch(url)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

// With async/await (modern way - easier to read)
async function getData() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}
```

### What `await` Does

`await` pauses the function until the **Promise** resolves:

```javascript
const response = await fetch(url);  // Pause here until response arrives
const data = await response.json(); // Pause here until JSON is parsed
// Continue with the data
```

### Rules

1. `await` can only be used inside an `async` function
2. `async` functions always return a Promise
3. Use `try/catch` for error handling with async/await

---

## Summary

The frontend is built with **zero frameworks** - just HTML, CSS, and vanilla JavaScript. This makes it easy to understand how web applications work at a fundamental level.

**Key concepts demonstrated:**
- `fetch()` API for HTTP requests
- `async/await` for asynchronous programming
- `JSON.stringify()` and `.json()` for data serialization
- DOM manipulation to update the UI
- Event handling (`addEventListener`, `onclick`)
- XSS prevention with `escapeHtml()`
- Template literals for dynamic HTML

Everything in this frontend maps directly to what you do in Postman - just with a visual interface!
