const Performance = require("../models/Performance");
const Employee = require("../models/Employee");

const getPerformanceReviews = async (req, res) => {
  try {
    const reviews = await Performance.find()
      .populate(
        "employee",
        "employeeId name email department designation"
      )
      .populate(
        "reviewedBy",
        "name email role"
      )
      .sort({
        reviewDate: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch performance reviews",
      error: error.message,
    });
  }
};

const getPerformanceByEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(
      req.params.employeeId
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const reviews = await Performance.find({
      employee: req.params.employeeId,
    })
      .populate(
        "employee",
        "employeeId name email department designation"
      )
      .populate(
        "reviewedBy",
        "name email role"
      )
      .sort({
        reviewDate: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee performance",
      error: error.message,
    });
  }
};

const createPerformanceReview = async (req, res) => {
  try {
    const {
      employee,
      reviewPeriod,
      reviewDate,
      overallRating,
      goals,
      achievements,
      strengths,
      improvementAreas,
      feedback,
      status,
    } = req.body;

    if (
      !employee ||
      !reviewPeriod ||
      !reviewDate ||
      !overallRating
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Employee, review period, review date and overall rating are required",
      });
    }

    const existingEmployee = await Employee.findById(
      employee
    );

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const rating = Number(overallRating);

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message:
          "Overall rating must be between 1 and 5",
      });
    }

    const review = await Performance.create({
      employee,
      reviewPeriod: reviewPeriod.trim(),
      reviewDate,
      overallRating: rating,
      goals: goals?.trim() || "",
      achievements: achievements?.trim() || "",
      strengths: strengths?.trim() || "",
      improvementAreas:
        improvementAreas?.trim() || "",
      feedback: feedback?.trim() || "",
      status: status || "Draft",
      reviewedBy: req.user._id,
    });

    const populatedReview =
      await Performance.findById(review._id)
        .populate(
          "employee",
          "employeeId name email department designation"
        )
        .populate(
          "reviewedBy",
          "name email role"
        );

    res.status(201).json({
      success: true,
      message:
        "Performance review created successfully",
      data: populatedReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to create performance review",
      error: error.message,
    });
  }
};

const updatePerformanceReview = async (req, res) => {
  try {
    const {
      employee,
      reviewPeriod,
      reviewDate,
      overallRating,
      goals,
      achievements,
      strengths,
      improvementAreas,
      feedback,
      status,
    } = req.body;

    const review = await Performance.findById(
      req.params.id
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Performance review not found",
      });
    }

    if (employee !== undefined) {
      const existingEmployee = await Employee.findById(
        employee
      );

      if (!existingEmployee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      review.employee = employee;
    }

    if (reviewPeriod !== undefined) {
      review.reviewPeriod = reviewPeriod.trim();
    }

    if (reviewDate !== undefined) {
      review.reviewDate = reviewDate;
    }

    if (overallRating !== undefined) {
      const rating = Number(overallRating);

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message:
            "Overall rating must be between 1 and 5",
        });
      }

      review.overallRating = rating;
    }

    if (goals !== undefined) {
      review.goals = goals.trim();
    }

    if (achievements !== undefined) {
      review.achievements = achievements.trim();
    }

    if (strengths !== undefined) {
      review.strengths = strengths.trim();
    }

    if (improvementAreas !== undefined) {
      review.improvementAreas =
        improvementAreas.trim();
    }

    if (feedback !== undefined) {
      review.feedback = feedback.trim();
    }

    if (status !== undefined) {
      review.status = status;
    }

    await review.save();

    const populatedReview =
      await Performance.findById(review._id)
        .populate(
          "employee",
          "employeeId name email department designation"
        )
        .populate(
          "reviewedBy",
          "name email role"
        );

    res.status(200).json({
      success: true,
      message:
        "Performance review updated successfully",
      data: populatedReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to update performance review",
      error: error.message,
    });
  }
};

const deletePerformanceReview = async (req, res) => {
  try {
    const review = await Performance.findById(
      req.params.id
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Performance review not found",
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Performance review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to delete performance review",
      error: error.message,
    });
  }
};

module.exports = {
  getPerformanceReviews,
  getPerformanceByEmployee,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
};