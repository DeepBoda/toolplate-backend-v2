"use strict";

const router = require("express").Router();
const user = require("./controller");
const userSchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const {joiValidator} = require("../../middlewares/joiValidator");
const {upload,deleteFileFromS3} = require("../../middlewares/multer");


// <=============== Public APIs ===============>

// #AWS SNS Login - Signup
router.post("/send/mobile-otp", user.sendMobileOTPByAWS); 
router.post("/send/email-otp/", user.sendEmailOTPByAWS); 

// TODO: Need to protect for user only ?
router.post("/verify/user/otp", user.verifyUserByAWSOTP); 
router.post("/signup",upload.single('profilePic'), joiValidator(userSchema.signup), user.signup); 
router.patch("/verify/new-mobile", user.verifyNewMobile); 
router.patch("/verify/new-email", user.verifyNewEmail); 


// <=============== Authorized APIs ===============>
router.use(authMiddleware);


// <=============== APIs only for Users ===============>
router.use(protectRoute(['User']))
router.get("/profile", user.getProfile);
router.patch("/profile", upload.single('profilePic') ,joiValidator(userSchema.updateProfile), user.updateProfile);
router.post("/send/otp/change/mobile", user.sendOTPtoChangeMobile_AWS); 
router.post("/send/otp/change/email", user.sendOTPtoChangeEmail_AWS); 






module.exports = router;
