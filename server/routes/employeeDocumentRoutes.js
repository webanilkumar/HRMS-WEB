const express = require("express");

const {
  getEmployeeDocuments,
  getDocumentsByEmployee,
  createEmployeeDocument,
  updateEmployeeDocument,
  deleteEmployeeDocument,
} = require("../controllers/employeeDocumentController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin, HR and Employee can view documents
router.get(
  "/",
  protect,
  authorize("Admin", "HR", "Employee"),
  getEmployeeDocuments
);

// View documents of a particular employee
router.get(
  "/employee/:employeeId",
  protect,
  authorize("Admin", "HR", "Employee"),
  getDocumentsByEmployee
);

// Admin and HR can create employee documents
router.post(
  "/",
  protect,
  authorize("Admin", "HR"),
  createEmployeeDocument
);

// Admin and HR can update employee documents
router.put(
  "/:id",
  protect,
  authorize("Admin", "HR"),
  updateEmployeeDocument
);

// Only Admin can delete employee documents
router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteEmployeeDocument
);

module.exports = router;