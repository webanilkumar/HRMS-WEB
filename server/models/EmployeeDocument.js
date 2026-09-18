const mongoose = require("mongoose");

const employeeDocumentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    documentType: {
      type: String,
      required: true,
      enum: [
        "Aadhaar",
        "PAN",
        "Resume",
        "Offer Letter",
        "Appointment Letter",
        "Experience Letter",
        "Education Certificate",
        "Other",
      ],
    },

    documentName: {
      type: String,
      required: true,
      trim: true,
    },

    documentNumber: {
      type: String,
      default: "",
      trim: true,
    },

    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },

    issueDate: {
      type: Date,
      default: null,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Active", "Expired", "Pending"],
      default: "Active",
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const EmployeeDocument = mongoose.model(
  "EmployeeDocument",
  employeeDocumentSchema
);

module.exports = EmployeeDocument;