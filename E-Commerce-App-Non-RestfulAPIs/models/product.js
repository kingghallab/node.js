const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    // ref means refer to the model x, as this objectId could literally refer to any id
    // thus ref is used in this context to refer the objectId to the User model, as exported in the User Model
    ref: 'User',
    required: true
  }
});




module.exports = mongoose.model("Product", productSchema);
