const path = require("path");
const fs = require("fs");
const p = path.join(path.dirname(require.main.filename), "data", "products.json");
const Cart = require("./cart.js");

const readProducts = callback => {
    fs.readFile(p, (err, fileContent) => {
        if (err || !fileContent) {  // Handle file read errors or empty file
            return callback([]);  // Return empty array if there's an error or file is empty
        }
        try {
            const products = JSON.parse(fileContent);
            callback(products);  // Return parsed data if successful
        } catch (parseError) {
            callback([]);  // Return an empty array if JSON parsing fails
        }
    })
}

const writeProducts = (updatedProducts) => {
    fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
        console.log(err);
    });
}

module.exports = class Product {
    constructor(title, imageUrl, description, price, id = null) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
        this.id = id;
    }

    save() {
        readProducts(products => {
            if (this.id) {
                const existingProductIndex = products.findIndex(productInListProducts => productInListProducts.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;
                writeProducts(updatedProducts);
            }
            else {
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), (err) => {
                    console.log(err);
                });
                writeProducts(products);
            }
        })
    }
    static fetchAll(asyncReturn) {
        readProducts(asyncReturn);
    }

    static getProductById(id, cbFunction) {
        Product.fetchAll(products => {
            const product = products.find(productInListProducts => productInListProducts.id === id);
            cbFunction(product);
        })
    }

    static deleteProduct(id) {
        Product.fetchAll(products => {
            const updatedProducts = products.filter(objProductInListProducts => id !== objProductInListProducts.id);
            const product = products.find(prod => prod.id === id);
            Cart.deleteProductFromCart(id, product.price);
            writeProducts(updatedProducts);
        })
    }
}