const EmployeeDocument = require("../models/EmployeeDocument");
const Employee = require("../models/Employee");

const getEmployeeDocuments = async (req, res) => {
  try {
    const documents = await EmployeeDocument.find()
      .populate("employee", "employeeId name email department designation")
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee documents",
      error: error.message,
    });
  }
};

const getDocumentsByEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const documents = await EmployeeDocument.find({
      employee: req.params.employeeId,
    })
      .populate("employee", "employeeId name email department designation")
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee documents",
      error: error.message,
    });
  }
};

const createEmployeeDocument = async (req, res) => {
  try {
    const {
      employee,
      documentType,
      documentName,
      documentNumber,
      fileUrl,
      issueDate,
      expiryDate,
      status,
      remarks,
    } = req.body;

    if (!employee || !documentType || !documentName) {
      return res.status(400).json({
        success: false,
        message:
          "Employee, document type and document name are required",
      });
    }

    const existingEmployee = await Employee.findById(employee);

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const document = await EmployeeDocument.create({
      employee,
      documentType,
      documentName: documentName.trim(),
      documentNumber: documentNumber?.trim() || "",
      fileUrl: fileUrl?.trim() || "",
      issueDate: issueDate || null,
      expiryDate: expiryDate || null,
      status: status || "Active",
      remarks: remarks?.trim() || "",
      uploadedBy: req.user._id,
    });

    const populatedDocument = await EmployeeDocument.findById(document._id)
      .populate("employee", "employeeId name email department designation")
      .populate("uploadedBy", "name email role");

    res.status(201).json({
      success: true,
      message: "Employee document created successfully",
      data: populatedDocument,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create employee document",
      error: error.message,
    });
  }
};

const updateEmployeeDocument = async (req, res) => {
  try {
    const {
      employee,
      documentType,
      documentName,
      documentNumber,
      fileUrl,
      issueDate,
      expiryDate,
      status,
      remarks,
    } = req.body;

    const document = await EmployeeDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Employee document not found",
      });
    }

    if (employee !== undefined) {
      const existingEmployee = await Employee.findById(employee);

      if (!existingEmployee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      document.employee = employee;
    }

    if (documentType !== undefined) {
      document.documentType = documentType;
    }

    if (documentName !== undefined) {
      document.documentName = documentName.trim();
    }

    if (documentNumber !== undefined) {
      document.documentNumber = documentNumber.trim();
    }

    if (fileUrl !== undefined) {
      document.fileUrl = fileUrl.trim();
    }

    if (issueDate !== undefined) {
      document.issueDate = issueDate || null;
    }

    if (expiryDate !== undefined) {
      document.expiryDate = expiryDate || null;
    }

    if (status !== undefined) {
      document.status = status;
    }

    if (remarks !== undefined) {
      document.remarks = remarks.trim();
    }

    await document.save();

    const populatedDocument = await EmployeeDocument.findById(document._id)
      .populate("employee", "employeeId name email department designation")
      .populate("uploadedBy", "name email role");

    res.status(200).json({
      success: true,
      message: "Employee document updated successfully",
      data: populatedDocument,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update employee document",
      error: error.message,
    });
  }
};

const deleteEmployeeDocument = async (req, res) => {
  try {
    const document = await EmployeeDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Employee document not found",
      });
    }

    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: "Employee document deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete employee document",
      error: error.message,
    });
  }
};

module.exports = {
  getEmployeeDocuments,
  getDocumentsByEmployee,
  createEmployeeDocument,
  updateEmployeeDocument,
  deleteEmployeeDocument,
};