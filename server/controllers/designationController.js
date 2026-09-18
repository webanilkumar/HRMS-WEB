const Designation = require("../models/Designation");
const Department = require("../models/Department");

const getDesignations = async (req, res) => {
  try {
    const designations = await Designation.find()
      .populate("department", "name code status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: designations.length,
      data: designations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch designations",
      error: error.message,
    });
  }
};

const createDesignation = async (req, res) => {
  try {
    const {
      name,
      code,
      department,
      description,
      status,
    } = req.body;

    if (!name?.trim() || !code?.trim() || !department) {
      return res.status(400).json({
        success: false,
        message:
          "Designation name, code and department are required",
      });
    }

    const departmentExists = await Department.findById(
      department
    );

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (departmentExists.status !== "Active") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot create a designation under an inactive department",
      });
    }

    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase();

    const existingDesignation = await Designation.findOne({
      $or: [
        { code: cleanCode },
        {
          name: {
            $regex: `^${escapeRegex(cleanName)}$`,
            $options: "i",
          },
          department,
        },
      ],
    });

    if (existingDesignation) {
      return res.status(400).json({
        success: false,
        message:
          "Designation with this code or name already exists",
      });
    }

    const designation = await Designation.create({
      name: cleanName,
      code: cleanCode,
      department,
      description: description?.trim() || "",
      status: status || "Active",
    });

    const populatedDesignation =
      await Designation.findById(designation._id).populate(
        "department",
        "name code status"
      );

    res.status(201).json({
      success: true,
      message: "Designation created successfully",
      data: populatedDesignation,
    });
  } catch (error) {
    handleDesignationError(
      res,
      error,
      "Failed to create designation"
    );
  }
};

const updateDesignation = async (req, res) => {
  try {
    const {
      name,
      code,
      department,
      description,
      status,
    } = req.body;

    const designation = await Designation.findById(
      req.params.id
    );

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Designation name cannot be empty",
      });
    }

    if (code !== undefined && !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Designation code cannot be empty",
      });
    }

    const targetDepartment =
      department !== undefined
        ? department
        : designation.department;

    const departmentExists = await Department.findById(
      targetDepartment
    );

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (
      departmentExists.status !== "Active" &&
      status !== "Inactive"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "An active designation cannot belong to an inactive department",
      });
    }

    const cleanName =
      name !== undefined ? name.trim() : designation.name;

    const cleanCode =
      code !== undefined
        ? code.trim().toUpperCase()
        : designation.code;

    const duplicateDesignation =
      await Designation.findOne({
        _id: { $ne: designation._id },
        $or: [
          { code: cleanCode },
          {
            name: {
              $regex: `^${escapeRegex(cleanName)}$`,
              $options: "i",
            },
            department: targetDepartment,
          },
        ],
      });

    if (duplicateDesignation) {
      return res.status(400).json({
        success: false,
        message:
          "Another designation with this code or name already exists",
      });
    }

    designation.name = cleanName;
    designation.code = cleanCode;
    designation.department = targetDepartment;

    if (description !== undefined) {
      designation.description = description.trim();
    }

    if (status !== undefined) {
      designation.status = status;
    }

    await designation.save();

    const populatedDesignation =
      await Designation.findById(
        designation._id
      ).populate("department", "name code status");

    res.status(200).json({
      success: true,
      message: "Designation updated successfully",
      data: populatedDesignation,
    });
  } catch (error) {
    handleDesignationError(
      res,
      error,
      "Failed to update designation"
    );
  }
};

const deleteDesignation = async (req, res) => {
  try {
    const designation = await Designation.findById(
      req.params.id
    );

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    await designation.deleteOne();

    res.status(200).json({
      success: true,
      message: "Designation deleted successfully",
    });
  } catch (error) {
    handleDesignationError(
      res,
      error,
      "Failed to delete designation"
    );
  }
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const handleDesignationError = (
  res,
  error,
  fallbackMessage
) => {
  if (error?.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Designation code already exists",
    });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid designation or department ID",
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
    error: error.message,
  });
};

module.exports = {
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
};