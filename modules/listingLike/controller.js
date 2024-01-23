"use strict";
const sequelize = require("sequelize");
const service = require("./service");
const listingService = require("../listing/service");
const { usersqquery, sqquery } = require("../../utils/query");
const User = require("../user/model");
const {
  userAdminAttributes,
  listingAdminAttributes,
} = require("../../constants/queryAttributes");
const Listing = require("../listing/model");

exports.likeListing = async (req, res, next) => {
  try {
    req.body.userId = req.requestor.id;
    const isAlreadyExist = await service.count({
      where: req.body,
    });
    if (isAlreadyExist) {
      await service.delete({
        where: req.body,
      });
      listingService.update(
        { likes: sequelize.literal("likes  - 1") },
        { where: { id: req.body.listingId } }
      );
      res.status(200).json({
        status: "success",
        message: "You removed like!.",
      });
    } else {
      await service.create(req.body);
      listingService.update(
        { likes: sequelize.literal("likes  + 1") },
        { where: { id: req.body.listingId } }
      );
      res.status(200).json({
        status: "success",
        message: "Liked listing 🫣!.",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await service.findAndCountAll({
      ...sqquery(req.query),
      distinct: true, // Add this option to ensure accurate counts
      include: [
        {
          model: User,
          attributes: userAdminAttributes,
        },
        {
          model: Listing,
          attributes: listingAdminAttributes,
        },
      ],
    });

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await service.findOne({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- Only Admin can Update/Delete ----------
exports.update = async (req, res, next) => {
  try {
    // Update the listing data
    const [affectedRows] = await service.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    // Send the response
    res.status(200).json({
      status: "success",
      data: {
        affectedRows,
      },
    });
  } catch (error) {
    // console.error(error);
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const affectedRows = await service.delete({
      where: {
        userId: req.requestor.id,
      },
    });

    res.status(200).send({
      status: "success",
      data: {
        affectedRows,
      },
    });
  } catch (error) {
    next(error);
  }
};
