"use strict";

const router = require("express").Router();
const user = require("./controller");
const userSchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const {joiValidator} = require("../../middlewares/joiValidator");
const {upload,deleteFilesFromS3} = require("../../middlewares/multer");


// <=============== Public APIs ===============>
router.post("/verify",  user.verifyOTP); 
router.post("/signup", joiValidator(userSchema.signup), user.signup); 
router.post("/google",  user.socialAuth); 
router.post("/login", user.login); 

// <=============== Authorized APIs ===============>
router.use(authMiddleware,protectRoute(['User']));
// <=============== APIs only for Users ===============>
router.get("/me", user.getProfile);
router.patch("/profile", upload.single('profilePic') ,joiValidator(userSchema.updateProfile), user.updateProfile);



module.exports = router;
