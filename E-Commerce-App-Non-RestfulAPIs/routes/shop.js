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

router.get("/checkout", isAuth, shopController.getCheckout);

router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);

router.get("/checkout/cancel", isAuth, shopController.getCheckout);


router.get("/orders", isAuth, shopController.getOrders);

router.post("/create-order", isAuth, shopController.postOrder)

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

module.exports = router;
