const express = require("express");

const {
  getAttendances,
  getTodayAttendance,
  punchIn,
  punchOut,
  deleteAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

router.get("/", getAttendances);
router.get("/today/:employeeId", getTodayAttendance);
router.post("/punch-in", punchIn);
router.put("/punch-out", punchOut);
router.delete("/:id", deleteAttendance);

module.exports = router;