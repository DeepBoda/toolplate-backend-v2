"use strict";

const { Op, literal } = require("sequelize");
const AWS = require("aws-sdk");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const service = require("./service");
const { deleteFilesFromAwsS3Bucket } = require("../../utils/service");

const {
  cl,
  jwtDecoder,
  generateOTP,
  sendSMSbyAWS,
} = require("../../utils/service");
const { sqquery } = require("../../utils/query");

// <=============== For Admins ===================>

/** Sends an SMS to a mobile number for OTP using the AWS SNS */
exports.sendMobileOTPByAWS = async (req, res, next) => {
  try {
    const OTP = generateOTP();
    // TODO: Send SMS
    // const isOTPSent = await sendSMSbyAWS(
    //   `${OTP} is the otp to login within Widur App. This is valid for 2 minutes. DO NOT SHARE THIS WITH ANYONE -WIDUR`,
    //   req.body.mobile
    // );

    // if (!isOTPSent) return next(createError(400, "OTP could'nt sent!"));

    const token = jwt.sign(
      {
        mobile: req.body.mobile,
        OTP: OTP,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 120,
      }
    );

    res.status(200).json({
      status: "success",
      message: "OTP send successfully",
      OTP, //TODO: Remove
      token,
    });
  } catch (err) {
    next(err);
  }

  return;

  // let aws_region = "ap-south-1";
  let aws_region = process.env.AWS_REGION;
  let destinationNumber = `+${req.body.mobile}`;
  // let token;
  // The content of the SMS message.
  // const OTP = Math.floor(100000 + Math.random() * 900000);
  let message = `${OTP} is the otp to login within Widur App. This is valid for 2 minutes. DO NOT SHARE THIS WITH ANYONE -WIDUR`;

  let applicationId = "8df7f411f57549ff9a565ffcebd55a23";
  let messageType = "TRANSACTIONAL";
  let senderId = "WIDURO";
  // let credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
  // AWS.config.credentials = credentials;

  AWS.config.update({ region: aws_region });

  //Create a new Pinpoint object.
  let pinpoint = new AWS.Pinpoint();
  token = jwt.sign(
    {
      mobile: req.body.mobile,
      OTP: OTP,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: 120,
    }
  );

  // Specify the parameters to pass to the API.
  let params = {
    ApplicationId: applicationId,

    MessageRequest: {
      Addresses: {
        [destinationNumber]: {
          ChannelType: "SMS",
        },
      },
      MessageConfiguration: {
        SMSMessage: {
          Body: message,
          EntityId: "1101515180000062836",
          TemplateId: "1107165889922186429",
          MessageType: messageType,
          SenderId: senderId,
        },
      },
    },
  };

  // TODO: Send sendMessages and remove the OTP in the res
  // //Try to send the message.
  // pinpoint.sendMessages(params, function (err, data) {
  //   // If something goes wrong, print an error message.
  //   if (err) {
  //     cl("Error in sendMessages", err);
  //     return next(err);
  //     // Otherwise, show the unique ID for the message.
  //   }

  //   cl("OTP send successfully", OTP);
  //   res.status(200).json({
  //     status: "success",
  //     message: "OTP send successfully",
  //     token,
  //   });
  // });
  cl("OTP send successfully", OTP);
  res.status(200).json({
    status: "success",
    message: "OTP send successfully",
    OTP,
    token,
  });
};

exports.sendEmailOTPByAWS = async (req, res, next) => {
  // The content of the SMS message.
  const OTP = Math.floor(100000 + Math.random() * 900000);
  let message = `${OTP} is the otp to login within Widur App. This is valid for 2 minutes. DO NOT SHARE THIS WITH ANYONE -WIDUR`;

  // TODO: Send email
  const token = jwt.sign(
    {
      email: req.body.email,
      OTP,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: 120,
    }
  );

  res.status(200).json({
    status: "success",
    message: "OTP send successfully",
    OTP, //TODO: Remove
    token,
  });
};

