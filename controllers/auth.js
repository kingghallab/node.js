const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

//Send Mail Logic... Returns a promise, you can chain .this().catch()
//Tested in postSignup

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
function sendEmail(email, subject, html) {
  const msg = {
    to: email,
    from: "adham_ghallab4@hotmail.com",
    subject: subject,
    text: "This is a test email. If you are seeing this, your email client does not support HTML.",
    html: html,
  };
  return sgMail.send(msg);
}

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: ""
    },
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: validationErrors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
    });
  }
  
      bcrypt
        .compare(password, user.password)
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
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};
exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: ""
    },
    validationErrors: []
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: validationErrors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword
      },
      validationErrors: validationErrors.array()
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      sendEmail(
        email, //to email
        "Successfully Signed Up", // sub
        "<strong>Welcome To Node.js E-Commerce Website</strong>"
      )
        .then(() => {
          console.log("Signup Email sent successfully");
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.reset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash(
            "error",
            "E-mail Doesn't Exist, Please Enter A Valid E-mail."
          );
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; //1 hour in mille seconds
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        sendEmail(
          req.body.email, //to email
          "Password Reset Request", // sub
          `<p>Here's your password reset link, expires in 1 hour</p>
          <p>Click This <a href="http://localhost:3000/reset/${token}">Link</a></p>
          `
        )
          .then(() => {
            console.log("Reset Password Email sent successfully");
          })
          .catch((error) => {
            console.error("Error sending email:", error);
          });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token; //Extract Token from /reset/${token}
  console.log("Token used in reset:", token);
  // console.log(Date.now());
  // $gt: Date.now() means check if date of reset token expiration > the date now
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      if (!user) {
        req.flash("error", "Something Went Wrong, Please Try Again Later.");
        console.log(
          "User tried to reset a password using a wrong or expired token"
        );
        return res.redirect("/reset");
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Enter New Password",
        errorMessage: message,
        userId: user._id.toString(),
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const userId = req.body.userId;
  let updatedUser; //to be able to use it in second-then block
  User.findOne({ _id: userId })
    .then((user) => {
      updatedUser = user;
      if (!user) {
        req.flash("error", "Something Went Wrong, Please Try Again Later.");
        console.log(
          `when fetching user with userId: ${userId}, no users are found in db`
        );
        return res.redirect("/reset");
      }
      return bcrypt.hash(req.body.password, 12);
    })
    .then((newHashedPassword) => {
      updatedUser.password = newHashedPassword;
      updatedUser.resetToken = null;
      updatedUser.resetTokenExpiration = undefined;
      return updatedUser.save();
    })
    .then((result) => res.redirect("/login"))
    .catch((err) => console.log(err));
};
