//routing framework
const express = require("express")
const app = express();
const path = require("path");
const sequelize = require("./helpers/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");


const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/404");
app.set("view engine", "ejs");
app.set("views", "views");

//Required for parsing incoming data
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    User.findByPk(1).then(user => {
        // @ts-ignore
        req.user = user;
        next();
    }).catch(err => console.log(err));

});


//For granting access to a file that should be accessed by the html views, which is the css file
app.use(express.static(path.join(__dirname, "public")));
//note that when specifying a directory after this access grant, you are typically already inside the public file

// /admin is then added in the admin.js routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.notFound404);



//defining sequelize relationships
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});




sequelize.sync().then(result => {
    return User.findByPk(1);

}).then(user => {
    if (!user) {
        return User.create({ name: "Adham", email: "adhamghallab0@gmail.com" });
    }
    return user;
    
}).then(user => {
    return user.getCart().then(cart=> {
        if (!cart) {
            return user.createCart();
        }
        return cart
    })
}).then(Cart => {
    app.listen(3000);
}).catch(err => {
    
    if (err) {
        console.log(err)
    }
});


