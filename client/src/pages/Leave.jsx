import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobalSearch from "../components/GlobalSearch";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Users,
  WalletCards,
  X,
} from "lucide-react";

function Leave() {
  const navigate = useNavigate();

  const initialLeaveRequests = [
    {
      id: "LV001",
      employee: "Rahul Singh",
      type: "Casual Leave",
      fromDate: "2026-08-29",
      toDate: "2026-08-30",
      reason: "Personal work",
      status: "Pending",
    },
    {
      id: "LV002",
      employee: "Sneha Kapoor",
      type: "Sick Leave",
      fromDate: "2026-08-28",
      toDate: "2026-08-28",
      reason: "Not feeling well",
      status: "Approved",
    },
    {
      id: "LV003",
      employee: "Vikram Joshi",
      type: "Earned Leave",
      fromDate: "2026-09-02",
      toDate: "2026-09-04",
      reason: "Family function",
      status: "Rejected",
    },
  ];

  const [leaveRequests, setLeaveRequests] = useState(() => {
    const saved = localStorage.getItem("hrmsLeaves");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialLeaveRequests;
      }
    }

    return initialLeaveRequests;
  });

  // Employees module se employees load honge
  const [employees] = useState(() => {
    const savedEmployees = localStorage.getItem("hrmsEmployees");

    if (savedEmployees) {
      try {
        return JSON.parse(savedEmployees);
      } catch {
        return [];
      }
    }

    return [];
  });

  const activeEmployees = useMemo(() => {
    return employees.filter(
      (employee) => employee.status === "Active"
    );
  }, [employees]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    employee: "",
    type: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const saveLeaveRequests = (updatedRequests) => {
    setLeaveRequests(updatedRequests);
    localStorage.setItem(
      "hrmsLeaves",
      JSON.stringify(updatedRequests)
    );
  };

  const filteredRequests = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    return leaveRequests.filter((request) => {
      const matchesSearch =
        request.employee.toLowerCase().includes(searchValue) ||
        request.type.toLowerCase().includes(searchValue) ||
        request.id.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leaveRequests, searchTerm, statusFilter]);

  const pendingCount = leaveRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCount = leaveRequests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedCount = leaveRequests.filter(
    (request) => request.status === "Rejected"
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
      employee: "",
      type: "",
      fromDate: "",
      toDate: "",
      reason: "",
    });

    setFormError("");
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const generateLeaveId = () => {
    if (leaveRequests.length === 0) {
      return "LV001";
    }

    const highestNumber = leaveRequests.reduce(
      (highest, request) => {
        const number = Number(
          request.id.replace("LV", "")
        );

        return number > highest ? number : highest;
      },
      0
    );

    return `LV${String(highestNumber + 1).padStart(
      3,
      "0"
    )}`;
  };

  const handleSubmitLeave = (event) => {
    event.preventDefault();

    setFormError("");

    if (
      !formData.employee ||
      !formData.type ||
      !formData.fromDate ||
      !formData.toDate ||
      !formData.reason.trim()
    ) {
      setFormError("Please fill all required fields.");
      return;
    }

    if (
      new Date(formData.toDate) <
      new Date(formData.fromDate)
    ) {
      setFormError(
        "To Date cannot be before From Date."
      );
      return;
    }

    const selectedEmployee = employees.find(
      (employee) => employee.id === formData.employee
    );

    if (!selectedEmployee) {
      setFormError("Please select a valid employee.");
      return;
    }

    const newLeaveRequest = {
      id: generateLeaveId(),
      employeeId: selectedEmployee.id,
      employee: selectedEmployee.name,
      type: formData.type,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      reason: formData.reason.trim(),
      status: "Pending",
    };

    const updatedRequests = [
      newLeaveRequest,
      ...leaveRequests,
    ];

    saveLeaveRequests(updatedRequests);
    closeModal();
  };

  const updateLeaveStatus = (leaveId, status) => {
    const updatedRequests = leaveRequests.map(
      (request) => {
        if (request.id !== leaveId) {
          return request;
        }

        return {
          ...request,
          status,
        };
      }
    );

    saveLeaveRequests(updatedRequests);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    return new Date(dateValue).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (status) => {
    if (status === "Approved") {
      return "leave-status-approved";
    }

    if (status === "Rejected") {
      return "leave-status-rejected";
    }

    return "leave-status-pending";
  };

  const handleLogout = () => {
    localStorage.removeItem("hrmsUser");
    sessionStorage.removeItem("hrmsUser");

    navigate("/login");
  };

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
            className="nav-item"
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
            className="nav-item active"
            onClick={() => navigate("/leave")}
          >
            <CalendarDays size={19} />
            <span>Leave</span>
          </button>

          <button className="nav-item" onClick={() => navigate("/payroll")}><WalletCards size={19} /><span>Payroll</span></button>

          <button className="nav-item">
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
              <h1>Leave</h1>
              <p>
                Manage employee leave requests and
                approvals.
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

        <section className="leave-page">
          <div className="leave-page-header">
            <div>
              <h1>Leave Management</h1>
              <p>
                Create, approve, reject and track
                employee leave requests.
              </p>
            </div>

            <button
              className="add-employee-button"
              onClick={openModal}
            >
              <Plus size={18} />
              Apply Leave
            </button>
          </div>

          <div className="leave-summary-grid">
            <div className="leave-summary-card">
              <span>Total Requests</span>
              <strong>{leaveRequests.length}</strong>
            </div>

            <div className="leave-summary-card">
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>

            <div className="leave-summary-card">
              <span>Approved</span>
              <strong>{approvedCount}</strong>
            </div>

            <div className="leave-summary-card">
              <span>Rejected</span>
              <strong>{rejectedCount}</strong>
            </div>
          </div>

          <div className="leave-management-panel">
            <div className="leave-management-filters">
              <div className="attendance-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search employee, leave ID or type..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">
                  All Status
                </option>
                <option value="Pending">
                  Pending
                </option>
                <option value="Approved">
                  Approved
                </option>
                <option value="Rejected">
                  Rejected
                </option>
              </select>
            </div>

            <div className="attendance-table-wrap">
              <table className="leave-management-table">
                <thead>
                  <tr>
                    <th>Leave ID</th>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>{request.employee}</td>
                        <td>{request.type}</td>
                        <td>
                          {formatDate(request.fromDate)}
                        </td>
                        <td>
                          {formatDate(request.toDate)}
                        </td>
                        <td>{request.reason}</td>

                        <td>
                          <span
                            className={`leave-management-status ${getStatusClass(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </td>

                        <td>
                          {request.status ===
                          "Pending" ? (
                            <div className="leave-management-actions">
                              <button
                                className="approve-button"
                                onClick={() =>
                                  updateLeaveStatus(
                                    request.id,
                                    "Approved"
                                  )
                                }
                              >
                                Approve
                              </button>

                              <button
                                className="reject-button"
                                onClick={() =>
                                  updateLeaveStatus(
                                    request.id,
                                    "Rejected"
                                  )
                                }
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="leave-action-completed">
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">
                        <div className="employees-empty-state">
                          No leave requests found.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {showModal && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <div className="employee-modal-header">
              <div>
                <h2>Apply Leave</h2>
                <p>
                  Select employee and enter leave
                  information.
                </p>
              </div>

              <button
                type="button"
                className="employee-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="employee-form"
              onSubmit={handleSubmitLeave}
            >
              {formError && (
                <div className="employee-form-error">
                  {formError}
                </div>
              )}

              <div className="employee-form-grid">
                <div className="employee-form-group">
                  <label htmlFor="employee">
                    Employee *
                  </label>

                  <select
                    id="employee"
                    name="employee"
                    value={formData.employee}
                    onChange={handleInputChange}
                  >
                    <option value="">
                      Select Employee
                    </option>

                    {activeEmployees.map((employee) => (
                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.id} - {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="employee-form-group">
                  <label htmlFor="type">
                    Leave Type *
                  </label>

                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="">
                      Select Leave Type
                    </option>
                    <option value="Casual Leave">
                      Casual Leave
                    </option>
                    <option value="Sick Leave">
                      Sick Leave
                    </option>
                    <option value="Earned Leave">
                      Earned Leave
                    </option>
                    <option value="Unpaid Leave">
                      Unpaid Leave
                    </option>
                  </select>
                </div>

                <div className="employee-form-group">
                  <label htmlFor="fromDate">
                    From Date *
                  </label>

                  <input
                    id="fromDate"
                    name="fromDate"
                    type="date"
                    value={formData.fromDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="employee-form-group">
                  <label htmlFor="toDate">
                    To Date *
                  </label>

                  <input
                    id="toDate"
                    name="toDate"
                    type="date"
                    value={formData.toDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="employee-form-group leave-reason-group">
                  <label htmlFor="reason">
                    Reason *
                  </label>

                  <textarea
                    id="reason"
                    name="reason"
                    rows="4"
                    placeholder="Enter leave reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="employee-modal-actions">
                <button
                  type="button"
                  className="employee-cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-save-button"
                >
                  Submit Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leave;

