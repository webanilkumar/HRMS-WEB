import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobalSearch from "../components/GlobalSearch";
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  UserCheck,
  UserMinus,
  WalletCards,
} from "lucide-react";

const ATTENDANCE_API_URL = "http://localhost:5000/api/attendance";
const EMPLOYEE_API_URL = "http://localhost:5000/api/employees";
const LEAVE_API_URL = "http://localhost:5000/api/leaves";

function Dashboard() {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState({
    date: "",
    punchIn: null,
    punchOut: null,
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");

  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    onLeave: 0,
  });

  const [recentEmployees, setRecentEmployees] = useState([]);
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState([]);

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
    if (attendanceLoading) {
      return {
        title: "Loading...",
        description: "Checking today's attendance.",
      };
    }

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

  const isDateInsideLeave = (leave, today) => {
    const fromDate =
      leave.fromDate ||
      leave.startDate ||
      leave.leaveFrom ||
      leave.dateFrom;

    const toDate =
      leave.toDate ||
      leave.endDate ||
      leave.leaveTo ||
      leave.dateTo ||
      fromDate;

    if (!fromDate || !toDate) {
      return false;
    }

    const start = String(fromDate).slice(0, 10);
    const end = String(toDate).slice(0, 10);

    return today >= start && today <= end;
  };

  const loadDashboardData = async () => {
    try {
      const today = getTodayDate();

      const [employeeResponse, attendanceResponse, leaveResponse] =
        await Promise.all([
          fetch(EMPLOYEE_API_URL),
          fetch(ATTENDANCE_API_URL),
          fetch(LEAVE_API_URL),
        ]);

      const employeeData = await employeeResponse.json();
      const attendanceData = await attendanceResponse.json();
      const leaveData = await leaveResponse.json();

      const employees = employeeData.employees || [];
      const attendances = attendanceData.attendances || [];
      const leaves = leaveData.leaves || [];

      setPendingLeaveRequests(
        leaves
          .filter(
            (leave) =>
              String(leave.status || "").toLowerCase() === "pending"
          )
          .map((leave) => ({
            id: leave._id,
            leaveId: leave.leaveId,
            name: leave.employee,
            type: leave.type,
            duration: `${new Date(leave.fromDate).toLocaleDateString(
              "en-IN"
            )} - ${new Date(leave.toDate).toLocaleDateString("en-IN")}`,
          }))
      );

      const activeEmployees = employees.filter(
        (employee) =>
          String(employee.status || "").toLowerCase() === "active"
      );

      const todayAttendance = attendances.filter(
        (item) => item.attendanceDate === today
      );

      const presentEmployeeIds = new Set(
        todayAttendance
          .filter((item) =>
            [
              "Present",
              "Punched In",
              "Punched Out",
              "Late",
              "Half Day",
            ].includes(item.status)
          )
          .map((item) => item.employeeId)
      );

      const todayApprovedLeaves = leaves.filter((leave) => {
        const leaveStatus = String(leave.status || "").toLowerCase();

        return (
          leaveStatus === "approved" &&
          isDateInsideLeave(leave, today)
        );
      });

      const leaveEmployeeIds = new Set(
        todayApprovedLeaves
          .map(
            (leave) =>
              leave.employeeId ||
              leave.employeeID ||
              leave.empId
          )
          .filter(Boolean)
      );

      const totalEmployees = activeEmployees.length;
      const presentToday = presentEmployeeIds.size;

      const onLeave = [...leaveEmployeeIds].filter(
        (employeeId) => !presentEmployeeIds.has(employeeId)
      ).length;

      const absentToday = Math.max(
        0,
        totalEmployees - presentToday - onLeave
      );

      setDashboardStats({
        totalEmployees,
        presentToday,
        absentToday,
        onLeave,
      });

      const latestEmployees = [...employees]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.joiningDate || 0);
          const dateB = new Date(b.createdAt || b.joiningDate || 0);

          return dateB - dateA;
        })
        .slice(0, 4)
        .map((employee) => ({
          name: employee.name,
          department: employee.department,
          role: employee.designation,
          status:
            String(employee.status).toLowerCase() === "active"
              ? "Present"
              : "Inactive",
        }));

      setRecentEmployees(latestEmployees);
    } catch (error) {
      console.error("Dashboard data error:", error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const loadTodayAttendance = async () => {
      try {
        setAttendanceLoading(true);
        setAttendanceError("");

        const today = getTodayDate();

        const response = await fetch(
          `${ATTENDANCE_API_URL}/today/EMP001?date=${today}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load today's attendance"
          );
        }

        if (data.attendance) {
          setAttendance({
            date: data.attendance.attendanceDate,
            punchIn: data.attendance.punchIn,
            punchOut: data.attendance.punchOut,
          });
        } else {
          setAttendance({
            date: today,
            punchIn: null,
            punchOut: null,
          });
        }
      } catch (error) {
        console.error(error);

        setAttendanceError(
          error.message || "Unable to load attendance."
        );
      } finally {
        setAttendanceLoading(false);
      }
    };

    loadTodayAttendance();
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

  const handlePunch = async () => {
    if (punchLoading || attendanceLoading) {
      return;
    }

    try {
      setPunchLoading(true);
      setAttendanceError("");

      const today = getTodayDate();

      if (!attendance.punchIn) {
        const employeeResponse = await fetch(EMPLOYEE_API_URL);
        const employeeData = await employeeResponse.json();

        if (!employeeResponse.ok || !employeeData.success) {
          throw new Error(
            employeeData.message || "Failed to load employee"
          );
        }

        const employee = employeeData.employees?.find(
          (item) => item.employeeId === "EMP001"
        );

        if (!employee) {
          throw new Error("EMP001 employee not found");
        }

        const response = await fetch(
          `${ATTENDANCE_API_URL}/punch-in`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              employeeId: employee.employeeId,
              employee: employee.name,
              attendanceDate: today,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Punch In failed");
        }

        setAttendance({
          date: data.attendance.attendanceDate,
          punchIn: data.attendance.punchIn,
          punchOut: data.attendance.punchOut,
        });

        setCurrentTime(new Date());

        await loadDashboardData();

        return;
      }

      if (attendance.punchIn && !attendance.punchOut) {
        const response = await fetch(
          `${ATTENDANCE_API_URL}/punch-out`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              employeeId: "EMP001",
              attendanceDate: today,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Punch Out failed");
        }

        setAttendance({
          date: data.attendance.attendanceDate,
          punchIn: data.attendance.punchIn,
          punchOut: data.attendance.punchOut,
        });

        await loadDashboardData();
      }
    } catch (error) {
      console.error(error);

      setAttendanceError(
        error.message || "Attendance action failed."
      );
    } finally {
      setPunchLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      const response = await fetch(`${LEAVE_API_URL}/${leaveId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Approved",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to approve leave request"
        );
      }

      await loadDashboardData();
    } catch (error) {
      console.error(error);

      setAttendanceError(
        error.message || "Unable to approve leave request."
      );
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      const response = await fetch(`${LEAVE_API_URL}/${leaveId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Rejected",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to reject leave request"
        );
      }

      await loadDashboardData();
    } catch (error) {
      console.error(error);

      setAttendanceError(
        error.message || "Unable to reject leave request."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hrmsUser");
    sessionStorage.removeItem("hrmsUser");

    navigate("/login");
  };

  const totalEmployees = dashboardStats.totalEmployees;

  const presentPercentage =
    totalEmployees > 0
      ? Math.round(
          (dashboardStats.presentToday / totalEmployees) * 100
        )
      : 0;

  const absentPercentage =
    totalEmployees > 0
      ? Math.round(
          (dashboardStats.absentToday / totalEmployees) * 100
        )
      : 0;

  const leavePercentage =
    totalEmployees > 0
      ? Math.round(
          (dashboardStats.onLeave / totalEmployees) * 100
        )
      : 0;

  const stats = [
    {
      title: "Total Employees",
      value: dashboardStats.totalEmployees,
      subtitle: "Active employees",
      icon: <Users size={22} />,
    },
    {
      title: "Present Today",
      value: dashboardStats.presentToday,
      subtitle: `${presentPercentage}% attendance`,
      icon: <UserCheck size={22} />,
    },
    {
      title: "Absent Today",
      value: dashboardStats.absentToday,
      subtitle: `${absentPercentage}% employees`,
      icon: <UserMinus size={22} />,
    },
    {
      title: "On Leave",
      value: dashboardStats.onLeave,
      subtitle: `${leavePercentage}% employees`,
      icon: <CalendarDays size={22} />,
    },
  ];

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
            onClick={() =>
              navigate("/departments-designations")
            }
          >
            <Building2 size={19} />
            <span>Departments & Designations</span>
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
              <h1>Dashboard</h1>
              <p>Welcome back, HRMS Admin</p>
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

          {attendanceError && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "#fff1f2",
                color: "#be123c",
              }}
            >
              {attendanceError}
            </div>
          )}

          <div className="dashboard-grid">
            <section className="panel attendance-panel">
              <div className="panel-header">
                <div>
                  <h3>My Attendance</h3>
                  <p>Today's attendance and working hours</p>
                </div>

                <span className="date-chip">
                  {getFormattedDate()}
                </span>
              </div>

              <div className="attendance-body">
                <div className="attendance-status-card">
                  <div className="attendance-circle">
                    <Clock3 size={28} />
                  </div>

                  <div>
                    <span className="attendance-small">
                      Current Status
                    </span>

                    <h4>{attendanceStatus.title}</h4>
                    <p>{attendanceStatus.description}</p>
                  </div>
                </div>

                <div className="attendance-times">
                  <div>
                    <span>Punch In</span>
                    <strong>
                      {formatTime(attendance.punchIn)}
                    </strong>
                  </div>

                  <div>
                    <span>Punch Out</span>
                    <strong>
                      {formatTime(attendance.punchOut)}
                    </strong>
                  </div>

                  <div>
                    <span>Working Hours</span>
                    <strong>{calculateWorkingHours()}</strong>
                  </div>
                </div>

                {attendanceLoading ? (
                  <button className="punch-button" disabled>
                    Loading Attendance...
                  </button>
                ) : !attendance.punchOut ? (
                  <button
                    className="punch-button"
                    onClick={handlePunch}
                    disabled={punchLoading}
                  >
                    {punchLoading
                      ? "Please wait..."
                      : attendance.punchIn
                        ? "Punch Out"
                        : "Punch In"}
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
                    <strong>
                      {dashboardStats.presentToday}
                    </strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill progress-present"
                      style={{
                        width: `${presentPercentage}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bar-row">
                  <div className="bar-info">
                    <span>On Leave</span>
                    <strong>{dashboardStats.onLeave}</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill progress-leave"
                      style={{
                        width: `${leavePercentage}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bar-row">
                  <div className="bar-info">
                    <span>Absent</span>
                    <strong>
                      {dashboardStats.absentToday}
                    </strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill progress-absent"
                      style={{
                        width: `${absentPercentage}%`,
                      }}
                    ></div>
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
                    {recentEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="4">
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      recentEmployees.map((employee) => (
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
                      ))
                    )}
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
                {pendingLeaveRequests.length === 0 ? (
                  <div
                    style={{
                      padding: "18px 0",
                      color: "#64748b",
                    }}
                  >
                    No pending leave requests
                  </div>
                ) : (
                  pendingLeaveRequests.map((request) => (
                    <div
                      className="leave-item"
                      key={request.id || request.leaveId}
                    >
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
                        <button
                          className="approve-button"
                          onClick={() =>
                            handleApproveLeave(request.id)
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="reject-button"
                          onClick={() =>
                            handleRejectLeave(request.id)
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;