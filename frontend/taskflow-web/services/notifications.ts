import { apiRequest } from "./api";

export type Notification = {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type NotificationResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
};

export function fetchNotifications(page = 1) {
  return apiRequest<NotificationResponse>(
    `/notifications/?page=${page}`
  );
}

export function markNotificationRead(id: number) {
  return apiRequest(`/notifications/${id}/read/`, {
    method: "PATCH",
  });
}

export function fetchUnreadCount() {
  return apiRequest<{ unread: number }>(
    "/notifications/unread-count/"
  );
}
