//routing framework
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/404");

const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "views");

//Required for parsing incoming data
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  User.findById("6797b2eb61c057edae0888ad") //Admin User (Me)
    .then((user) => {
      // @ts-ignore
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

//For granting access to a file that should be accessed by the html views, which is the css file
app.use(express.static(path.join(__dirname, "public")));
//note that when specifying a directory after this access grant, you are typically already inside the public file

// /admin is then added in the admin.js routes
// for example route get add product = /admin/add-product
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.notFound404);

mongoose
  .connect(
    "mongodb+srv://adhamghallab0:coDP0BdUg7zGeA4z@thecluster.9n4zf.mongodb.net/shop?retryWrites=true&w=majority&appName=theCluster"
  )
  .then((result) => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: "Adham",
          email: "adhamghallab0@gmail.com",
          cart: { items: [] },
        });
        user.save();
      }
    })
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
