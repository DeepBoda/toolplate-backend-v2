const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config({ path: "./.env" });

const { responseInClientSlack } = require("./utils/slackBoat");
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

// Routes
app.use("/", indexRouter);

// Catch all routes that don't match any other routes and return 404 error
app.use((req, _, next) => {
  next(createError(404, `Can't find ${req.originalUrl} on this server!`));
});

// DB Connection
const force = false;

if (force) {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question(`💀 Force true ?\n`, (input) => {
    if (input == "y") {
      sequelize
        .sync({ force: true })
        .then((result) => {
          console.log(`✔ Database connected successfully! 🎯`);
        })
        .catch((err) => {
          console.error("Error while creating tables...");
          console.log(err);
        });
    } else {
      console.log("Force true prevented, reconnect the DB.");
      process.exit(0);
    }

    readline.close();
  });
} else {
  sequelize
    .sync()
    // .authenticate()
    .then(async (result) => {
      console.log(`✔ Database connection successful`);
    })
    .catch((err) => {
      console.error("Error while creating tables...");
      console.log(err);
    });
}

// Error handler
app.use((err, req, res, next) => {
  // Handle Sequelize errors
  if (err.name === "SequelizeUniqueConstraintError") {
    err.status = 409;
    let msg = "";

    err.errors.map((el) => {
      msg += `${el.path} '${el.value.split("-")[0]}' already registered`;
    });

    err.message = msg;
  }

  if (err.name === "SequelizeValidationError") {
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

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Unknown Error",
    stack: err.stack,
  });

  // Logging the error
  if (err.status >= 500 || res.statusCode >= 500) {
    responseInClientSlack({
      attachments: [
        {
          title: `error`,
          text: `\n\nstatusCode: ${err?.status} \n\nMessage : ${err?.message}\n\n stack: ${err?.stack} \n\n user:${req?.requestor?.id}`,
          color: "#FF0000",
        },
      ],
    });
  }

  logService.create({
    method: req.method,
    url: req.url,
    statusCode: err.status || res.statusCode,
    message: err.message || "Something went wrong!",
    stack: err.stack,
    payload: {
      params: req.params,
      body: req.body,
      query: req.query,
    },
    userId: req?.requestor?.id,
  });
});

module.exports = app;
