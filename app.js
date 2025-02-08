//routing framework
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const MONGODB_URI =
  "mongodb+srv://adhamghallab0:coDP0BdUg7zGeA4z@thecluster.9n4zf.mongodb.net/shop?retryWrites=true&w=majority&appName=theCluster";

const session = require("express-session");
const mongodbStore = require("connect-mongodb-session")(session);

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/404");
const loginRoute = require("./routes/auth");

const User = require("./models/user");

const store = new mongodbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

//Required for parsing incoming data
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

//For granting access to a file that should be accessed by the html views, which is the css file
// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "public")));
//note that when specifying a directory after this access grant, you are typically already inside the public file

// /admin is then added in the admin.js routes
// for example route get add product = /admin/add-product
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(loginRoute);

app.use(errorController.notFound404);

mongoose
  .connect(MONGODB_URI)
  // eslint-disable-next-line no-unused-vars
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
