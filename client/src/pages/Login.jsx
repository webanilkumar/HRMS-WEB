import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/apiConfig";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Login failed.");
        return;
      }

      const loginData = {
        id: result.data.id,
        name: result.data.name,
        email: result.data.email,
        role: result.data.role,
        employeeId: result.data.employeeId,
        isActive: result.data.isActive,
        token: result.token,
      };

      if (rememberMe) {
        localStorage.setItem(
          "hrmsUser",
          JSON.stringify(loginData)
        );

        localStorage.setItem(
          "hrmsToken",
          result.token
        );

        sessionStorage.removeItem("hrmsUser");
        sessionStorage.removeItem("hrmsToken");
      } else {
        sessionStorage.setItem(
          "hrmsUser",
          JSON.stringify(loginData)
        );

        sessionStorage.setItem(
          "hrmsToken",
          result.token
        );

        localStorage.removeItem("hrmsUser");
        localStorage.removeItem("hrmsToken");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="brand-box">
          <div className="brand-logo">HR</div>

          <div>
            <h1>HRMS</h1>
            <p>Human Resource Management System</p>
          </div>
        </div>

        <div className="login-content">
          <p className="welcome-text">Welcome back</p>

          <h2>Login to your account</h2>

          <p className="sub-text">
            Enter your credentials to access the HRMS dashboard.
          </p>

          <form
            className="login-form"
            onSubmit={handleLogin}
          >
            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                disabled={loading}
              />
            </div>

            {error && (
              <p className="login-error">
                {error}
              </p>
            )}

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                  disabled={loading}
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-btn"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="demo-login-box">
            <p>Admin Login</p>
            <span>Email: admin@hrms.com</span>
            <span>Password: Admin@123</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="visual-card">
          <div className="visual-icon">
            HR
          </div>

          <h2>
            Manage your workforce smarter
          </h2>

          <p>
            Employees, attendance, punch
            in/out, leave, payroll and reports
            in one place.
          </p>

          <div className="feature-grid">
            <div className="feature-card">
              <strong>Employees</strong>
              <span>
                Manage employee records
              </span>
            </div>

            <div className="feature-card">
              <strong>Attendance</strong>
              <span>
                Track daily attendance
              </span>
            </div>

            <div className="feature-card">
              <strong>Leave</strong>
              <span>
                Approve and manage leave
              </span>
            </div>

            <div className="feature-card">
              <strong>Payroll</strong>
              <span>
                Maintain salary records
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
