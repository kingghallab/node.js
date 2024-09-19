const path = require("path");
const fs = require("fs");
const Product = require("./product");
const p = path.join(path.dirname(require.main.filename), "data", "cart.json");

module.exports = class Cart {

    static addProductToCart(id, price) {
        //fetch previous cart

        fs.readFile(p, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 };
            if (!err) {
                cart = JSON.parse(fileContent);
            }
            //Analyze Cart and find if existing product
            const existingProductIndex = cart.products.findIndex(product => product.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            if (existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            }
            else {
                updatedProduct = { id: id, qty: 1 };
                cart.products = [...cart.products, updatedProduct];
            }

            cart.totalPrice = cart.totalPrice + +price;
            fs.writeFile(p, JSON.stringify(cart), err => {
                if (err) {
                    console.log(err);
                }
            })
        })
    }

    static deleteProductFromCart(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                console.log(err);
                return;
            }
            let updatedCart = JSON.parse(fileContent);
            const existingProduct = updatedCart.products.find(product => product.id === id);
            if (existingProduct) {
                updatedCart.totalPrice = updatedCart.totalPrice - (+productPrice) * existingProduct.qty;
                updatedCart.products = updatedCart.products.filter(productInProductsArray => productInProductsArray.id !== id);
                fs.writeFile(p, JSON.stringify(updatedCart), err => {
                    if (err) {
                        console.log(err);
                    }
                })
            }
        })
    }

    static getCartProductsId(cbFunction) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                cbFunction(null);
            }
            cbFunction(JSON.parse(fileContent));
        })
    }
}