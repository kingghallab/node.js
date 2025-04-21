const express = require("express");
const { check, body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/auth");
const User = require("../models/user");
const isAuth = require("../middleware/is-auth");
router.put(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Email is invalid! Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email Address Already Exists! Please enter a different Email."
            );
          }
        });
      })
      .normalizeEmail(),
    check("password").trim().isLength({ min: 5 }),
    check("name").trim().not().isEmpty(),
  ],
  authController.signUp
);

router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Email is invalid!"),
    check("password").trim().isLength({ min: 5 }),
  ],
  authController.PostLogin
);


router.get('/status', isAuth, authController.getUserStatus);

router.patch(
  '/status',
  isAuth,
  [
    body('status')
      .trim()
      .not()
      .isEmpty()
  ],
  authController.updateUserStatus
);

module.exports = router;
