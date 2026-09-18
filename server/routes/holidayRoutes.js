const express = require("express");

const {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} = require("../controllers/holidayController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("Admin", "HR", "Employee"),
  getHolidays
);

router.post(
  "/",
  protect,
  authorize("Admin", "HR"),
  createHoliday
);

router.put(
  "/:id",
  protect,
  authorize("Admin", "HR"),
  updateHoliday
);

router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteHoliday
);

module.exports = router;