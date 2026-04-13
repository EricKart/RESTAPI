# ================================================================
# REST API Backend - FastAPI + SQLite
# ================================================================
# This file sets up a complete REST API server that demonstrates
# all HTTP methods: GET, POST, PUT, PATCH, DELETE
#
# Database: SQLite (local file-based database)
# Port: 8000
# Base URL: http://localhost:8000/api/students
# Docs: http://localhost:8000/docs (auto-generated Swagger UI!)
# ================================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import sqlite3
import os

# ---- Initialize FastAPI App ----
# FastAPI automatically generates interactive API documentation!
# Visit http://localhost:8000/docs after starting the server.
app = FastAPI(
    title="Student Manager REST API",
    description="A REST API for managing students - Teaching Project",
    version="1.0.0",
)

# ---- CORS Middleware ----
# CORS (Cross-Origin Resource Sharing) allows the frontend
# (running on a different port) to communicate with this API.
# Without this, the browser blocks cross-origin requests.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# ---- Pydantic Models ----
# Pydantic models define the SHAPE of data.
# They validate incoming data automatically and return clear error messages.
# This is one of FastAPI's biggest advantages over Flask!


class StudentCreate(BaseModel):
    """Schema for creating a new student (POST request body)"""

    name: str
    email: str
    course: str
    age: Optional[int] = None


class StudentUpdate(BaseModel):
    """Schema for full update (PUT request body) - all fields required"""

    name: str
    email: str
    course: str
    age: Optional[int] = None


class StudentPatch(BaseModel):
    """Schema for partial update (PATCH request body) - all fields optional"""

    name: Optional[str] = None
    email: Optional[str] = None
    course: Optional[str] = None
    age: Optional[int] = None


# ---- Database Setup ----
# SQLite stores data in a single file. No separate database server needed!
DB_PATH = os.path.join(os.path.dirname(__file__), "students.db")


