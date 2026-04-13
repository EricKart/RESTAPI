// ============================================
// REST API Student Manager - Frontend JavaScript
// ============================================

// ---- Configuration ----
const BACKENDS = {
    js: "http://localhost:3000/api/students",
    python: "http://localhost:8000/api/students",
};

function getBaseUrl() {
    const select = document.getElementById("backendSelect");
    return BACKENDS[select.value];
}

// ---- Logging Utility ----
function logRequest(method, url, body, response, status) {
    const panel = document.getElementById("logPanel");
    // Remove placeholder
    const placeholder = panel.querySelector(".log-placeholder");
    if (placeholder) placeholder.remove();

    const time = new Date().toLocaleTimeString();
    const statusClass = status >= 400 ? "error" : "";

    let html = `<div class="log-entry">`;
    html += `<span class="log-time">${time}</span> `;
    html += `<span class="log-method ${method}">${method}</span> `;
    html += `<span class="log-url">${url}</span> `;
    html += `<span class="log-status ${statusClass}">Status: ${status}</span>`;
    if (body) {
        html += `<div class="log-body">Request Body: ${JSON.stringify(body)}</div>`;
    }
    html += `<div class="log-response">Response: ${JSON.stringify(response, null, 2)}</div>`;
    html += `</div>`;

    panel.insertAdjacentHTML("afterbegin", html);
}

function clearLogs() {
    const panel = document.getElementById("logPanel");
    panel.innerHTML = '<p class="log-placeholder">Logs will appear here when you perform actions...</p>';
}

// ---- API Helper ----
// This function wraps fetch() to add logging and error handling.
// It demonstrates how the browser sends HTTP requests to a REST API.
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

// ---- Check Connection ----
async function checkConnection() {
    const dot = document.getElementById("connectionStatus");
    try {
        const response = await fetch(getBaseUrl());
        if (response.ok) {
            dot.className = "status-dot status-connected";
            dot.title = "Connected";
        } else {
            dot.className = "status-dot status-disconnected";
            dot.title = "Disconnected";
        }
    } catch {
        dot.className = "status-dot status-disconnected";
        dot.title = "Disconnected";
    }
}

// Check connection when backend changes
document.getElementById("backendSelect").addEventListener("change", () => {
    checkConnection();
    fetchStudents();
});

// ============================================
// CRUD Operations - These map to HTTP Methods
// ============================================

// ---- GET /api/students ----
// Fetches ALL students from the database
async function fetchStudents() {
    const { data, status } = await apiCall("GET", getBaseUrl());
    if (data) {
        renderStudents(data);
    }
}

// ---- GET /api/students/:id ----
// Fetches a SINGLE student by their ID
async function fetchStudentById() {
    const id = document.getElementById("searchId").value;
    if (!id) {
        alert("Please enter a Student ID");
        return;
    }
    const { data, status } = await apiCall("GET", `${getBaseUrl()}/${id}`);
    if (data && status === 200) {
        renderStudents(Array.isArray(data) ? data : [data]);
    } else if (status === 404) {
        document.getElementById("studentList").innerHTML =
            '<p class="empty-state">Student not found</p>';
    }
}

// ---- POST /api/students ----
// Creates a NEW student in the database
async function createStudent(studentData) {
    const { data, status } = await apiCall("POST", getBaseUrl(), studentData);
    if (status === 201) {
        alert("Student created successfully!");
        fetchStudents(); // Refresh the list
    }
}

// ---- PUT /api/students/:id ----
// REPLACES an entire student record (full update)
async function updateStudent(id, studentData) {
    const { data, status } = await apiCall("PUT", `${getBaseUrl()}/${id}`, studentData);
    if (status === 200) {
        alert("Student updated successfully!");
        cancelEdit();
        fetchStudents();
    }
}

// ---- PATCH /api/students/:id ----
// Updates ONLY specific fields of a student (partial update)
async function patchStudent() {
    const id = document.getElementById("patchId").value;
    const field = document.getElementById("patchField").value;
    let value = document.getElementById("patchValue").value;

    if (!id || !value) {
        alert("Please enter Student ID and new value");
        return;
    }

    // Convert age to number if that's the field
    if (field === "age") {
        value = parseInt(value, 10);
    }

    const patchData = { [field]: value };
    const { data, status } = await apiCall("PATCH", `${getBaseUrl()}/${id}`, patchData);
    if (status === 200) {
        alert(`Student ${field} updated successfully!`);
        fetchStudents();
        // Clear patch form
        document.getElementById("patchId").value = "";
        document.getElementById("patchValue").value = "";
    }
}

// ---- DELETE /api/students/:id ----
// Removes a student from the database
async function deleteStudent(id) {
    if (!confirm(`Are you sure you want to delete student #${id}?`)) return;

    const { data, status } = await apiCall("DELETE", `${getBaseUrl()}/${id}`);
    if (status === 200) {
        alert("Student deleted successfully!");
        fetchStudents();
    }
}

// ---- Form Handling ----
document.getElementById("studentForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const id = document.getElementById("studentId").value;
    const studentData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        course: document.getElementById("course").value,
        age: parseInt(document.getElementById("age").value) || null,
    };

    if (id) {
        // PUT - Full update (editing existing student)
        updateStudent(id, studentData);
    } else {
        // POST - Create new student
        createStudent(studentData);
    }
});

// Fill form for editing (PUT)
function editStudent(student) {
    document.getElementById("studentId").value = student.id;
    document.getElementById("name").value = student.name;
    document.getElementById("email").value = student.email;
    document.getElementById("course").value = student.course;
    document.getElementById("age").value = student.age || "";

    document.getElementById("formTitle").textContent = `Edit Student #${student.id}`;
    document.getElementById("submitBtn").textContent = "PUT - Update Student";
    document.getElementById("cancelBtn").style.display = "inline-block";

    // Scroll to form
    document.querySelector(".form-section").scrollIntoView({ behavior: "smooth" });
}

function cancelEdit() {
    document.getElementById("studentForm").reset();
    document.getElementById("studentId").value = "";
    document.getElementById("formTitle").textContent = "Add New Student";
    document.getElementById("submitBtn").textContent = "POST - Create Student";
    document.getElementById("cancelBtn").style.display = "none";
}

// ---- Render Students ----
function renderStudents(students) {
    const container = document.getElementById("studentList");

    if (!students || students.length === 0) {
        container.innerHTML = '<p class="empty-state">No students found</p>';
        return;
    }

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
                <button class="btn btn-edit" onclick='editStudent(${JSON.stringify(s)})'>
                    PUT - Edit
                </button>
                <button class="btn btn-danger" onclick="deleteStudent(${s.id})">
                    DELETE
                </button>
            </div>
        </div>`;
    }
    container.innerHTML = html;
}

// Security: Prevent XSS by escaping HTML
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ---- Initial Load ----
checkConnection();
