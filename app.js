"use strict";

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
require("dotenv").config();

const wooffer = require("wooffer");

const isProduction = process.env.NODE_ENV === "production";
const token = process.env.WOOFFER_TOKEN;
const serviceToken = isProduction
  ? process.env.WOOFFER_SERVICE
  : process.env.WOOFFER_SERVICE_DEV;

const app = express();
app.disable("x-powered-by");

wooffer(token, serviceToken);
app.use(wooffer.requestMonitoring);

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware for parsing cookies
app.use(cookieParser());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Database connection
const sequelize = require("./config/db");

// IP Whitelist middleware (assuming it's implemented correctly)

// Configure CORS
const frontendDomains = isProduction
  ? process.env.PROD_CORS_ORIGINS.split(",")
  : process.env.DEV_CORS_ORIGINS.split(",");

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      frontendDomains.some((domain) => origin.startsWith(domain))
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// const corsOptions = {
//   origin: "*",
// };

// Enable CORS for all routes
app.use(cors(corsOptions));

// Apply compression only if response size is above 1KB
app.use(compression({ threshold: 1024 }));

// Use helmet middleware to set various security headers
app.use(helmet());

// Middleware for checking allowed IPs
app.set("trust proxy", true);
// app.use(ipWhitelist); // Uncomment if IP whitelisting is needed

// Health check endpoint (before auth - no API key required)
app.use("/health", require("./modules/health"));

// Middleware for API key validation
const { validateAPIKey } = require("./middlewares/auth");
app.use(validateAPIKey);

// Define your routes
const indexRouter = require("./routes");
app.use("/", indexRouter);

// Catch all routes that don't match any other routes and return 404 error
app.use((req, res, next) => {
  next(createError(404, `Can't find ${req.originalUrl} on this server!`));
});

// DB Connection
const force = false;

if (force) {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question(
    `💀 Are you sure? You want to force database synchronization??? (yes/y) \n`,
    (input) => {
      if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
        sequelize
          .sync({ force: true })
          .then(() => {
            console.log(`✔ Database connected successfully! 🎯`);
            readline.close(); // Close the readline interface after the user's response
          })
          .catch((error) => {
            console.error("Error while creating tables...\n", error);
          });
      } else {
        console.log("Force true prevented, reconnect the DB.");
        process.exit(0);
      }
    }
  );
} else {
  sequelize
    // .sync()
    .authenticate()
    .then(async () => {
      console.log(`✔ Database connection successful! 🎯`);
    })
    .catch((error) => {
      console.error("Error while connecting to the database...\n", error);
    });
}

// Error handler for the entire app
app.use((err, req, res) => {
  // Handle specific error types
  if (err.name === "SequelizeUniqueConstraintError") {
    err.status = 409;
    let msg = "";

    err.errors.map((el) => {
      msg += `${el.path} '${el.value.split("-")[0]}' already registered`;
    });

    err.message = msg;
  } else if (err.name === "SequelizeValidationError") {
    err.status = 400;
    let msg = "";

    err.errors.map((el) => {
      if (el.type === "notNull Violation") {
        msg += el.path + " is required. ";
      } else {
        msg += el.message;
      }
    });

    err.message = msg;
  } else if (
    err.name === "JsonWebTokenError" &&
    err.message === "jwt malformed"
  ) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized attempt, login again!",
    });
  }

  wooffer.fail(err.message);

  // Handle other errors
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Unknown Error",
  });

  // Additional logging for error monitoring
  app.use((err, req, res, next) => {
    try {
      const logService = require("./modules/log/service");
      logService.create({
        method: req.method,
        url: req.url,
        statusCode: err.status || res.statusCode,
        message: err.message || "Something went wrong!",
        payload: {
          params: req.params,
          body: req.body,
          query: req.query,
        },
        userId: req?.requestor?.id,
      });
    } catch (logError) {
      console.error("Error while logging:", logError);
    }

    next(err);
  });
});

module.exports = app;