def get_db():
    """Create a database connection and return it."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn


def init_db():
    """Initialize the database: create table and insert sample data."""
    conn = get_db()
    cursor = conn.cursor()

    # Create the students table if it doesn't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            course TEXT NOT NULL,
            age INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Insert sample data if table is empty
    cursor.execute("SELECT COUNT(*) FROM students")
    if cursor.fetchone()[0] == 0:
        sample_students = [
            ("Alice Johnson", "alice@example.com", "Computer Science", 21),
            ("Bob Smith", "bob@example.com", "Data Science", 23),
            ("Charlie Brown", "charlie@example.com", "Web Development", 20),
        ]
        cursor.executemany(
            "INSERT INTO students (name, email, course, age) VALUES (?, ?, ?, ?)",
            sample_students,
        )
        print("Sample data inserted!")

    conn.commit()
    conn.close()


# Initialize database on startup
init_db()


# Helper: Convert sqlite3.Row to dict
def row_to_dict(row):
    """Convert a sqlite3.Row object to a regular dictionary."""
    if row is None:
        return None
    return dict(row)


# ================================================================
# REST API ROUTES
# ================================================================
# REST = Representational State Transfer
#
# HTTP Method  | Route                | Action          | CRUD
# -------------|----------------------|-----------------|--------
# GET          | /api/students        | Get all students| READ
# GET          | /api/students/{id}   | Get one student | READ
# POST         | /api/students        | Create student  | CREATE
# PUT          | /api/students/{id}   | Full update     | UPDATE
# PATCH        | /api/students/{id}   | Partial update  | UPDATE
# DELETE       | /api/students/{id}   | Delete student  | DELETE
# ================================================================


# ---- GET /api/students ----
# Purpose: Retrieve ALL students from the database
# HTTP Method: GET (used to READ/retrieve data, never modifies data)
# Status Code: 200 OK
@app.get("/api/students")
def get_all_students():
    """
    Fetch all students from the database.

    - **HTTP Method**: GET
    - **Purpose**: Read/retrieve all records
    - **Returns**: List of all students
    - **Status Code**: 200 OK
    """
    conn = get_db()
    students = conn.execute("SELECT * FROM students ORDER BY id").fetchall()
    conn.close()
    return [row_to_dict(s) for s in students]


# ---- GET /api/students/{id} ----
# Purpose: Retrieve a SINGLE student by their ID
# The {id} in the URL is a "path parameter" - FastAPI automatically captures it
# Example: GET /api/students/1 -> id = 1
@app.get("/api/students/{student_id}")
def get_student(student_id: int):
    """
    Fetch a single student by their ID.

    - **HTTP Method**: GET
    - **Purpose**: Read/retrieve a specific record
    - **Path Parameter**: student_id (integer)
    - **Returns**: Student object or 404 error
    - **Status Code**: 200 OK or 404 Not Found
    """
    conn = get_db()
    student = conn.execute(
        "SELECT * FROM students WHERE id = ?", (student_id,)
    ).fetchone()
    conn.close()

    if not student:
        # 404 = Not Found - The requested resource doesn't exist
        raise HTTPException(status_code=404, detail="Student not found")

    return row_to_dict(student)


# ---- POST /api/students ----
# Purpose: CREATE a new student in the database
# HTTP Method: POST (used to CREATE new resources)
# The client sends student data in the REQUEST BODY
# Status Code: 201 Created
@app.post("/api/students", status_code=201)
def create_student(student: StudentCreate):
    """
    Create a new student in the database.

    - **HTTP Method**: POST
    - **Purpose**: Create a new resource
    - **Request Body**: StudentCreate schema (name, email, course, age)
    - **Returns**: The newly created student with assigned ID
    - **Status Code**: 201 Created
    """
    conn = get_db()
    try:
        cursor = conn.execute(
            "INSERT INTO students (name, email, course, age) VALUES (?, ?, ?, ?)",
            (student.name, student.email, student.course, student.age),
        )
        conn.commit()

        # Fetch the newly created student
        new_student = conn.execute(
            "SELECT * FROM students WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        conn.close()

        return row_to_dict(new_student)
    except sqlite3.IntegrityError:
        conn.close()
        # 409 = Conflict - The resource already exists
        raise HTTPException(
            status_code=409, detail="A student with this email already exists"
        )


# ---- PUT /api/students/{id} ----
# Purpose: FULLY UPDATE (replace) an existing student
# HTTP Method: PUT (used to REPLACE a resource entirely)
# PUT vs PATCH: PUT replaces the ENTIRE resource, PATCH updates only specific fields
# The client must send ALL fields, even unchanged ones
@app.put("/api/students/{student_id}")
def update_student(student_id: int, student: StudentUpdate):
    """
    Fully update (replace) an existing student.

    - **HTTP Method**: PUT
    - **Purpose**: Replace an entire resource
    - **Path Parameter**: student_id (integer)
    - **Request Body**: StudentUpdate schema (ALL fields required)
    - **Returns**: The updated student
    - **Status Code**: 200 OK or 404 Not Found
    """
    conn = get_db()

    # Check if student exists
    existing = conn.execute(
        "SELECT * FROM students WHERE id = ?", (student_id,)
    ).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    try:
        conn.execute(
            """UPDATE students 
               SET name = ?, email = ?, course = ?, age = ?, updated_at = CURRENT_TIMESTAMP 
               WHERE id = ?""",
            (student.name, student.email, student.course, student.age, student_id),
        )
        conn.commit()

        updated = conn.execute(
            "SELECT * FROM students WHERE id = ?", (student_id,)
        ).fetchone()
        conn.close()

        return row_to_dict(updated)
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(
            status_code=409, detail="A student with this email already exists"
        )


# ---- PATCH /api/students/{id} ----
# Purpose: PARTIALLY UPDATE a student (only specified fields)
# HTTP Method: PATCH (used to update SPECIFIC fields only)
# Unlike PUT, the client only sends the fields they want to change
@app.patch("/api/students/{student_id}")
def patch_student(student_id: int, student: StudentPatch):
    """
    Partially update a student (only specified fields).

    - **HTTP Method**: PATCH
    - **Purpose**: Update specific fields of a resource
    - **Path Parameter**: student_id (integer)
    - **Request Body**: StudentPatch schema (only fields you want to change)
    - **Returns**: The updated student
    - **Status Code**: 200 OK or 404 Not Found

    **PUT vs PATCH Example:**
    - PUT: Send `{"name": "Alice", "email": "alice@mail.com", "course": "CS", "age": 21}`
    - PATCH: Send `{"name": "Alice Updated"}` (only the field you want to change)
    """
    conn = get_db()

    # Check if student exists
    existing = conn.execute(
        "SELECT * FROM students WHERE id = ?", (student_id,)
    ).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    # Only update fields that were provided (not None)
    update_data = student.model_dump(exclude_unset=True)

    if not update_data:
        conn.close()
        raise HTTPException(status_code=400, detail="No fields provided to update")

    # Build dynamic SQL for partial update
    set_clauses = ", ".join(f"{key} = ?" for key in update_data.keys())
    values = list(update_data.values())

    try:
        conn.execute(
            f"UPDATE students SET {set_clauses}, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            values + [student_id],
        )
        conn.commit()

        updated = conn.execute(
            "SELECT * FROM students WHERE id = ?", (student_id,)
        ).fetchone()
        conn.close()

        return row_to_dict(updated)
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(
            status_code=409, detail="A student with this email already exists"
        )


# ---- DELETE /api/students/{id} ----
# Purpose: DELETE a student from the database
# HTTP Method: DELETE (used to REMOVE a resource)
# Status Code: 200 OK with confirmation message
@app.delete("/api/students/{student_id}")
def delete_student(student_id: int):
    """
    Delete a student from the database.

    - **HTTP Method**: DELETE
    - **Purpose**: Remove a resource
    - **Path Parameter**: student_id (integer)
    - **Returns**: Confirmation message with deleted student data
    - **Status Code**: 200 OK or 404 Not Found
    """
    conn = get_db()

    existing = conn.execute(
        "SELECT * FROM students WHERE id = ?", (student_id,)
    ).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    deleted_student = row_to_dict(existing)
    conn.execute("DELETE FROM students WHERE id = ?", (student_id,))
    conn.commit()
    conn.close()

    return {
        "message": f"Student '{deleted_student['name']}' deleted successfully",
        "deleted": deleted_student,
    }


# ---- Run Server ----
# This block runs when you execute: python main.py
if __name__ == "__main__":
    import uvicorn

    print("\n===========================================")
    print("  FastAPI REST API Server")
    print("  Running on: http://localhost:8000")
    print("  API Base:   http://localhost:8000/api/students")
    print("  Docs:       http://localhost:8000/docs")
    print("  Database:   SQLite (students.db)")
    print("===========================================\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
