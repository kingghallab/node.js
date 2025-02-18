const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { check } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

router.get("/login", authController.getLogin);
router.post("/login", [check("email").custom((value, {req}) => {
    return User.findOne({ email: value })
        .then((user) => {
          if (!user) {
            return Promise.reject("Invalid Email or Password!");
          }
          return true;
        }), check("password").custom((value, {req}) => { 
            
            bcrypt
                .compare(value, user.password)
                .then((doMatch) => {
                  if (doMatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save((err) => {
                      console.log(err);
                      res.redirect("/");
                    });
                  }
                  req.flash("error", "Invalid Email Or Password."); // Invalid Password, password doesn't match hashed pw
                  res.redirect("/login");
                })})], authController.postLogin);
router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  // Validate email and password array
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter A Valid Email!")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
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
      ).custom((value, { req }) => { 
        if (value !== req.body.confirmPassword) {
          throw new Error("Passwords Do Not Match!");
        }
        return true;
      }), // Check if password matches confirmPassword
  ],
  authController.postSignup
);
router.post("/logout", authController.postLogout);
router.get("/reset", authController.reset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
