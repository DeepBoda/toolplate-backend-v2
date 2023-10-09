"use strict";

exports.AdminAttributes = ["id", "name", "email"];

exports.userAdminAttributes = ["username", "email", "profilePic"];
exports.blogAdminAttributes = ["title", "image", "alt"];
exports.toolAttributes = [
  "id",
  "title",
  "description",
  "image",
  "price",
  "link",
  "slug",
  "createdAt",
  "likes",
  "views",
  "wishlists",
  "ratingsAverage",
  "totalRatings",
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
  "likes",
  "views",
  "comments",
  "wishlists",
];

exports.tagAttributes = ["name"];
exports.categoryAttributes = ["name"];
