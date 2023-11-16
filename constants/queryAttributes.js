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
  "release",
  "social",
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
  "release",
];

exports.categoryAttributes = ["id", "name", "slug"];

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
  "likes",
  "views",
  "comments",
  "wishlists",
  "release",
];

exports.categoryAdminAttributes = ["id", "name", "slug", "createdAt"];

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
