// UI/static/JS/auth.js

// API_BASE comes from config.js (loaded before this script)

/* ======================
   AUTHENTICATION FUNCTIONS
====================== */

/**
 * Optional hook - can be used later if you want to run code when login page loads
 */
function loadLogin() {
    // Future enhancements (e.g., clear fields, focus email, etc.)
    console.log("Login page loaded");
}

/**
 * Handle user login
 */
function loginUser() {
    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value;

    if (!email || !password) {
        showError("Email and password are required");
        return;
    }

    fetch(`${API_BASE}/auth/token/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    })
    .then(async response => {
        const data = await response.json();

        // ❌ Invalid credentials (Django usually returns 401)
        if (response.status === 401 || response.status === 400) {
            throw new Error(data.detail || "Invalid email or password");
        }

        // ❌ Other server errors
        if (!response.ok) {
            throw new Error("Server error. Please try again later.");
        }

        return data;
    })
    .then(data => {
        // ✅ Store tokens
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        // ✅ Fetch user profile
        return fetch(`${API_BASE}/profile/`, {
            headers: {
                "Authorization": "Bearer " + data.access
            }
        });
    })
    .then(res => res.json())
    .then(user => {
        localStorage.setItem("user", JSON.stringify(user));
        window.location.href = "/dashboard/";
    })
    .catch(error => {
        console.error("Login error:", error);
        showError(error.message); // ✅ clean error message
    });
}


/**
 * Handle user signup
 */
function signupUser() {
    const firstName = document.getElementById("firstName")?.value.trim();
    const lastName = document.getElementById("lastName")?.value.trim();
    const email = document.getElementById("signupEmail")?.value.trim();
    const password = document.getElementById("signupPassword")?.value;

    if (!email || !password) {
        alert("Email and password are required");
        return;
    }

    if (!firstName || !lastName) {
        alert("First name and last name are required");
        return;
    }

    fetch(`${API_BASE}/auth/signup/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
            first_name: firstName,
            last_name: lastName
        }),
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Signup failed");
        }
        return data;
    })
    .then(() => {
        alert("Signup successful! Please log in.");
        window.location.href = "/login/";
    })
    .catch(error => {
        console.error("Signup error:", error);
        alert(error.message);
    });
}


/**
 * Handle forgot password request
 */
function submitForgotPassword() {
    const email = document.getElementById("forgotEmail")?.value.trim();

    if (!email) {
        alert("Please enter your email");
        return;
    }

    fetch(`${API_BASE}/auth/forgot-password/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "If that email exists, a reset link has been sent.");
        window.location.href = "/login/";
    })
    .catch(error => {
        console.error("Forgot password error:", error);
        alert("An error occurred. Please try again.");
    });
}


/**
 * Display error messages in login UI
 */
function showError(message) {
    const errorEl = document.getElementById("errorMsg");

    if (!errorEl) {
        alert(message); // fallback safety
        return;
    }

    errorEl.innerText = message;
    errorEl.style.display = "block";
}


