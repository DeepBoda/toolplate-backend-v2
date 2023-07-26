"use strict";

const router = require("express").Router();
const user = require("./controller");
const userSchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const {joiValidator} = require("../../middlewares/joiValidator");
const {upload,deleteFilesFromS3} = require("../../middlewares/multer");


// <=============== Public APIs ===============>

router.post("/signup",upload.single('profilePic'), joiValidator(userSchema.signup), user.signup); 
router.post("/login", user.login); 

// <=============== Authorized APIs ===============>
router.use(authMiddleware);

// <=============== APIs only for Users ===============>
router.use(protectRoute(['User']))
router.get("/profile", user.getProfile);
router.patch("/profile", upload.single('profilePic') ,joiValidator(userSchema.updateProfile), user.updateProfile);



module.exports = router;
