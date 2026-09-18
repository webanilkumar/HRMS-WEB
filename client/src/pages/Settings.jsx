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
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  Users,
  WalletCards,
} from "lucide-react";

const SETTINGS_API_URL = "http://localhost:5000/api/settings";

const defaultSettings = {
  companyName: "HRMS Solutions Pvt. Ltd.",
  companyEmail: "hr@company.com",
  companyPhone: "+91 98765 43210",
  companyAddress: "Mumbai, Maharashtra, India",

  workingHoursPerDay: "8",
  officeStartTime: "09:30",
  officeEndTime: "18:30",
  gracePeriod: "15",

  allowLatePunch: true,
  allowEarlyPunchOut: true,
  requireAttendanceRemark: false,

  casualLeave: "12",
  sickLeave: "10",
  earnedLeave: "18",

  payrollDay: "30",
  pfEnabled: true,
  esiEnabled: true,
  professionalTaxEnabled: true,
};

function Settings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(defaultSettings);
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setErrorMessage("");

        const response = await fetch(SETTINGS_API_URL);
        const result = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Failed to load settings.");
        }

        const data = result.data;

        setSettings({
          companyName: data.companyProfile?.companyName ?? "",
          companyEmail: data.companyProfile?.companyEmail ?? "",
          companyPhone: data.companyProfile?.companyPhone ?? "",
          companyAddress: data.companyProfile?.companyAddress ?? "",

          workingHoursPerDay: String(
            data.workingHours?.workingHoursPerDay ?? 8
          ),
          officeStartTime: data.workingHours?.officeStartTime ?? "09:30",
          officeEndTime: data.workingHours?.officeEndTime ?? "18:30",
          gracePeriod: String(
            data.workingHours?.gracePeriodMinutes ?? 15
          ),

          allowLatePunch:
            data.attendanceRules?.allowLatePunch ?? true,
          allowEarlyPunchOut:
            data.attendanceRules?.allowEarlyPunchOut ?? true,
          requireAttendanceRemark:
            data.attendanceRules?.attendanceRemarkRequired ?? false,

          casualLeave: String(
            data.leaveSettings?.casualLeavePerYear ?? 12
          ),
          sickLeave: String(
            data.leaveSettings?.sickLeavePerYear ?? 12
          ),
          earnedLeave: String(
            data.leaveSettings?.earnedLeavePerYear ?? 15
          ),

          payrollDay: String(
            data.payrollSettings?.payrollProcessingDay ?? 30
          ),
          pfEnabled:
            data.payrollSettings?.providentFundEnabled ?? true,
          esiEnabled:
            data.payrollSettings?.esiEnabled ?? true,
          professionalTaxEnabled:
            data.payrollSettings?.professionalTaxEnabled ?? true,
        });
      } catch (error) {
        console.error("Settings load error:", error);
        setErrorMessage(
          "Unable to load settings from backend. Make sure the backend server is running."
        );
      }
    };

    loadSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSavedMessage("");
      setErrorMessage("");

      const payload = {
        companyProfile: {
          companyName: settings.companyName.trim(),
          companyEmail: settings.companyEmail.trim(),
          companyPhone: settings.companyPhone.trim(),
          companyAddress: settings.companyAddress.trim(),
        },
        workingHours: {
          workingHoursPerDay: Number(settings.workingHoursPerDay),
          gracePeriodMinutes: Number(settings.gracePeriod),
          officeStartTime: settings.officeStartTime,
          officeEndTime: settings.officeEndTime,
        },
        attendanceRules: {
          allowLatePunch: settings.allowLatePunch,
          allowEarlyPunchOut: settings.allowEarlyPunchOut,
          attendanceRemarkRequired:
            settings.requireAttendanceRemark,
        },
        leaveSettings: {
          casualLeavePerYear: Number(settings.casualLeave),
          sickLeavePerYear: Number(settings.sickLeave),
          earnedLeavePerYear: Number(settings.earnedLeave),
        },
        payrollSettings: {
          payrollProcessingDay: Number(settings.payrollDay),
          providentFundEnabled: settings.pfEnabled,
          esiEnabled: settings.esiEnabled,
          professionalTaxEnabled:
            settings.professionalTaxEnabled,
        },
      };

      const response = await fetch(SETTINGS_API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save settings.");
      }

      setSavedMessage("Settings saved successfully.");

      setTimeout(() => {
        setSavedMessage("");
      }, 2500);
    } catch (error) {
      console.error("Settings save error:", error);
      setErrorMessage(error.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsSaving(true);
      setSavedMessage("");
      setErrorMessage("");

      const response = await fetch(`${SETTINGS_API_URL}/reset`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Failed to reset settings.");
      }

      const data = result.data;

      setSettings({
        companyName: data.companyProfile?.companyName ?? "",
        companyEmail: data.companyProfile?.companyEmail ?? "",
        companyPhone: data.companyProfile?.companyPhone ?? "",
        companyAddress: data.companyProfile?.companyAddress ?? "",

        workingHoursPerDay: String(
          data.workingHours?.workingHoursPerDay ?? 8
        ),
        officeStartTime: data.workingHours?.officeStartTime ?? "09:30",
        officeEndTime: data.workingHours?.officeEndTime ?? "18:30",
        gracePeriod: String(
          data.workingHours?.gracePeriodMinutes ?? 15
        ),

        allowLatePunch:
          data.attendanceRules?.allowLatePunch ?? true,
        allowEarlyPunchOut:
          data.attendanceRules?.allowEarlyPunchOut ?? true,
        requireAttendanceRemark:
          data.attendanceRules?.attendanceRemarkRequired ?? false,

        casualLeave: String(
          data.leaveSettings?.casualLeavePerYear ?? 12
        ),
        sickLeave: String(
          data.leaveSettings?.sickLeavePerYear ?? 12
        ),
        earnedLeave: String(
          data.leaveSettings?.earnedLeavePerYear ?? 15
        ),

        payrollDay: String(
          data.payrollSettings?.payrollProcessingDay ?? 30
        ),
        pfEnabled:
          data.payrollSettings?.providentFundEnabled ?? true,
        esiEnabled:
          data.payrollSettings?.esiEnabled ?? true,
        professionalTaxEnabled:
          data.payrollSettings?.professionalTaxEnabled ?? true,
      });

      setSavedMessage("Settings reset to default.");

      setTimeout(() => {
        setSavedMessage("");
      }, 2500);
    } catch (error) {
      console.error("Settings reset error:", error);
      setErrorMessage(error.message || "Failed to reset settings.");
    } finally {
      setIsSaving(false);
    }
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
            className="nav-item"
            onClick={() => navigate("/payroll")}
          >
            <WalletCards size={19} />
            <span>Payroll</span>
          </button>

          <button
            className="nav-item active"
            onClick={() => navigate("/settings")}
          >
            <SettingsIcon size={19} />
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
              <h1>Settings</h1>
              <p>Manage company and HRMS configuration</p>
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
          <div className="settings-page">
            {(savedMessage || errorMessage) && (
              <div
                style={{
                  position: "fixed",
                  top: "24px",
                  right: "24px",
                  zIndex: 9999,
                  minWidth: "280px",
                  maxWidth: "380px",
                  padding: "14px 18px",
                  borderRadius: "10px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18)",
                  background: errorMessage ? "#fee2e2" : "#dcfce7",
                  color: errorMessage ? "#991b1b" : "#166534",
                  border: errorMessage
                    ? "1px solid #fecaca"
                    : "1px solid #bbf7d0",
                  fontWeight: 600,
                }}
              >
                {errorMessage || savedMessage}
              </div>
            )}

            <div className="settings-section">
              <div className="settings-section-header">
                <div className="settings-icon">
                  <Building2 size={20} />
                </div>

                <div>
                  <h2>Company Profile</h2>
                  <p>Basic company information</p>
                </div>
              </div>

              <div className="settings-grid">
                <div className="settings-field">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={settings.companyName}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-field">
                  <label>Company Email</label>
                  <input
                    type="email"
                    name="companyEmail"
                    value={settings.companyEmail}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-field">
                  <label>Company Phone</label>
                  <input
                    type="text"
                    name="companyPhone"
                    value={settings.companyPhone}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-field">
                  <label>Company Address</label>
                  <input
                    type="text"
                    name="companyAddress"
                    value={settings.companyAddress}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-header">
                <div className="settings-icon">
                  <Clock3 size={20} />
                </div>

                <div>
                  <h2>Working Hours</h2>
                  <p>Configure office timing</p>
                </div>
              </div>

              <div className="settings-grid">
                <div className="settings-field">
                  <label>Working Hours / Day</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    name="workingHoursPerDay"
                    value={settings.workingHoursPerDay}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-field">
                  <label>Grace Period (Minutes)</label>
                  <input
                    type="number"
                    min="0"
                    name="gracePeriod"
                    value={settings.gracePeriod}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-field">
                  <label>Office Start Time</label>
                  <input
                    type="time"
                    name="officeStartTime"
                    value={settings.officeStartTime}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-field">
                  <label>Office End Time</label>
                  <input
                    type="time"
                    name="officeEndTime"
                    value={settings.officeEndTime}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-header">
                <div className="settings-icon">
                  <Clock3 size={20} />
                </div>

                <div>
                  <h2>Attendance Rules</h2>
                  <p>Control punch and attendance behaviour</p>
                </div>
              </div>

              <div className="settings-toggle-list">
                <label className="settings-toggle-row">
                  <div>
                    <strong>Allow Late Punch</strong>
                    <span>
                      Employees can punch in after office start time.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="allowLatePunch"
                    checked={settings.allowLatePunch}
                    onChange={handleChange}
                  />
                </label>

                <label className="settings-toggle-row">
                  <div>
                    <strong>Allow Early Punch Out</strong>
                    <span>
                      Employees can punch out before office end time.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="allowEarlyPunchOut"
                    checked={settings.allowEarlyPunchOut}
                    onChange={handleChange}
                  />
                </label>

                <label className="settings-toggle-row">
                  <div>
                    <strong>Attendance Remark Required</strong>
                    <span>
                      Require a remark while submitting attendance.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="requireAttendanceRemark"
                    checked={settings.requireAttendanceRemark}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-header">
                <div className="settings-icon">
                  <CalendarDays size={20} />
                </div>

                <div>
                  <h2>Leave Settings</h2>
                  <p>Annual leave allocation</p>
                </div>
              </div>

              <div className="settings-grid">
                <div className="settings-field">
                  <label>Casual Leave / Year</label>
                  <input
                    type="number"
                    min="0"
                    name="casualLeave"
                    value={settings.casualLeave}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-field">
                  <label>Sick Leave / Year</label>
                  <input
                    type="number"
                    min="0"
                    name="sickLeave"
                    value={settings.sickLeave}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-field">
                  <label>Earned Leave / Year</label>
                  <input
                    type="number"
                    min="0"
                    name="earnedLeave"
                    value={settings.earnedLeave}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-header">
                <div className="settings-icon">
                  <WalletCards size={20} />
                </div>

                <div>
                  <h2>Payroll Settings</h2>
                  <p>Configure salary processing rules</p>
                </div>
              </div>

              <div className="settings-grid">
                <div className="settings-field">
                  <label>Payroll Processing Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    name="payrollDay"
                    value={settings.payrollDay}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="settings-toggle-list">
                <label className="settings-toggle-row">
                  <div>
                    <strong>Provident Fund (PF)</strong>
                    <span>
                      Enable PF deduction during payroll processing.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="pfEnabled"
                    checked={settings.pfEnabled}
                    onChange={handleChange}
                  />
                </label>

                <label className="settings-toggle-row">
                  <div>
                    <strong>ESI</strong>
                    <span>
                      Enable employee state insurance deduction.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="esiEnabled"
                    checked={settings.esiEnabled}
                    onChange={handleChange}
                  />
                </label>

                <label className="settings-toggle-row">
                  <div>
                    <strong>Professional Tax</strong>
                    <span>
                      Enable professional tax deduction.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="professionalTaxEnabled"
                    checked={settings.professionalTaxEnabled}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>

            <div className="settings-actions">
              <button
                className="settings-reset-button"
                onClick={handleReset}
                disabled={isSaving}
              >
                <RotateCcw size={18} />
                Reset
              </button>

              <button
                className="settings-save-button"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save size={18} />
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;