exports.verifyUserByAWSOTP = async (req, res, next) => {
  try {
    let token = null;
    let isNewUser = true;
    const { mobile, OTP } = await jwtDecoder(req);

    if (OTP != req.body.OTP) {
      return res.status(401).json({
        status: 401,
        message: "Incorrect Otp. Kindly retry",
      });
    }

    //Get user by mobile
    const avlUser = await service.findOne({
      where: {
        mobile,
      },
    });

    if (!avlUser) {
      // Sign a JWT Token for sing up
      token = jwt.sign(
        {
          mobile,
          role: "User",
        },
        process.env.JWT_SECRET
      );
    } else {
      isNewUser = false;
      req.requestor = avlUser.toJSON();

      // Sign a JWT Token for login
      token = jwt.sign(
        {
          ...req.requestor,
          role: "User",
        },
        process.env.JWT_SECRET
      );
    }

    res.status(200).json({
      status: "success",
      isNewUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    if (req.file) req.body.profilePic = req.file.location;
    const user = await service.create(req.body);

    const token = jwt.sign(
      {
        ...user.toJSON(),
        role: "User",
      },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      status: "success",
      data: user,
      token,
    });
  } catch (err) {
    cl(err);
    next(err);
  }
};
exports.getProfile = async (req, res, next) => {
  const UserId = req.requestor.id;
  const user = await service.findOne({
    where: {
      id: UserId,
    },
  });

  // // Get followers and followings count

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

    const token = jwt.sign(
      {
        ...user.toJSON(),
        role: "User",
      },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      status: "success",
      data: {
        affectedRows,
      },
      token,
    });
    if (req.file && oldUserData?.profilePic)
      deleteFilesFromAwsS3Bucket(oldUserData?.profilePic);
  } catch (err) {
    next(err);
  }
};

exports.sendOTPtoChangeMobile_AWS = async (req, res, next) => {
  const OTP = generateOTP();

  // TODO: Send SMS
  const isOTPSent = await sendSMSbyAWS(
    `${OTP} is the otp to login within Widur App. This is valid for 2 minutes. DO NOT SHARE THIS WITH ANYONE -WIDUR`,
    req.body.mobile
  );

  if (!isOTPSent) return next(createError(400, "OTP could'nt sent!"));

  const token = jwt.sign(
    {
      mobile: req.requestor.mobile,
      newMobile: req.body.newMobile,
      OTP: OTP,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: 500,
    }
  );

  res.status(200).json({
    status: "success",
    message: "OTP send successfully",
    OTP, //TODO: Remove
    token,
  });
};

exports.verifyNewMobile = async (req, res, next) => {
  try {
    const decoded = await jwtDecoder(req);

    cl("decoded", decoded);

    if (decoded.OTP != req.body.OTP)
      return res.status(401).json({
        status: "fail",
        message: "Incorrect Otp. Kindly retry",
      });

    //Get user by mobile
    let [user] = await service.get({
      where: {
        mobile: decoded.mobile,
      },
    });

    user.mobile = decoded.newMobile;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Mobile number changes successfully, please login again",
    });
  } catch (err) {
    next(err);
  }
};

exports.sendOTPtoChangeEmail_AWS = async (req, res, next) => {
  // The content of the SMS message.
  const OTP = Math.floor(100000 + Math.random() * 900000);
  console.log(OTP);
  let message = `${OTP} is the otp to login within Widur App. This is valid for 2 minutes. DO NOT SHARE THIS WITH ANYONE -WIDUR`;

  // TODO: Send email and remove OTP from the res
  const token = jwt.sign(
    {
      email: req.requestor.email,
      newEmail: req.body.newEmail,
      OTP,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: 120,
    }
  );

  res.status(200).json({
    status: "success",
    OTP,
    token,
  });
};

exports.verifyNewEmail = async (req, res, next) => {
  try {
    const decoded = await jwtDecoder(req);

    cl("decoded", decoded);

    if (decoded.OTP != req.body.OTP)
      return res.status(401).json({
        status: "fail",
        message: "Incorrect Otp. Kindly retry",
      });

    //Get user by email
    let [user] = await service.get({
      where: {
        email: decoded.email,
      },
    });

    user.email = decoded.newEmail;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Email changes successfully, please login again",
    });
  } catch (err) {
    next(err);
  }
};

// <=============== For Admins ===================>

exports.getAll = async (req, res, next) => {
  const users = await service.findAll({});
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
