document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.startsWith("/dashboard")) {
        loadDashboard();
    }
});

function loadDashboard() {
    console.log("dashboard.js loaded");

    const token = localStorage.getItem("access_token");

    if (!token) {
        navigate("login");
        return;
    }

    // -----------------------------
    // DASHBOARD API CALL
    // -----------------------------
    fetch(`${API_BASE}/dashboard/`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => {
        if (!res.ok) {
            if (res.status === 401) {
                localStorage.removeItem("access_token");
                navigate("login");
            }
            throw new Error("Dashboard API failed");
        }
        return res.json();
    })
    .then(data => {
        document.getElementById("welcome").innerText = data.message;
        document.getElementById("created").innerText = data.summary.tasks_created;
        document.getElementById("assigned").innerText = data.summary.tasks_assigned;
        document.getElementById("pending").innerText = data.summary.tasks_pending;

        
         // 🔔 FIX: unread notification count
        document.getElementById("notifCount").innerText =
          data.summary.unread_notifications;
    })
    .catch(err => {
        console.error("Dashboard load error:", err);
    });

    // -----------------------------
    // WEBSOCKET (FASTAPI)
    // -----------------------------
    const wsUrl = `${WS_BASE}/ws/notifications?token=${token}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            const countEl = document.getElementById("notifCount");

            countEl.innerText = parseInt(countEl.innerText) + 1;
            alert("🔔 " + data.message);
        } catch (e) {
            console.error("Invalid WS message:", event.data);
        }
    };

    socket.onerror = (err) => {
        console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
        console.warn("WebSocket closed");
    };
}
