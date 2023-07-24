"use strict";

const router = require("express").Router();
const userFeedback = require("./controller");
const joiSchema = require("./joiSchema");
const {joiValidator} = require("../../middlewares/joiValidator");


router.post("/",joiValidator(joiSchema.create),userFeedback.add)




module.exports = router;
