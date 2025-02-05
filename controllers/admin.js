const Product = require("../models/product");


exports.getProductsAdmin = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("admin/products.ejs", {
        products: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product.ejs", {
    pageTitle: "Product Addition",
    path: "/admin/add-product",
    operation: "Add Product",
    edit: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    description: description,
    price: price,
    userId: req.user
  });
  //this createProduct method is available via the defined relations in app.js, it's a specific method created by sequelize create`whatever table name u defined`({object that has data entries})
  product
    .save()
    .then((result) => {
      console.log("Created A Product Successfully!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
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
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  Product.findById(req.body.productId)
    .then((product) => {
      product.title = req.body.title;
      product.imageUrl = req.body.imageUrl;
      product.description = req.body.description;
      product.price = req.body.price;
      return product.save();
    })
    .then((result) => {
      console.log("Product is Updated");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findByIdAndDelete(productId)
    .then((result) => {
      console.log(`Destroyed Product With Id: ${productId}`);
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
