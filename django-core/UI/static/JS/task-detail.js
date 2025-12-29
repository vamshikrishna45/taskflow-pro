document.addEventListener("DOMContentLoaded", () => {
    if (!window.location.pathname.includes("task-detail")) return;

    loadTaskDetail();
});


/* =========================
   Helpers
========================= */

function getTaskId() {
    return sessionStorage.getItem("activeTaskId");
}

function getLoggedInUserEmail() {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.email || null;
}


function disableButton(id) {
    const btn = document.getElementById(id);
    if (btn) {
        btn.disabled = true;
        btn.style.opacity = 0.5;
        btn.style.cursor = "not-allowed";
    }
}

function hideElement(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
}

/* =========================
   Load Task Detail
========================= */

function loadTaskDetail() {
    const token = localStorage.getItem("access_token");
    const taskId = getTaskId();

    if (!token || !taskId) {
        window.location.href = "/tasks/";
        return;
    }

    fetch(`${API_BASE}/tasks/${taskId}/`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Not allowed");
        return res.json();
    })
    .then(task => {
        // Populate UI
        document.getElementById("taskTitle").innerText = task.title;
        document.getElementById("taskDescription").innerText = task.description || "-";
        document.getElementById("taskStatus").innerText = task.status;
        document.getElementById("taskCreatedBy").innerText = task.created_by;
        document.getElementById("taskAssignedTo").innerText = task.assigned_to || "-";
        document.getElementById("taskDeadline").innerText = task.deadline || "-";

        applyTaskRules(task);
    })
    .catch(() => {
        window.location.href = "/tasks/";
    });
}

/* =========================
   UI Rules (THIS YOU ASKED)
========================= */

function applyTaskRules(task) {
    const loggedInEmail = getLoggedInUserEmail();

    const isCreator = task.created_by === loggedInEmail;
    const isAssignee = task.assigned_to === loggedInEmail;

    /* ---------- ASSIGN ---------- */
    // Only creator, only TODO, only if not assigned
    if (!isCreator || task.status !== "TODO" || task.assigned_to) {
        hideElement("assignSection");
    }

    /* ---------- START ---------- */
    // Only assignee can see Start
    if (!isAssignee) {
        hideElement("startBtn");
    } else if (task.status !== "TODO") {
        disableButton("startBtn");
    }

    /* ---------- COMPLETE ---------- */
    // ❗ ONLY assignee can see Complete
    if (!isAssignee) {
        hideElement("completeBtn");
    } else if (task.status !== "IN_PROGRESS") {
        disableButton("completeBtn");
    }
}


/* =========================
   Actions
========================= */

function assignTask(userId) {
    const taskId = getTaskId();

    fetch(`${API_BASE}/tasks/${taskId}/assign/`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_id: userId })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || "Assigned");
        loadTaskDetail();
    });
}

function startTask() {
    const taskId = getTaskId();

    fetch(`${API_BASE}/tasks/${taskId}/start/`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        loadTaskDetail();
    });
}

function completeTask() {
    const taskId = getTaskId();

    fetch(`${API_BASE}/tasks/${taskId}/complete/`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        loadTaskDetail();
    });
}

function goBack() {
    if (window.location.search) {
        window.location.href = `/tasks/${window.location.search}`;
    } else {
        window.location.href = `/tasks/`;
    }
}



let selectedUserId = null;

function searchUsers(query) {
    if (query.length < 2) {
        document.getElementById("userResults").innerHTML = "";
        return;
    }

    fetch(`${API_BASE}/users/search/?q=${query}`, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    })
    .then(res => res.json())
    .then(users => {
        const ul = document.getElementById("userResults");
        ul.innerHTML = "";

        users.forEach(user => {
            const li = document.createElement("li");
            li.innerText = user.email;
            li.style.cursor = "pointer";

            li.onclick = () => {
                selectedUserId = user.id;
                document.getElementById("userSearchInput").value = user.email;
                ul.innerHTML = "";
                document.getElementById("assignBtn").disabled = false;
            };

            ul.appendChild(li);
        });
    });
}

document.getElementById("assignBtn")?.addEventListener("click", () => {
    if (selectedUserId) {
        assignTask(selectedUserId);
    }
});
