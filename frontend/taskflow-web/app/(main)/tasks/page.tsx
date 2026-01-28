"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import {
  fetchTasks,
  deleteTask,
  createTask,
  suggestPriority,
  enhanceDescription,
} from "@/services/tasks";

const PAGE_SIZE = 10;

export default function TasksPage() {
  const router = useRouter();
  
  // State for tasks list and pagination
  const [tasks, setTasks] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Filter state
  const [filterTaskId, setFilterTaskId] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUnassigned, setFilterUnassigned] = useState(false);

  // Modal state for creating new tasks
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("");
  const [priorityHint, setPriorityHint] = useState(
    "🤖 AI suggestion will appear here"
  );

  // Timer for debouncing priority suggestions
  let priorityTimer: any = null;

  // Load tasks when page changes
  useEffect(() => {
    loadTasks(page);
  }, [page]);

  // Fetch tasks from API
  async function loadTasks(p: number) {
    const data = await fetchTasks(p);
    const results = data.results || [];
    setAllTasks(results);
    setTasks(results);
    setTotalPages(Math.ceil(data.count / PAGE_SIZE));
    setHasNext(!!data.next);
    setHasPrev(!!data.previous);
  }

  // Apply filters
  function applyFilters() {
    let filtered = [...allTasks];

    // Filter by task ID
    if (filterTaskId) {
      const id = filterTaskId.replace("TFP-", "");
      filtered = filtered.filter((t) => String(t.id) === id);
    }

    // Filter by assignee
    if (filterAssignee) {
      filtered = filtered.filter(
        (t) =>
          t.assigned_to &&
          t.assigned_to.toLowerCase().includes(filterAssignee.toLowerCase())
      );
    }

    // Filter by priority
    if (filterPriority) {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    // Filter unassigned
    if (filterUnassigned) {
      filtered = filtered.filter((t) => !t.assigned_to);
    }

    setTasks(filtered);
  }

  // Clear all filters
  function clearFilters() {
    setFilterTaskId("");
    setFilterAssignee("");
    setFilterPriority("");
    setFilterStatus("");
    setFilterUnassigned(false);
    setTasks(allTasks);
  }

  // Reset modal form fields
  function resetModal() {
    setTitle("");
    setDescription("");
    setDeadline("");
    setPriority("");
    setPriorityHint("🤖 AI suggestion will appear here");
  }

  // Debounce AI priority suggestion to avoid excessive API calls
  function debouncePrioritySuggest(t: string, d: string) {
    clearTimeout(priorityTimer);
    priorityTimer = setTimeout(async () => {
      if (!t) return;
      const data = await suggestPriority(t, d);
      if (data?.suggested_priority) {
        setPriorityHint(`🤖 AI suggests: ${data.suggested_priority} priority`);
      }
    }, 700);
  }

  // Handle task creation
  async function handleCreateTask() {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    await createTask({
      title,
      description,
      deadline: deadline || null,
      priority: priority || null,
    });

    setShowModal(false);
    resetModal();
    loadTasks(page);
  }

  // Use AI to enhance task description
  async function handleEnhanceDescription() {
    if (!description.trim()) {
      alert("Enter description first");
      return;
    }

    const data = await enhanceDescription(description);
    if (data?.enhanced_description) {
      setDescription(data.enhanced_description);
    }
  }

  // Navigate to task detail page
  function handleViewTask(taskId: number) {
    sessionStorage.setItem("activeTaskId", taskId.toString());
    router.push("/task-detail");
  }

  // Delete a task after confirmation
  async function handleDelete(taskId: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this task?")) return;
    await deleteTask(taskId);
    loadTasks(page);
  }

  return (
    <AuthGuard>
      <h2>My Tasks</h2>

      {/* Add Task Button */}
      <div className="card">
        <button className="primary" onClick={() => setShowModal(true)}>
          ➕ Add Task
        </button>
      </div>

      {/* Filters Section */}
      <div className="card">
        <h3>Filters</h3>
        <div className="filters">
          <input
            type="text"
            placeholder="Task ID (e.g. TFP-3)"
            value={filterTaskId}
            onChange={(e) => setFilterTaskId(e.target.value)}
          />

          <input
            type="text"
            placeholder="Assignee email"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          />

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={filterUnassigned}
              onChange={(e) => setFilterUnassigned(e.target.checked)}
            />
            Unassigned
          </label>

          <button onClick={applyFilters}>Apply</button>
          <button onClick={clearFilters}>Clear</button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card">
        <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1rem" }}>
          💡 Click on any task to view full details
        </p>

        <table className="task-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Task ID</th>
              <th>Title</th>
              <th>Assigned To</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  No tasks found
                </td>
              </tr>
            )}

            {tasks.map((task, index) => {
              const serialNo = (page - 1) * PAGE_SIZE + index + 1;
              return (
                <tr
                  key={task.id}
                  onClick={() => handleViewTask(task.id)}
                  style={{ cursor: "pointer" }}
                  className="task-row"
                >
                  <td>{serialNo}</td>
                  <td>
                    <strong>TFP-{task.id}</strong>
                  </td>
                  <td>{task.title}</td>
                  <td>{task.assigned_to || "—"}</td>
                  <td>{task.priority || "-"}</td>
                  <td>{task.status}</td>
                  <td>
                    <button onClick={(e) => handleDelete(task.id, e)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={!hasPrev} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          <span className="page-info">
            Page {page} of {totalPages}
          </span>
          <button disabled={!hasNext} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create Task</h3>

            <input
              placeholder="Task title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                debouncePrioritySuggest(e.target.value, description);
              }}
            />

            <textarea
              placeholder="Describe the task in detail..."
              rows={6}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                debouncePrioritySuggest(title, e.target.value);
              }}
            />

            <div className="enhance-deadline-row">
              <button
                type="button"
                className="ai-enhance-btn"
                onClick={handleEnhanceDescription}
              >
                ✨ Enhance the description with AI
              </button>

              <div className="deadline-field">
                <label>Deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <label>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">-- Select priority (optional) --</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            <small style={{ display: "block", marginTop: "4px", color: "#6b7280" }}>
              {priorityHint}
            </small>

            <div className="modal-actions">
              <button onClick={handleCreateTask}>Create</button>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetModal();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}