/*********************************
 * STATE
 *********************************/
let notifInterval = null;
let currentNotifPage = 1;
let allNotifications = [];

// filter state
let notifFilters = {
    read: "unread",   // unread | all
    time: "all"       // all | today | 7days | older
};

/*********************************
 * INIT
 *********************************/
document.addEventListener("DOMContentLoaded", () => {
    if (!location.pathname.startsWith("/notifications")) return;

    loadNotifications(1);
    startNotificationPolling();
});

/*********************************
 * LOAD NOTIFICATIONS (API)
 *********************************/
function loadNotifications(page = 1) {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(`${API_BASE}/notifications/?page=${page}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => {
    if (res.status === 401) {
        handleUnauthorized();
        throw new Error("Unauthorized");
    }
    return res.json();
})

    .then(data => {
        if (!data) return;

        allNotifications = data.results || [];
        currentNotifPage = page;

        applyNotifFilters();
        updateNotifPagination(data);
    })
    .catch(err => {
        console.error("Failed to load notifications", err);
    });
}

/*********************************
 * FILTER HANDLERS
 *********************************/
function applyNotifFilters() {
    // 🔑 READ FROM UI
    notifFilters.read =
        document.getElementById("filterRead").value;

    notifFilters.time =
        document.getElementById("filterTime").value;

    let filtered = [...allNotifications];
    const now = new Date();

    // Read / Unread
    if (notifFilters.read === "unread") {
        filtered = filtered.filter(n => !n.is_read);
    }

    // Time filter
    filtered = filtered.filter(n => {
        const created = new Date(n.created_at);
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);

        if (notifFilters.time === "today") {
            return created.toDateString() === now.toDateString();
        }
        if (notifFilters.time === "7days") {
            return diffDays <= 7;
        }
        if (notifFilters.time === "older") {
            return diffDays > 7;
        }
        return true;
    });

    renderNotifications(filtered);
}


/*********************************
 * FILTER UI EVENTS
 *********************************/
function onReadFilterChange(value) {
    notifFilters.read = value;
    applyNotifFilters();
}

function onTimeFilterChange(value) {
    notifFilters.time = value;
    applyNotifFilters();
}

/*********************************
 * RENDER UI
 *********************************/
function renderNotifications(notifications) {
    const list = document.getElementById("notifList");
    list.innerHTML = "";

    if (notifications.length === 0) {
        list.innerHTML = "<li>No notifications</li>";
        return;
    }

    notifications.forEach(n => {
        const li = document.createElement("li");
        li.className = `notif ${n.is_read ? "read" : "unread"}`;

        li.innerHTML = `
            <div class="notif-msg">${n.message}</div>
            <div class="notif-time">
                ${new Date(n.created_at).toLocaleString()}
            </div>
            ${
                !n.is_read
                    ? `<button onclick="markRead(${n.id})">Mark as read</button>`
                    : ""
            }
        `;

        list.appendChild(li);
    });
}

/*********************************
 * PAGINATION
 *********************************/
function updateNotifPagination(data) {
    document.getElementById("notifPageInfo").innerText =
        `Page ${currentNotifPage}`;

    document.getElementById("prevNotifBtn").disabled = !data.previous;
    document.getElementById("nextNotifBtn").disabled = !data.next;

    document.getElementById("notifPagination").style.display =
        (data.previous || data.next) ? "flex" : "none";
}

function nextNotifPage() {
    loadNotifications(currentNotifPage + 1);
}

function prevNotifPage() {
    if (currentNotifPage > 1) {
        loadNotifications(currentNotifPage - 1);
    }
}

/*********************************
 * ACTIONS
 *********************************/
function markRead(id) {
    fetch(`${API_BASE}/notifications/${id}/read/`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    })
    .then(() => {
        loadNotifications(currentNotifPage);

        if (typeof updateNotificationBadge === "function") {
            updateNotificationBadge();
        }
    });
}

/*********************************
 * POLLING
 *********************************/
function startNotificationPolling() {
    if (notifInterval) return;

    notifInterval = setInterval(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            clearInterval(notifInterval);
            notifInterval = null;
            return;
        }
        loadNotifications(currentNotifPage);
    }, 10000);
}


/*********************************
 * CLEANUP
 *********************************/
window.addEventListener("beforeunload", () => {
    if (notifInterval) {
        clearInterval(notifInterval);
        notifInterval = null;
    }
});
