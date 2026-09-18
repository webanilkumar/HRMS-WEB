const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    reviewPeriod: {
      type: String,
      required: true,
      trim: true,
    },

    reviewDate: {
      type: Date,
      required: true,
    },

    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    goals: {
      type: String,
      default: "",
      trim: true,
    },

    achievements: {
      type: String,
      default: "",
      trim: true,
    },

    strengths: {
      type: String,
      default: "",
      trim: true,
    },

    improvementAreas: {
      type: String,
      default: "",
      trim: true,
    },

    feedback: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Draft", "Completed"],
      default: "Draft",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Performance = mongoose.model(
  "Performance",
  performanceSchema
);

module.exports = Performance;