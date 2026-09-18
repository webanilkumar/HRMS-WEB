import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  BriefcaseBusiness,
  Search,
  Pencil,
  Trash2,
  Plus,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Layers3,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function DepartmentsDesignations() {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    code: "",
    description: "",
    status: "Active",
  });

  const [designationForm, setDesignationForm] = useState({
    name: "",
    code: "",
    department: "",
    description: "",
    status: "Active",
  });

  const [editingDepartmentId, setEditingDepartmentId] =
    useState(null);
  const [editingDesignationId, setEditingDesignationId] =
    useState(null);

  const [departmentSearch, setDepartmentSearch] = useState("");
  const [designationSearch, setDesignationSearch] = useState("");

  const [departmentStatusFilter, setDepartmentStatusFilter] =
    useState("All");
  const [designationStatusFilter, setDesignationStatusFilter] =
    useState("All");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = useMemo(
    () =>
      sessionStorage.getItem("hrmsToken") ||
      localStorage.getItem("hrmsToken") ||
      "",
    []
  );

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const jsonHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const showSuccess = (text) => {
    setMessage(text);
    setError("");

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const showError = (text) => {
    setError(text);
    setMessage("");

    window.setTimeout(() => {
      setError("");
    }, 4000);
  };

  const fetchDepartments = async () => {
    const response = await fetch(`${API_URL}/departments`, {
      headers: authHeaders,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load departments");
    }

    setDepartments(result.data || []);
  };

  const fetchDesignations = async () => {
    const response = await fetch(`${API_URL}/designations`, {
      headers: authHeaders,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to load designations"
      );
    }

    setDesignations(result.data || []);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchDepartments(),
        fetchDesignations(),
      ]);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetDepartmentForm = () => {
    setDepartmentForm({
      name: "",
      code: "",
      description: "",
      status: "Active",
    });

    setEditingDepartmentId(null);
  };

  const resetDesignationForm = () => {
    setDesignationForm({
      name: "",
      code: "",
      department: "",
      description: "",
      status: "Active",
    });

    setEditingDesignationId(null);
  };

  const handleDepartmentChange = (event) => {
    const { name, value } = event.target;

    setDepartmentForm((previous) => ({
      ...previous,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));
  };

  const handleDesignationChange = (event) => {
    const { name, value } = event.target;

    setDesignationForm((previous) => ({
      ...previous,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));
  };

  const handleDepartmentSubmit = async (event) => {
    event.preventDefault();

    if (
      !departmentForm.name.trim() ||
      !departmentForm.code.trim()
    ) {
      showError("Department name and code are required");
      return;
    }

    try {
      setLoading(true);

      const url = editingDepartmentId
        ? `${API_URL}/departments/${editingDepartmentId}`
        : `${API_URL}/departments`;

      const response = await fetch(url, {
        method: editingDepartmentId ? "PUT" : "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          ...departmentForm,
          name: departmentForm.name.trim(),
          code: departmentForm.code.trim().toUpperCase(),
          description: departmentForm.description.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to save department"
        );
      }

      showSuccess(
        editingDepartmentId
          ? "Department updated successfully"
          : "Department created successfully"
      );

      resetDepartmentForm();

      await Promise.all([
        fetchDepartments(),
        fetchDesignations(),
      ]);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDesignationSubmit = async (event) => {
    event.preventDefault();

    if (
      !designationForm.name.trim() ||
      !designationForm.code.trim() ||
      !designationForm.department
    ) {
      showError(
        "Designation name, code and department are required"
      );
      return;
    }

    try {
      setLoading(true);

      const url = editingDesignationId
        ? `${API_URL}/designations/${editingDesignationId}`
        : `${API_URL}/designations`;

      const response = await fetch(url, {
        method: editingDesignationId ? "PUT" : "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          ...designationForm,
          name: designationForm.name.trim(),
          code: designationForm.code.trim().toUpperCase(),
          description: designationForm.description.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to save designation"
        );
      }

      showSuccess(
        editingDesignationId
          ? "Designation updated successfully"
          : "Designation created successfully"
      );

      resetDesignationForm();
      await fetchDesignations();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const editDepartment = (department) => {
    setDepartmentForm({
      name: department.name || "",
      code: department.code || "",
      description: department.description || "",
      status: department.status || "Active",
    });

    setEditingDepartmentId(department._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const editDesignation = (designation) => {
    setDesignationForm({
      name: designation.name || "",
      code: designation.code || "",
      department:
        designation.department?._id ||
        designation.department ||
        "",
      description: designation.description || "",
      status: designation.status || "Active",
    });

    setEditingDesignationId(designation._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteDepartment = async (department) => {
    const confirmed = window.confirm(
      `Delete "${department.name}" department?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/departments/${department._id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete department"
        );
      }

      showSuccess("Department deleted successfully");

      await Promise.all([
        fetchDepartments(),
        fetchDesignations(),
      ]);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDesignation = async (designation) => {
    const confirmed = window.confirm(
      `Delete "${designation.name}" designation?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/designations/${designation._id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete designation"
        );
      }

      showSuccess("Designation deleted successfully");
      await fetchDesignations();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeDepartments = departments.filter(
    (item) => item.status === "Active"
  ).length;

  const activeDesignations = designations.filter(
    (item) => item.status === "Active"
  ).length;

  const filteredDepartments = useMemo(() => {
    const search = departmentSearch.toLowerCase().trim();

    return departments.filter((department) => {
      const matchesSearch =
        !search ||
        department.name?.toLowerCase().includes(search) ||
        department.code?.toLowerCase().includes(search) ||
        department.description?.toLowerCase().includes(search);

      const matchesStatus =
        departmentStatusFilter === "All" ||
        department.status === departmentStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    departments,
    departmentSearch,
    departmentStatusFilter,
  ]);

  const filteredDesignations = useMemo(() => {
    const search = designationSearch.toLowerCase().trim();

    return designations.filter((designation) => {
      const departmentName =
        designation.department?.name || "";

      const matchesSearch =
        !search ||
        designation.name?.toLowerCase().includes(search) ||
        designation.code?.toLowerCase().includes(search) ||
        departmentName.toLowerCase().includes(search) ||
        designation.description
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        designationStatusFilter === "All" ||
        designation.status === designationStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    designations,
    designationSearch,
    designationStatusFilter,
  ]);

  const activeDepartmentOptions = departments.filter(
    (department) =>
      department.status === "Active" ||
      department._id === designationForm.department
  );

  const getDesignationCount = (departmentId) =>
    designations.filter((designation) => {
      const id =
        designation.department?._id ||
        designation.department;

      return id === departmentId;
    }).length;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.titleRow}>
              <div style={styles.headerIcon}>
                <Layers3 size={24} />
              </div>

              <div>
                <h1 style={styles.title}>
                  Departments & Designations
                </h1>

                <p style={styles.subtitle}>
                  Manage your organization structure,
                  departments and job designations.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            style={styles.refreshButton}
          >
            <RefreshCw
              size={17}
              className={loading ? "spin-icon" : ""}
            />
            Refresh
          </button>
        </div>

        {message && (
          <div style={styles.successToast}>
            <CheckCircle2 size={19} />
            {message}
          </div>
        )}

        {error && (
          <div style={styles.errorToast}>
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        <div style={styles.statsGrid}>
          <StatCard
            icon={<Building2 size={22} />}
            label="Total Departments"
            value={departments.length}
            helper={`${activeDepartments} active`}
          />

          <StatCard
            icon={<CheckCircle2 size={22} />}
            label="Active Departments"
            value={activeDepartments}
            helper={`${departments.length - activeDepartments} inactive`}
          />

          <StatCard
            icon={<BriefcaseBusiness size={22} />}
            label="Total Designations"
            value={designations.length}
            helper={`${activeDesignations} active`}
          />

          <StatCard
            icon={<CheckCircle2 size={22} />}
            label="Active Designations"
            value={activeDesignations}
            helper={`${designations.length - activeDesignations} inactive`}
          />
        </div>

        <div style={styles.formsGrid}>
          <form
            onSubmit={handleDepartmentSubmit}
            style={styles.card}
          >
            <FormHeader
              icon={<Building2 size={20} />}
              title={
                editingDepartmentId
                  ? "Edit Department"
                  : "Add Department"
              }
              description="Create and manage company departments."
            />

            <FormField label="Department Name" required>
              <input
                type="text"
                name="name"
                value={departmentForm.name}
                onChange={handleDepartmentChange}
                placeholder="e.g. Engineering"
                style={styles.input}
              />
            </FormField>

            <FormField label="Department Code" required>
              <input
                type="text"
                name="code"
                value={departmentForm.code}
                onChange={handleDepartmentChange}
                placeholder="e.g. ENG"
                maxLength={15}
                style={styles.input}
              />
            </FormField>

            <FormField label="Description">
              <textarea
                name="description"
                value={departmentForm.description}
                onChange={handleDepartmentChange}
                placeholder="Enter department description"
                rows={4}
                style={{
                  ...styles.input,
                  resize: "vertical",
                  minHeight: "92px",
                }}
              />
            </FormField>

            <FormField label="Status">
              <select
                name="status"
                value={departmentForm.status}
                onChange={handleDepartmentChange}
                style={styles.input}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </FormField>

            <div style={styles.formActions}>
              <button
                type="submit"
                disabled={loading}
                style={styles.primaryButton}
              >
                <Plus size={17} />

                {editingDepartmentId
                  ? "Update Department"
                  : "Add Department"}
              </button>

              {editingDepartmentId && (
                <button
                  type="button"
                  onClick={resetDepartmentForm}
                  style={styles.cancelButton}
                >
                  <X size={17} />
                  Cancel
                </button>
              )}
            </div>
          </form>

          <form
            onSubmit={handleDesignationSubmit}
            style={styles.card}
          >
            <FormHeader
              icon={<BriefcaseBusiness size={20} />}
              title={
                editingDesignationId
                  ? "Edit Designation"
                  : "Add Designation"
              }
              description="Create job roles under your departments."
            />

            <FormField label="Designation Name" required>
              <input
                type="text"
                name="name"
                value={designationForm.name}
                onChange={handleDesignationChange}
                placeholder="e.g. Software Engineer"
                style={styles.input}
              />
            </FormField>

            <FormField label="Designation Code" required>
              <input
                type="text"
                name="code"
                value={designationForm.code}
                onChange={handleDesignationChange}
                placeholder="e.g. SE"
                maxLength={15}
                style={styles.input}
              />
            </FormField>

            <FormField label="Department" required>
              <select
                name="department"
                value={designationForm.department}
                onChange={handleDesignationChange}
                style={styles.input}
              >
                <option value="">
                  Select Department
                </option>

                {activeDepartmentOptions.map(
                  (department) => (
                    <option
                      key={department._id}
                      value={department._id}
                    >
                      {department.name} ({department.code})
                      {department.status === "Inactive"
                        ? " - Inactive"
                        : ""}
                    </option>
                  )
                )}
              </select>
            </FormField>

            <FormField label="Description">
              <textarea
                name="description"
                value={designationForm.description}
                onChange={handleDesignationChange}
                placeholder="Enter designation description"
                rows={4}
                style={{
                  ...styles.input,
                  resize: "vertical",
                  minHeight: "92px",
                }}
              />
            </FormField>

            <FormField label="Status">
              <select
                name="status"
                value={designationForm.status}
                onChange={handleDesignationChange}
                style={styles.input}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </FormField>

            <div style={styles.formActions}>
              <button
                type="submit"
                disabled={loading}
                style={styles.primaryButton}
              >
                <Plus size={17} />

                {editingDesignationId
                  ? "Update Designation"
                  : "Add Designation"}
              </button>

              {editingDesignationId && (
                <button
                  type="button"
                  onClick={resetDesignationForm}
                  style={styles.cancelButton}
                >
                  <X size={17} />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <DataSection
          icon={<Building2 size={20} />}
          title="Departments"
          count={filteredDepartments.length}
          search={departmentSearch}
          setSearch={setDepartmentSearch}
          filter={departmentStatusFilter}
          setFilter={setDepartmentStatusFilter}
          placeholder="Search departments..."
        >
          {filteredDepartments.length === 0 ? (
            <EmptyState
              icon={<Building2 size={32} />}
              title="No departments found"
              description={
                departments.length === 0
                  ? "Create your first department using the form above."
                  : "Try changing your search or status filter."
              }
            />
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <TableHead>Department</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Designations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead align="right">
                      Actions
                    </TableHead>
                  </tr>
                </thead>

                <tbody>
                  {filteredDepartments.map(
                    (department) => (
                      <tr
                        key={department._id}
                        style={styles.tableRow}
                      >
                        <TableCell>
                          <div style={styles.nameCell}>
                            <div style={styles.smallIcon}>
                              <Building2 size={16} />
                            </div>

                            <strong>
                              {department.name}
                            </strong>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span style={styles.codeBadge}>
                            {department.code}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span style={styles.descriptionText}>
                            {department.description || "—"}
                          </span>
                        </TableCell>

                        <TableCell>
                          {getDesignationCount(
                            department._id
                          )}
                        </TableCell>

                        <TableCell>
                          <StatusBadge
                            status={department.status}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <div style={styles.actionGroup}>
                            <button
                              type="button"
                              title="Edit department"
                              onClick={() =>
                                editDepartment(department)
                              }
                              style={styles.iconButton}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              title="Delete department"
                              onClick={() =>
                                deleteDepartment(department)
                              }
                              style={{
                                ...styles.iconButton,
                                ...styles.deleteIconButton,
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </DataSection>

        <DataSection
          icon={<BriefcaseBusiness size={20} />}
          title="Designations"
          count={filteredDesignations.length}
          search={designationSearch}
          setSearch={setDesignationSearch}
          filter={designationStatusFilter}
          setFilter={setDesignationStatusFilter}
          placeholder="Search designations..."
        >
          {filteredDesignations.length === 0 ? (
            <EmptyState
              icon={<BriefcaseBusiness size={32} />}
              title="No designations found"
              description={
                designations.length === 0
                  ? "Create a department first, then add your first designation."
                  : "Try changing your search or status filter."
              }
            />
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <TableHead>Designation</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead align="right">
                      Actions
                    </TableHead>
                  </tr>
                </thead>

                <tbody>
                  {filteredDesignations.map(
                    (designation) => (
                      <tr
                        key={designation._id}
                        style={styles.tableRow}
                      >
                        <TableCell>
                          <div style={styles.nameCell}>
                            <div style={styles.smallIcon}>
                              <BriefcaseBusiness size={16} />
                            </div>

                            <strong>
                              {designation.name}
                            </strong>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span style={styles.codeBadge}>
                            {designation.code}
                          </span>
                        </TableCell>

                        <TableCell>
                          {designation.department?.name ||
                            "—"}
                        </TableCell>

                        <TableCell>
                          <span style={styles.descriptionText}>
                            {designation.description || "—"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <StatusBadge
                            status={designation.status}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <div style={styles.actionGroup}>
                            <button
                              type="button"
                              title="Edit designation"
                              onClick={() =>
                                editDesignation(designation)
                              }
                              style={styles.iconButton}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              title="Delete designation"
                              onClick={() =>
                                deleteDesignation(
                                  designation
                                )
                              }
                              style={{
                                ...styles.iconButton,
                                ...styles.deleteIconButton,
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </DataSection>
      </div>

      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .spin-icon {
            animation: spin 0.8s linear infinite;
          }

          input:focus,
          textarea:focus,
          select:focus {
            outline: none;
            border-color: #2563eb !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
          }

          button {
            font-family: inherit;
          }

          button:disabled {
            opacity: 0.65;
            cursor: not-allowed !important;
          }

          tbody tr:hover {
            background: #f8fafc;
          }

          @media (max-width: 900px) {
            .hrms-toolbar {
              flex-direction: column;
              align-items: stretch !important;
            }
          }
        `}
      </style>
    </div>
  );
}

function StatCard({ icon, label, value, helper }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>

      <div>
        <div style={styles.statLabel}>{label}</div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statHelper}>{helper}</div>
      </div>
    </div>
  );
}

function FormHeader({ icon, title, description }) {
  return (
    <div style={styles.formHeader}>
      <div style={styles.formHeaderIcon}>{icon}</div>

      <div>
        <h2 style={styles.cardTitle}>{title}</h2>
        <p style={styles.cardSubtitle}>{description}</p>
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}
        {required && (
          <span style={styles.required}> *</span>
        )}
      </label>

      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "Active";

  return (
    <span
      style={{
        ...styles.statusBadge,
        ...(active
          ? styles.activeBadge
          : styles.inactiveBadge),
      }}
    >
      <span
        style={{
          ...styles.statusDot,
          background: active ? "#16a34a" : "#94a3b8",
        }}
      />
      {status}
    </span>
  );
}

function DataSection({
  icon,
  title,
  count,
  search,
  setSearch,
  filter,
  setFilter,
  placeholder,
  children,
}) {
  return (
    <section style={styles.dataCard}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitleRow}>
          <div style={styles.sectionIcon}>{icon}</div>

          <div>
            <h2 style={styles.sectionTitle}>
              {title}
            </h2>

            <p style={styles.sectionSubtitle}>
              {count} record{count === 1 ? "" : "s"} shown
            </p>
          </div>
        </div>

        <div
          className="hrms-toolbar"
          style={styles.toolbar}
        >
          <div style={styles.searchBox}>
            <Search size={17} style={styles.searchIcon} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={placeholder}
              style={styles.searchInput}
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
            style={styles.filterSelect}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {children}
    </section>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>{icon}</div>
      <h3 style={styles.emptyTitle}>{title}</h3>
      <p style={styles.emptyDescription}>
        {description}
      </p>
    </div>
  );
}

function TableHead({ children, align = "left" }) {
  return (
    <th
      style={{
        ...styles.tableHead,
        textAlign: align,
      }}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  align = "left",
}) {
  return (
    <td
      style={{
        ...styles.tableCell,
        textAlign: align,
      }}
    >
      {children}
    </td>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "28px",
    color: "#172033",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },

  titleRow: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
  },

  headerIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#e8efff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 750,
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  refreshButton: {
    height: "42px",
    padding: "0 16px",
    border: "1px solid #dbe3ef",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#334155",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 600,
  },

  successToast: {
    position: "fixed",
    top: "22px",
    right: "22px",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "13px 17px",
    background: "#ecfdf3",
    border: "1px solid #bbf7d0",
    color: "#166534",
    borderRadius: "11px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
    fontWeight: 600,
  },

  errorToast: {
    position: "fixed",
    top: "22px",
    right: "22px",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "13px 17px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    borderRadius: "11px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
    fontWeight: 600,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e6ebf2",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 2px 8px rgba(15,23,42,0.035)",
  },

  statIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#eef4ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  statLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 650,
  },

  statValue: {
    fontSize: "25px",
    lineHeight: 1.2,
    fontWeight: 750,
    marginTop: "3px",
  },

  statHelper: {
    color: "#94a3b8",
    fontSize: "11px",
    marginTop: "2px",
  },

  formsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "20px",
    marginBottom: "22px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e6ebf2",
    borderRadius: "15px",
    padding: "22px",
    boxShadow: "0 3px 12px rgba(15,23,42,0.04)",
  },

  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "22px",
    paddingBottom: "16px",
    borderBottom: "1px solid #eef2f7",
  },

  formHeaderIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#eef4ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    margin: 0,
    fontSize: "18px",
  },

  cardSubtitle: {
    margin: "4px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },

  field: {
    marginBottom: "16px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 650,
    color: "#334155",
    marginBottom: "7px",
  },

  required: {
    color: "#dc2626",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dbe3ef",
    borderRadius: "9px",
    padding: "11px 12px",
    fontSize: "14px",
    color: "#172033",
    background: "#ffffff",
    transition: "0.15s ease",
  },

  formActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "20px",
  },

  primaryButton: {
    minHeight: "41px",
    border: "none",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    padding: "0 16px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontWeight: 650,
  },

  cancelButton: {
    minHeight: "41px",
    border: "1px solid #dbe3ef",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#475569",
    padding: "0 16px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontWeight: 650,
  },

  dataCard: {
    background: "#ffffff",
    border: "1px solid #e6ebf2",
    borderRadius: "15px",
    marginBottom: "22px",
    overflow: "hidden",
    boxShadow: "0 3px 12px rgba(15,23,42,0.035)",
  },

  sectionHeader: {
    padding: "20px 22px",
    borderBottom: "1px solid #eef2f7",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  sectionTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  sectionIcon: {
    width: "39px",
    height: "39px",
    borderRadius: "10px",
    background: "#eef4ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "17px",
  },

  sectionSubtitle: {
    margin: "3px 0 0",
    color: "#94a3b8",
    fontSize: "11px",
  },

  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  searchBox: {
    position: "relative",
    minWidth: "230px",
  },

  searchIcon: {
    position: "absolute",
    left: "11px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    height: "39px",
    border: "1px solid #dbe3ef",
    borderRadius: "9px",
    padding: "0 12px 0 35px",
    fontSize: "13px",
  },

  filterSelect: {
    height: "39px",
    border: "1px solid #dbe3ef",
    borderRadius: "9px",
    background: "#ffffff",
    padding: "0 10px",
    color: "#475569",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "850px",
  },

  tableHead: {
    padding: "12px 18px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    borderBottom: "1px solid #e8edf4",
    whiteSpace: "nowrap",
  },

  tableRow: {
    borderBottom: "1px solid #eef2f7",
    transition: "background 0.15s ease",
  },

  tableCell: {
    padding: "14px 18px",
    fontSize: "13px",
    color: "#334155",
    verticalAlign: "middle",
  },

  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  smallIcon: {
    width: "31px",
    height: "31px",
    borderRadius: "8px",
    background: "#f1f5f9",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  codeBadge: {
    display: "inline-block",
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#475569",
  },

  descriptionText: {
    color: "#64748b",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 9px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
  },

  activeBadge: {
    background: "#ecfdf3",
    color: "#15803d",
  },

  inactiveBadge: {
    background: "#f1f5f9",
    color: "#64748b",
  },

  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
  },

  actionGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "7px",
  },

  iconButton: {
    width: "34px",
    height: "34px",
    border: "1px solid #dbe3ef",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#475569",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteIconButton: {
    color: "#dc2626",
    borderColor: "#fecaca",
    background: "#fffafa",
  },

  emptyState: {
    textAlign: "center",
    padding: "55px 20px",
  },

  emptyIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto 13px",
    borderRadius: "16px",
    background: "#f1f5f9",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "15px",
    color: "#334155",
  },

  emptyDescription: {
    margin: "6px auto 0",
    color: "#94a3b8",
    fontSize: "12px",
    maxWidth: "360px",
  },
};

export default DepartmentsDesignations;