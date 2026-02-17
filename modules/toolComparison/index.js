/**
 * Tool Comparison Routes
 * 
 * Defines API endpoints for comparing tools.
 */
const compare = require("./controller");
const router = require("express").Router();

router.get("/compare", compare.compare);

module.exports = router;
