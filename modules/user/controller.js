"use strict";

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
const { cl } = require("../../utils/service");

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
    console.log("OTP: ", OTP);

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
    console.log(error);
    next(error);
  }
};

// OTP verification route
exports.verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;

    const decodedToken = jwt.decode(req.body.token);
    cl(decodedToken, "token");
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
      // Handle error during profile picture generation (optional)
      console.error("Error generating profile picture:", error);
      // You can provide a default profile picture URL or handle the error gracefully
      profilePicUrl =
        "https://planet-k.s3.ap-south-1.amazonaws.com/toolplate-logo.png";
    }

    // Create the user in Firebase Authentication
    const firebaseUser = await admin.auth().createUser({
      email: decodedToken.email,
      password: decodedToken.password,
      displayName: decodedToken.username,
    });
    console.log("firebaseUser: ", firebaseUser);
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
    console.log("firebase_token : ", req.body.firebase_token);
    // Check if the request contains a firebase_token
    if (!req.body.firebase_token) {
      throw createError(400, "Invalid request. Missing firebase_token.");
    }

    // Handle Firebase authentication
    const firebaseUser = await admin
      .auth()
      .verifyIdToken(req.body.firebase_token);

    // Check if the email is verified
    if (!firebaseUser.email_verified) {
      throw createError(401, "Email is not verified. Try with another email.");
    }

    // Check if the email already exists in the local database
    let user = await service.findOne({ where: { email: firebaseUser.email } });

    // If the user doesn't exist, create a new user
    if (!user) {
      const { email, name } = firebaseUser;
      const uid = firebaseUser.uid;
      // Generate the profile picture URL using the username
      let profilePicUrl;
      try {
        profilePicUrl = await generateProfilePic(name.toUpperCase());
      } catch (error) {
        // Handle error during profile picture generation (optional)
        console.error("Error generating profile picture:", error);
        // You can provide a default profile picture URL or handle the error gracefully
        profilePicUrl = "YOUR_DEFAULT_PROFILE_PIC_URL";
      }

      // Create the user in the local database
      user = await service.create({
        username: name,
        email,
        uid,
        profilePic: profilePicUrl,
        // password: null,
        // Other fields based on your database schema, but no need for the password field
      });
    }

    // Check if the user is blocked or not
    if (user.isBlocked == true)
      return res.status(401).json({
        status: "Permission Denied",
        message: "You'are Blocked by Admin",
      });

    // Sign a JWT Token as Login Token
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
    console.log(error);
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
  } catch (err) {
    cl(err);
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    delete req.body.password;
    let oldUserData;
    if (req.file) {
      req.body.profilePic = req.file.location;
      oldUserData = await service.findOne({
        where: {
          id: req.requestor.id,
        },
      });
    }
    const [affectedRows] = await service.update(req.body, {
      where: {
        id: req.requestor.id,
      },
    });

    // Get the updated user and sign a login token
    const user = await service.findOne({
      where: {
        id: req.requestor.id,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        affectedRows,
      },
      // token,
    });
    if (req.file && oldUserData?.profilePic)
      deleteFilesFromS3([oldUserData?.profilePic]);
  } catch (err) {
    next(err);
  }
};

// <=============== For Admins ===================>

exports.getAll = async (req, res, next) => {
  try {
    const users = await service.findAll({ ...usersqquery });

    res.status(200).send({
      status: "success",
      data: users,
    });
  } catch (err) {
    cl(err);
    next(err);
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
  } catch (err) {
    cl(err);
    next(err);
  }
};

exports.deleteById = async (req, res, next) => {
  try {
    // If a profilePic URL is present, delete the file from S3
    const { profilePic } = await service.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (profilePic) deleteFilesFromS3([profilePic]);
    const affectedRows = await service.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "success",
      message: "delete user successfully",
      data: {
        affectedRows,
      },
    });
  } catch (err) {
    cl(err);
    next(err);
  }
};
