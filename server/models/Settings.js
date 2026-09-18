const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    companyProfile: {
      companyName: {
        type: String,
        default: "HRMS",
        trim: true,
      },
      companyEmail: {
        type: String,
        default: "",
        trim: true,
      },
      companyPhone: {
        type: String,
        default: "",
        trim: true,
      },
      companyAddress: {
        type: String,
        default: "",
        trim: true,
      },
    },

    workingHours: {
      workingHoursPerDay: {
        type: Number,
        default: 8,
        min: 1,
        max: 24,
      },
      gracePeriodMinutes: {
        type: Number,
        default: 15,
        min: 0,
      },
      officeStartTime: {
        type: String,
        default: "09:30",
      },
      officeEndTime: {
        type: String,
        default: "18:30",
      },
    },

    attendanceRules: {
      allowLatePunch: {
        type: Boolean,
        default: true,
      },
      allowEarlyPunchOut: {
        type: Boolean,
        default: true,
      },
      attendanceRemarkRequired: {
        type: Boolean,
        default: false,
      },
    },

    leaveSettings: {
      casualLeavePerYear: {
        type: Number,
        default: 12,
        min: 0,
      },
      sickLeavePerYear: {
        type: Number,
        default: 12,
        min: 0,
      },
      earnedLeavePerYear: {
        type: Number,
        default: 15,
        min: 0,
      },
    },

    payrollSettings: {
      payrollProcessingDay: {
        type: Number,
        default: 30,
        min: 1,
        max: 31,
      },
      providentFundEnabled: {
        type: Boolean,
        default: true,
      },
      esiEnabled: {
        type: Boolean,
        default: true,
      },
      professionalTaxEnabled: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

module.exports = Settings;