const express = require("express");

const {
  getLeaves,
  getLeaveById,
  createLeave,
  updateLeave,
  deleteLeave,
} = require("../controllers/leaveController");

const router = express.Router();

router.get("/", getLeaves);
router.get("/:id", getLeaveById);
router.post("/", createLeave);
router.put("/:id", updateLeave);
router.delete("/:id", deleteLeave);

module.exports = router;