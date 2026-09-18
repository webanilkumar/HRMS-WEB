const express = require("express");

const {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin, HR and Employee can view notices
router.get(
  "/",
  protect,
  authorize("Admin", "HR", "Employee"),
  getNotices
);

// Admin and HR can create notices
router.post(
  "/",
  protect,
  authorize("Admin", "HR"),
  createNotice
);

// Admin and HR can edit notices
router.put(
  "/:id",
  protect,
  authorize("Admin", "HR"),
  updateNotice
);

// Only Admin can delete notices
router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteNotice
);

module.exports = router;