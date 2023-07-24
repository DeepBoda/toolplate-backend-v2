"use strict";

const router = require("express").Router();
const admin = require("./controller");
const joiSchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const {joiValidator} = require("../../middlewares/joiValidator");

// <=============== Public APIs ===============>
router.post("/login", admin.login); 
router.post("/",joiValidator(joiSchema.create), admin.create); //TODO: Protect the api

// <=============== Authorized APIs ===============>
router.use(authMiddleware);

// <=============== APIs for only Admins ===============>
router.use(protectRoute(["Admin"]));
router.get("/my/profile",admin.getMyProfile);






module.exports = router;
