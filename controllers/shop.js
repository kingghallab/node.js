const Product = require("../models/product");
const Cart = require("../models/cart");


exports.getShowShop = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render("shop/product-list.ejs", {
            products: products,
            pageTitle: "ALL PRODUCTS",
            path: "/products",
        });
    });
};

exports.getShowCart = (req, res, next) => {
    Cart.getCartProductsId((cart) => {
        Product.fetchAll(theProducts => {
            const showCart = [];
            for (product of theProducts) {
                const showProduct = cart.products.find(productInCart => productInCart.id === product.id);
                if (showProduct) {
                    showCart.push({productData: product, productQty: showProduct.qty});
                }
            }
            res.render("shop/cart.ejs", {
                pageTitle: "Cart",
                path: "/cart",
                products: showCart
            });
        })
            
    });
};


exports.postAddToCart = (req, res, next) => {
    const productId = req.body.productId; //using body as product id is a hidden value passed from the add to cart form
    Product.getProductById(productId, (product) => {
        Cart.addProductToCart(productId, product.price);
    });
    res.redirect("/cart");
};

exports.PostDeleteProductFromCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.getProductById(prodId, product => {
        Cart.deleteProductFromCart(prodId, product.price);
    })
    res.redirect("/cart");
}


exports.getProductDetails = (req, res, next) => {
    const prodId = req.params.productId; //using params as product id is a parameter in the url
    Product.getProductById(prodId, (product) => {
        res.render("shop/product-detail.ejs", {
            product: product,
            pageTitle: "Product Details",
            path: "/products",
        });
    });
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render("shop/index.ejs", {
            products: products,
            pageTitle: "Shop",
            path: "/",
        });
    });
};

exports.getCheckout = (req, res, next) => {
    res.render("shop/checkout.ejs", {
        pageTitle: "Check Out",
        path: "/checkout",
    });
};

exports.getOrders = (req, res, next) => {
    res.render("shop/orders.ejs", { pageTitle: "Order Page", path: "/orders" });
};
