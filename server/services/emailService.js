const nodemailer = require("nodemailer");
const path = require("path");

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error(
      "Email configuration missing. Please add EMAIL_USER and EMAIL_APP_PASSWORD in .env"
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

const sendEmail = async ({
  to,
  subject,
  text,
  html,
  attachments = [],
}) => {
  try {
    if (!to) {
      throw new Error("Recipient email is required");
    }

    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"HRMS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });

    console.log(`Email sent successfully to ${to}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`Email sending failed: ${error.message}`);
    throw error;
  }
};

const sendBirthdayEmail = async (employee) => {
  const employeeName =
    employee.name || employee.fullName || "Employee";

  const birthdayBannerPath = path.join(
    __dirname,
    "..",
    "assets",
    "birthday-banner.png"
  );

  return sendEmail({
    to: employee.email,
    subject: `Happy Birthday ${employeeName}!`,
    text: `Happy Birthday ${employeeName}! Wishing you a wonderful year ahead.`,

    html: `
      <div style="
        max-width:700px;
        margin:auto;
        font-family:Arial,sans-serif;
        background:#ffffff;
        border-radius:12px;
        overflow:hidden;
      ">

        <img
          src="cid:birthday-banner"
          alt="Happy Birthday"
          style="
            width:100%;
            max-width:700px;
            height:auto;
            display:block;
          "
        />

        <div style="
          padding:25px;
          text-align:center;
          line-height:1.6;
        ">

          <h2 style="margin-bottom:10px;">
            Happy Birthday ${employeeName}! ??
          </h2>

          <p>
            Wishing you a very Happy Birthday and a wonderful year ahead.
          </p>

          <p>
            May your special day bring you happiness,
            success and good health.
          </p>

          <br />

          <p>
            Best Wishes,<br />
            <strong>HRMS Team</strong>
          </p>

        </div>

      </div>
    `,

    attachments: [
      {
        filename: "birthday-banner.png",
        path: birthdayBannerPath,
        cid: "birthday-banner",
      },
    ],
  });
};

const sendNewJoinerEmail = async (employee) => {
  const employeeName =
    employee.name || employee.fullName || "Employee";

  const employeePhotoPath = path.join(
    __dirname,
    "..",
    "Assets",
    "aarav-profile.jpg"
  );

  return sendEmail({
    to: employee.email,
    subject: `Welcome to the Team, ${employeeName}!`,
    text: `Welcome to the team, ${employeeName}! We are excited to have you with us.`,

    html: `
      <div style="
        max-width:600px;
        margin:auto;
        font-family:Arial,sans-serif;
        text-align:center;
        padding:30px;
        background:#ffffff;
        border-radius:15px;
      ">

        <h1 style="color:#1d4ed8;">
          Welcome to the Team! ??
        </h1>

        <img
          src="cid:employee-profile-photo"
          alt="${employeeName}"
          width="160"
          height="160"
          style="
            width:160px;
            height:160px;
            border-radius:50%;
            object-fit:cover;
            border:5px solid #2563eb;
            margin:15px 0;
          "
        />

        <h2>${employeeName}</h2>

        <p style="
          font-size:16px;
          line-height:1.7;
        ">
          We are delighted to welcome you to our team.
        </p>

        <p style="
          font-size:16px;
          line-height:1.7;
        ">
          We hope you have a successful and rewarding
          journey with the organization.
        </p>

        <p style="font-size:16px;">
          We are excited to have you with us! ??
        </p>

        <br />

        <p>
          Best Wishes,<br />
          <strong>HRMS Team</strong>
        </p>

      </div>
    `,

    attachments: [
      {
        filename: "aarav-profile.jpg",
        path: employeePhotoPath,
        cid: "employee-profile-photo",
      },
    ],
  });
};
const sendWorkAnniversaryEmail = async (employee, years) => {
  const employeeName =
    employee.name || employee.fullName || "Employee";

  return sendEmail({
    to: employee.email,
    subject: `Happy Work Anniversary ${employeeName}!`,
    text: `Happy Work Anniversary ${employeeName}! Thank you for your contribution and dedication.`,

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;">

        <h2>
          Happy Work Anniversary ${employeeName}!
        </h2>

        <p>
          Congratulations on your work anniversary!
        </p>

        ${
          years
            ? `<p>
                Thank you for completing
                <strong>${years} year(s)</strong>
                with the organization.
               </p>`
            : ""
        }

        <p>
          Thank you for your hard work,
          dedication and valuable contribution to the team.
        </p>

        <br />

        <p>
          Best Wishes,<br />
          <strong>HRMS Team</strong>
        </p>

      </div>
    `,
  });
};

const verifyEmailConnection = async () => {
  try {
    const transporter = createTransporter();

    await transporter.verify();

    console.log(
      "Email server connection verified successfully"
    );

    return true;
  } catch (error) {
    console.error(
      `Email server verification failed: ${error.message}`
    );

    return false;
  }
};

module.exports = {
  sendEmail,
  sendBirthdayEmail,
  sendNewJoinerEmail,
  sendWorkAnniversaryEmail,
  verifyEmailConnection,
};

