import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobalSearch from "../components/GlobalSearch";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Clock3,
  Edit3,
  Eye,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Trash2,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/employees";

function Employees() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    dateOfBirth: "",
    profilePhoto: "",
    joiningDate: "",
    status: "Active",
  });

  const mapEmployee = (employee) => ({
    ...employee,
    id: employee.employeeId,
  });

  const syncLocalEmployees = (employeeList) => {
    localStorage.setItem(
      "hrmsEmployees",
      JSON.stringify(employeeList)
    );
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setApiError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load employees."
        );
      }

      const employeeList = (data.employees || []).map(mapEmployee);

      setEmployees(employeeList);

      // Temporary compatibility for Leave/Dashboard
      // until those modules are also moved to backend APIs.
      syncLocalEmployees(employeeList);
    } catch (error) {
      console.error("Employee fetch error:", error);

      setApiError(
        "Unable to load employees from backend. Make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateForInput = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    return new Date(dateValue).toISOString().split("T")[0];
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        employee.name.toLowerCase().includes(searchValue) ||
        employee.id.toLowerCase().includes(searchValue) ||
        employee.email.toLowerCase().includes(searchValue);

      const matchesDepartment =
        departmentFilter === "All" ||
        employee.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All" ||
        employee.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [
    employees,
    searchTerm,
    departmentFilter,
    statusFilter,
  ]);

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      designation: "",
      dateOfBirth: "",
      profilePhoto: "",
      joiningDate: "",
      status: "Active",
    });

    setFormError("");
  };

  const validateEmployeeForm = (mongoId = null) => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.department ||
      !formData.designation.trim() ||
      !formData.joiningDate
    ) {
      setFormError("Please fill all required fields.");
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setFormError(
        "Phone number must contain exactly 10 digits."
      );
      return false;
    }

    const emailExists = employees.some(
      (employee) =>
        employee.email.toLowerCase() ===
          formData.email.trim().toLowerCase() &&
        employee._id !== mongoId
    );

    if (emailExists) {
      setFormError(
        "An employee with this email already exists."
      );
      return false;
    }

    return true;
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (submitting) {
      return;
    }

    setShowAddModal(false);
    resetForm();
  };

  const openViewModal = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedEmployee(null);
  };

  const openEditModal = (employee) => {
    setEditingEmployeeId(employee._id);

    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || "",
      department: employee.department,
      designation: employee.designation,
      dateOfBirth: formatDateForInput(employee.dateOfBirth),
      profilePhoto: employee.profilePhoto || "",
      joiningDate: formatDateForInput(employee.joiningDate),
      status: employee.status,
    });

    setFormError("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (submitting) {
      return;
    }

    setShowEditModal(false);
    setEditingEmployeeId(null);
    resetForm();
  };

  const generateEmployeeId = () => {
    if (employees.length === 0) {
      return "EMP001";
    }

    const highestNumber = employees.reduce(
      (highest, employee) => {
        const number = Number(
          employee.id.replace("EMP", "")
        );

        return number > highest ? number : highest;
      },
      0
    );

    return `EMP${String(highestNumber + 1).padStart(
      3,
      "0"
    )}`;
  };

  const handleAddEmployee = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!validateEmployeeForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: generateEmployeeId(),
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          department: formData.department,
          designation: formData.designation.trim(),
          dateOfBirth: formData.dateOfBirth || null,
          profilePhoto: formData.profilePhoto.trim(),
          joiningDate: formData.joiningDate,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to create employee."
        );
      }

      const newEmployee = mapEmployee(data.employee);

      const updatedEmployees = [
        newEmployee,
        ...employees,
      ];

      setEmployees(updatedEmployees);
      syncLocalEmployees(updatedEmployees);

      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Add employee error:", error);

      setFormError(
        error.message || "Failed to create employee."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!validateEmployeeForm(editingEmployeeId)) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/${editingEmployeeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            department: formData.department,
            designation: formData.designation.trim(),
            dateOfBirth: formData.dateOfBirth || null,
            profilePhoto: formData.profilePhoto.trim(),
            joiningDate: formData.joiningDate,
            status: formData.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to update employee."
        );
      }

      const updatedEmployee = mapEmployee(data.employee);

      const updatedEmployees = employees.map(
        (employee) =>
          employee._id === editingEmployeeId
            ? updatedEmployee
            : employee
      );

      setEmployees(updatedEmployees);
      syncLocalEmployees(updatedEmployees);

      setShowEditModal(false);
      setEditingEmployeeId(null);
      resetForm();
    } catch (error) {
      console.error("Update employee error:", error);

      setFormError(
        error.message || "Failed to update employee."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (mongoId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setApiError("");

      const response = await fetch(`${API_URL}/${mongoId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete employee."
        );
      }

      const updatedEmployees = employees.filter(
        (employee) => employee._id !== mongoId
      );

      setEmployees(updatedEmployees);
      syncLocalEmployees(updatedEmployees);
    } catch (error) {
      console.error("Delete employee error:", error);

      setApiError(
        error.message || "Failed to delete employee."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hrmsUser");
    sessionStorage.removeItem("hrmsUser");

    navigate("/login");
  };

  const renderEmployeeFormFields = () => (
    <div className="employee-form-grid">
      <div className="employee-form-group">
        <label htmlFor="name">Full Name *</label>

        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter employee name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>

      <div className="employee-form-group">
        <label htmlFor="email">Email Address *</label>

        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter email address"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>

      <div className="employee-form-group">
        <label htmlFor="phone">Phone Number *</label>

        <input
          id="phone"
          name="phone"
          type="text"
          maxLength="10"
          placeholder="Enter 10 digit number"
          value={formData.phone}
          onChange={handleInputChange}
        />
      </div>

      <div className="employee-form-group">
        <label htmlFor="department">Department *</label>

        <select
          id="department"
          name="department"
          value={formData.department}
          onChange={handleInputChange}
        >
          <option value="">Select Department</option>
          <option value="Engineering">Engineering</option>
          <option value="Human Resources">
            Human Resources
          </option>
          <option value="Finance">Finance</option>
          <option value="Marketing">Marketing</option>
          <option value="Operations">Operations</option>
        </select>
      </div>

      <div className="employee-form-group">
        <label htmlFor="designation">
          Designation *
        </label>

        <input
          id="designation"
          name="designation"
          type="text"
          placeholder="Enter designation"
          value={formData.designation}
          onChange={handleInputChange}
        />
      </div>

      <div className="employee-form-group">
        <label htmlFor="profilePhoto">
          Profile Photo URL
        </label>

        <input
          id="profilePhoto"
          name="profilePhoto"
          type="url"
          placeholder="https://example.com/photo.jpg"
          value={formData.profilePhoto}
          onChange={handleInputChange}
        />
      </div>

      <div className="employee-form-group">
        <label htmlFor="dateOfBirth">
          Date of Birth
        </label>

        <input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
        />
      </div>

      <div className="employee-form-group">
        <label htmlFor="joiningDate">
          Joining Date *
        </label>

        <input
          id="joiningDate"
          name="joiningDate"
          type="date"
          value={formData.joiningDate}
          onChange={handleInputChange}
        />
      </div>

      <div className="employee-form-group">
        <label htmlFor="status">Status</label>

        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">HR</div>

          <div>
            <h2>HRMS</h2>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className="nav-item"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className="nav-item active"
            onClick={() => navigate("/employees")}
          >
            <Users size={19} />
            <span>Employees</span>
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/attendance")}
          >
            <Clock3 size={19} />
            <span>Attendance</span>
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/leave")}
          >
            <CalendarDays size={19} />
            <span>Leave</span>
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/payroll")}
          >
            <WalletCards size={19} />
            <span>Payroll</span>
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/settings")}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-item logout-item"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button className="menu-button">
              <Menu size={22} />
            </button>

            <div>
              <h1>Employees</h1>
              <p>
                Manage employee records and information
              </p>
            </div>
          </div>

          <div className="header-actions">
            <GlobalSearch />

            <button className="icon-button">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>

            <button className="profile-button">
              <div className="profile-avatar">HA</div>

              <div className="profile-info">
                <strong>HRMS Admin</strong>
                <span>Administrator</span>
              </div>

              <ChevronDown size={17} />
            </button>
          </div>
        </header>

        <section className="employees-page">
          <div className="employees-page-header">
            <div>
              <h1>Employee Management</h1>
              <p>
                Add, view, edit, search and manage employee
                records.
              </p>
            </div>

            <button
              className="add-employee-button"
              onClick={openAddModal}
            >
              <Plus size={18} />
              Add Employee
            </button>
          </div>

          {apiError && (
            <div className="employee-form-error">
              {apiError}
            </div>
          )}

          <div className="employees-summary-grid">
            <div className="employee-summary-card">
              <div className="employee-summary-icon">
                <UserRound size={21} />
              </div>

              <div>
                <span>Total Employees</span>
                <strong>{employees.length}</strong>
              </div>
            </div>

            <div className="employee-summary-card">
              <div className="employee-summary-icon">
                <UserRound size={21} />
              </div>

              <div>
                <span>Active Employees</span>
                <strong>{activeEmployees}</strong>
              </div>
            </div>

            <div className="employee-summary-card">
              <div className="employee-summary-icon">
                <UserRound size={21} />
              </div>

              <div>
                <span>Inactive Employees</span>
                <strong>
                  {employees.length - activeEmployees}
                </strong>
              </div>
            </div>
          </div>

          <div className="employees-panel">
            <div className="employees-filters">
              <div className="employees-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search by name, employee ID or email..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />
              </div>

              <select
                value={departmentFilter}
                onChange={(event) =>
                  setDepartmentFilter(event.target.value)
                }
              >
                <option value="All">
                  All Departments
                </option>
                <option value="Engineering">
                  Engineering
                </option>
                <option value="Human Resources">
                  Human Resources
                </option>
                <option value="Finance">Finance</option>
                <option value="Marketing">
                  Marketing
                </option>
                <option value="Operations">
                  Operations
                </option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div className="employees-table-wrap">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Joining Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7">
                        <div className="employees-empty-state">
                          Loading employees...
                        </div>
                      </td>
                    </tr>
                  ) : filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <tr key={employee._id}>
                        <td>
                          <div className="employees-person-cell">
                            <div className="employees-avatar">
                              {employee.profilePhoto ? (
                                <img
                                  src={employee.profilePhoto}
                                  alt={employee.name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                  }}
                                />
                              ) : (
                                employee.name
                                  .split(" ")
                                  .map((name) => name[0])
                                  .join("")
                                  .slice(0, 2)
                              )}
                            </div>

                            <div>
                              <strong>
                                {employee.name}
                              </strong>
                              <span>
                                {employee.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>{employee.id}</td>

                        <td>
                          {employee.department}
                        </td>

                        <td>
                          {employee.designation}
                        </td>

                        <td>
                          {formatDate(
                            employee.joiningDate
                          )}
                        </td>

                        <td>
                          <span
                            className={`employee-status-badge ${
                              employee.status ===
                              "Active"
                                ? "employee-status-active"
                                : "employee-status-inactive"
                            }`}
                          >
                            {employee.status}
                          </span>
                        </td>

                        <td>
                          <div className="employee-actions">
                            <button
                              type="button"
                              title="View Employee"
                              onClick={() =>
                                openViewModal(employee)
                              }
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              type="button"
                              title="Edit Employee"
                              onClick={() =>
                                openEditModal(employee)
                              }
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              className="employee-delete-button"
                              title="Delete Employee"
                              onClick={() =>
                                handleDeleteEmployee(
                                  employee._id
                                )
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">
                        <div className="employees-empty-state">
                          No employees found.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="employees-table-footer">
              <span>
                Showing {filteredEmployees.length} of{" "}
                {employees.length} employees
              </span>

              <div className="employees-pagination">
                <button disabled>Previous</button>
                <button className="employees-page-number">
                  1
                </button>
                <button disabled>Next</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showAddModal && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <div className="employee-modal-header">
              <div>
                <h2>Add Employee</h2>
                <p>
                  Enter employee information below.
                </p>
              </div>

              <button
                type="button"
                className="employee-modal-close"
                onClick={closeAddModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="employee-form"
              onSubmit={handleAddEmployee}
            >
              {formError && (
                <div className="employee-form-error">
                  {formError}
                </div>
              )}

              {renderEmployeeFormFields()}

              <div className="employee-modal-actions">
                <button
                  type="button"
                  className="employee-cancel-button"
                  onClick={closeAddModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-save-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Adding..."
                    : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedEmployee && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <div className="employee-modal-header">
              <div>
                <h2>Employee Details</h2>
                <p>
                  Complete employee profile
                  information.
                </p>
              </div>

              <button
                type="button"
                className="employee-modal-close"
                onClick={closeViewModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className="employee-form">
              <div className="employee-view-profile">
                <div className="employees-avatar">
                  {selectedEmployee.profilePhoto ? (
                    <img
                      src={selectedEmployee.profilePhoto}
                      alt={selectedEmployee.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    selectedEmployee.name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .slice(0, 2)
                  )}
                </div>

                <div>
                  <h2>{selectedEmployee.name}</h2>
                  <p>
                    {selectedEmployee.designation}
                  </p>
                </div>
              </div>

              <div className="employee-form-grid">
                <div className="employee-form-group">
                  <label>Employee ID</label>
                  <input
                    value={selectedEmployee.id}
                    readOnly
                  />
                </div>

                <div className="employee-form-group">
                  <label>Full Name</label>
                  <input
                    value={selectedEmployee.name}
                    readOnly
                  />
                </div>

                <div className="employee-form-group">
                  <label>Email Address</label>
                  <input
                    value={selectedEmployee.email}
                    readOnly
                  />
                </div>

                <div className="employee-form-group">
                  <label>Phone Number</label>
                  <input
                    value={
                      selectedEmployee.phone || ""
                    }
                    readOnly
                  />
                </div>

                <div className="employee-form-group">
                  <label>Department</label>
                  <input
                    value={
                      selectedEmployee.department
                    }
                    readOnly
                  />
                </div>

                <div className="employee-form-group">
                  <label>Designation</label>
                  <input
                    value={
                      selectedEmployee.designation
                    }
                    readOnly
                  />
                </div>

                <div className="employee-form-group">
                  <label>Profile Photo URL</label>
                  <input
                    value={selectedEmployee.profilePhoto || ""}
                    readOnly
                  />
                </div>

                <div className="employee-form-group">
                  <label>Date of Birth</label>
                  <input
                    value={formatDate(
                      selectedEmployee.dateOfBirth
                    )}
                    readOnly
                  />
                </div>

                <div className="employee-form-group">
                  <label>Joining Date</label>
                  <input
                    value={formatDate(
                      selectedEmployee.joiningDate
                    )}
                    readOnly
                  />
                </div>

                <div className="employee-form-group">
                  <label>Status</label>
                  <input
                    value={selectedEmployee.status}
                    readOnly
                  />
                </div>
              </div>

              <div className="employee-modal-actions">
                <button
                  type="button"
                  className="employee-save-button"
                  onClick={closeViewModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <div className="employee-modal-header">
              <div>
                <h2>Edit Employee</h2>
                <p>
                  Update employee information.
                </p>
              </div>

              <button
                type="button"
                className="employee-modal-close"
                onClick={closeEditModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="employee-form"
              onSubmit={handleUpdateEmployee}
            >
              {formError && (
                <div className="employee-form-error">
                  {formError}
                </div>
              )}

              {renderEmployeeFormFields()}

              <div className="employee-modal-actions">
                <button
                  type="button"
                  className="employee-cancel-button"
                  onClick={closeEditModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-save-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Updating..."
                    : "Update Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;