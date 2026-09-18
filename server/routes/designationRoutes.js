const express = require("express");

const {
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} = require("../controllers/designationController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("Admin", "HR"),
  getDesignations
);

router.post(
  "/",
  protect,
  authorize("Admin", "HR"),
  createDesignation
);

router.put(
  "/:id",
  protect,
  authorize("Admin", "HR"),
  updateDesignation
);

router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteDesignation
);

module.exports = router;