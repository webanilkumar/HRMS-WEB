const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const employeeRoutes = require("./routes/employeeRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const designationRoutes = require("./routes/designationRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const employeeDocumentRoutes = require("./routes/employeeDocumentRoutes");
const performanceRoutes = require("./routes/performanceRoutes");

const app = express();

app.use(cors());
app.use(express.json());

let mongoConnectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        console.log("MongoDB connected successfully");
      })
      .catch((error) => {
        mongoConnectionPromise = null;
        throw error;
      });
  }

  await mongoConnectionPromise;
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HRMS Backend API is running successfully",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    message: "HRMS server is healthy",
  });
});

app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payrolls", payrollRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/employee-documents", employeeDocumentRoutes);
app.use("/api/performance", performanceRoutes);

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`HRMS server running on port ${PORT}`);
  });
}

module.exports = app;
