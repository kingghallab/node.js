const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product.ejs", {
        pageTitle: "Product Addition",
        path: "/admin/add-product",
        operation: "Add Product",
        edit: false
    });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;

    if (!editMode) {
        res.redirect("/");
    }

    const productId = req.params.productId;
    Product.getProductById(productId, (product) => {
        if (!product) {
            res.redirect("/");
        }
        res.render("admin/edit-product.ejs", {
            pageTitle: "Edit Product",
            path: "/admin/edit-product",
            edit: editMode,
            product: product,
        });
    });
};

exports.postEditProduct = (req, res, next) => {
    const Edited = new Product(req.body.title, req.body.imageUrl, req.body.description, req.body.price, req.body.productId);
    Edited.save(); 
    res.redirect("/");
}

exports.postAddProduct = (req, res, next) => {
    const product = new Product(
        req.body.title,
        req.body.imageUrl,
        req.body.description,
        req.body.price
    );
    product.save();
    res.redirect("/");
};

exports.getProductsAdmin = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render("admin/products.ejs", {
            products: products,
            pageTitle: "Admin Products",
            path: "/admin/products",
        });
    });
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.deleteProduct(productId);
    res.redirect("/admin/products");
}

