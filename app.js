const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

dotenv.config();

// const { responseInClientSlack } = require("./utils/slackBoat");
const logService = require("./modules/log/service");
const indexRouter = require("./routes");
const sequelize = require("./config/db");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configure CORS
app.use(cors());
// Enable compression middleware
app.use(compression());
// Enhance security with helmet middleware
app.use(helmet());

// Routes
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
    .sync()
    // .authenticate()
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
  }

  // Handle other errors
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Unknown Error",
  });

  // // Logging the error
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

  // Logging error and handling
  app.use((err, req, res, next) => {
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
  });
});
module.exports = app;
