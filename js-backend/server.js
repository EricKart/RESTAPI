// ================================================================
// REST API Backend - Express.js + SQLite
// ================================================================
// This file sets up a complete REST API server that demonstrates
// all HTTP methods: GET, POST, PUT, PATCH, DELETE
//
// Database: SQLite (local file-based database)
// Port: 3000
// Base URL: http://localhost:3000/api/students
// ================================================================

const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

// ---- Initialize Express App ----
const app = express();
const PORT = 3000;

// ---- Middleware ----
// Middleware are functions that run BEFORE your route handlers.

// cors() - Allows the frontend (running on a different port) to talk to this API.
// Without this, the browser would block requests due to "Same-Origin Policy".
app.use(cors());

// express.json() - Parses incoming JSON request bodies.
// Without this, req.body would be undefined when the client sends JSON data.
app.use(express.json());

// ---- Database Setup ----
// SQLite stores data in a single file. No separate database server needed!
const dbPath = path.join(__dirname, "students.db");
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Create the students table if it doesn't exist
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

// Insert sample data if table is empty
const count = db.prepare("SELECT COUNT(*) as count FROM students").get();
if (count.count === 0) {
    const insert = db.prepare(
        "INSERT INTO students (name, email, course, age) VALUES (?, ?, ?, ?)"
    );
    insert.run("Alice Johnson", "alice@example.com", "Computer Science", 21);
    insert.run("Bob Smith", "bob@example.com", "Data Science", 23);
    insert.run("Charlie Brown", "charlie@example.com", "Web Development", 20);
    console.log("Sample data inserted!");
}

// ================================================================
// REST API ROUTES
// ================================================================
// REST = Representational State Transfer
//
// HTTP Method  | Route                | Action          | CRUD
// -------------|----------------------|-----------------|--------
// GET          | /api/students        | Get all students| READ
// GET          | /api/students/:id    | Get one student | READ
// POST         | /api/students        | Create student  | CREATE
// PUT          | /api/students/:id    | Full update     | UPDATE
// PATCH        | /api/students/:id    | Partial update  | UPDATE
// DELETE       | /api/students/:id    | Delete student  | DELETE
// ================================================================

// ---- GET /api/students ----
// Purpose: Retrieve ALL students from the database
// HTTP Method: GET (used to READ/retrieve data, never modifies data)
// Status Code: 200 OK
app.get("/api/students", (req, res) => {
    try {
        const students = db.prepare("SELECT * FROM students ORDER BY id").all();
        // 200 = OK - The request succeeded
        res.status(200).json(students);
    } catch (error) {
        // 500 = Internal Server Error - Something went wrong on the server
        res.status(500).json({ error: "Failed to fetch students" });
    }
});

// ---- GET /api/students/:id ----
// Purpose: Retrieve a SINGLE student by their ID
// The :id in the URL is a "route parameter" - it captures the value from the URL
// Example: GET /api/students/1 -> req.params.id = "1"
app.get("/api/students/:id", (req, res) => {
    try {
        const student = db
            .prepare("SELECT * FROM students WHERE id = ?")
            .get(req.params.id);

        if (!student) {
            // 404 = Not Found - The requested resource doesn't exist
            return res.status(404).json({ error: "Student not found" });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch student" });
    }
});

// ---- POST /api/students ----
// Purpose: CREATE a new student in the database
// HTTP Method: POST (used to CREATE new resources)
// The client sends student data in the REQUEST BODY (req.body)
// Status Code: 201 Created (a new resource was successfully created)
app.post("/api/students", (req, res) => {
    try {
        const { name, email, course, age } = req.body;

        // Validation - Check required fields
        if (!name || !email || !course) {
            // 400 = Bad Request - The client sent invalid data
            return res.status(400).json({
                error: "Missing required fields: name, email, and course are required",
            });
        }

        const result = db
            .prepare(
                "INSERT INTO students (name, email, course, age) VALUES (?, ?, ?, ?)"
            )
            .run(name, email, course, age || null);

        const newStudent = db
            .prepare("SELECT * FROM students WHERE id = ?")
            .get(result.lastInsertRowid);

        // 201 = Created - The resource was successfully created
        res.status(201).json(newStudent);
    } catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
            // 409 = Conflict - The resource already exists
            return res.status(409).json({ error: "A student with this email already exists" });
        }
        res.status(500).json({ error: "Failed to create student" });
    }
});

