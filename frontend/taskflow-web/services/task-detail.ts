import { apiRequest } from "./api";

/**
 * Fetch single task detail
 */
export async function fetchTaskDetail(taskId: number) {
  return apiRequest(`/tasks/${taskId}/`);
}

/**
 * Assign task to user
 */
export async function assignTask(taskId: number, userId: number) {
  return apiRequest(`/tasks/${taskId}/assign/`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

/**
 * Start task
 */
export async function startTask(taskId: number) {
  return apiRequest(`/tasks/${taskId}/start/`, {
    method: "POST",
  });
}

/**
 * Complete task
 */
export async function completeTask(taskId: number) {
  return apiRequest(`/tasks/${taskId}/complete/`, {
    method: "POST",
  });
}

/**
 * Search users
 */
export async function searchUsers(query: string) {
  return apiRequest(`/users/search/?q=${query}`);
}


