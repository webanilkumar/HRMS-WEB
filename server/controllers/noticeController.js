const Notice = require("../models/Notice");

const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("createdBy", "name email role")
      .sort({
        priority: -1,
        publishDate: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notices",
      error: error.message,
    });
  }
};

const createNotice = async (req, res) => {
  try {
    const {
      title,
      message,
      category,
      priority,
      publishDate,
      expiryDate,
      status,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const notice = await Notice.create({
      title: title.trim(),
      message: message.trim(),
      category: category || "General",
      priority: priority || "Medium",
      publishDate: publishDate || new Date(),
      expiryDate: expiryDate || null,
      status: status || "Active",
      createdBy: req.user._id,
    });

    const populatedNotice =
      await Notice.findById(notice._id).populate(
        "createdBy",
        "name email role"
      );

    res.status(201).json({
      success: true,
      message: "Notice created successfully",
      data: populatedNotice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create notice",
      error: error.message,
    });
  }
};

const updateNotice = async (req, res) => {
  try {
    const {
      title,
      message,
      category,
      priority,
      publishDate,
      expiryDate,
      status,
    } = req.body;

    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    if (title !== undefined) {
      notice.title = title.trim();
    }

    if (message !== undefined) {
      notice.message = message.trim();
    }

    if (category !== undefined) {
      notice.category = category;
    }

    if (priority !== undefined) {
      notice.priority = priority;
    }

    if (publishDate !== undefined) {
      notice.publishDate = publishDate;
    }

    if (expiryDate !== undefined) {
      notice.expiryDate = expiryDate || null;
    }

    if (status !== undefined) {
      notice.status = status;
    }

    await notice.save();

    const populatedNotice =
      await Notice.findById(notice._id).populate(
        "createdBy",
        "name email role"
      );

    res.status(200).json({
      success: true,
      message: "Notice updated successfully",
      data: populatedNotice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update notice",
      error: error.message,
    });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    await notice.deleteOne();

    res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete notice",
      error: error.message,
    });
  }
};

module.exports = {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
};