// app.js - Simple navigation and auth guard

function navigate(view) {
    // Just redirect to proper URL
    window.location.href = '/' + view + '/';
}

function logout() {
    localStorage.removeItem("access_token");
    window.location.href = '/login/';
}

// Optional: protect pages
if (window.location.pathname !== '/login/' && 
    window.location.pathname !== '/signup/' && 
    window.location.pathname !== '/forgot-password/' &&
    !localStorage.getItem("access_token")) {
    window.location.href = '/login/';
}


function handleUnauthorized() {
    console.warn("Session expired. Redirecting to login.");

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/login/";
}



