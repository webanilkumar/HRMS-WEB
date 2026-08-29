import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import GlobalSearch from "../components/GlobalSearch";

function Payroll() {
  const navigate = useNavigate();

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

  const [payrollRecords, setPayrollRecords] = useState(() => {
    const savedPayroll = localStorage.getItem("hrmsPayroll");

    if (savedPayroll) {
      try {
        return JSON.parse(savedPayroll);
      } catch {
        return [];
      }
    }

    return [];
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    month: "",
    basicSalary: "",
    allowances: "",
    deductions: "",
    status: "Pending",
  });

  const activeEmployees = useMemo(() => {
    return employees.filter(
      (employee) => employee.status === "Active"
    );
  }, [employees]);

  const savePayrollRecords = (records) => {
    setPayrollRecords(records);

    localStorage.setItem(
      "hrmsPayroll",
      JSON.stringify(records)
    );
  };

  const generatePayrollId = () => {
    const nextNumber = payrollRecords.length + 1;

    return `PAY${String(nextNumber).padStart(3, "0")}`;
  };

  const calculateNetSalary = (
    basicSalary,
    allowances,
    deductions
  ) => {
    const basic = Number(basicSalary) || 0;
    const allowanceAmount = Number(allowances) || 0;
    const deductionAmount = Number(deductions) || 0;

    return basic + allowanceAmount - deductionAmount;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      month: "",
      basicSalary: "",
      allowances: "",
      deductions: "",
      status: "Pending",
    });

    setFormError("");
  };

  const handleGeneratePayroll = (event) => {
    event.preventDefault();

    if (
      !formData.employeeId ||
      !formData.month ||
      !formData.basicSalary
    ) {
      setFormError(
        "Employee, month and basic salary are required."
      );

      return;
    }

    const selectedEmployee = employees.find(
      (employee) => employee.id === formData.employeeId
    );

    if (!selectedEmployee) {
      setFormError("Selected employee not found.");
      return;
    }

    const alreadyExists = payrollRecords.some(
      (record) =>
        record.employeeId === formData.employeeId &&
        record.month === formData.month
    );

    if (alreadyExists) {
      setFormError(
        "Payroll for this employee and month already exists."
      );

      return;
    }

    const netSalary = calculateNetSalary(
      formData.basicSalary,
      formData.allowances,
      formData.deductions
    );

    if (netSalary < 0) {
      setFormError(
        "Net salary cannot be less than zero."
      );

      return;
    }

    const newPayroll = {
      id: generatePayrollId(),
      employeeId: selectedEmployee.id,
      employee: selectedEmployee.name,
      department: selectedEmployee.department,
      designation: selectedEmployee.designation,
      month: formData.month,
      basicSalary: Number(formData.basicSalary),
      allowances: Number(formData.allowances) || 0,
      deductions: Number(formData.deductions) || 0,
      netSalary,
      status: formData.status,
    };

    const updatedRecords = [
      newPayroll,
      ...payrollRecords,
    ];

    savePayrollRecords(updatedRecords);

    resetForm();
    setShowModal(false);
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedRecords = payrollRecords.map(
      (record) =>
        record.id === id
          ? {
              ...record,
              status: newStatus,
            }
          : record
    );

    savePayrollRecords(updatedRecords);
  };

  const filteredPayrollRecords = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();

    return payrollRecords.filter((record) => {
      const matchesSearch =
        !value ||
        record.employee
          ?.toLowerCase()
          .includes(value) ||
        record.employeeId
          ?.toLowerCase()
          .includes(value) ||
        record.id
          ?.toLowerCase()
          .includes(value) ||
        record.department
          ?.toLowerCase()
          .includes(value);

      const matchesMonth =
        monthFilter === "All" ||
        record.month === monthFilter;

      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      return (
        matchesSearch &&
        matchesMonth &&
        matchesStatus
      );
    });
  }, [
    payrollRecords,
    searchTerm,
    monthFilter,
    statusFilter,
  ]);

  const months = useMemo(() => {
    return [
      ...new Set(
        payrollRecords.map((record) => record.month)
      ),
    ];
  }, [payrollRecords]);

  const totalNetSalary = useMemo(() => {
    return payrollRecords.reduce(
      (total, record) =>
        total + Number(record.netSalary || 0),
      0
    );
  }, [payrollRecords]);

  const paidCount = useMemo(() => {
    return payrollRecords.filter(
      (record) => record.status === "Paid"
    ).length;
  }, [payrollRecords]);

  const pendingCount = useMemo(() => {
    return payrollRecords.filter(
      (record) => record.status === "Pending"
    ).length;
  }, [payrollRecords]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthValue) => {
    if (!monthValue) {
      return "-";
    }

    const [year, month] = monthValue.split("-");

    const date = new Date(
      Number(year),
      Number(month) - 1,
      1
    );

    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
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
            className="nav-item"
            onClick={() => navigate("/leave")}
          >
            <CalendarDays size={19} />
            <span>Leave</span>
          </button>

          <button
            className="nav-item active"
            onClick={() => navigate("/payroll")}
          >
            <WalletCards size={19} />
            <span>Payroll</span>
          </button>

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
              <h1>Payroll</h1>
              <p>
                Manage employee salaries and payments
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

        <section className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon">
                  <WalletCards size={22} />
                </div>

                <span className="stat-label">
                  Payroll Records
                </span>
              </div>

              <h3>{payrollRecords.length}</h3>
              <p>Total generated payroll</p>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon">
                  <WalletCards size={22} />
                </div>

                <span className="stat-label">
                  Total Salary
                </span>
              </div>

              <h3>
                {formatCurrency(totalNetSalary)}
              </h3>

              <p>Total net salary amount</p>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon">
                  <WalletCards size={22} />
                </div>

                <span className="stat-label">
                  Paid
                </span>
              </div>

              <h3>{paidCount}</h3>
              <p>Completed payments</p>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon">
                  <Clock3 size={22} />
                </div>

                <span className="stat-label">
                  Pending
                </span>
              </div>

              <h3>{pendingCount}</h3>
              <p>Pending salary payments</p>
            </div>
          </div>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>Payroll Management</h3>
                <p>
                  Generate and manage employee payroll
                </p>
              </div>

              <button
                className="punch-button payroll-generate-button" onClick={() => { resetForm(); setShowModal(true); }}
              >
                Generate Payroll
              </button>
            </div>

            <div className="payroll-toolbar">
              <div className="payroll-search-box"><Search size={18} />

                <input
                  type="text"
                  placeholder="Search employee or payroll ID..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />
              </div>

              <select
                value={monthFilter}
                onChange={(event) =>
                  setMonthFilter(event.target.value)
                }
              >
                <option value="All">
                  All Months
                </option>

                {months.map((month) => (
                  <option
                    key={month}
                    value={month}
                  >
                    {formatMonth(month)}
                  </option>
                ))}
              </select>

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

                <option value="Paid">
                  Paid
                </option>
              </select>
            </div>

            <div className="employee-table-wrap">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Payroll ID</th>
                    <th>Employee</th>
                    <th>Month</th>
                    <th>Basic</th>
                    <th>Allowance</th>
                    <th>Deduction</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayrollRecords.length > 0 ? (
                    filteredPayrollRecords.map(
                      (record) => (
                        <tr key={record.id}>
                          <td>{record.id}</td>

                          <td>
                            <div className="employee-cell">
                              <div className="employee-avatar">
                                {record.employee
                                  .split(" ")
                                  .map(
                                    (name) =>
                                      name[0]
                                  )
                                  .join("")
                                  .slice(0, 2)}
                              </div>

                              <div>
                                <strong>
                                  {record.employee}
                                </strong>

                                <div className="table-small-text">
                                  {
                                    record.employeeId
                                  }
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            {formatMonth(
                              record.month
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              record.basicSalary
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              record.allowances
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              record.deductions
                            )}
                          </td>

                          <td>
                            <strong>
                              {formatCurrency(
                                record.netSalary
                              )}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${
                                record.status ===
                                "Paid"
                                  ? "status-present"
                                  : "status-leave"
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>

                          <td>
                            <select
                              value={record.status}
                              onChange={(event) =>
                                handleStatusChange(
                                  record.id,
                                  event.target.value
                                )
                              }
                            >
                              <option value="Pending">
                                Pending
                              </option>

                              <option value="Paid">
                                Paid
                              </option>
                            </select>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="empty-table-message"
                      >
                        No payroll records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>

      {showModal && (
        <div className="payroll-modal-overlay">
          <div className="payroll-modal">
            <div className="payroll-modal-header">
              <div>
                <h3>Generate Payroll</h3>
                <p>
                  Add salary details for an employee
                </p>
              </div>

              <button
                className="payroll-modal-close"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="employee-form"
              onSubmit={handleGeneratePayroll}
            >
              <div className="employee-form-group">
                <label htmlFor="employeeId">
                  Employee
                </label>

                <select
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                >
                  <option value="">
                    Select Employee
                  </option>

                  {activeEmployees.map(
                    (employee) => (
                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.id} -{" "}
                        {employee.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="employee-form-group">
                <label htmlFor="month">
                  Payroll Month
                </label>

                <input
                  id="month"
                  type="month"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                />
              </div>

              <div className="employee-form-grid">
                <div className="employee-form-group">
                  <label htmlFor="basicSalary">
                    Basic Salary
                  </label>

                  <input
                    id="basicSalary"
                    type="number"
                    min="0"
                    name="basicSalary"
                    placeholder="50000"
                    value={formData.basicSalary}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="employee-form-group">
                  <label htmlFor="allowances">
                    Allowances
                  </label>

                  <input
                    id="allowances"
                    type="number"
                    min="0"
                    name="allowances"
                    placeholder="5000"
                    value={formData.allowances}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="employee-form-group">
                  <label htmlFor="deductions">
                    Deductions
                  </label>

                  <input
                    id="deductions"
                    type="number"
                    min="0"
                    name="deductions"
                    placeholder="2000"
                    value={formData.deductions}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="employee-form-group">
                  <label htmlFor="status">
                    Payment Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Paid">
                      Paid
                    </option>
                  </select>
                </div>
              </div>

              <div className="payroll-preview">
                <span>Net Salary</span>

                <strong>
                  {formatCurrency(
                    calculateNetSalary(
                      formData.basicSalary,
                      formData.allowances,
                      formData.deductions
                    )
                  )}
                </strong>
              </div>

              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}

              <div className="payroll-modal-actions">
                <button
                  type="button"
                  className="payroll-cancel-button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="payroll-submit-button">Generate Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payroll;


