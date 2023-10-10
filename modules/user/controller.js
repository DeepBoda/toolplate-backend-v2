"use strict";
const sequelize = require("../../config/db");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const service = require("./service");
const { usersqquery, sqquery } = require("../../utils/query");
const { deleteFilesFromS3 } = require("../../middlewares/multer");
const admin = require("../../config/firebaseConfig"); // Firebase Admin SDK instance
const otpGenerator = require("otp-generator");
const { generateProfilePic } = require("../../middlewares/generateProfile");
const { sendOTP } = require("../../utils/mail");

// Signup route
exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if the email already exists in the local database
    const existingUser = await service.findOne({
      where: { email },
    });

    if (existingUser) {
      throw createError(400, `${email} already registered`);
    }

    // Generate a 6-digit OTP
    const OTP = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    // console.log("OTP: ", OTP);

    // Generate JWT token and send response
    const token = jwt.sign(
      {
        ...req.body,
        OTP,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIREIN }
    );

    // Send the email with the OTP
    await sendOTP({ email, username, OTP });

    res.status(200).json({
      status: "success",
      message: `OTP sent to ${email}`,
      token,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// OTP verification route
exports.verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;

    const decodedToken = jwt.decode(req.body.token);

    if (
      !decodedToken ||
      !decodedToken.username ||
      !decodedToken.email ||
      !decodedToken.OTP
    ) {
      throw createError(400, "Invalid token or missing data");
    }

    // Compare the entered OTP with the OTP from the token
    const isOTPValid = crypto.timingSafeEqual(
      Buffer.from(otp),
      Buffer.from(decodedToken.OTP)
    );

    if (!isOTPValid) {
      throw createError(400, "Invalid OTP");
    }

    // Generate the profile picture URL using the username
    let profilePicUrl;
    try {
      profilePicUrl = await generateProfilePic(decodedToken.username);
    } catch (error) {
      console.error("Error generating profile picture:", error);
      profilePicUrl = "https://cdn.toolplate.ai/logo/ai_profile.png";
    }

    // Create the user in Firebase Authentication
    const firebaseUser = await admin.auth().createUser({
      email: decodedToken.email,
      password: decodedToken.password,
      displayName: decodedToken.username,
    });
    // Get the user's UUID from Firebase
    const uid = firebaseUser.uid;

    // Create the user in your local database and store the FCM token and profilePicUrl
    const user = await service.create({
      username: decodedToken.username,
      email: decodedToken.email,
      password: decodedToken.password,
      uid,
      profilePic: profilePicUrl, // Store the generated profile picture URL in your local database
    });

    // Generate JWT token and send response
    const token = jwt.sign(
      {
        id: user.id,
        role: "User",
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIREIN }
    );

    res.status(200).json({
      status: "success",
      message: "Signup successful",
      token,
      role: "User",
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.socialAuth = async (req, res, next) => {
  try {
    const { firebase_token } = req.body;
    console.log("firebase-Token: ", firebase_token);

    if (!firebase_token) {
      throw createError(400, "Invalid request. Missing firebase_token.");
    }

    const firebaseUser = await admin.auth().verifyIdToken(firebase_token);

    if (!firebaseUser || !firebaseUser.email) {
      throw createError(400, "Invalid firebase_token or missing email.");
    }

    const { email, name, uid } = firebaseUser;

    let user = await service.findOne({ where: { email } });

    if (!user) {
      // Generate the profile picture URL using the username
      let profilePicUrl;
      try {
        profilePicUrl = await generateProfilePic(name.toUpperCase());
      } catch (error) {
        console.error("Error generating profile picture:", error);
        profilePicUrl = "https://cdn.toolplate.ai/logo/ai_profile.png";
      }

      // Create the user in the local database
      user = await service.create({
        username: name,
        email,
        uid,
        profilePic: profilePicUrl,
      });
    }

    if (user.isBlocked) {
      return res.status(401).json({
        status: "Permission Denied",
        message: "You're Blocked by Admin",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: "User",
      },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      status: 200,
      message: "Login successful",
      token,
      role: "User",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Login route
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find the user in your local database using the email
    const user = await service.findOne({ where: { email } });

    // If the user doesn't exist, return error
    if (!user) {
      throw createError(400, "Invalid email or password");
    }

    // Check if the provided password matches the hashed password in the database
    const correctPassword = await bcryptjs.compare(password, user.password);
    if (!correctPassword) {
      throw createError(400, "Invalid email or password");
    }

    // Check if the user is blocked or not
    if (user.isBlocked == true)
      return res.status(401).json({
        status: "Permission Denied",
        message: "You'are Blocked by Admin",
      });

    // Generate JWT token and send response
    const token = jwt.sign(
      {
        id: user.id,
        role: "User",
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIREIN }
    );

    res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      role: "User",
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.requestor.id;
    const user = await service.findOne({
      where: {
        id: userId,
      },
    });
    // Exclude the 'password' field from the user object
    if (user) {
      user.password = undefined;
    }

    res.status(200).send({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.requestor.id;
    const { file, body } = req;

    // Remove password from the request body
    delete body.password;

    let oldProfilePic;
    if (file) {
      // Update profile picture location in the request body
      body.profilePic = file.location;

      // Retrieve old user data from the database
      const oldUserData = await service.findOne({ where: { id: userId } });
      oldProfilePic = oldUserData?.profilePic;
    }

    // Update user's data in the database
    const [affectedRows] = await service.update(body, {
      where: { id: userId },
    });

    // Send success response with the number of affected rows
    res.status(200).json({
      status: "success",
      data: { affectedRows },
    });

    // Delete old profile picture from S3 storage if it exists
    if (file && oldProfilePic) {
      deleteFilesFromS3([oldProfilePic]);
    }
  } catch (error) {
    next(error);
  }
};
exports.updateFCM = async (req, res, next) => {
  try {
    const userId = req.requestor.id;

    // Update user's data in the database
    const [affectedRows] = await service.update(req.body, {
      where: { id: userId },
    });

    // Send success response with the number of affected rows
    res.status(200).json({
      status: "success",
      data: { affectedRows },
    });
  } catch (error) {
    next(error);
  }
};

// <=============== For Admins ===================>

exports.getAll = async (req, res, next) => {
  try {
    const [users, blocked, joined] = await Promise.all([
      service.findAndCountAll({
        ...sqquery({ ...req.query }, {}, ["username", "email"]),
      }),
      service.count({
        ...sqquery({ ...req.query }, { isBlocked: true }, [
          "username",
          "email",
        ]),
      }),
      service.count({
        ...sqquery(
          { ...req.query },
          {},
          ["username", "email"],
          [],
          ["group", "limit"]
        ),
        group: [sequelize.fn("date", sequelize.col("createdAt"))],
        limit: 5,
      }),
    ]);

    res.status(200).send({
      status: "success",
      data: { blocked, ...users, joined },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const user = await service.findOne({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).send({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
exports.blockUser = async (req, res, next) => {
  try {
    const isBlocked = req.body.isBlocked;

    // Update the user's isBlocked status
    const [affectedRows] = await service.update(
      { isBlocked },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    // Generate success message based on isBlocked value
    const message = isBlocked
      ? "User blocked successfully!"
      : "User unblocked successfully!";

    res.status(200).json({
      status: "success",
      message,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteById = async (req, res, next) => {
  try {
    const user = await service.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found!",
      });
    }

    // Now, delete the user from Firebase Authentication
    try {
      await admin.auth().deleteUser(user.uid);
      console.log("Firebase User deleted.");
    } catch (firebaseError) {
      console.error("Error deleting Firebase User: ", firebaseError);
    }

    // Delete the user from your database
    const affectedRows = await service.delete({
      where: {
        id: req.params.id,
      },
    });

    // Delete the user's profile picture from S3 (if it exists)
    if (user.profilePic) {
      try {
        deleteFilesFromS3([user.profilePic]);
        console.log("Profile picture deleted from S3.");
      } catch (s3Error) {
        console.error("Error deleting profile picture from S3: ", s3Error);
      }
    }

    res.status(200).json({
      status: "success",
      message: "User deleted successfully!",
      data: {
        affectedRows,
      },
    });
  } catch (error) {
    console.error("Error deleting User: ", error);
    next(error);
  }
};
