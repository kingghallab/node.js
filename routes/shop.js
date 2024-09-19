const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shop");

router.get("/", shopController.getIndex);

router.get("/cart", shopController.getShowCart);

router.post("/cart", shopController.postAddToCart);

router.post("/cart-delete-item", shopController.PostDeleteProductFromCart);

router.get("/products", shopController.getShowShop);

router.get("/products/:productId", shopController.getProductDetails);

router.get("/checkout", shopController.getCheckout);

router.get("/orders", shopController.getOrders);

module.exports = router;  