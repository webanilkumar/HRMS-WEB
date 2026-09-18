const Employee = require("../models/Employee");
const {
  sendNewJoinerEmail,
} = require("../services/emailService");

const runNewJoinerEmailJob = async () => {
  try {
    console.log("Checking new joiners...");

    const employees = await Employee.find({
      status: "Active",
      joiningDate: { $ne: null },
    });

    const today = new Date();

    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const newJoiners = employees.filter((employee) => {
      if (!employee.joiningDate) {
        return false;
      }

      const joiningDate = new Date(employee.joiningDate);

      return (
        joiningDate.getDate() === currentDay &&
        joiningDate.getMonth() === currentMonth &&
        joiningDate.getFullYear() === currentYear
      );
    });

    if (newJoiners.length === 0) {
      console.log("No new joiners today.");

      return {
        success: true,
        count: 0,
      };
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const employee of newJoiners) {
      try {
        if (!employee.email) {
          console.log(
            `Email missing for ${employee.name}`
          );

          failedCount += 1;
          continue;
        }

        await sendNewJoinerEmail(employee);

        console.log(
          `New joiner email sent to ${employee.name} (${employee.email})`
        );

        sentCount += 1;
      } catch (error) {
        console.error(
          `New joiner email failed for ${employee.name}: ${error.message}`
        );

        failedCount += 1;
      }
    }

    console.log(
      `New joiner email job completed. Sent: ${sentCount}, Failed: ${failedCount}`
    );

    return {
      success: true,
      count: newJoiners.length,
      sentCount,
      failedCount,
    };
  } catch (error) {
    console.error(
      `New joiner email job failed: ${error.message}`
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  runNewJoinerEmailJob,
};
