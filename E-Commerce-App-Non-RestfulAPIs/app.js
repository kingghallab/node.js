//For environment variables, notice that you include that file in gitignore, to not leak your api keys or db uri
require("dotenv").config();

//routing framework
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const csrf = require("csurf");
const csrfProtection = csrf();
const flash = require("connect-flash"); //For sending error messages when user does sth wrong eg: login with false credentials

const session = require("express-session");
const mongodbStore = require("connect-mongodb-session")(session);

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/404");
const loginRoute = require("./routes/auth");

const User = require("./models/user");

const store = new mongodbStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

const multer = require("multer"); //For parsing incoming files
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/:/g, "-"); // Replace colons with dashes
    cb(null, `${timestamp}-${file.originalname}`);
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
//Required for parsing incoming data
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    secret: "A Secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// This is for adding isAuthenticated and csrfToken to rendering All views
// equivalent to: isAuthenticated: req.session.isLoggedIn,
//                csrfToken: req.csrfToken()
// when rendering the view
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

//For granting access to a file that should be accessed by the html views, which is the css file
// This is called static file serving
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

//note that when specifying a directory after this access grant, you are typically already inside the public file

// /admin is then added in the admin.js routes
// for example route get add product = /admin/add-product
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(loginRoute);

//500 error handling, this gets invoked when an error is thrown in the app like this in a catch block
// Note that this skips all the middleware a nd goes directly to the error handling middleware which is the last one
// this gets triggered when you throw new Error(err) in the code, express then collects all errors and sends it to this middleware
// Thats the block you want added in catch
// const error = new Error(err);
// error.httpStatusCode = 500;
// return next(error);-
app.get("/500", errorController.get500);
app.use((err, req, res, next) => {
  res.redirect("/500");
  console.log(err);
});

app.use(errorController.notFound404);

mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.log(err);
  });
