const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const { default: mongoose } = require("mongoose");
const post = require("../models/post");
const io = require("../socket"); // Importing the socket instance

exports.getSinglePost = async (req, res, next) => {
  const postId = req.params.id;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Post Doesn't Exist");
      error.statusCode = 404;
      throw error;
    }
    console.log("Sending imageUrl:", post.imageUrl);
    res.status(200).json({
      message: "Post Fetched",
      post: post,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator") // This populates the creator field with the user data
      .sort({ createdAt: -1 }) // This sorts the posts by createdAt field in descending order
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({
      message: "Posts fetched successfully",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed, Enter data correctly!");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided!");
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = "images/" + req.file.filename; // This Fixed the issue of imageUrl being sent as a windows path, this sends it as a url path for browsers
  // with forward slashes instead of back slashes
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    io.getIo().emit("posts", {
      action: "create",
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
    });
    res
      .status(201) // 201 means created
      .json({
        message: "Post created!",
        post: post,
        creator: { _id: post.creator._id, name: post.creator.name },
      });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed, Enter data correctly!");
    error.statusCode = 422;
    throw error;
  }
  const postId = req.params.id;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image; // This is the old imageUrl
  if (req.file) {
    imageUrl = "images/" + req.file.filename; // This is the new imageUrl
  }
  if (!imageUrl) {
    const error = new Error("No file picked!");
    error.statusCode = 422;
    throw error;
  }
  try {
    // This populates the creator field with the user data
    const post = await Post.findById(postId).populate("creator");
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not Authorized");
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl); // This is the old imageUrl to delete it
    }
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    const result = await post.save();
    io.getIo().emit("posts", {
      action: "update",
      post: result,
    });
    res.status(200).json({
      message: "Post updated!",
      post: result,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.id;
  try {
    const post = await Post.findById(postId);
    //Check if the one who requested the deletion is the currently logged in user
    if (!post) {
      const error = new Error("Post Doesn't Exist");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not Authorized");
      error.statusCode = 403;
      throw error;
    }
    clearImage(post.imageUrl);
    await Post.findByIdAndDelete(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    io.getIo().emit("posts", {
      action: "delete",
      post: postId,
    });
    res.status(200).json({ message: "Deleted Post Successfully" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath); // This is the path to the image
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
