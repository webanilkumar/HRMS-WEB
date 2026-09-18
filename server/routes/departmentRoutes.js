const express = require("express");

const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("Admin", "HR"),
  getDepartments
);

router.post(
  "/",
  protect,
  authorize("Admin", "HR"),
  createDepartment
);

router.put(
  "/:id",
  protect,
  authorize("Admin", "HR"),
  updateDepartment
);

router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteDepartment
);

module.exports = router;