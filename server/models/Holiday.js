const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "National Holiday",
        "Public Holiday",
        "Company Holiday",
        "Optional Holiday",
      ],
      default: "Public Holiday",
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

const Holiday = mongoose.model(
  "Holiday",
  holidaySchema
);

module.exports = Holiday;