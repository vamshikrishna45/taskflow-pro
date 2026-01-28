const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

/**
 * Central API request helper
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("access_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // ✅ FIXED: Don't redirect on login endpoint
  if (response.status === 401) {
    // If this is NOT a login attempt, then session expired
    if (!endpoint.includes("/auth/login")) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/auth/login";
      throw new Error("Session expired");
    }
    
    // ✅ For login failures, throw the actual error from backend
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || "Invalid credentials");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || "API error");
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}