const express = require("express");
const { check } = require("express-validator");
const feedController = require("../controllers/feed");
const router = express.Router();
const jwtIsAuth = require("../middleware/is-auth");

router.get("/post/:id", jwtIsAuth, feedController.getSinglePost);

// GET /feed/posts
router.get("/posts", jwtIsAuth, feedController.getPosts);

// POST /feed/post
router.post(
  "/post", jwtIsAuth,
  [
    check("title").trim().isLength({ min: 5 }),
    check("content").trim().isLength({ min: 5 }),
  ],
  feedController.postPost
);

//Using put for updating the post
router.put(
  "/post/:id", jwtIsAuth,
  [
    check("title").trim().isLength({ min: 5 }),
    check("content").trim().isLength({ min: 5 }),
  ],
  feedController.updatePost
);


router.delete("/post/:id", jwtIsAuth, feedController.deletePost);

module.exports = router;
