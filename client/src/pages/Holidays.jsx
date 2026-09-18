import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/holidays";

function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    type: "Public Holiday",
    description: "",
    status: "Active",
  });

  const [editingId, setEditingId] = useState(null);

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
    } catch (error) {
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

  const fetchHolidays = async () => {
    try {
      setLoading(true);

      if (!token) {
        throw new Error(
          "Login session not found. Please login again."
        );
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch holidays"
        );
      }

      setHolidays(data.data || []);
    } catch (error) {
      setHolidays([]);

      showToast(
        error.message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      date: "",
      type: "Public Holiday",
      description: "",
      status: "Active",
    });

    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      showToast(
        "Holiday name is required",
        "error"
      );
      return;
    }

    if (!formData.date) {
      showToast(
        "Holiday date is required",
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

      const response = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(
            formData
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save holiday"
        );
      }

      showToast(
        editingId
          ? "Holiday updated successfully"
          : "Holiday added successfully"
      );

      resetForm();

      await fetchHolidays();
    } catch (error) {
      showToast(
        error.message,
        "error"
      );
    }
  };

  const handleEdit = (holiday) => {
    setEditingId(holiday._id);

    setFormData({
      name:
        holiday.name || "",

      date:
        holiday.date
          ? holiday.date.split("T")[0]
          : "",

      type:
        holiday.type ||
        "Public Holiday",

      description:
        holiday.description || "",

      status:
        holiday.status ||
        "Active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (
    holidayId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this holiday?"
      );

    if (!confirmed) {
      return;
    }

    try {
      if (!token) {
        throw new Error(
          "Login session not found. Please login again."
        );
      }

      const response =
        await fetch(
          `${API_URL}/${holidayId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete holiday"
        );
      }

      showToast(
        "Holiday deleted successfully"
      );

      if (
        editingId === holidayId
      ) {
        resetForm();
      }

      await fetchHolidays();
    } catch (error) {
      showToast(
        error.message,
        "error"
      );
    }
  };

  const formatDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "-";
    }

    const date =
      new Date(dateValue);

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
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
        <div>
          <h1 style={styles.title}>
            Holiday Management
          </h1>

          <p style={styles.subtitle}>
            Manage company holidays and
            official holiday calendar
          </p>
        </div>
      </div>

      {canManage && (
        <div style={styles.card}>
          <h2
            style={styles.cardTitle}
          >
            {editingId
              ? "Edit Holiday"
              : "Add Holiday"}
          </h2>

          <form
            onSubmit={handleSubmit}
            style={styles.form}
          >
            <div style={styles.field}>
              <label
                style={styles.label}
              >
                Holiday Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter holiday name"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label
                style={styles.label}
              >
                Holiday Date *
              </label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label
                style={styles.label}
              >
                Holiday Type
              </label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="National Holiday">
                  National Holiday
                </option>

                <option value="Public Holiday">
                  Public Holiday
                </option>

                <option value="Company Holiday">
                  Company Holiday
                </option>

                <option value="Optional Holiday">
                  Optional Holiday
                </option>
              </select>
            </div>

            <div style={styles.field}>
              <label
                style={styles.label}
              >
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

            <div
              style={{
                ...styles.field,
                gridColumn:
                  "1 / -1",
              }}
            >
              <label
                style={styles.label}
              >
                Description
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                placeholder="Enter holiday description"
                rows="3"
                style={{
                  ...styles.input,
                  resize:
                    "vertical",
                }}
              />
            </div>

            <div
              style={
                styles.buttonArea
              }
            >
              <button
                type="submit"
                style={
                  styles.primaryButton
                }
              >
                {editingId
                  ? "Update Holiday"
                  : "Add Holiday"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  style={
                    styles.cancelButton
                  }
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div style={styles.card}>
        <div
          style={
            styles.listHeader
          }
        >
          <h2
            style={styles.cardTitle}
          >
            Holiday List
          </h2>

          <span style={styles.count}>
            Total: {holidays.length}
          </span>
        </div>

        {loading ? (
          <p style={styles.message}>
            Loading holidays...
          </p>
        ) : holidays.length === 0 ? (
          <p style={styles.message}>
            No holidays found.
          </p>
        ) : (
          <div
            style={
              styles.tableWrapper
            }
          >
            <table
              style={styles.table}
            >
              <thead>
                <tr>
                  <th style={styles.th}>
                    Holiday Name
                  </th>

                  <th style={styles.th}>
                    Date
                  </th>

                  <th style={styles.th}>
                    Type
                  </th>

                  <th style={styles.th}>
                    Description
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>

                  {canManage && (
                    <th
                      style={
                        styles.th
                      }
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {holidays.map(
                  (holiday) => (
                    <tr
                      key={
                        holiday._id
                      }
                    >
                      <td
                        style={
                          styles.td
                        }
                      >
                        <strong>
                          {
                            holiday.name
                          }
                        </strong>
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {formatDate(
                          holiday.date
                        )}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {
                          holiday.type
                        }
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {holiday.description ||
                          "-"}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        <span
                          style={{
                            ...styles.status,
                            backgroundColor:
                              holiday.status ===
                              "Active"
                                ? "#dcfce7"
                                : "#fee2e2",
                            color:
                              holiday.status ===
                              "Active"
                                ? "#166534"
                                : "#991b1b",
                          }}
                        >
                          {
                            holiday.status
                          }
                        </span>
                      </td>

                      {canManage && (
                        <td
                          style={
                            styles.td
                          }
                        >
                          <div
                            style={
                              styles.actionButtons
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  holiday
                                )
                              }
                              style={
                                styles.editButton
                              }
                            >
                              Edit
                            </button>

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    holiday._id
                                  )
                                }
                                style={
                                  styles.deleteButton
                                }
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
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
    border:
      "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    outline: "none",
    backgroundColor:
      "#ffffff",
  },

  buttonArea: {
    gridColumn: "1 / -1",
    display: "flex",
    gap: "10px",
    marginTop: "5px",
  },

  primaryButton: {
    border: "none",
    borderRadius: "7px",
    padding: "11px 20px",
    cursor: "pointer",
    backgroundColor:
      "#2563eb",
    color: "#ffffff",
    fontWeight: "600",
  },

  cancelButton: {
    border:
      "1px solid #d1d5db",
    borderRadius: "7px",
    padding: "11px 20px",
    cursor: "pointer",
    backgroundColor:
      "#ffffff",
    color: "#374151",
    fontWeight: "600",
  },

  listHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
  },

  count: {
    backgroundColor:
      "#eef2ff",
    color: "#4338ca",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
    minWidth: "850px",
  },

  th: {
    textAlign: "left",
    padding: "13px",
    backgroundColor:
      "#f9fafb",
    borderBottom:
      "1px solid #e5e7eb",
    color: "#4b5563",
    fontSize: "13px",
  },

  td: {
    padding: "13px",
    borderBottom:
      "1px solid #e5e7eb",
    color: "#374151",
    fontSize: "14px",
    verticalAlign:
      "middle",
  },

  status: {
    display:
      "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  actionButtons: {
    display: "flex",
    gap: "8px",
  },

  editButton: {
    border: "none",
    borderRadius: "6px",
    padding: "7px 12px",
    cursor: "pointer",
    backgroundColor:
      "#f59e0b",
    color: "#ffffff",
    fontWeight: "600",
  },

  deleteButton: {
    border: "none",
    borderRadius: "6px",
    padding: "7px 12px",
    cursor: "pointer",
    backgroundColor:
      "#dc2626",
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

export default Holidays;