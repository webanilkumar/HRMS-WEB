import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/notices";

function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    category: "General",
    priority: "Medium",
    publishDate: "",
    expiryDate: "",
    status: "Active",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const getAuthData = () => {
    try {
      const sessionUserString =
        sessionStorage.getItem("hrmsUser");

      if (sessionUserString) {
        const user = JSON.parse(sessionUserString);

        return {
          user,
          token:
            user?.token ||
            sessionStorage.getItem("hrmsToken") ||
            "",
        };
      }

      const localUserString =
        localStorage.getItem("hrmsUser");

      if (localUserString) {
        const user = JSON.parse(localUserString);

        return {
          user,
          token:
            user?.token ||
            localStorage.getItem("hrmsToken") ||
            "",
        };
      }

      return {
        user: null,
        token: "",
      };
    } catch {
      return {
        user: null,
        token: "",
      };
    }
  };

  const authData = getAuthData();
  const userRole = authData.user?.role || "";
  const token = authData.token;

  const canManage =
    userRole === "Admin" || userRole === "HR";

  const canDelete =
    userRole === "Admin";

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 3000);
  };

  const fetchNotices = async () => {
    try {
      setLoading(true);

      if (!token) {
        throw new Error(
          "Login session not found. Please login again."
        );
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch notices"
        );
      }

      setNotices(data.data || []);
    } catch (error) {
      setNotices([]);
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      title: "",
      message: "",
      category: "General",
      priority: "Medium",
      publishDate: "",
      expiryDate: "",
      status: "Active",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      showToast(
        "Notice title is required",
        "error"
      );
      return;
    }

    if (!formData.message.trim()) {
      showToast(
        "Notice message is required",
        "error"
      );
      return;
    }

    try {
      if (!token) {
        throw new Error(
          "Login session not found. Please login again."
        );
      }

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId
        ? "PUT"
        : "POST";

      const payload = {
        ...formData,
        publishDate:
          formData.publishDate || undefined,
        expiryDate:
          formData.expiryDate || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save notice"
        );
      }

      showToast(
        editingId
          ? "Notice updated successfully"
          : "Notice created successfully"
      );

      resetForm();
      await fetchNotices();
    } catch (error) {
      showToast(
        error.message,
        "error"
      );
    }
  };

  const handleEdit = (notice) => {
    setEditingId(notice._id);

    setFormData({
      title: notice.title || "",
      message: notice.message || "",
      category:
        notice.category || "General",
      priority:
        notice.priority || "Medium",
      publishDate:
        notice.publishDate
          ? notice.publishDate.split("T")[0]
          : "",
      expiryDate:
        notice.expiryDate
          ? notice.expiryDate.split("T")[0]
          : "",
      status:
        notice.status || "Active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (noticeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notice?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${noticeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete notice"
        );
      }

      showToast(
        "Notice deleted successfully"
      );

      if (editingId === noticeId) {
        resetForm();
      }

      await fetchNotices();
    } catch (error) {
      showToast(
        error.message,
        "error"
      );
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    return new Date(
      dateValue
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
      };
    }

    if (priority === "Low") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
      };
    }

    return {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    };
  };

  return (
    <div style={styles.page}>
      {toast.show && (
        <div
          style={{
            ...styles.toast,
            backgroundColor:
              toast.type === "error"
                ? "#dc2626"
                : "#16a34a",
          }}
        >
          {toast.message}
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>
          Notifications / Notice Board
        </h1>

        <p style={styles.subtitle}>
          Manage office announcements,
          HR notices and important updates
        </p>
      </div>

      {canManage && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            {editingId
              ? "Edit Notice"
              : "Create Notice"}
          </h2>

          <form
            onSubmit={handleSubmit}
            style={styles.form}
          >
            <div style={styles.field}>
              <label style={styles.label}>
                Title *
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter notice title"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="General">
                  General
                </option>

                <option value="HR">
                  HR
                </option>

                <option value="Policy">
                  Policy
                </option>

                <option value="Holiday">
                  Holiday
                </option>

                <option value="Event">
                  Event
                </option>

                <option value="Important">
                  Important
                </option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Priority
              </label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Publish Date
              </label>

              <input
                type="date"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Expiry Date
              </label>

              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div
              style={{
                ...styles.field,
                gridColumn: "1 / -1",
              }}
            >
              <label style={styles.label}>
                Message *
              </label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter notice message"
                rows="4"
                style={{
                  ...styles.input,
                  resize: "vertical",
                }}
              />
            </div>

            <div style={styles.buttonArea}>
              <button
                type="submit"
                style={styles.primaryButton}
              >
                {editingId
                  ? "Update Notice"
                  : "Create Notice"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.listHeader}>
          <h2 style={styles.cardTitle}>
            Notice Board
          </h2>

          <span style={styles.count}>
            Total: {notices.length}
          </span>
        </div>

        {loading ? (
          <p style={styles.message}>
            Loading notices...
          </p>
        ) : notices.length === 0 ? (
          <p style={styles.message}>
            No notices found.
          </p>
        ) : (
          <div style={styles.noticeGrid}>
            {notices.map((notice) => (
              <div
                key={notice._id}
                style={styles.noticeCard}
              >
                <div style={styles.noticeTop}>
                  <div>
                    <h3 style={styles.noticeTitle}>
                      {notice.title}
                    </h3>

                    <span style={styles.category}>
                      {notice.category}
                    </span>
                  </div>

                  <span
                    style={{
                      ...styles.priority,
                      ...getPriorityStyle(
                        notice.priority
                      ),
                    }}
                  >
                    {notice.priority}
                  </span>
                </div>

                <p style={styles.noticeMessage}>
                  {notice.message}
                </p>

                <div style={styles.meta}>
                  <span>
                    Publish:{" "}
                    {formatDate(
                      notice.publishDate
                    )}
                  </span>

                  <span>
                    Expiry:{" "}
                    {formatDate(
                      notice.expiryDate
                    )}
                  </span>

                  <span>
                    Status: {notice.status}
                  </span>
                </div>

                <div style={styles.createdBy}>
                  Created by:{" "}
                  {notice.createdBy?.name ||
                    "Unknown"}
                </div>

                {canManage && (
                  <div style={styles.actionButtons}>
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(notice)
                      }
                      style={styles.editButton}
                    >
                      Edit
                    </button>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            notice._id
                          )
                        }
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f6f7fb",
    padding: "30px",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  header: {
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    color: "#1f2937",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "14px",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  cardTitle: {
    margin: 0,
    marginBottom: "20px",
    fontSize: "20px",
    color: "#1f2937",
  },

  form: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    marginBottom: "7px",
    fontWeight: "600",
    fontSize: "14px",
    color: "#374151",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#ffffff",
  },

  buttonArea: {
    gridColumn: "1 / -1",
    display: "flex",
    gap: "10px",
  },

  primaryButton: {
    border: "none",
    borderRadius: "7px",
    padding: "11px 20px",
    cursor: "pointer",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "600",
  },

  cancelButton: {
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    padding: "11px 20px",
    cursor: "pointer",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontWeight: "600",
  },

  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  count: {
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },

  noticeGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "18px",
  },

  noticeCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "18px",
    backgroundColor: "#ffffff",
  },

  noticeTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },

  noticeTitle: {
    margin: 0,
    marginBottom: "8px",
    color: "#1f2937",
    fontSize: "18px",
  },

  category: {
    display: "inline-block",
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    padding: "4px 9px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  priority: {
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },

  noticeMessage: {
    color: "#4b5563",
    lineHeight: 1.6,
    marginTop: "16px",
    marginBottom: "16px",
  },

  meta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    color: "#6b7280",
    fontSize: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #e5e7eb",
  },

  createdBy: {
    marginTop: "10px",
    color: "#6b7280",
    fontSize: "12px",
  },

  actionButtons: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
  },

  editButton: {
    border: "none",
    borderRadius: "6px",
    padding: "7px 12px",
    cursor: "pointer",
    backgroundColor: "#f59e0b",
    color: "#ffffff",
    fontWeight: "600",
  },

  deleteButton: {
    border: "none",
    borderRadius: "6px",
    padding: "7px 12px",
    cursor: "pointer",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontWeight: "600",
  },

  message: {
    color: "#6b7280",
    textAlign: "center",
    padding: "25px",
  },

  toast: {
    position: "fixed",
    top: "20px",
    right: "20px",
    color: "#ffffff",
    padding: "13px 18px",
    borderRadius: "8px",
    zIndex: 9999,
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.18)",
    fontSize: "14px",
    fontWeight: "600",
  },
};

export default Notices;