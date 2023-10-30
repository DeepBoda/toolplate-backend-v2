"use strict";

const router = require("express").Router();
const tool = require("./controller");
const toolSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router
  .route("/")
  .get(tool.getAllForAdmin)
  .post(
    upload.fields([
      { name: "image", maxCount: 1 },
      { name: "previews", maxCount: 10 },
      { name: "videos", maxCount: 10 },
    ]),
    joiValidator(toolSchema.create),
    tool.add
  );
router.route("/scheduled").get(tool.getScheduledForAdmin);
router
  .route("/:id")
  .get(tool.getForAdmin)
  .patch(
    upload.fields([
      { name: "image", maxCount: 1 },
      { name: "videos", maxCount: 10 },
    ]),
    joiValidator(toolSchema.update),
    tool.update
  )
  .delete(tool.delete);

module.exports = router;
