"use strict";

const router = require("express").Router();
const user = require("./controller");
const userSchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const {joiValidator} = require("../../middlewares/joiValidator");
const {upload,deleteFilesFromS3} = require("../../middlewares/multer");
const {limiter} = require("../../middlewares/rateLimiter");


// <=============== Public APIs ===============>
router.post("/verify", limiter, user.verifyOTP); 
router.post("/signup",limiter, joiValidator(userSchema.signup), user.signup); 
router.post("/google",limiter,  user.socialAuth); 
router.post("/login",limiter, user.login); 

// <=============== Authorized APIs ===============>
router.use(authMiddleware,protectRoute(['User']));
// <=============== APIs only for Users ===============>
router.get("/me", user.getProfile);
router.patch("/profile", upload.single('profilePic') ,joiValidator(userSchema.updateProfile), user.updateProfile);
router.patch("/fcm",joiValidator(userSchema.updateFCM), user.updateFCM);



module.exports = router;
