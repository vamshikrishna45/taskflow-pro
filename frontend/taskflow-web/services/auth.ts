import { apiRequest } from "./api";

/* ======================
/* ======================
   LOGIN
====================== */
export async function login(email: string, password: string) {
  const data = await apiRequest("/auth/login/", {  // ← Changed from /token/ to /auth/login/
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // store tokens
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);

  return data;
}

/* ======================
   SIGNUP
====================== */
export async function signup(payload: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}) {
  return apiRequest("/auth/signup/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ======================
   LOGOUT
====================== */
export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/auth/login";
}

/* ======================
   PROFILE
====================== */
export async function getProfile() {
  return apiRequest("/profile/");
}

/* ======================
   CHANGE PASSWORD
====================== */
export async function changePassword(
  old_password: string,
  new_password: string
) {
  return apiRequest("/profile/change-password/", {
    method: "POST",
    body: JSON.stringify({ old_password, new_password }),
  });
}

/* ======================
   FORGOT PASSWORD
====================== */
export async function forgotPassword(email: string) {
  return apiRequest("/auth/forgot-password/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/* ======================
   RESET PASSWORD
/* ======================
   RESET PASSWORD
====================== */
export async function resetPassword(
  token: string,
  new_password: string
) {
  return apiRequest("/auth/reset-password/", {
    method: "POST",
    body: JSON.stringify({ token, new_password }),
  });
}
