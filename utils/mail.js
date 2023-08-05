const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
// Create the transport object outside the function
const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_FOR_CLIENT,
    pass: process.env.EMAIL_GENERATED_PASSWORD,
  },
  // // Additional options:
  // tls: {
  //   rejectUnauthorized: true,
  // },
  // pool: true, // Enable connection pooling for reusing connections (improves performance)
  // maxConnections: 25, // Maximum number of parallel connections to the server
  // maxMessages: 1000, // Maximum number of messages to send per connection
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
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
