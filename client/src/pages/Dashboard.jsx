import { useEffect, useState } from "react";
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
  UserCheck,
  UserMinus,
  WalletCards,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState({
    date: "",
    punchIn: null,
    punchOut: null,
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  const stats = [
    {
      title: "Total Employees",
      value: "128",
      subtitle: "+8 this month",
      icon: <Users size={22} />,
    },
    {
      title: "Present Today",
      value: "112",
      subtitle: "87.5% attendance",
      icon: <UserCheck size={22} />,
    },
    {
      title: "Absent Today",
      value: "6",
      subtitle: "4.7% employees",
      icon: <UserMinus size={22} />,
    },
    {
      title: "On Leave",
      value: "10",
      subtitle: "7.8% employees",
      icon: <CalendarDays size={22} />,
    },
  ];

  const employees = [
    {
      name: "Aarav Sharma",
      department: "Engineering",
      role: "Frontend Developer",
      status: "Present",
    },
    {
      name: "Priya Mehta",
      department: "Human Resources",
      role: "HR Executive",
      status: "Present",
    },
    {
      name: "Rohan Verma",
      department: "Finance",
      role: "Accountant",
      status: "Leave",
    },
    {
      name: "Neha Patel",
      department: "Marketing",
      role: "Marketing Executive",
      status: "Present",
    },
  ];

  const leaveRequests = [
    {
      name: "Rahul Singh",
      type: "Casual Leave",
      duration: "29 Aug - 30 Aug",
    },
    {
      name: "Sneha Kapoor",
      type: "Sick Leave",
      duration: "28 Aug",
    },
    {
      name: "Vikram Joshi",
      type: "Earned Leave",
      duration: "2 Sep - 4 Sep",
    },
  ];

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) {
      return "--:--";
    }

    return new Date(dateValue).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateWorkingHours = () => {
    if (!attendance.punchIn) {
      return "00h 00m";
    }

    const startTime = new Date(attendance.punchIn);

    const endTime = attendance.punchOut
      ? new Date(attendance.punchOut)
      : currentTime;

    const difference = endTime.getTime() - startTime.getTime();

    if (difference <= 0) {
      return "00h 00m";
    }

    const totalMinutes = Math.floor(difference / 60000);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
      2,
      "0"
    )}m`;
  };

  const getAttendanceStatus = () => {
    if (!attendance.punchIn) {
      return {
        title: "Not Punched In",
        description: "Click Punch In to start your working day.",
      };
    }

    if (attendance.punchIn && !attendance.punchOut) {
      return {
        title: "Punched In",
        description: `You punched in at ${formatTime(attendance.punchIn)}.`,
      };
    }

    return {
      title: "Punched Out",
      description: `You completed today's attendance at ${formatTime(
        attendance.punchOut
      )}.`,
    };
  };

  useEffect(() => {
    const today = getTodayDate();

    const savedAttendance = localStorage.getItem("hrmsAttendance");

    if (!savedAttendance) {
      const newAttendance = {
        date: today,
        punchIn: null,
        punchOut: null,
      };

      localStorage.setItem(
        "hrmsAttendance",
        JSON.stringify(newAttendance)
      );

      setAttendance(newAttendance);

      return;
    }

    try {
      const parsedAttendance = JSON.parse(savedAttendance);

      if (parsedAttendance.date === today) {
        setAttendance(parsedAttendance);
      } else {
        const newAttendance = {
          date: today,
          punchIn: null,
          punchOut: null,
        };

        localStorage.setItem(
          "hrmsAttendance",
          JSON.stringify(newAttendance)
        );

        setAttendance(newAttendance);
      }
    } catch {
      const newAttendance = {
        date: today,
        punchIn: null,
        punchOut: null,
      };

      localStorage.setItem(
        "hrmsAttendance",
        JSON.stringify(newAttendance)
      );

      setAttendance(newAttendance);
    }
  }, []);

  useEffect(() => {
    if (!attendance.punchIn || attendance.punchOut) {
      return undefined;
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [attendance.punchIn, attendance.punchOut]);

  const handlePunch = () => {
    const today = getTodayDate();
    const currentDateTime = new Date().toISOString();

    if (!attendance.punchIn) {
      const updatedAttendance = {
        date: today,
        punchIn: currentDateTime,
        punchOut: null,
      };

      localStorage.setItem(
        "hrmsAttendance",
        JSON.stringify(updatedAttendance)
      );

      setAttendance(updatedAttendance);
      setCurrentTime(new Date());

      return;
    }

    if (attendance.punchIn && !attendance.punchOut) {
      const updatedAttendance = {
        ...attendance,
        punchOut: currentDateTime,
      };

      localStorage.setItem(
        "hrmsAttendance",
        JSON.stringify(updatedAttendance)
      );

      setAttendance(updatedAttendance);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hrmsUser");
    sessionStorage.removeItem("hrmsUser");

    navigate("/login");
  };

  const attendanceStatus = getAttendanceStatus();

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
            className="nav-item active"
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

          <button className="nav-item">
            <CalendarDays size={19} />
            <span>Leave</span>
          </button>

          <button className="nav-item">
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
              <h1>Dashboard</h1>
              <p>Welcome back, HRMS Admin</p>
            </div>
          </div>

          <div className="header-actions">
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>

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
            {stats.map((item) => (
              <div className="stat-card" key={item.title}>
                <div className="stat-card-top">
                  <div className="stat-icon">{item.icon}</div>
                  <span className="stat-label">{item.title}</span>
                </div>

                <h3>{item.value}</h3>
                <p>{item.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="dashboard-grid">
            <section className="panel attendance-panel">
              <div className="panel-header">
                <div>
                  <h3>My Attendance</h3>
                  <p>Today's attendance and working hours</p>
                </div>

                <span className="date-chip">{getFormattedDate()}</span>
              </div>

              <div className="attendance-body">
                <div className="attendance-status-card">
                  <div className="attendance-circle">
                    <Clock3 size={28} />
                  </div>

                  <div>
                    <span className="attendance-small">Current Status</span>
                    <h4>{attendanceStatus.title}</h4>
                    <p>{attendanceStatus.description}</p>
                  </div>
                </div>

                <div className="attendance-times">
                  <div>
                    <span>Punch In</span>
                    <strong>{formatTime(attendance.punchIn)}</strong>
                  </div>

                  <div>
                    <span>Punch Out</span>
                    <strong>{formatTime(attendance.punchOut)}</strong>
                  </div>

                  <div>
                    <span>Working Hours</span>
                    <strong>{calculateWorkingHours()}</strong>
                  </div>
                </div>

                {!attendance.punchOut ? (
                  <button
                    className="punch-button"
                    onClick={handlePunch}
                  >
                    {attendance.punchIn ? "Punch Out" : "Punch In"}
                  </button>
                ) : (
                  <button className="punch-button" disabled>
                    Attendance Completed
                  </button>
                )}
              </div>
            </section>

            <section className="panel overview-panel">
              <div className="panel-header">
                <div>
                  <h3>Attendance Overview</h3>
                  <p>Today's employee status</p>
                </div>
              </div>

              <div className="attendance-bars">
                <div className="bar-row">
                  <div className="bar-info">
                    <span>Present</span>
                    <strong>112</strong>
                  </div>

                  <div className="progress-track">
                    <div className="progress-fill progress-present"></div>
                  </div>
                </div>

                <div className="bar-row">
                  <div className="bar-info">
                    <span>On Leave</span>
                    <strong>10</strong>
                  </div>

                  <div className="progress-track">
                    <div className="progress-fill progress-leave"></div>
                  </div>
                </div>

                <div className="bar-row">
                  <div className="bar-info">
                    <span>Absent</span>
                    <strong>6</strong>
                  </div>

                  <div className="progress-track">
                    <div className="progress-fill progress-absent"></div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="dashboard-grid bottom-grid">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>Recent Employees</h3>
                  <p>Latest employee records</p>
                </div>

                <button
                  className="text-button"
                  onClick={() => navigate("/employees")}
                >
                  View All
                </button>
              </div>

              <div className="employee-table-wrap">
                <table className="employee-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.name}>
                        <td>
                          <div className="employee-cell">
                            <div className="employee-avatar">
                              {employee.name
                                .split(" ")
                                .map((name) => name[0])
                                .join("")
                                .slice(0, 2)}
                            </div>

                            <span>{employee.name}</span>
                          </div>
                        </td>

                        <td>{employee.department}</td>
                        <td>{employee.role}</td>

                        <td>
                          <span
                            className={`status-badge ${
                              employee.status === "Present"
                                ? "status-present"
                                : "status-leave"
                            }`}
                          >
                            {employee.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>Pending Leave Requests</h3>
                  <p>Requests waiting for approval</p>
                </div>
              </div>

              <div className="leave-list">
                {leaveRequests.map((request) => (
                  <div className="leave-item" key={request.name}>
                    <div className="leave-avatar">
                      {request.name
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div className="leave-info">
                      <strong>{request.name}</strong>

                      <span>
                        {request.type} • {request.duration}
                      </span>
                    </div>

                    <div className="leave-actions">
                      <button className="approve-button">
                        Approve
                      </button>

                      <button className="reject-button">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;