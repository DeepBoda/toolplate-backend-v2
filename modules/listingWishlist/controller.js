"use strict";

const sequelize = require("../../config/db");
const service = require("./service");
const listingService = require("../listing/service");
const { usersqquery, sqquery } = require("../../utils/query");
const {
  listingAttributes,
  listingCategoryAttributes,
  userAdminAttributes,
  listingAdminAttributes,
} = require("../../constants/queryAttributes");
const Listing = require("../listing/model");
const ListingCategory = require("../listingCategory/model");
const User = require("../user/model");
const CategoryOfListing = require("../categoryOfListing/model");

exports.add = async (req, res, next) => {
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
        { wishlists: sequelize.literal("wishlists  - 1") },
        { where: { id: req.body.listingId } }
      );

      res.status(200).json({
        status: "success",
        message: "Listing removed from wishlist!.",
      });
    } else {
      await service.create(req.body);
      listingService.update(
        { wishlists: sequelize.literal("wishlists  + 1") },
        { where: { id: req.body.listingId } }
      );

      res.status(200).json({
        status: "success",
        message: "Listing added to wishlist!.",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findAndCountAll({
      ...sqquery(
        req.query,
        {
          userId: req.requestor.id,
        }
        // ["$listings.title$"]
      ),
      include: {
        model: Listing,
        attributes: [
          ...listingAttributes,
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM listingLikes WHERE listingLikes.listingId = listing.id AND listingLikes.UserId = ${userId}) > 0`
            ),
            "isLiked",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM listingWishlists WHERE listingWishlists.listingId = listing.id AND listingWishlists.UserId = ${userId}) > 0`
            ),
            "isWishlisted",
          ],
        ],
        include: {
          model: ListingCategory,
          attributes: ["id", "listingId", "categoryOfListingId"],
          include: {
            model: CategoryOfListing,
            attributes: listingCategoryAttributes,
          },
        },
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

exports.getByUser = async (req, res, next) => {
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
        id: req.params.id,
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
