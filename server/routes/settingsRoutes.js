const express = require("express");

const {
  getSettings,
  updateSettings,
  resetSettings,
} = require("../controllers/settingsController");

const router = express.Router();

router.get("/", getSettings);
router.put("/", updateSettings);
router.post("/reset", resetSettings);

module.exports = router;