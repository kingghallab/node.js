require("dotenv").config();

const express = require("express");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    cb(null, timestamp + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(bodyParser.json()); // we use this to parse the incoming request body (JSON), note that the other one is for urlencoded
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/auth", authRoutes);
app.use("/feed", feedRoutes);

app.use("/images", express.static(path.join(__dirname, "images")));

// This is a middleware function that runs for every request to the server allow for client-side applications to make requests to the server from different origins (domains).
// This is important for APIs that are consumed by web applications hosted on different domains.
app.use((req, res, next) => {
  // To allow CORS (Cross-Origin Resource Sharing) for all routes and methods
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  // Allowing headers for the request
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Error Handling route
app.use((err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || 500;
  const message = err.message;
  const data = err.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(process.env.MONGODB_URI) //Changed database to messages
  .then((result) => {
    const server = app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
      console.log("Server is running on port 8080");
    });
    //Sets up socketIO by using the http server to establish the connection
    const io = require("./socket").init(server);
    //defining event listeners
    // (this function will be executed for every new client that connects)
    io.on('connection', socket => { //Socket refers to the client which connected 
      console.log('Client connected');
    
    });
  })
  .catch((err) => {
    console.log(err);
  });
