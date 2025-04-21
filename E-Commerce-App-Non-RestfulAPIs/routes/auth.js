// to implement what you've done in post signup for user experience
// you have to validate email and password using check again, and then take the code in controller and put it there as a .custom method, also don't forget to
// add changes in the view to render them correctly like, old input and red border class for invalid input

const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { check } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  // Validate email and password array
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter A Valid Email!")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            // Notice here that this is asynchronous, so we return a promise
            return Promise.reject(
              "Email Already Exists, Please Pick A Different One!"
            );
          }
          return true; // Return true if email is unique
        });
      }),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Please Enter A Password That's more than 5 characters long")
      .isAlphanumeric()
      .withMessage(
        "Please Re-enter the password, only alphanumeric characters are allowed"
      )
      .trim()
      .custom((value, { req }) => {
        // Notice here that this is synchronous, so we don't need to return a promise
        if (value !== req.body.confirmPassword) {
          throw new Error("Passwords Do Not Match!");
        }
        return (req.session.user = user);
      }), // Check if password matches confirmPassword
      check("confirmPassword")
      .trim()
  ],
  authController.postSignup
);
router.post("/logout", authController.postLogout);
router.get("/reset", authController.reset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
