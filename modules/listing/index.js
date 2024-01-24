"use strict";

const router = require("express").Router();
const listing = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get( listing.getAll);
router.route("/slugs").get( listing.getSlugsForSitemap);
router.route("/data/:slug").get(listing.getDynamicBySlug);
router.route("/view/:id").get(listing.createView);
router.route("/related/:id").get(listing.getRelatedListings);
router.route("/:slug").get(listing.getBySlug);



module.exports = router;
