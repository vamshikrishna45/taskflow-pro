"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import {
  fetchTaskDetail,
  assignTask,
  startTask,
  completeTask,
  searchUsers,
} from "@/services/task-detail";
import { apiRequest } from "@/services/api";

export default function TaskDetailPage() {
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userSelected, setUserSelected] = useState(false); // ✅ ADD THIS


  const taskId =
    typeof window !== "undefined"
      ? Number(sessionStorage.getItem("activeTaskId"))
      : null;

  useEffect(() => {
    async function loadUserProfile() {
      if (typeof window !== "undefined") {
        // Try to get user from localStorage first
        const userData = localStorage.getItem("user");
        
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            setCurrentUser(parsed);
            return;
          } catch (error) {
            console.error("Failed to parse user data:", error);
          }
        }
        
        // If no user data, fetch from API
        try {
          const profile = await apiRequest("/profile/");
          console.log("Fetched user profile:", profile);
          
          // Store in localStorage for future use
          localStorage.setItem("user", JSON.stringify(profile));
          setCurrentUser(profile);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      }
    }

    loadUserProfile();

    if (!taskId) {
      router.push("/tasks");
      return;
    }
    loadTask();
  }, [taskId]);

  async function loadTask() {
    try {
      const data = await fetchTaskDetail(taskId!);
      console.log("Task loaded:", data);
      setTask(data);
    } catch (error: any) {
      alert(error.message || "Failed to load task");
      router.push("/tasks");
    }
  }

  async function handleSearch(q: string) {
    setSearchQuery(q);
    setUserSelected(false); // ✅ ADD THIS
    
    if (q.length < 2) {
      setUsers([]);
      return;
    }
    
    try {
      const data = await searchUsers(q);
      console.log("Users found:", data);
      setUsers(data);
    } catch (error: any) {
      console.error("Search failed:", error);
      setUsers([]);
    }
  }

  function selectUser(userId: number, email: string) {
    setSelectedUserId(userId);
    setSearchQuery(email);
    setUsers([]);
    setUserSelected(true); // ✅ ADD THIS
  }

  async function handleAssign() {
    if (!selectedUserId) return;
    
    try {
      setLoading(true);
      await assignTask(taskId!, selectedUserId);
      alert("Task assigned successfully");
      setSearchQuery("");
      setSelectedUserId(null);
      loadTask();
    } catch (error: any) {
      alert(error.message || "Failed to assign task");
    } finally {
      setLoading(false);
    }
  }

  async function handleStart() {
    try {
      setLoading(true);
      await startTask(taskId!);
      alert("Task started successfully");
      loadTask();
    } catch (error: any) {
      alert(error.message || "Failed to start task");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    try {
      setLoading(true);
      await completeTask(taskId!);
      alert("Task completed successfully");
      loadTask();
    } catch (error: any) {
      alert(error.message || "Failed to complete task");
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    router.push("/tasks");
  }

  if (!task || !currentUser) {
    return (
      <AuthGuard>
        <div className="card">
          <h2>Loading task details...</h2>
        </div>
      </AuthGuard>
    );
  }

  const isCreator = task.created_by === currentUser.email;
  const isAssignee = task.assigned_to && task.assigned_to === currentUser.email;

  // Debug logs
  console.log("Current user email:", currentUser.email);
  console.log("Task creator:", task.created_by);
  console.log("Is creator:", isCreator);

  // Business rules
  const canAssign = isCreator && task.status === "TODO" && !task.assigned_to;
  const canStart = isAssignee && task.status === "TODO";
  const canComplete = isAssignee && task.status === "IN_PROGRESS";

  return (
    <AuthGuard>
      <h2>Task Detail</h2>
      <button onClick={goBack} disabled={loading}>← Back to Tasks</button>

      <div className="card">
        <p>
          <b>Title:</b> {task.title}
        </p>
        <p>
          <b>Description:</b> {task.description || "-"}
        </p>
        <p>
          <b>Status:</b>{" "}
          <span
            style={{
              fontWeight: "bold",
              color:
                task.status === "TODO"
                  ? "#f59e0b"
                  : task.status === "IN_PROGRESS"
                  ? "#3b82f6"
                  : "#10b981",
            }}
          >
            {task.status}
          </span>
        </p>
        <p>
          <b>Priority:</b> {task.priority || "-"}
        </p>
        <p>
          <b>Created By:</b> {task.created_by}
        </p>
        <p>
          <b>Assigned To:</b> {task.assigned_to || "-"}
        </p>
        <p>
          <b>Deadline:</b>{" "}
          {task.deadline ? new Date(task.deadline).toLocaleString() : "-"}
        </p>
      </div>

      {/* Assign Section */}
      {canAssign && (
        <div className="card" id="assignSection">
          <h3>Assign Task to User</h3>
          <p
            style={{
              color: "#6b7280",
              fontSize: "0.875rem",
              marginBottom: "1rem",
            }}
          >
            Search for a user by email and assign this task
          </p>

          <input
            type="text"
            placeholder="Type email to search users..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />

          {users.length > 0 && (
            <ul
              id="userResults"
              style={{
                listStyle: "none",
                padding: 0,
                margin: "10px 0",
                border: "1px solid #ddd",
                borderRadius: "4px",
                maxHeight: "200px",
                overflowY: "auto",
                backgroundColor: "white",
              }}
            >
              {users.map((u) => (
                <li
                  key={u.id}
                  onClick={() => selectUser(u.id, u.email)}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  {u.email}
                </li>
              ))}
            </ul>
          )}

         {!userSelected &&
  searchQuery &&
  users.length === 0 &&
  searchQuery.length >= 2 && (
    <p>No users found matching "{searchQuery}"</p>
)}


          <button
            disabled={!selectedUserId || loading}
            onClick={handleAssign}
            style={{
              marginTop: "1rem",
              padding: "10px 20px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: !selectedUserId || loading ? "not-allowed" : "pointer",
              opacity: !selectedUserId || loading ? 0.5 : 1,
            }}
          >
            {loading ? "Assigning..." : "Assign Task"}
          </button>
        </div>
      )}

      {isCreator && task.assigned_to && (
        <div
          className="card"
          style={{
            backgroundColor: "#fef3c7",
            borderLeft: "4px solid #f59e0b",
          }}
        >
          <p style={{ margin: 0, color: "#92400e" }}>
            ℹ️ This task is already assigned to <strong>{task.assigned_to}</strong>
          </p>
        </div>
      )}

      {(canStart || canComplete) && (
        <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
          {canStart && (
            <button
              id="startBtn"
              onClick={handleStart}
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Starting..." : "▶ Start Task"}
            </button>
          )}

          {canComplete && (
            <button
              id="completeBtn"
              onClick={handleComplete}
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "4px",
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Completing..." : "✓ Complete Task"}
            </button>
          )}
        </div>
      )}

      {isCreator && !task.assigned_to && task.status === "TODO" && (
        <div
          className="card"
          style={{
            backgroundColor: "#fef3c7",
            borderLeft: "4px solid #f59e0b",
            marginTop: "1rem",
          }}
        >
          <p style={{ margin: 0, color: "#92400e" }}>
            ℹ️ Please assign this task to a user to begin work
          </p>
        </div>
      )}

      {isCreator && !isAssignee && task.assigned_to && (
        <div
          className="card"
          style={{
            backgroundColor: "#f3f4f6",
            borderLeft: "4px solid #6b7280",
            marginTop: "1rem",
          }}
        >
          <p style={{ margin: 0, color: "#374151" }}>
            ℹ️ Only the assigned user ({task.assigned_to}) can start or complete
            this task
          </p>
        </div>
      )}
    </AuthGuard>
  );
}