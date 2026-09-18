import { useEffect, useState } from "react";

const DOCUMENT_API =
  "http://localhost:5000/api/employee-documents";

const EMPLOYEE_API =
  "http://localhost:5000/api/employees";

function EmployeeDocuments() {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    employee: "",
    documentType: "Aadhaar",
    documentName: "",
    documentNumber: "",
    fileUrl: "",
    issueDate: "",
    expiryDate: "",
    status: "Active",
    remarks: "",
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
  const token = authData.token;
  const userRole = authData.user?.role || "";

  const canManage =
    userRole === "Admin" || userRole === "HR";

  const canDelete = userRole === "Admin";

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

  const fetchEmployees = async () => {
    try {
      const response = await fetch(EMPLOYEE_API);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch employees"
        );
      }

      setEmployees(data.employees || []);
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      if (!token) {
        throw new Error(
          "Login session not found. Please login again."
        );
      }

      const response = await fetch(DOCUMENT_API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch employee documents"
        );
      }

      setDocuments(data.data || []);
    } catch (error) {
      setDocuments([]);
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDocuments();

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
      employee: "",
      documentType: "Aadhaar",
      documentName: "",
      documentNumber: "",
      fileUrl: "",
      issueDate: "",
      expiryDate: "",
      status: "Active",
      remarks: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.employee) {
      showToast(
        "Please select an employee",
        "error"
      );
      return;
    }

    if (!formData.documentName.trim()) {
      showToast(
        "Document name is required",
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
        ? `${DOCUMENT_API}/${editingId}`
        : DOCUMENT_API;

      const method = editingId
        ? "PUT"
        : "POST";

      const payload = {
        employee: formData.employee,
        documentType: formData.documentType,
        documentName:
          formData.documentName.trim(),
        documentNumber:
          formData.documentNumber.trim(),
        fileUrl: formData.fileUrl.trim(),
        issueDate:
          formData.issueDate || null,
        expiryDate:
          formData.expiryDate || null,
        status: formData.status,
        remarks: formData.remarks.trim(),
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
          data.message ||
            "Failed to save employee document"
        );
      }

      showToast(
        editingId
          ? "Employee document updated successfully"
          : "Employee document created successfully"
      );

      resetForm();
      await fetchDocuments();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleEdit = (document) => {
    setEditingId(document._id);

    setFormData({
      employee:
        document.employee?._id || "",
      documentType:
        document.documentType || "Aadhaar",
      documentName:
        document.documentName || "",
      documentNumber:
        document.documentNumber || "",
      fileUrl:
        document.fileUrl || "",
      issueDate:
        document.issueDate
          ? document.issueDate.split("T")[0]
          : "",
      expiryDate:
        document.expiryDate
          ? document.expiryDate.split("T")[0]
          : "",
      status:
        document.status || "Active",
      remarks:
        document.remarks || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${DOCUMENT_API}/${documentId}`,
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
          data.message ||
            "Failed to delete employee document"
        );
      }

      showToast(
        "Employee document deleted successfully"
      );

      if (editingId === documentId) {
        resetForm();
      }

      await fetchDocuments();
    } catch (error) {
      showToast(error.message, "error");
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

  const openDocument = (url) => {
    if (!url) {
      showToast(
        "Document URL is not available",
        "error"
      );
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
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
        <h1 style={styles.title}>
          Employee Documents
        </h1>

        <p style={styles.subtitle}>
          Manage employee identity,
          employment and qualification documents
        </p>
      </div>

      {canManage && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            {editingId
              ? "Edit Employee Document"
              : "Add Employee Document"}
          </h2>

          <form
            onSubmit={handleSubmit}
            style={styles.form}
          >
            <div style={styles.field}>
              <label style={styles.label}>
                Employee *
              </label>

              <select
                name="employee"
                value={formData.employee}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">
                  Select Employee
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee._id}
                    value={employee._id}
                  >
                    {employee.employeeId} -{" "}
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Document Type *
              </label>

              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="Aadhaar">
                  Aadhaar
                </option>

                <option value="PAN">
                  PAN
                </option>

                <option value="Resume">
                  Resume
                </option>

                <option value="Offer Letter">
                  Offer Letter
                </option>

                <option value="Appointment Letter">
                  Appointment Letter
                </option>

                <option value="Experience Letter">
                  Experience Letter
                </option>

                <option value="Education Certificate">
                  Education Certificate
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Document Name *
              </label>

              <input
                type="text"
                name="documentName"
                value={formData.documentName}
                onChange={handleChange}
                placeholder="Example: PAN Card"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Document Number
              </label>

              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                placeholder="Enter document number"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Issue Date
              </label>

              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
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

                <option value="Expired">
                  Expired
                </option>

                <option value="Pending">
                  Pending
                </option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Document URL
              </label>

              <input
                type="url"
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleChange}
                placeholder="https://example.com/document.pdf"
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
                Remarks
              </label>

              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter remarks"
                rows="3"
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
                  ? "Update Document"
                  : "Add Document"}
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
            Document List
          </h2>

          <span style={styles.count}>
            Total: {documents.length}
          </span>
        </div>

        {loading ? (
          <p style={styles.message}>
            Loading documents...
          </p>
        ) : documents.length === 0 ? (
          <p style={styles.message}>
            No employee documents found.
          </p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    Employee
                  </th>

                  <th style={styles.th}>
                    Type
                  </th>

                  <th style={styles.th}>
                    Document
                  </th>

                  <th style={styles.th}>
                    Number
                  </th>

                  <th style={styles.th}>
                    Issue Date
                  </th>

                  <th style={styles.th}>
                    Expiry Date
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>

                  <th style={styles.th}>
                    File
                  </th>

                  {canManage && (
                    <th style={styles.th}>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {documents.map((document) => (
                  <tr key={document._id}>
                    <td style={styles.td}>
                      <strong>
                        {document.employee?.name ||
                          "-"}
                      </strong>

                      <div style={styles.smallText}>
                        {document.employee
                          ?.employeeId || ""}
                      </div>
                    </td>

                    <td style={styles.td}>
                      {document.documentType}
                    </td>

                    <td style={styles.td}>
                      {document.documentName}
                    </td>

                    <td style={styles.td}>
                      {document.documentNumber ||
                        "-"}
                    </td>

                    <td style={styles.td}>
                      {formatDate(
                        document.issueDate
                      )}
                    </td>

                    <td style={styles.td}>
                      {formatDate(
                        document.expiryDate
                      )}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            document.status ===
                            "Active"
                              ? "#dcfce7"
                              : document.status ===
                                "Expired"
                              ? "#fee2e2"
                              : "#fef3c7",
                          color:
                            document.status ===
                            "Active"
                              ? "#166534"
                              : document.status ===
                                "Expired"
                              ? "#991b1b"
                              : "#92400e",
                        }}
                      >
                        {document.status}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {document.fileUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            openDocument(
                              document.fileUrl
                            )
                          }
                          style={styles.viewButton}
                        >
                          View
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>

                    {canManage && (
                      <td style={styles.td}>
                        <div
                          style={
                            styles.actionButtons
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(document)
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
                                  document._id
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
                ))}
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
    fontFamily: "Arial, Helvetica, sans-serif",
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

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #e5e7eb",
    color: "#374151",
    fontSize: "13px",
    backgroundColor: "#f9fafb",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    color: "#4b5563",
    fontSize: "13px",
  },

  smallText: {
    marginTop: "4px",
    fontSize: "11px",
    color: "#9ca3af",
  },

  statusBadge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },

  actionButtons: {
    display: "flex",
    gap: "7px",
  },

  editButton: {
    border: "none",
    borderRadius: "6px",
    padding: "7px 11px",
    cursor: "pointer",
    backgroundColor: "#f59e0b",
    color: "#ffffff",
    fontWeight: "600",
  },

  deleteButton: {
    border: "none",
    borderRadius: "6px",
    padding: "7px 11px",
    cursor: "pointer",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontWeight: "600",
  },

  viewButton: {
    border: "none",
    borderRadius: "6px",
    padding: "7px 11px",
    cursor: "pointer",
    backgroundColor: "#2563eb",
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

export default EmployeeDocuments;