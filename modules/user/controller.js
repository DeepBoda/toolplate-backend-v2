"use strict";

const createError = require("http-errors");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const service = require("./service");
const admin = require("../../config/firebaseConfig"); // Firebase Admin SDK instance
const { generateProfilePic } = require("../../middlewares/generateProfile");

// Signup route
exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, FCM } = req.body;

    // Check if the email already exists in Firebase Authentication
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(email);
    } catch (error) {
      // Ignore the error, assume email doesn't exist in Firebase
      firebaseUser = null;
    }

    // Check if the email already exists in the local database
    const existingUser = await service.findOne({ where: { email } });

    if (firebaseUser || existingUser) {
      throw createError(400, `Email ${email} already registered`);
    }

    // Generate the profile picture URL using the username
    let profilePicUrl;
    try {
      profilePicUrl = await generateProfilePic(username);
    } catch (error) {
      // Handle error during profile picture generation (optional)
      console.error("Error generating profile picture:", error);
      // You can provide a default profile picture URL or handle the error gracefully
      profilePicUrl = "YOUR_DEFAULT_PROFILE_PIC_URL";
    }

    // Create the user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username,
    });

    // Get the user's UUID from Firebase
    const uidFromFirebase = userRecord.uid;

    // Create the user in your local database and store the FCM token and profilePicUrl
    const user = await service.create({
      username,
      email,
      password,
      uid: uidFromFirebase,
      FCM,
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
      data: user,
      token,
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
      throw createError(401, "Invalid email or password");
    }

    // Check if the provided password matches the hashed password in the database
    const correctPassword = await bcryptjs.compare(password, user.password);
    if (!correctPassword) {
      throw createError(401, "Invalid email or password");
    }

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
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  const userId = req.requestor.id;
  const user = await service.findOne({
    where: {
      id: userId,
    },
  });

  res.status(200).send({
    status: "success",
    data: user,
  });
};

exports.updateProfile = async (req, res, next) => {
  try {
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

    // const token = jwt.sign(
    //   {
    //     ...user.toJSON(),
    //     role: "User",
    //   },
    //   process.env.JWT_SECRET
    // );

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
  const users = await service.findAll({ ...usersqquery });

  res.status(200).send({
    status: "success",
    data: users,
  });
};

exports.getById = async (req, res, next) => {
  const user = await service.findOne({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).send({
    status: "success",
    data: user,
  });
};

exports.deleteById = async (req, res, next) => {
  // If a image URL is present, delete the file from S3
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
};
