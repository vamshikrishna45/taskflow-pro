function updateNotificationBadge() {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(`${API_BASE}/notifications/unread-count/`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => {
        if (!res.ok) return null;   // ❗ do NOT throw
        return res.json();
    })
    .then(data => {
        if (!data) return;

        const badge = document.getElementById("notifBadge");
        if (!badge) return;

        const unread = data.unread || 0;

        badge.style.display = unread > 0 ? "inline-block" : "none";
        badge.innerText = unread;
    })
    .catch(() => {
        /* silent fail – navbar must never break */
    });
}

document.addEventListener("DOMContentLoaded", updateNotificationBadge);
