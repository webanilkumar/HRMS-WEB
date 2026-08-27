import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    const demoEmail = "admin@hrms.com";
    const demoPassword = "Admin@123";

    if (email === demoEmail && password === demoPassword) {
      const loginData = {
        email,
        role: "Admin",
        name: "HRMS Admin",
      };

      if (rememberMe) {
        localStorage.setItem("hrmsUser", JSON.stringify(loginData));
      } else {
        sessionStorage.setItem("hrmsUser", JSON.stringify(loginData));
      }

      navigate("/dashboard");
      return;
    }

    setError("Invalid email or password.");
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

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />

                <span>Remember me</span>
              </label>

              <button type="button" className="forgot-btn">
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-btn">
              Login
            </button>
          </form>

          <div className="demo-login-box">
            <p>Demo Admin Login</p>
            <span>Email: admin@hrms.com</span>
            <span>Password: Admin@123</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="visual-card">
          <div className="visual-icon">HR</div>

          <h2>Manage your workforce smarter</h2>

          <p>
            Employees, attendance, punch in/out, leave, payroll and reports in
            one place.
          </p>

          <div className="feature-grid">
            <div className="feature-card">
              <strong>Employees</strong>
              <span>Manage employee records</span>
            </div>

            <div className="feature-card">
              <strong>Attendance</strong>
              <span>Track daily attendance</span>
            </div>

            <div className="feature-card">
              <strong>Leave</strong>
              <span>Approve and manage leave</span>
            </div>

            <div className="feature-card">
              <strong>Payroll</strong>
              <span>Maintain salary records</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;