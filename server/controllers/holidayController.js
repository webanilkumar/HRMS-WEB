const Holiday = require("../models/Holiday");

const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({
      date: 1,
    });

    res.status(200).json({
      success: true,
      count: holidays.length,
      data: holidays,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch holidays",
      error: error.message,
    });
  }
};

const createHoliday = async (req, res) => {
  try {
    const {
      name,
      date,
      type,
      description,
      status,
    } = req.body;

    if (!name || !date) {
      return res.status(400).json({
        success: false,
        message: "Holiday name and date are required",
      });
    }

    const existingHoliday = await Holiday.findOne({
      date: new Date(date),
    });

    if (existingHoliday) {
      return res.status(400).json({
        success: false,
        message:
          "A holiday already exists on this date",
      });
    }

    const holiday = await Holiday.create({
      name: name.trim(),
      date,
      type: type || "Public Holiday",
      description: description?.trim() || "",
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Holiday created successfully",
      data: holiday,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create holiday",
      error: error.message,
    });
  }
};

const updateHoliday = async (req, res) => {
  try {
    const {
      name,
      date,
      type,
      description,
      status,
    } = req.body;

    const holiday = await Holiday.findById(
      req.params.id
    );

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    if (date !== undefined) {
      const duplicateHoliday =
        await Holiday.findOne({
          date: new Date(date),
          _id: { $ne: holiday._id },
        });

      if (duplicateHoliday) {
        return res.status(400).json({
          success: false,
          message:
            "A holiday already exists on this date",
        });
      }

      holiday.date = date;
    }

    if (name !== undefined) {
      holiday.name = name.trim();
    }

    if (type !== undefined) {
      holiday.type = type;
    }

    if (description !== undefined) {
      holiday.description = description.trim();
    }

    if (status !== undefined) {
      holiday.status = status;
    }

    await holiday.save();

    res.status(200).json({
      success: true,
      message: "Holiday updated successfully",
      data: holiday,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update holiday",
      error: error.message,
    });
  }
};

const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(
      req.params.id
    );

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    await holiday.deleteOne();

    res.status(200).json({
      success: true,
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete holiday",
      error: error.message,
    });
  }
};

module.exports = {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
};