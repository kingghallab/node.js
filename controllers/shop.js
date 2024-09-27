/**
 * @type {import('sequelize').Model} Product
 */

const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getShowShop = (req, res, next) => {
    Product.findAll()
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
        .getCart()
        .then((cart) => {
            return cart
                .getProducts()
                .then((products) => {
                    res.render("shop/cart.ejs", {
                        pageTitle: "Cart",
                        path: "/cart",
                        products: products,
                    });
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
};

exports.postAddToCart = (req, res, next) => {
    const productId = req.body.productId; //using body as product id is a hidden value passed from the add to cart form
    let fetchedCart;
    let newQuantity = 1;
    req.user
        .getCart()
        .then((cart) => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } });
        })
        .then((products) => {
            let product;
            if (products.length > 0) {
                product = products[0];
            }
            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return (
                Product
                    // @ts-ignore
                    .findByPk(productId)
            );
        })
        .then((product) => {
            return fetchedCart.addProduct(product, {
                through: { quantity: newQuantity },
            });
        })
        .then(() => {
            res.redirect("/cart");
        })
        .catch((err) => console.log(err));
};

exports.PostDeleteProductFromCart = (req, res, next) => {
    const prodId = req.body.productId;
    let fetchedCart;
    req.user
        .getCart()
        .then((cart) => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: prodId } });
        })
        .then((products) => {
            let product = products[0];
            return product.cartItem.destroy();
        })
        .then((result) => {
            res.redirect("/cart");
        })
        .catch((err) => console.log(err));
};

exports.getProductDetails = (req, res, next) => {
    const prodId = req.params.productId; //using params as product id is a parameter in the url
    Product.findByPk(prodId)
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
    Product.findAll()
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
    req.user.getCart().then(cart => {
        return cart.getProducts();
    })
    .then(products => {
        console.log(products);
    })
    res.render("shop/orders.ejs", { pageTitle: "Order Page", path: "/orders" });
};
