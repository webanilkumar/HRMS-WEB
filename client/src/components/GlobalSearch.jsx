import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  Search,
  Settings as SettingsIcon,
  UserRound,
  WalletCards,
} from "lucide-react";

function GlobalSearch() {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);

  const loadSearchData = () => {
    try {
      const savedEmployees =
        localStorage.getItem("hrmsEmployees");

      const savedLeaves =
        localStorage.getItem("hrmsLeaves");

      const savedPayroll =
        localStorage.getItem("hrmsPayroll");

      setEmployees(
        savedEmployees ? JSON.parse(savedEmployees) : []
      );

      setLeaves(
        savedLeaves ? JSON.parse(savedLeaves) : []
      );

      setPayrollRecords(
        savedPayroll ? JSON.parse(savedPayroll) : []
      );
    } catch {
      setEmployees([]);
      setLeaves([]);
      setPayrollRecords([]);
    }
  };

  useEffect(() => {
    loadSearchData();

    const handleStorageChange = () => {
      loadSearchData();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const results = useMemo(() => {
    const value = searchTerm
      .trim()
      .toLowerCase();

    if (!value) {
      return [];
    }

    const employeeResults = employees
      .filter((employee) => {
        return (
          employee.name
            ?.toLowerCase()
            .includes(value) ||
          employee.id
            ?.toLowerCase()
            .includes(value) ||
          employee.email
            ?.toLowerCase()
            .includes(value) ||
          employee.department
            ?.toLowerCase()
            .includes(value) ||
          employee.designation
            ?.toLowerCase()
            .includes(value)
        );
      })
      .map((employee) => ({
        key: `employee-${employee.id}`,
        title: employee.name,
        subtitle: `${employee.id} - ${employee.department}`,
        type: "Employee",
        path: "/employees",
      }));

    const leaveResults = leaves
      .filter((leave) => {
        return (
          leave.employee
            ?.toLowerCase()
            .includes(value) ||
          leave.employeeId
            ?.toLowerCase()
            .includes(value) ||
          leave.id
            ?.toLowerCase()
            .includes(value) ||
          leave.type
            ?.toLowerCase()
            .includes(value) ||
          leave.status
            ?.toLowerCase()
            .includes(value)
        );
      })
      .map((leave) => ({
        key: `leave-${leave.id}`,
        title: `${leave.employee} - ${leave.type}`,
        subtitle: `${leave.id} - ${leave.status}`,
        type: "Leave",
        path: "/leave",
      }));

    const payrollResults = payrollRecords
      .filter((payroll) => {
        return (
          payroll.id
            ?.toLowerCase()
            .includes(value) ||
          payroll.employee
            ?.toLowerCase()
            .includes(value) ||
          payroll.employeeId
            ?.toLowerCase()
            .includes(value) ||
          payroll.department
            ?.toLowerCase()
            .includes(value) ||
          payroll.designation
            ?.toLowerCase()
            .includes(value) ||
          payroll.month
            ?.toLowerCase()
            .includes(value) ||
          payroll.status
            ?.toLowerCase()
            .includes(value)
        );
      })
      .map((payroll) => ({
        key: `payroll-${payroll.id}`,
        title: `${payroll.employee} - Payroll`,
        subtitle: `${payroll.id} - ${payroll.month} - ${payroll.status}`,
        type: "Payroll",
        path: "/payroll",
      }));

    const moduleResults = [
      {
        key: "module-employees",
        title: "Employees",
        subtitle: "Employee Management",
        type: "Module",
        path: "/employees",
        keywords:
          "employee employees staff worker management",
      },
      {
        key: "module-attendance",
        title: "Attendance",
        subtitle: "Attendance Management",
        type: "Module",
        path: "/attendance",
        keywords:
          "attendance punch in punch out present absent working hours",
      },
      {
        key: "module-leave",
        title: "Leave",
        subtitle: "Leave Management",
        type: "Module",
        path: "/leave",
        keywords:
          "leave leaves holiday casual sick earned unpaid pending approved rejected",
      },
      {
        key: "module-payroll",
        title: "Payroll",
        subtitle: "Payroll Management",
        type: "Module",
        path: "/payroll",
        keywords:
          "payroll salary salaries payment payments paid pending basic allowance allowances deduction deductions net salary",
      },
      {
        key: "module-settings",
        title: "Settings",
        subtitle: "Company and HRMS Configuration",
        type: "Settings",
        path: "/settings",
        keywords:
          "settings setting company company profile configuration hrms configuration working hours office start time office end time grace period attendance rules leave settings payroll settings pf esi professional tax",
      },
    ].filter((module) => {
      return (
        module.title
          .toLowerCase()
          .includes(value) ||
        module.subtitle
          .toLowerCase()
          .includes(value) ||
        module.keywords.includes(value)
      );
    });

    return [
      ...moduleResults,
      ...employeeResults,
      ...leaveResults,
      ...payrollResults,
    ].slice(0, 10);
  }, [
    searchTerm,
    employees,
    leaves,
    payrollRecords,
  ]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setShowResults(true);

    loadSearchData();
  };

  const handleResultClick = (path) => {
    setSearchTerm("");
    setShowResults(false);

    navigate(path);
  };

  const getIcon = (type) => {
    if (type === "Employee") {
      return <UserRound size={18} />;
    }

    if (type === "Leave") {
      return <CalendarDays size={18} />;
    }

    if (type === "Payroll") {
      return <WalletCards size={18} />;
    }

    if (type === "Settings") {
      return <SettingsIcon size={18} />;
    }

    return <Clock3 size={18} />;
  };

  return (
    <div
      className="global-search-container"
      ref={searchRef}
    >
      <div className="search-box global-search-box">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search HRMS..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => {
            loadSearchData();

            if (searchTerm.trim()) {
              setShowResults(true);
            }
          }}
        />
      </div>

      {showResults && searchTerm.trim() && (
        <div className="global-search-results">
          {results.length > 0 ? (
            results.map((result) => (
              <button
                type="button"
                className="global-search-result"
                key={result.key}
                onClick={() =>
                  handleResultClick(result.path)
                }
              >
                <div className="global-search-result-icon">
                  {getIcon(result.type)}
                </div>

                <div className="global-search-result-info">
                  <strong>{result.title}</strong>
                  <span>{result.subtitle}</span>
                </div>

                <span className="global-search-result-type">
                  {result.type}
                </span>
              </button>
            ))
          ) : (
            <div className="global-search-empty">
              No results found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;