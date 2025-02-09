const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");

const shopController = require("../controllers/shop");

router.get("/", shopController.getIndex);

router.get("/cart", isAuth, shopController.getShowCart);

router.post("/cart", isAuth, shopController.postAddToCart);

router.post("/cart-delete-item", isAuth, shopController.PostDeleteProductFromCart);

router.get("/products", shopController.getShowShop);

router.get("/products/:productId", shopController.getProductDetails);

// router.get("/checkout", shopController.getCheckout);

router.get("/orders", isAuth, shopController.getOrders);

router.post("/create-order", isAuth, shopController.postOrder)

module.exports = router;
