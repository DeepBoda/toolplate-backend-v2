"use strict";

exports.AdminAttributes = ["id", "name"];
exports.userAdminAttributes = ["username", "profilePic"];
exports.userAllAdminAttributes = [
  "id",
  "username",
  "email",
  "profilePic",
  "isBlocked",
  "createdAt",
];

exports.toolAttributes = [
  "id",
  "title",
  "description",
  "image",
  "price",
  "link",
  "slug",
  "createdAt",
  "updatedAt",
  "likes",
  "views",
  "wishlists",
  "ratingsAverage",
  "totalRatings",
  "release",
  "social",
];
exports.toolCardAttributes = [
  "id",
  "title",
  "description",
  "image",
  "price",
  "slug",
  "ratingsAverage",
  "release",
];
exports.toolCardAttributes = [
  "id",
  "title",
  "description",
  "image",
  "price",
  "slug",
  "ratingsAverage",
  "release",
];
exports.blogAttributes = [
  "id",
  "title",
  "description",
  "image",
  "alt",
  "readTime",
  "slug",
  "createdAt",
  "updatedAt",
  "likes",
  "views",
  "comments",
  "wishlists",
  "release",
];
exports.listingAttributes = [
  "id",
  "title",
  "description",
  "overview",
  "image",
  "alt",
  "slug",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "likes",
  "views",
  "comments",
];
exports.newsAttributes = [
  "id",
  "title",
  "description",
  "image",
  "link",
  "slug",
  "views",
  "wishlists",
  "newsCategoryId",
  "release",
  "createdAt",
  "updatedAt",
];
exports.submitToolAttributes = [
  "id",
  "title",
  "link",
  "country",
  "status",
  "createdAt",
];

exports.categoryAttributes = [
  "id",
  "name",
  "image",
  "slug",
  "description",
  "mainCategoryId",
  "createdAt",
];
exports.blogCategoryAttributes = ["id", "name", "slug", "description"];
exports.listingCategoryAttributes = ["id", "name", "slug", "description"];
exports.mainCategoryAttributes = ["id", "name", "image", "slug", "createdAt"];
exports.newsCategoryAttributes = [
  "id",
  "name",
  "overview",
  "image",
  "slug",
  "title",
  "description",
];

exports.toolAdminAttributes = ["id", "title", "image", "price"];
exports.listingToolAttributes = [
  "id",
  "title",
  "description",
  "ratingsAverage",
  "image",
  "link",
  "slug",
  "price",
];
exports.blogAdminAttributes = ["id", "title", "image", "alt"];
exports.listingAdminAttributes = ["id", "title", "image", "alt"];

exports.toolAllAdminAttributes = [
  "id",
  "title",
  "image",
  "price",
  "slug",
  "createdAt",
  "updatedAt",
  "likes",
  "views",
  "wishlists",
  "ratingsAverage",
  "totalRatings",
  "release",
  "social",
];
exports.blogAllAdminAttributes = [
  "id",
  "title",
  "image",
  "alt",
  "readTime",
  "slug",
  "createdAt",
  "updatedAt",
  "likes",
  "views",
  "comments",
  "wishlists",
  "release",
];
exports.listingAllAdminAttributes = [
  "id",
  "title",
  "description",
  "image",
  "alt",
  "slug",
  "createdAt",
  "updatedAt",
  "likes",
  "views",
  "comments",
];

exports.categoryAdminAttributes = [
  "id",
  "name",
  "image",
  "slug",
  "description",
  "mainCategoryId",
  "createdAt",
];
exports.mainCategoryAdminAttributes = [
  "id",
  "name",
  "image",
  "slug",
  "description",
  "createdAt",
];
exports.listingCategoryAdminAttributes = ["id", "name", "slug", "createdAt"];

exports.notificationAdminAttributes = [
  "id",
  "title",
  "body",
  "topic",
  "click_action",
  "createdAt",
];
