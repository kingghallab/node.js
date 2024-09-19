//routing framework
const express = require("express") 
const app = express();
const path = require("path");
const db = require("./helpers/database");


const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/404");
app.set("view engine", "ejs");
app.set("views", "views");


//Required for parsing incoming data
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}));

//For granting access to a file that should be accessed by the html views, which is the css file
app.use(express.static(path.join(__dirname, "public")));
//note that when specifying a directory after this access grant, you are typically already inside the public file

// /admin is then added in the admin.js routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.notFound404);

app.listen(3000);
