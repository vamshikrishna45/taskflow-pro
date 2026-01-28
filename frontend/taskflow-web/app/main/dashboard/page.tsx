"use client";

import { useEffect, useState } from "react";
import { getDashboard } from "@/services/dashboard";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1 id="welcome">{data?.message}</h1>

      <div className="card">
        <h3>Summary</h3>

        <div className="summary-grid">
          <SummaryItem
            label="Tasks Created"
            value={data?.summary?.tasks_created || 0}
          />

          <SummaryItem
            label="Tasks Assigned"
            value={data?.summary?.tasks_assigned || 0}
          />

          <SummaryItem
            label="Tasks Pending"
            value={data?.summary?.tasks_pending || 0}
          />
        </div>
      </div>

      <div className="card">
        <h3>
          Notifications (
          <span id="notifCount">
            {data?.summary?.unread_notifications || 0}
          </span>
          )
        </h3>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="summary-item">
      <div className="summary-icon">📊</div>
      <div className="summary-content">
        <span className="summary-label">{label}</span>
        <span className="summary-value">{value}</span>
      </div>
    </div>
  );
}