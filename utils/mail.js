const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
// Create the transport object outside the function
const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_FOR_CLIENT,
    pass: process.env.EMAIL_GENERATED_PASSWORD,
  },
  // Additional options:
  tls: {
    rejectUnauthorized: true,
  },
  pool: true, // Enable connection pooling for reusing connections (improves performance)
  maxConnections: 25, // Maximum number of parallel connections to the server
  maxMessages: 1000, // Maximum number of messages to send per connection
});

// Inside the function, use the transport object to send emails
exports.sendOTP = async (options) => {
  try {
    const templatePath = path.join(__dirname, "../public/otp.html");

    const otpTemplate = fs.readFileSync(templatePath, "utf-8");

    // Replace the placeholder {{otp}} with the actual OTP value
    const emailContent = otpTemplate.replace(/{{otp}}|{{name}}/g, (match) => {
      return match === "{{otp}}" ? options.OTP : options.username;
    });

    const mailOptions = {
      from: process.env.EMAIL_FOR_CLIENT,
      to: options.email,
      subject: "OTP verification",
      html: emailContent, // Use "html" instead of "text" for HTML content
    };

    await transport.sendMail(mailOptions);
    console.log("OTP email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

exports.replySubmittedTool = async (options) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../public/emails/submission.html"
    );

    const Template = fs.readFileSync(templatePath, "utf-8");

    // Replace the placeholder {{tool}} with the actual Tool name
    const emailContent = Template.replace(/{{name}}|{{tool}}/g, (match) => {
      return match === "{{tool}}" ? options.title : options.username;
    });

    const mailOptions = {
      from: process.env.EMAIL_FOR_CLIENT,
      to: options.email,
      subject: "Tool Submission on Toolplate!",
      html: emailContent, // Use "html" instead of "text" for HTML content
    };

    await transport.sendMail(mailOptions);
    console.log("Email for Submission reply sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

exports.initialPitch = async (options) => {
  try {
    const templatePath = path.join(__dirname, "../public/emails/initial.html");

    const Template = fs.readFileSync(templatePath, "utf-8");

    // Replace the placeholder {{tool}} with the actual Tool name
    const emailContent = Template.replace(/{{name}}|{{tool}}/g, (match) => {
      return match === "{{tool}}" ? options.tool : options.username;
    });

    const mailOptions = {
      from: process.env.EMAIL_FOR_CLIENT,
      to: options.email,
      subject: "Hurry! Get listed on Toolplate!",
      html: emailContent, // Use "html" instead of "text" for HTML content
    };

    await transport.sendMail(mailOptions);
    console.log("Email for Pitch company sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

exports.firstFollowUp = async (options) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../public/emails/followup1.html"
    );

    const Template = fs.readFileSync(templatePath, "utf-8");

    // Replace the placeholder {{tool}} with the actual Tool name
    const emailContent = Template.replace(/{{name}}|{{tool}}/g, (match) => {
      return match === "{{tool}}" ? options.tool : options.username;
    });

    const mailOptions = {
      from: process.env.EMAIL_FOR_CLIENT,
      to: options.email,
      subject: "[FollowUp1] Hurry! Get listed on Toolplate!",
      html: emailContent, // Use "html" instead of "text" for HTML content
    };

    await transport.sendMail(mailOptions);
    console.log("Email as 1st FollowUp sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

exports.secondFollowUp = async (options) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../public/emails/followup2.html"
    );

    const Template = fs.readFileSync(templatePath, "utf-8");

    // Replace the placeholder {{tool}} with the actual Tool name
    const emailContent = Template.replace(/{{name}}|{{tool}}/g, (match) => {
      return match === "{{tool}}" ? options.tool : options.username;
    });

    const mailOptions = {
      from: process.env.EMAIL_FOR_CLIENT,
      to: options.email,
      subject: "[FollowUp2] Hurry! Get listed on Toolplate!",
      html: emailContent, // Use "html" instead of "text" for HTML content
    };

    await transport.sendMail(mailOptions);
    console.log("Email as 2nd FollowUp sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

exports.thirdFollowUp = async (options) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../public/emails/followup3.html"
    );

    const Template = fs.readFileSync(templatePath, "utf-8");

    // Replace the placeholder {{tool}} with the actual Tool name
    const emailContent = Template.replace(/{{name}}|{{tool}}/g, (match) => {
      return match === "{{tool}}" ? options.tool : options.username;
    });

    const mailOptions = {
      from: process.env.EMAIL_FOR_CLIENT,
      to: options.email,
      subject: "[FollowUp3] Hurry! Get listed on Toolplate!",
      html: emailContent, // Use "html" instead of "text" for HTML content
    };

    await transport.sendMail(mailOptions);
    console.log("Email as 3rd FollowUp sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

exports.featured = async (options) => {
  try {
    const templatePath = path.join(__dirname, "../public/emails/featured.html");

    const Template = fs.readFileSync(templatePath, "utf-8");

    // Replace the placeholder {{tool}} with the actual Tool name
    const emailContent = Template.replace(
      /{{name}}|{{tool}}|{{site}}/g,
      (match) => {
        return match === "{{tool}}"
          ? options.tool
          : match === "{{name}}"
          ? options.username
          : options.slug;
      }
    );

    const mailOptions = {
      from: process.env.EMAIL_FOR_CLIENT,
      to: options.email,
      subject: "[Featured] Woohoo! Listed on Toolplate!",
      html: emailContent, // Use "html" instead of "text" for HTML content
    };

    await transport.sendMail(mailOptions);
    console.log("Featured: greeting Email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

exports.rejected = async (options) => {
  try {
    const templatePath = path.join(__dirname, "../public/emails/rejected.html");

    const Template = fs.readFileSync(templatePath, "utf-8");

    // Replace the placeholder {{tool}} with the actual Tool name
    const emailContent = Template.replace(
      /{{name}}|{{tool}}|{{reason}}/g,
      (match) => {
        return match === "{{tool}}"
          ? options.tool
          : match === "{{name}}"
          ? options.username
          : options.reason;
      }
    );

    const mailOptions = {
      from: process.env.EMAIL_FOR_CLIENT,
      to: options.email,
      subject: "[Rejected] Oops! We noticed an issue!",
      html: emailContent, // Use "html" instead of "text" for HTML content
    };

    await transport.sendMail(mailOptions);
    console.log("Rejected: warm Email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
