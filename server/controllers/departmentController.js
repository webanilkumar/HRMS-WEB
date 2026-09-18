const Department = require("../models/Department");
const Designation = require("../models/Designation");

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;

    if (!name?.trim() || !code?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department name and code are required",
      });
    }

    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase();

    const existingDepartment = await Department.findOne({
      $or: [
        { name: { $regex: `^${escapeRegex(cleanName)}$`, $options: "i" } },
        { code: cleanCode },
      ],
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message:
          "Department with this name or code already exists",
      });
    }

    const department = await Department.create({
      name: cleanName,
      code: cleanCode,
      description: description?.trim() || "",
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    handleDepartmentError(
      res,
      error,
      "Failed to create department"
    );
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department name cannot be empty",
      });
    }

    if (code !== undefined && !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department code cannot be empty",
      });
    }

    const cleanName =
      name !== undefined ? name.trim() : department.name;

    const cleanCode =
      code !== undefined
        ? code.trim().toUpperCase()
        : department.code;

    const duplicateDepartment = await Department.findOne({
      _id: { $ne: department._id },
      $or: [
        {
          name: {
            $regex: `^${escapeRegex(cleanName)}$`,
            $options: "i",
          },
        },
        { code: cleanCode },
      ],
    });

    if (duplicateDepartment) {
      return res.status(400).json({
        success: false,
        message:
          "Another department with this name or code already exists",
      });
    }

    department.name = cleanName;
    department.code = cleanCode;

    if (description !== undefined) {
      department.description = description.trim();
    }

    if (status !== undefined) {
      department.status = status;
    }

    await department.save();

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    handleDepartmentError(
      res,
      error,
      "Failed to update department"
    );
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const designationCount = await Designation.countDocuments({
      department: department._id,
    });

    if (designationCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete this department because designations are assigned to it. Delete or move those designations first.",
      });
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    handleDepartmentError(
      res,
      error,
      "Failed to delete department"
    );
  }
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const handleDepartmentError = (res, error, fallbackMessage) => {
  if (error?.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Department name or code already exists",
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
    error: error.message,
  });
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};