const Attendance = require("../models/Attendance");

// Get all attendance records
const getAttendances = async (req, res) => {
  try {
    const attendances = await Attendance.find().sort({
      attendanceDate: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: attendances.length,
      attendances,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
      error: error.message,
    });
  }
};

// Get today's attendance for one employee
const getTodayAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Attendance date is required",
      });
    }

    const attendance = await Attendance.findOne({
      employeeId,
      attendanceDate: date,
    });

    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch today's attendance",
      error: error.message,
    });
  }
};

// Punch In
const punchIn = async (req, res) => {
  try {
    const {
      employeeId,
      employee,
      attendanceDate,
    } = req.body;

    if (!employeeId || !employee || !attendanceDate) {
      return res.status(400).json({
        success: false,
        message:
          "Employee ID, employee name and attendance date are required",
      });
    }

    const existingAttendance = await Attendance.findOne({
      employeeId,
      attendanceDate,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Punch In already completed for today",
      });
    }

    const attendance = await Attendance.create({
      employeeId,
      employee,
      attendanceDate,
      punchIn: new Date(),
      punchOut: null,
      totalWorkingMinutes: 0,
      status: "Punched In",
    });

    res.status(201).json({
      success: true,
      message: "Punch In successful",
      attendance,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Punch In failed",
      error: error.message,
    });
  }
};

// Punch Out
const punchOut = async (req, res) => {
  try {
    const { employeeId, attendanceDate } = req.body;

    if (!employeeId || !attendanceDate) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and attendance date are required",
      });
    }

    const attendance = await Attendance.findOne({
      employeeId,
      attendanceDate,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Punch In record not found for today",
      });
    }

    if (!attendance.punchIn) {
      return res.status(400).json({
        success: false,
        message: "Please Punch In first",
      });
    }

    if (attendance.punchOut) {
      return res.status(400).json({
        success: false,
        message: "Punch Out already completed for today",
      });
    }

    const punchOutTime = new Date();
    const punchInTime = new Date(attendance.punchIn);

    const totalWorkingMinutes = Math.max(
      0,
      Math.floor((punchOutTime - punchInTime) / (1000 * 60))
    );

    attendance.punchOut = punchOutTime;
    attendance.totalWorkingMinutes = totalWorkingMinutes;
    attendance.status = "Punched Out";

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Punch Out successful",
      attendance,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Punch Out failed",
      error: error.message,
    });
  }
};

// Delete attendance record
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete attendance record",
      error: error.message,
    });
  }
};

module.exports = {
  getAttendances,
  getTodayAttendance,
  punchIn,
  punchOut,
  deleteAttendance,
};