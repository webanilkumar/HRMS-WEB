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
  Search,
  Settings,
  Users,
  WalletCards,
} from "lucide-react";

function Attendance() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const attendanceRecords = [
    {
      id: "EMP001",
      name: "Aarav Sharma",
      department: "Engineering",
      punchIn: "09:12 AM",
      punchOut: "06:20 PM",
      workingHours: "09h 08m",
      status: "Present",
    },
    {
      id: "EMP002",
      name: "Priya Mehta",
      department: "Human Resources",
      punchIn: "09:25 AM",
      punchOut: "06:05 PM",
      workingHours: "08h 40m",
      status: "Present",
    },
    {
      id: "EMP003",
      name: "Rohan Verma",
      department: "Finance",
      punchIn: "--:--",
      punchOut: "--:--",
      workingHours: "00h 00m",
      status: "Leave",
    },
    {
      id: "EMP004",
      name: "Neha Patel",
      department: "Marketing",
      punchIn: "10:02 AM",
      punchOut: "--:--",
      workingHours: "07h 22m",
      status: "Punched In",
    },
    {
      id: "EMP005",
      name: "Vikram Joshi",
      department: "Engineering",
      punchIn: "--:--",
      punchOut: "--:--",
      workingHours: "00h 00m",
      status: "Absent",
    },
  ];

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        record.name.toLowerCase().includes(searchValue) ||
        record.id.toLowerCase().includes(searchValue) ||
        record.department.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const presentCount = attendanceRecords.filter(
    (record) =>
      record.status === "Present" ||
      record.status === "Punched In"
  ).length;

  const leaveCount = attendanceRecords.filter(
    (record) => record.status === "Leave"
  ).length;

  const absentCount = attendanceRecords.filter(
    (record) => record.status === "Absent"
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("hrmsUser");
    sessionStorage.removeItem("hrmsUser");

    navigate("/login");
  };

  const getStatusClass = (status) => {
    if (status === "Present") {
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

          <button className="nav-item" onClick={() => navigate("/leave")}><CalendarDays size={19} /><span>Leave</span></button>

          <button className="nav-item" onClick={() => navigate("/payroll")}><WalletCards size={19} /><span>Payroll</span></button>

          <button className="nav-item" onClick={() => navigate("/settings")}><Settings size={19} /><span>Settings</span></button>
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
              <p>Track daily employee attendance and working hours.</p>
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
                Monitor employee punch in, punch out and daily status.
              </p>
            </div>

            <input
              className="attendance-date-input"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </div>

          <div className="attendance-summary-grid">
            <div className="attendance-summary-card">
              <span>Total Employees</span>
              <strong>{attendanceRecords.length}</strong>
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
                <option value="Punched In">Punched In</option>
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
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record.id}>
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
                          No attendance records found.
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


