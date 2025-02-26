const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const { check } = require("express-validator");

const adminController = require("../controllers/admin");

router.get("/add-product", isAuth, adminController.getAddProduct);
router.post(
  "/add-product",
  [
    check("title").isString().isLength({ min: 3 }).trim().withMessage("Title must be alphanumeric and at least 3 characters long"),
    check("imageUrl").isURL().withMessage("Please enter a valid URL for the image"),
    check("price").isFloat().withMessage("Please enter a valid price"),
    check("description").isLength({ min: 5, max: 400 }).trim().withMessage("Description must be between 5 and 400 characters long"),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/products", isAuth, adminController.getProductsAdmin);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post(
  "/edit-product",
  [
    check("title").isString().isLength({ min: 3 }).trim().withMessage("Title must be alphanumeric and at least 3 characters long"),
    check("imageUrl").isURL().withMessage("Please enter a valid URL for the image"),
    check("price").isFloat().withMessage("Please enter a valid price"),
    check("description").isLength({ min: 5, max: 400 }).trim().withMessage("Description must be between 5 and 400 characters long"),
  ],
  isAuth,
  adminController.postEditProduct
);
 
router.post(
  "/delete-product",
  isAuth,
  adminController.deleteProduct
);

module.exports = router;
