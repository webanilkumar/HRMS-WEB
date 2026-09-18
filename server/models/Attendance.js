const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },

    employee: {
      type: String,
      required: true,
      trim: true,
    },

    attendanceDate: {
      type: String,
      required: true,
      trim: true,
    },

    punchIn: {
      type: Date,
      default: null,
    },

    punchOut: {
      type: Date,
      default: null,
    },

    totalWorkingMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "Not Punched In",
        "Punched In",
        "Punched Out",
        "Present",
        "Absent",
        "Late",
        "Half Day",
        "Leave",
      ],
      default: "Not Punched In",
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  {
    employeeId: 1,
    attendanceDate: 1,
  },
  {
    unique: true,
  }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;