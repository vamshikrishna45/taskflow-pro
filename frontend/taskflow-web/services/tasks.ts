import { apiRequest } from "./api";

/**
 * Fetch paginated tasks
 */
export async function fetchTasks(page = 1) {
  return apiRequest(`/tasks/?page=${page}`);
}

/**
 * Delete task
 */
export async function deleteTask(taskId: number) {
  return apiRequest(`/tasks/${taskId}/delete/`, {
    method: "DELETE",
  });
}

/**
 * Create task
 */
export async function createTask(payload: {
  title: string;
  description?: string;
  deadline?: string | null;
  priority?: string | null;
}) {
  return apiRequest("/tasks/create/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * AI priority suggestion
 */
export async function suggestPriority(title: string, description: string) {
  return apiRequest("/tasks/suggest-priority/", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
}

/**
 * AI description enhancement
 */
export async function enhanceDescription(description: string) {
  return apiRequest("/tasks/enhance-description/", {
    method: "POST",
    body: JSON.stringify({ description }),
  });
}