document.addEventListener("DOMContentLoaded", loadProfile);

function loadProfile() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        navigate("login");
        return;
    }

    fetch(`${API_BASE}/profile/`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => {
        if (res.status === 401) {
            localStorage.removeItem("access_token");
            navigate("login");
            throw new Error("Unauthorized");
        }
        return res.json();
    })
    .then(data => {
        const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim();

        document.getElementById("profileName").innerText =
            fullName || "-";

        document.getElementById("profileEmail").innerText =
            data.email || "-";
    })
    .catch(err => console.error(err));
}

function changePassword() {
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;

    if (!oldPassword || !newPassword) {
        alert("Both passwords are required");
        return;
    }

    fetch(`${API_BASE}/profile/change-password/`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || data.error);

        if (data.message) {
            // 🔐 Password change invalidates JWT
            localStorage.removeItem("access_token");
            navigate("login");
        }
    });
}
