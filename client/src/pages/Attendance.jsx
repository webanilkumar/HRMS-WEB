import { useEffect, useMemo, useState } from "react";
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
  Search,
  Settings,
  Users,
  WalletCards,
} from "lucide-react";

const ATTENDANCE_API_URL = "http://localhost:5000/api/attendance";
const EMPLOYEE_API_URL = "http://localhost:5000/api/employees";

function Attendance() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const formatTime = (dateValue) => {
    if (!dateValue) {
      return "--:--";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "--:--";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatWorkingHours = (minutes = 0) => {
    const safeMinutes = Number(minutes) || 0;

    const hours = Math.floor(safeMinutes / 60);
    const remainingMinutes = safeMinutes % 60;

    return `${String(hours).padStart(2, "0")}h ${String(
      remainingMinutes
    ).padStart(2, "0")}m`;
  };

  useEffect(() => {
    const loadAttendanceData = async () => {
      try {
        setLoading(true);
        setApiError("");

        const [attendanceResponse, employeeResponse] = await Promise.all([
          fetch(ATTENDANCE_API_URL),
          fetch(EMPLOYEE_API_URL),
        ]);

        const attendanceData = await attendanceResponse.json();
        const employeeData = await employeeResponse.json();

        if (!attendanceResponse.ok || !attendanceData.success) {
          throw new Error(
            attendanceData.message || "Failed to load attendance records"
          );
        }

        if (!employeeResponse.ok || !employeeData.success) {
          throw new Error(
            employeeData.message || "Failed to load employees"
          );
        }

        setAttendanceRecords(attendanceData.attendances || []);
        setEmployees(employeeData.employees || []);
      } catch (error) {
        console.error(error);

        setApiError(
          error.message ||
            "Unable to load attendance data from backend."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAttendanceData();
  }, []);

  const employeeMap = useMemo(() => {
    const map = {};

    employees.forEach((employee) => {
      map[employee.employeeId] = employee;
    });

    return map;
  }, [employees]);

  const selectedDateRecords = useMemo(() => {
    return attendanceRecords
      .filter((record) => record.attendanceDate === selectedDate)
      .map((record) => {
        const employeeDetails = employeeMap[record.employeeId];

        return {
          _id: record._id,
          id: record.employeeId,
          name: record.employee,
          department:
            employeeDetails?.department || "Not Assigned",
          punchIn: formatTime(record.punchIn),
          punchOut: formatTime(record.punchOut),
          workingHours: formatWorkingHours(
            record.totalWorkingMinutes
          ),
          status: record.status,
        };
      });
  }, [attendanceRecords, selectedDate, employeeMap]);

  const filteredRecords = useMemo(() => {
    return selectedDateRecords.filter((record) => {
      const searchValue = searchTerm.toLowerCase().trim();

      const matchesSearch =
        record.name.toLowerCase().includes(searchValue) ||
        record.id.toLowerCase().includes(searchValue) ||
        record.department.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [selectedDateRecords, searchTerm, statusFilter]);

  const presentCount = selectedDateRecords.filter(
    (record) =>
      record.status === "Present" ||
      record.status === "Punched In" ||
      record.status === "Punched Out"
  ).length;

  const leaveCount = selectedDateRecords.filter(
    (record) => record.status === "Leave"
  ).length;

  const absentCount = selectedDateRecords.filter(
    (record) => record.status === "Absent"
  ).length;

  const activeEmployeeCount = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("hrmsUser");
    sessionStorage.removeItem("hrmsUser");

    navigate("/login");
  };

  const getStatusClass = (status) => {
    if (
      status === "Present" ||
      status === "Punched Out"
    ) {
      return "attendance-status-present";
    }

    if (status === "Punched In") {
      return "attendance-status-punched";
    }

    if (status === "Leave") {
      return "attendance-status-leave";
    }

    return "attendance-status-absent";
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
            className="nav-item active"
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
              <h1>Attendance</h1>
              <p>
                Track daily employee attendance and working hours.
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

        <section className="attendance-page">
          <div className="attendance-page-header">
            <div>
              <h1>Attendance Management</h1>

              <p>
                Monitor employee punch in, punch out and daily
                status.
              </p>
            </div>

            <input
              className="attendance-date-input"
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(event.target.value)
              }
            />
          </div>

          {apiError && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "#fff1f2",
                color: "#be123c",
              }}
            >
              {apiError}
            </div>
          )}

          <div className="attendance-summary-grid">
            <div className="attendance-summary-card">
              <span>Total Employees</span>
              <strong>{activeEmployeeCount}</strong>
            </div>

            <div className="attendance-summary-card">
              <span>Present</span>
              <strong>{presentCount}</strong>
            </div>

            <div className="attendance-summary-card">
              <span>On Leave</span>
              <strong>{leaveCount}</strong>
            </div>

            <div className="attendance-summary-card">
              <span>Absent</span>
              <strong>{absentCount}</strong>
            </div>
          </div>

          <div className="attendance-panel">
            <div className="attendance-filters">
              <div className="attendance-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search employee..."
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
                <option value="All">All Status</option>
                <option value="Present">Present</option>
                <option value="Punched In">
                  Punched In
                </option>
                <option value="Punched Out">
                  Punched Out
                </option>
                <option value="Leave">Leave</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            <div className="attendance-table-wrap">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Punch In</th>
                    <th>Punch Out</th>
                    <th>Working Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7">
                        <div className="employees-empty-state">
                          Loading attendance records...
                        </div>
                      </td>
                    </tr>
                  ) : filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record._id || record.id}>
                        <td>
                          <div className="attendance-person-cell">
                            <div className="employees-avatar">
                              {record.name
                                .split(" ")
                                .map((name) => name[0])
                                .join("")
                                .slice(0, 2)}
                            </div>

                            <strong>{record.name}</strong>
                          </div>
                        </td>

                        <td>{record.id}</td>
                        <td>{record.department}</td>
                        <td>{record.punchIn}</td>
                        <td>{record.punchOut}</td>
                        <td>{record.workingHours}</td>

                        <td>
                          <span
                            className={`attendance-status-badge ${getStatusClass(
                              record.status
                            )}`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">
                        <div className="employees-empty-state">
                          No attendance records found for this
                          date.
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
    </div>
  );
}

export default Attendance;