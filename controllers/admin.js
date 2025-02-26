const Product = require("../models/product");
const { validationResult } = require("express-validator");

exports.getProductsAdmin = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin/products.ejs", {
        products: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product.ejs", {
    pageTitle: "Product Addition",
    path: "/admin/add-product",
    operation: "Add Product",
    edit: false,
    oldInput: {
      title: "",
      imageUrl: "",
      description: "",
      price: "",
    },
    errorMessage: null,
    hasError: false,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).render("admin/edit-product.ejs", {
      pageTitle: "Product Addition",
      path: "/admin/add-product",
      operation: "Add Product",
      edit: false,
      errorMessage: validationErrors.array()[0].msg,
      product: {
        title: title,
        imageUrl: imageUrl,
        description: description,
        price: price,
      },
      hasError: true,
      validationErrors: validationErrors.array(),
    });
  }

  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    description: description,
    price: price,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      console.log("Created A Product Successfully!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    res.redirect("/");
  }

  const productId = req.params.productId;
  //note that `user` is what you also name the req parameter in the app.js file
  //instead of findByPk you can also use -thanks to the defined associations- req.user.getProducts
  Product.findById(productId)
    .then((product) => {
      if (!product) {
        res.redirect("/");
      }
      res.render("admin/edit-product.ejs", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        edit: editMode,
        product: product,
        errorMessage: null,
        hasError: false,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).render("admin/edit-product.ejs", {
      pageTitle: "Product Addition",
      path: "/admin/add-product",
      operation: "Add Product",
      edit: false,
      errorMessage: validationErrors.array()[0].msg,
      product: {
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        price: req.body.price,
      },
      hasError: true,
      validationErrors: validationErrors.array(),
    });
  }
  Product.findById(req.body.productId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = req.body.title;
      product.imageUrl = req.body.imageUrl;
      product.description = req.body.description;
      product.price = req.body.price;
      return product.save().then((result) => {
        console.log("Product is Updated");
        res.redirect("/");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteOne({ _id: productId, userId: req.user._id })
    .then((result) => {
      console.log(`Destroyed Product With Id: ${productId}`);
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
