import { apiRequest } from "./api";

export type DashboardResponse = {
  message: string;
  summary: {
    tasks_created: number;
    tasks_assigned: number;
    tasks_pending: number;
    unread_notifications: number;
  };
};

export function getDashboard() {
  return apiRequest<DashboardResponse>("/dashboard/summary/");
}
