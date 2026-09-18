const express = require("express");

const {
  getPerformanceReviews,
  getPerformanceByEmployee,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
} = require("../controllers/performanceController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin, HR and Employee can view performance reviews
router.get(
  "/",
  protect,
  authorize("Admin", "HR", "Employee"),
  getPerformanceReviews
);

// View performance reviews of a particular employee
router.get(
  "/employee/:employeeId",
  protect,
  authorize("Admin", "HR", "Employee"),
  getPerformanceByEmployee
);

// Admin and HR can create performance reviews
router.post(
  "/",
  protect,
  authorize("Admin", "HR"),
  createPerformanceReview
);

// Admin and HR can update performance reviews
router.put(
  "/:id",
  protect,
  authorize("Admin", "HR"),
  updatePerformanceReview
);

// Only Admin can delete performance reviews
router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deletePerformanceReview
);

module.exports = router;