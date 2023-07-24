const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

dotenv.config();

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
// Enable compression middleware
app.use(compression());
// Enhance security with helmet middleware
app.use(helmet());

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
    .then(async (result) => {
      console.log(`✔ Database connection successful! 🎯`);
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

  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Unknown Error",
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
    payload: {
      params: req.params,
      body: req.body,
      query: req.query,
    },
    userId: req?.requestor?.id,
  });
});

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = app.listen(port, () => {
  console.log(`🧑🏻‍💻Server is listening to port ${port}`);
});

server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
});

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

module.exports = app;
