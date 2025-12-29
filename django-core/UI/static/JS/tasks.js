/*********************************
 * PAGE INIT
 *********************************/
document.addEventListener("DOMContentLoaded", () => {
    if (!location.pathname.startsWith("/tasks")) return;
    loadTasks();
});

/*********************************
 * STATE
 *********************************/
let currentTaskPage = 1;
let totalTaskPages = 1;
const PAGE_SIZE = 10;
/* 🔑 FILTER STATE (MUST BE BEFORE loadTasks) */
let taskFilters = {
    assigned_to: "",
    status: "",
    task_id: "",
    unassigned: false
};


function applyFilters() {
    let filtered = [...allTasks];

    const assignee = document.getElementById("filterAssignee").value.trim().toLowerCase();
    const status = document.getElementById("filterStatus").value;
    const taskId = document.getElementById("filterTaskId").value.trim();
    const unassigned = document.getElementById("filterUnassigned").checked;

    if (taskId) {
        const id = taskId.replace("TFP-", "");
        filtered = filtered.filter(t => String(t.id) === id);
    }

    if (assignee) {
        filtered = filtered.filter(
            t => t.assigned_to && t.assigned_to.toLowerCase().includes(assignee)
        );
    }

    if (status) {
        filtered = filtered.filter(t => t.status === status);
    }

    if (unassigned) {
        filtered = filtered.filter(t => !t.assigned_to);
    }

    renderTaskTable(filtered);
}



function clearFilters() {
    document.getElementById("filterAssignee").value = "";
    document.getElementById("filterStatus").value = "";
    document.getElementById("filterTaskId").value = "";
    document.getElementById("filterUnassigned").checked = false;

    renderTaskTable(allTasks);
}


/*********************************
 * LOAD TASKS (API)
 *********************************/
function loadTasks(page = 1) {
    const params = new URLSearchParams();

    params.append("page", page);

    if (taskFilters.assigned_to) {
        params.append("assigned_to", taskFilters.assigned_to);
    }

    if (taskFilters.status) {
        params.append("status", taskFilters.status);
    }

    if (taskFilters.task_id) {
        params.append("task_id", taskFilters.task_id);
    }

    if (taskFilters.unassigned) {
        params.append("unassigned", "true");
    }

    fetch(`${API_BASE}/tasks/?${params.toString()}`, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    })
    .then(res => {
    if (res.status === 401) {
        handleUnauthorized();
        return null;
    }
    return res.json();
})
    .then(data => {
        currentTaskPage = page;
        totalTaskPages = Math.ceil(data.count / PAGE_SIZE);

        allTasks = data.results || [];
        renderTaskTable(allTasks);

        updatePagination(data);
    });
}





/*********************************
 * RENDER TABLE
 *********************************/
function renderTaskTable(tasks) {
    const tbody = document.getElementById("taskTableBody");
    tbody.innerHTML = "";

    if (tasks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">No tasks found</td>
            </tr>
        `;
        return;
    }

    tasks.forEach((task, index) => {
        const row = document.createElement("tr");

        // 🔑 Continuous serial number across pages
        const serialNo = (currentTaskPage - 1) * PAGE_SIZE + index + 1;

        row.innerHTML = `
            <td>${serialNo}</td>
            <td><strong>TFP-${task.id}</strong></td>
            <td>${task.title}</td>
            <td>${task.assigned_to || "—"}</td>
            <td>${task.status}</td>
            <td>
                <button onclick="viewTask(${task.id})">View</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

/*********************************
 * PAGINATION UI
 *********************************/
function updatePagination(data) {
    document.getElementById("taskPageInfo").innerText =
        `Page ${currentTaskPage} of ${totalTaskPages}`;

    document.getElementById("prevTaskBtn").disabled = !data.previous;
    document.getElementById("nextTaskBtn").disabled = !data.next;

    document.getElementById("taskPagination").style.display =
        totalTaskPages > 1 ? "flex" : "none";
}

function nextTaskPage() {
    if (currentTaskPage < totalTaskPages) {
        loadTasks(currentTaskPage + 1);
    }
}

function prevTaskPage() {
    if (currentTaskPage > 1) {
        loadTasks(currentTaskPage - 1);
    }
}

/*********************************
 * TASK ACTIONS
 *********************************/
function viewTask(taskId) {
    sessionStorage.setItem("activeTaskId", taskId);
    navigate("task-detail");
}

function deleteTask(taskId) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    fetch(`${API_BASE}/tasks/${taskId}/delete/`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Delete failed");
        loadTasks(currentTaskPage);
    })
    .catch(err => alert("Delete failed"));
}

/*********************************
 * CREATE TASK MODAL
 *********************************/
function openCreateTaskModal() {
    resetTaskModal();
    document.getElementById("taskModal").classList.remove("hidden");
}

function closeCreateTaskModal() {
    document.getElementById("taskModal").classList.add("hidden");
}

function submitTask() {
    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const deadline = document.getElementById("taskDeadline").value;

    if (!title) {
        alert("Title is required");
        return;
    }

    fetch(`${API_BASE}/tasks/create/`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title,
            description,
            deadline: deadline || null
        })
    })
    .then(res => res.json())
    .then(() => {
        closeCreateTaskModal();
        loadTasks(currentTaskPage);
    });
}

function resetTaskModal() {
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("taskDeadline").value = "";
}
