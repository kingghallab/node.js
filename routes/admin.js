const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");

router.get("/add-product", adminController.getAddProduct);
router.post("/add-product", adminController.postAddProduct);

router.get("/products", adminController.getProductsAdmin);

router.get("/edit-product/:productId", adminController.getEditProduct);
router.post("/edit-product", adminController.postEditProduct);

router.post("/delete-product/:productId", adminController.deleteProduct);
/*Both routers start with the same url /admin/add-product , yet they're different in purposes and both are accessible
under different methods: one is get and one is post .
*/

module.exports = router;

