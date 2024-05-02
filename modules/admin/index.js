"use strict";

const router = require("express").Router();
const admin = require("./controller");
const joiSchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

// <================= Public APIs =================>
router.post("/login", admin.login); 
router.post("/add", joiValidator(joiSchema.create), admin.create);
// router.patch("/update/:id", joiValidator(joiSchema.update), admin.update); //TODO: Protect the api

// <================ Authorized APIs ================>
router.use(authMiddleware,protectRoute(["Admin"]));

router.get("/",admin.getAll);
router.get("/profile",admin.getMyProfile);
router.post("/upload",upload.single('image') , admin.uploadImage);






module.exports = router;
