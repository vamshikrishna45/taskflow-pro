"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import {
  fetchNotifications,
  markNotificationRead,
  Notification,
} from "@/services/notifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const [readFilter, setReadFilter] = useState("unread");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    load(page);
  }, [page]);

  function load(p: number) {
    fetchNotifications(p).then((data) => {
      setNotifications(data.results || []);
      setPagination(data);
    });
  }

  const filtered = useMemo(() => {
    let list = [...notifications];
    const now = new Date();

    if (readFilter === "unread") {
      list = list.filter((n) => !n.is_read);
    }

    list = list.filter((n) => {
      const created = new Date(n.created_at);
      const diffDays =
        (now.getTime() - created.getTime()) /
        (1000 * 60 * 60 * 24);

      if (timeFilter === "today") {
        return created.toDateString() === now.toDateString();
      }
      if (timeFilter === "7days") {
        return diffDays <= 7;
      }
      if (timeFilter === "older") {
        return diffDays > 7;
      }
      return true;
    });

    return list;
  }, [notifications, readFilter, timeFilter]);

  async function markRead(id: number) {
    await markNotificationRead(id);
    load(page);
  }

  return (
    <AuthGuard>
      <div className="container">
        <h2>Notifications</h2>

        <div className="card">
          {/* FILTER BAR */}
          <div className="notif-filters">
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
            >
              <option value="unread">Unread</option>
              <option value="all">All</option>
            </select>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="older">Older</option>
            </select>
          </div>

          {/* LIST */}
          <ul className="notification-list">
            {filtered.length === 0 && (
              <li>No notifications</li>
            )}

            {filtered.map((n) => (
              <li
                key={n.id}
                className={`notif ${
                  n.is_read ? "read" : "unread"
                }`}
              >
                <div className="notif-msg">{n.message}</div>
                <div className="notif-time">
                  {new Date(n.created_at).toLocaleString()}
                </div>

                {!n.is_read && (
                  <button onClick={() => markRead(n.id)}>
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* PAGINATION */}
        {pagination && (pagination.previous || pagination.next) && (
          <div className="pagination">
            <button
              disabled={!pagination.previous}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>

            <span className="page-info">
              Page {page}
            </span>

            <button
              disabled={!pagination.next}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
