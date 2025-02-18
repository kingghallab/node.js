const Product = require("../models/product");
const Order = require("../models/order");

exports.getShowShop = (req, res, next) => {
  Product.find()
    .then((ProductsList) => {
      res.render("shop/product-list.ejs", {
        products: ProductsList,
        pageTitle: "ALL PRODUCTS",
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getShowCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      let products = user.cart.items;
      // console.log(products);
      res.render("shop/cart.ejs", {
        pageTitle: "Cart",
        path: "/cart",
        products: products,
      });
    })
    .catch((err) => console.log(err));
};

exports.postAddToCart = (req, res, next) => {
  const productId = req.body.productId; //using body as product id is a hidden value passed from the add to cart form
  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      // console.log(result);
      console.log(`Added Product with ID ${productId} to cart`);
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.PostDeleteProductFromCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.deleteOneFromCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
      console.log(`Deleted Product with ID ${prodId} from cart`);
    })
    .catch((err) => console.log(err));
};

exports.getProductDetails = (req, res, next) => {
  const prodId = req.params.productId; //using params as product id is a parameter in the url
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail.ejs", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((ProductsList) => {
      res.render("shop/index.ejs", {
        products: ProductsList,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout.ejs", {
    pageTitle: "Check Out",
    path: "/checkout",
  });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders.ejs", {
        pageTitle: "Order Page",
        path: "/orders",
        orders: orders,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      console.log(products);
      const order = new Order({
        products: products,
        user: { email: req.user.email, userId: req.user },
      });
      return order.save();
    })
    .then((result) => {
      req.user.clearCart();
      res.redirect("/orders");
    });
};
