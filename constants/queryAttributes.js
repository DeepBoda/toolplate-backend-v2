"use strict";

exports.AdminAttributes = ["id", "name"];
exports.userAdminAttributes = ["username", "email", "profilePic"];
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

exports.categoryAttributes = ["id", "name"];
exports.tagAttributes = ["id", "name"];

exports.toolAdminAttributes = ["title", "image", "price"];
exports.blogAdminAttributes = ["title", "image", "alt"];

exports.toolAllAdminAttributes = [
  "id",
  "title",
  "image",
  "price",
  "slug",
  "createdAt",
  "likes",
  "views",
  "wishlists",
  "ratingsAverage",
  "totalRatings",
];
exports.blogAllAdminAttributes = [
  "id",
  "title",
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

exports.categoryAdminAttributes = ["id", "name", "createdAt"];
exports.tagAdminAttributes = ["id", "name", "createdAt"];

exports.ratingsAdminAttributes = [
  "id",
  "rating",
  "title",
  "review",
  "createdAt",
  "toolId",
  "userId",
];
exports.notificationAdminAttributes = [
  "id",
  "title",
  "body",
  "topic",
  "click_action",
  "createdAt",
];
