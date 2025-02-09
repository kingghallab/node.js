const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");

const adminController = require("../controllers/admin");

router.get("/add-product", isAuth, adminController.getAddProduct);
router.post("/add-product", isAuth, adminController.postAddProduct);

router.get("/products", isAuth, adminController.getProductsAdmin);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post("/edit-product", isAuth, adminController.postEditProduct);

router.post("/delete-product/:productId", isAuth, adminController.deleteProduct);
/*Both routers start with the same url /admin/add-product , yet they're different in purposes and both are accessible
under different methods: one is get and one is post .
*/

module.exports = router;

