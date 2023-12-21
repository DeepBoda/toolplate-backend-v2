"use strict";

const router = require("express").Router();
const user = require("./controller");
const joiSchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const {joiValidator} = require("../../middlewares/joiValidator");
const {upload,deleteFilesFromS3} = require("../../middlewares/multer");
const {limiter} = require("../../middlewares/rateLimiter");


// <=============== Public APIs ===============>
router.post("/verify", limiter, user.verifyOTP); 
router.post("/signup",limiter, joiValidator(joiSchema.signup), user.signup); 
router.post("/google",limiter,  user.socialAuth); 
router.post("/login",limiter, user.login); 

// <=============== Authorized APIs ===============>
router.use(authMiddleware,protectRoute(['User']));
// <=============== APIs only for Users ===============>
router.get("/me", user.getProfile);
router.patch("/profile", upload.single('profilePic') ,joiValidator(joiSchema.updateProfile), user.updateProfile);
router.patch("/fcm",joiValidator(joiSchema.updateFCM), user.updateFCM);



module.exports = router;