// ---- PUT /api/students/:id ----
// Purpose: FULLY UPDATE (replace) an existing student
// HTTP Method: PUT (used to REPLACE a resource entirely)
// PUT vs PATCH: PUT replaces the ENTIRE resource, PATCH updates only specific fields
// The client must send ALL fields, even unchanged ones
app.put("/api/students/:id", (req, res) => {
    try {
        const { name, email, course, age } = req.body;

        // PUT requires ALL fields (it's a full replacement)
        if (!name || !email || !course) {
            return res.status(400).json({
                error: "PUT requires all fields: name, email, and course",
            });
        }

        // Check if student exists first
        const existing = db
            .prepare("SELECT * FROM students WHERE id = ?")
            .get(req.params.id);

        if (!existing) {
            return res.status(404).json({ error: "Student not found" });
        }

        db.prepare(
            `UPDATE students 
             SET name = ?, email = ?, course = ?, age = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`
        ).run(name, email, course, age || null, req.params.id);

        const updated = db
            .prepare("SELECT * FROM students WHERE id = ?")
            .get(req.params.id);

        res.status(200).json(updated);
    } catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({ error: "A student with this email already exists" });
        }
        res.status(500).json({ error: "Failed to update student" });
    }
});

// ---- PATCH /api/students/:id ----
// Purpose: PARTIALLY UPDATE a student (only specified fields)
// HTTP Method: PATCH (used to update SPECIFIC fields only)
// Unlike PUT, the client only sends the fields they want to change
app.patch("/api/students/:id", (req, res) => {
    try {
        const existing = db
            .prepare("SELECT * FROM students WHERE id = ?")
            .get(req.params.id);

        if (!existing) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Only update fields that were provided in the request body
        const updates = {};
        if (req.body.name !== undefined) updates.name = req.body.name;
        if (req.body.email !== undefined) updates.email = req.body.email;
        if (req.body.course !== undefined) updates.course = req.body.course;
        if (req.body.age !== undefined) updates.age = req.body.age;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields provided to update" });
        }

        // Build dynamic SQL for partial update
        const setClauses = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values = Object.values(updates);

        db.prepare(
            `UPDATE students SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).run(...values, req.params.id);

        const updated = db
            .prepare("SELECT * FROM students WHERE id = ?")
            .get(req.params.id);

        res.status(200).json(updated);
    } catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({ error: "A student with this email already exists" });
        }
        res.status(500).json({ error: "Failed to update student" });
    }
});

// ---- DELETE /api/students/:id ----
// Purpose: DELETE a student from the database
// HTTP Method: DELETE (used to REMOVE a resource)
// Status Code: 200 OK with confirmation message
app.delete("/api/students/:id", (req, res) => {
    try {
        const existing = db
            .prepare("SELECT * FROM students WHERE id = ?")
            .get(req.params.id);

        if (!existing) {
            return res.status(404).json({ error: "Student not found" });
        }

        db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);

        // 200 = OK - The resource was successfully deleted
        res.status(200).json({
            message: `Student '${existing.name}' deleted successfully`,
            deleted: existing,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete student" });
    }
});

// ---- Start Server ----
app.listen(PORT, () => {
    console.log(`\n===========================================`);
    console.log(`  Express.js REST API Server`);
    console.log(`  Running on: http://localhost:${PORT}`);
    console.log(`  API Base:   http://localhost:${PORT}/api/students`);
    console.log(`  Database:   SQLite (students.db)`);
    console.log(`===========================================\n`);
});
