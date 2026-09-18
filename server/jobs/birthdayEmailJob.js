const Employee = require("../models/Employee");
const {
  sendBirthdayEmail,
} = require("../services/emailService");

const runBirthdayEmailJob = async () => {
  try {
    console.log("Checking employee birthdays...");

    const employees = await Employee.find({
      status: "Active",
      dateOfBirth: { $ne: null },
    });

    const today = new Date();

    const currentDay = today.getDate();
    const currentMonth = today.getMonth();

    const birthdayEmployees = employees.filter(
      (employee) => {
        if (!employee.dateOfBirth) {
          return false;
        }

        const dob = new Date(employee.dateOfBirth);

        return (
          dob.getDate() === currentDay &&
          dob.getMonth() === currentMonth
        );
      }
    );

    if (birthdayEmployees.length === 0) {
      console.log("No employee birthdays today.");

      return {
        success: true,
        count: 0,
      };
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const employee of birthdayEmployees) {
      try {
        if (!employee.email) {
          console.log(
            `Email missing for ${employee.name}`
          );

          failedCount += 1;
          continue;
        }

        await sendBirthdayEmail(employee);

        console.log(
          `Birthday email sent to ${employee.name} (${employee.email})`
        );

        sentCount += 1;
      } catch (error) {
        console.error(
          `Birthday email failed for ${employee.name}: ${error.message}`
        );

        failedCount += 1;
      }
    }

    console.log(
      `Birthday email job completed. Sent: ${sentCount}, Failed: ${failedCount}`
    );

    return {
      success: true,
      count: birthdayEmployees.length,
      sentCount,
      failedCount,
    };
  } catch (error) {
    console.error(
      `Birthday email job failed: ${error.message}`
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  runBirthdayEmailJob,
};
