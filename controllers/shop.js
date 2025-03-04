const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const pdfkit = require("pdfkit");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const ITEMS_PER_PAGE = 2;

exports.getShowShop = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((ProductsList) => {
      res.render("shop/product-list.ejs", {
        products: ProductsList,
        pageTitle: "ALL PRODUCTS",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((ProductsList) => {
      res.render("shop/index.ejs", {
        products: ProductsList,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let totalPrice;
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      totalPrice = 0;
      products.forEach((p) => {
        totalPrice += p.quantity * p.productId.price;
      });
      return stripe.checkout.sessions.create({
        payment_method_types: ["card"], // You can add more like "paypal"
        mode: "payment", // "subscription" for recurring payments
        success_url:
          req.protocol + '://' + req.get("host") + "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: req.protocol + '://' + req.get("host") + "/checkout/cancel",
        line_items: products.map((p) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: p.productId.title,
              description: p.productId.description,
            },
            unit_amount: p.productId.price * 100, // Convert to cents
          },
          quantity: p.quantity,
        })),
      });
    })
    .then((session) => {
      res.redirect( session.url );
      // res.render("shop/checkout.ejs", {
      //   pageTitle: "Check Out",
      //   path: "/checkout",
      //   products: products,
      //   totalSum: totalPrice,
      //   sessionId: session.id,
      // });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
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
}

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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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

// This function is used to get the invoice of an order and send it to user
exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);
      // const file = fs.createReadStream(invoicePath);
      const pdfDoc = new pdfkit();
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text("Invoice", { underline: true });
      pdfDoc.fontSize(14).text("--------------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc.text(
          `${prod.product.title} - ${prod.quantity} x $${prod.product.price}`
        );
      });
      pdfDoc.text("--------------------------");
      pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);
      pdfDoc.end();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      // file.pipe forwards the data to the response stream, it converts the readable stream to a writable stream
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
