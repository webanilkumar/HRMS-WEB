import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";
import Settings from "./pages/Settings";
import DepartmentsDesignations from "./pages/DepartmentsDesignations";
import Holidays from "./pages/Holidays";
import Notices from "./pages/Notices";
import EmployeeDocuments from "./pages/EmployeeDocuments";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/employees"
        element={<Employees />}
      />

      <Route
        path="/attendance"
        element={<Attendance />}
      />

      <Route
        path="/leave"
        element={<Leave />}
      />

      <Route
        path="/payroll"
        element={<Payroll />}
      />

      <Route
        path="/settings"
        element={<Settings />}
      />

      <Route
        path="/departments-designations"
        element={<DepartmentsDesignations />}
      />

      <Route
        path="/holidays"
        element={<Holidays />}
      />

      <Route
        path="/notices"
        element={<Notices />}
      />

      <Route
        path="/employee-documents"
        element={<EmployeeDocuments />}
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;