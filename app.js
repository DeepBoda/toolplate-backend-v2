const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Configure environment-specific settings
const isProduction = process.env.NODE_ENV === "production";

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware for parsing cookies
app.use(cookieParser());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
const sequelize = require("./config/db");

// Configure CORS
const frontendDomains = isProduction
  ? [
      "https://toolplate.ai",
      "https://www.toolplate.ai",
      "https://admin.toolplate.ai",
    ]
  : [
      "https://new-toolplate-website.vercel.app",
      "https://tool-plate-dashboard-git-staging-care-taker.vercel.app",
      "https://test.toolplate.ai",
      "http://localhost:3000",
      "http://localhost:3001",
    ];

app.use(
  cors({
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
  })
);

// Enable compression middleware
app.use(compression());

// Enhance security with helmet middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Customize your CSP policy as needed
  })
);

// Define your IP whitelist based on the environment
const allowedIPs = isProduction
  ? ["192.168.1.100", "127.0.0.1", "::1", "13.126.138.220"]
  : ["192.168.1.100", "127.0.0.1", "::1", "13.126.138.220", "15.207.242.14"];

// Middleware for checking allowed IPs
function checkAllowedIP(req, res, next) {
  const clientIP = req.ip; // Get the client's IP address

  if (allowedIPs.includes(clientIP)) {
    next(); // Allow the request to proceed to the next middleware
  } else {
    res.status(403).send("Access denied. Your IP is not whitelisted.");
  }
}

// Define your routes
const indexRouter = require("./routes");
app.use("/", indexRouter);
// app.use("/", indexRouter);

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
          .then((result) => {
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
    .then(async (result) => {
      console.log(`✔ Database connection successful! 🎯`);
    })
    .catch((error) => {
      console.error("Error while creating tables...\n", error);
    });
}

// Error handler
app.use((err, req, res, next) => {
  // Handle Sequelize errors
  if (err.name === "SequelizeUniqueConstraintError") {
    // Handle unique constraint errors (e.g., duplicate data)
    err.status = 409;
    let msg = "";

    err.errors.map((el) => {
      msg += `${el.path} '${el.value.split("-")[0]}' already registered`;
    });

    err.message = msg;
  } else if (err.name === "SequelizeValidationError") {
    // Handle validation errors
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
      // token: req.header("Authorization"),
    });
  }

  // Handle other errors
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Unknown Error",
  });

  app.use((err, req, res, next) => {
    // Logging the error to the slack
    // if (err.status >= 500 || res.statusCode >= 500) {
    //   responseInClientSlack({
    //     attachments: [
    //       {
    //         title: `error`,
    //         text: `\n\nstatusCode: ${err?.status} \n\nMessage : ${err?.message}\n\n stack: ${err?.stack} \n\n user:${req?.requestor?.id}`,
    //         color: "#FF0000",
    //       },
    //     ],
    //   });
    // }

    // Logging error
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

    // Re-throw the error to let the subsequent error-handling middleware handle it
    throw err;
  });
});
module.exports = app;
