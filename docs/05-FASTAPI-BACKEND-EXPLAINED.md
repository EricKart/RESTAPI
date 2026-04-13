# 05 - FastAPI Backend Explained (Python + SQLite)

> A **line-by-line walkthrough** of the FastAPI backend code. Every function, every decorator, every concept explained.

---

## Table of Contents

1. [What is FastAPI?](#1-what-is-fastapi)
2. [What is Uvicorn?](#2-what-is-uvicorn)
3. [What is Pydantic?](#3-what-is-pydantic)
4. [File: requirements.txt Explained](#4-file-requirementstxt-explained)
5. [File: main.py - Full Walkthrough](#5-file-mainpy---full-walkthrough)
6. [Decorators in Python](#6-decorators-in-python)
7. [Type Hints in Python](#7-type-hints-in-python)
8. [FastAPI vs Express.js - Side by Side](#8-fastapi-vs-expressjs---side-by-side)
9. [The Auto-Generated Docs (/docs)](#9-the-auto-generated-docs-docs)
10. [Why FastAPI Over Flask?](#10-why-fastapi-over-flask)

---

## 1. What is FastAPI?

**FastAPI** is a modern, high-performance web framework for building APIs with Python.

Created by Sebastian Ramirez in 2018, it combines:
- **Speed**: One of the fastest Python frameworks (comparable to Node.js and Go)
- **Developer Experience**: Type hints, auto-validation, auto-documentation
- **Standards**: Built on OpenAPI and JSON Schema standards

### How FastAPI Compares

```
Flask (old):
  - No built-in validation
  - No auto-docs
  - Manual input parsing
  - Very flexible but you write more code

FastAPI (modern):
  - Automatic validation via Pydantic
  - Auto-generated Swagger docs at /docs
  - Type-safe with Python type hints
  - Less boilerplate code
```

---

## 2. What is Uvicorn?

**Uvicorn** is an ASGI (Asynchronous Server Gateway Interface) server. It's what actually **runs** your FastAPI application.

Think of it this way:
- **FastAPI** = Your application (the restaurant)
- **Uvicorn** = The actual server process (the building the restaurant operates in)

```bash
# When you run this:
python main.py

# It internally does:
uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

# Which means:
# - Look at file main.py
# - Find the object named `app`
# - Serve it on port 8000
# - reload=True: auto-restart when code changes (great for development!)
```

---

## 3. What is Pydantic?

**Pydantic** is a data validation library. It defines the **shape** of your data and validates it automatically.

```python
from pydantic import BaseModel

class StudentCreate(BaseModel):
    name: str          # Must be a string
    email: str         # Must be a string
    course: str        # Must be a string
    age: Optional[int] = None  # Optional integer, defaults to None
```

### What Pydantic Does For You

If someone sends this POST request:

```json
{ "name": "Alice", "email": 123, "course": "CS" }
```

Pydantic automatically responds with:

```json
{
    "detail": [
        {
            "type": "string_type",
            "loc": ["body", "email"],
            "msg": "Input should be a valid string",
            "input": 123
        }
    ]
}
```

**You didn't write any validation code!** Pydantic handled it because you declared `email: str` and they sent a number.

In Express.js, you'd have to write:

```javascript
if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: "email must be a string" });
}
```

---

## 4. File: requirements.txt Explained

```
fastapi==0.111.0          # The web framework
uvicorn[standard]==0.30.1 # The ASGI server to run FastAPI
pydantic==2.7.4           # Data validation (used by FastAPI)
```

### What happens when you run `pip install -r requirements.txt`?

1. pip reads the file
2. Downloads each package from PyPI (Python Package Index)
3. Installs them in your Python environment
4. These are analogous to `npm install` reading `package.json`

### pip vs npm

| Python (pip) | JavaScript (npm) |
|-------------|-----------------|
| `pip install package` | `npm install package` |
| `requirements.txt` | `package.json` |
| `pip install -r requirements.txt` | `npm install` |
| `venv/` (virtual environment) | `node_modules/` |
| `pip freeze` | `npm list` |

---

## 5. File: main.py - Full Walkthrough

### Section 1: Imports

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3
import os
```

| Import | Purpose |
|--------|---------|
| `FastAPI` | The main framework class |
| `HTTPException` | To raise HTTP errors (404, 400, etc.) |
| `CORSMiddleware` | Enables cross-origin requests |
| `BaseModel` | Base class for Pydantic data models |
| `Optional` | Type hint for optional fields |
| `sqlite3` | Python's built-in SQLite module |
| `os` | Operating system utilities (file paths) |

### Section 2: App Creation

```python
app = FastAPI(
    title="Student Manager REST API",
    description="A REST API for managing students - Teaching Project",
    version="1.0.0",
)
```

This creates the FastAPI application. The `title`, `description`, and `version` appear in the auto-generated docs at `/docs`.

### Section 3: CORS Middleware

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Which origins can access (all)
    allow_credentials=True,     # Allow cookies
    allow_methods=["*"],       # Which methods (GET, POST, etc.)
    allow_headers=["*"],       # Which headers
)
```

Same purpose as `app.use(cors())` in Express. Without this, the browser blocks requests from the frontend.

### Section 4: Pydantic Models

```python
class StudentCreate(BaseModel):
    """Schema for creating a new student (POST)"""
    name: str
    email: str
    course: str
    age: Optional[int] = None

class StudentUpdate(BaseModel):
    """Schema for full update (PUT) - all required"""
    name: str
    email: str
    course: str
    age: Optional[int] = None

class StudentPatch(BaseModel):
    """Schema for partial update (PATCH) - all optional"""
    name: Optional[str] = None
    email: Optional[str] = None
    course: Optional[str] = None
    age: Optional[int] = None
```

**Three models for three use cases:**

| Model | Used By | Fields Required? |
|-------|---------|-----------------|
| `StudentCreate` | POST | name, email, course required |
| `StudentUpdate` | PUT | name, email, course required |
| `StudentPatch` | PATCH | ALL fields optional |

### Section 5: Database Functions

```python
DB_PATH = os.path.join(os.path.dirname(__file__), "students.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Return rows as dict-like objects
    return conn
```

- `os.path.dirname(__file__)` = directory of the current file
- `sqlite3.connect()` opens the database file (creates if it doesn't exist)
- `row_factory = sqlite3.Row` makes rows accessible by column name (`row["name"]`)

```python
def row_to_dict(row):
    if row is None:
        return None
    return dict(row)
```

Converts `sqlite3.Row` to a regular Python dictionary for JSON serialization.

### Section 6: GET All Students

```python
@app.get("/api/students")
def get_all_students():
    conn = get_db()
    students = conn.execute("SELECT * FROM students ORDER BY id").fetchall()
    conn.close()
    return [row_to_dict(s) for s in students]
```

**Breaking it down:**

- `@app.get("/api/students")` - **Decorator**: registers this function for GET requests to `/api/students`
- `def get_all_students()` - The function name appears in the auto-docs
- `conn.execute(sql).fetchall()` - Execute SQL and get all rows
- `conn.close()` - Always close the connection when done
- `return [row_to_dict(s) for s in students]` - **List comprehension**: converts each row to a dictionary
- FastAPI **automatically** converts the returned list to JSON

**Comparison with Express:**

```javascript
// Express
app.get("/api/students", (req, res) => {
    const students = db.prepare("SELECT * FROM students").all();
    res.status(200).json(students);
});
```

```python
# FastAPI
@app.get("/api/students")
def get_all_students():
    conn = get_db()
    students = conn.execute("SELECT * FROM students").fetchall()
    conn.close()
    return [row_to_dict(s) for s in students]
```

Key difference: In FastAPI, you just `return` the data. No need for `res.json()`.

### Section 7: GET by ID

```python
@app.get("/api/students/{student_id}")
def get_student(student_id: int):
    conn = get_db()
    student = conn.execute("SELECT * FROM students WHERE id = ?", (student_id,)).fetchone()
    conn.close()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return row_to_dict(student)
```

- `{student_id}` = **path parameter** (like `:id` in Express)
- `student_id: int` = FastAPI automatically converts the URL string to an integer and validates it!
- `raise HTTPException(status_code=404, ...)` = FastAPI's way of returning error responses
- `(student_id,)` = A tuple with one element (the comma is required in Python for single-element tuples)

### Section 8: POST Create

```python
@app.post("/api/students", status_code=201)
def create_student(student: StudentCreate):
    conn = get_db()
    try:
        cursor = conn.execute(
            "INSERT INTO students (name, email, course, age) VALUES (?, ?, ?, ?)",
            (student.name, student.email, student.course, student.age),
        )
        conn.commit()

        new_student = conn.execute(
            "SELECT * FROM students WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        conn.close()
        return row_to_dict(new_student)
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=409, detail="A student with this email already exists")
```

- `status_code=201` - Sets the **default** response status code
- `student: StudentCreate` - FastAPI **automatically** parses the request body and validates it against the Pydantic model
- `conn.commit()` - SQLite requires explicit commit for write operations
- `cursor.lastrowid` - The auto-generated ID of the new record
- `sqlite3.IntegrityError` - Thrown when UNIQUE constraint fails (duplicate email)

**The magic**: You didn't write ANY validation code. Pydantic validates `name`, `email`, `course` are strings and present. If someone sends `{"name": 123}`, Pydantic returns an error automatically.

### Section 9: PUT Full Update

```python
@app.put("/api/students/{student_id}")
def update_student(student_id: int, student: StudentUpdate):
    conn = get_db()
    existing = conn.execute("SELECT * FROM students WHERE id = ?", (student_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    conn.execute(
        """UPDATE students 
           SET name = ?, email = ?, course = ?, age = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?""",
        (student.name, student.email, student.course, student.age, student_id),
    )
    conn.commit()
    # ... fetch and return updated student
```

Notice: `StudentUpdate` requires ALL fields, just like the Express PUT handler.

### Section 10: PATCH Partial Update

```python
@app.patch("/api/students/{student_id}")
def patch_student(student_id: int, student: StudentPatch):
    # ... check student exists ...

    update_data = student.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    set_clauses = ", ".join(f"{key} = ?" for key in update_data.keys())
    values = list(update_data.values())

    conn.execute(
        f"UPDATE students SET {set_clauses}, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        values + [student_id],
    )
```

**The key line**: `student.model_dump(exclude_unset=True)`

- `model_dump()` converts the Pydantic model to a dictionary
- `exclude_unset=True` **only includes fields that were actually sent** in the request
- If you send `{"name": "Alice"}`, `update_data` = `{"name": "Alice"}` (email, course, age excluded)

This is how PATCH knows which fields to update!

### Section 11: DELETE

```python
@app.delete("/api/students/{student_id}")
def delete_student(student_id: int):
    conn = get_db()
    existing = conn.execute("SELECT * FROM students WHERE id = ?", (student_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    deleted_student = row_to_dict(existing)
    conn.execute("DELETE FROM students WHERE id = ?", (student_id,))
    conn.commit()
    conn.close()

    return {"message": f"Student '{deleted_student['name']}' deleted successfully", "deleted": deleted_student}
```

### Section 12: Running the Server

```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

- `if __name__ == "__main__"` - Only runs when you execute `python main.py` directly
- `"main:app"` - Look in file `main.py` for the object named `app`
- `host="0.0.0.0"` - Listen on all network interfaces
- `port=8000` - Listen on port 8000
- `reload=True` - Auto-restart when code changes (development mode)

---

## 6. Decorators in Python

Decorators are a key Python concept used heavily in FastAPI.

```python
@app.get("/api/students")
def get_all_students():
    ...
```

The `@app.get(...)` is a **decorator**. It's like saying:

> "Register the function below as the handler for GET requests to /api/students"

It's equivalent to Express's:

```javascript
app.get("/api/students", function handler() { ... });
```

FastAPI has decorators for each HTTP method:

```python
@app.get(...)     # Handle GET requests
@app.post(...)    # Handle POST requests
@app.put(...)     # Handle PUT requests
@app.patch(...)   # Handle PATCH requests
@app.delete(...)  # Handle DELETE requests
```

---

## 7. Type Hints in Python

FastAPI uses Python **type hints** extensively:

```python
def get_student(student_id: int):  # student_id must be an integer
    ...

def create_student(student: StudentCreate):  # student must match StudentCreate model
    ...
```

Type hints tell FastAPI:
1. **What to expect** - Student ID should be an integer
2. **How to validate** - Reject if wrong type
3. **What to document** - Show in the auto-generated docs
4. **How to convert** - Automatically convert URL string "5" to integer 5

---

## 8. FastAPI vs Express.js - Side by Side

### Creating a Student (POST)

**Express.js:**
```javascript
app.post("/api/students", (req, res) => {
    const { name, email, course, age } = req.body;

    // Manual validation
    if (!name || !email || !course) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const result = db.prepare("INSERT INTO students ...").run(name, email, course, age);
    const newStudent = db.prepare("SELECT * FROM students WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(newStudent);
});
```

**FastAPI:**
```python
@app.post("/api/students", status_code=201)
def create_student(student: StudentCreate):  # Validation is automatic!
    conn = get_db()
    cursor = conn.execute("INSERT INTO students ...", (student.name, student.email, student.course, student.age))
    conn.commit()
    new_student = conn.execute("SELECT * FROM students WHERE id = ?", (cursor.lastrowid,)).fetchone()
    conn.close()
    return row_to_dict(new_student)
```

**Key differences:**
- Express: Manual validation, explicit `res.json()`
- FastAPI: Automatic validation via Pydantic, just `return`

---

## 9. The Auto-Generated Docs (/docs)

One of FastAPI's biggest features is **automatic interactive documentation**.

After starting the server, visit: **http://localhost:8000/docs**

You'll see:
- Every endpoint listed with its HTTP method
- Request body schemas (from Pydantic models)
- Response examples
- A **"Try it out"** button to test endpoints directly in the browser!

There's also an alternative docs page: **http://localhost:8000/redoc**

This is powered by **OpenAPI** (formerly Swagger) specification. FastAPI generates this automatically from your code, type hints, and docstrings.

---

## 10. Why FastAPI Over Flask?

| Feature | Flask | FastAPI |
|---------|-------|---------|
| Data Validation | Manual | Automatic (Pydantic) |
| API Documentation | Manual (Swagger setup) | Automatic (/docs) |
| Type Checking | None | Full type hints |
| Async Support | Limited | Native |
| Performance | Moderate | Very High |
| Learning Curve | Easy | Easy (with type hints) |
| Error Messages | Generic | Detailed and specific |

**Flask** is great for simple apps and learning basics. **FastAPI** is the modern choice for production APIs.

---

## Next Steps

- [06 - Frontend Explained](06-FRONTEND-EXPLAINED.md) - How the frontend calls these APIs
- [03 - Postman Guide](03-POSTMAN-GUIDE.md) - Test all endpoints manually
