const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true }
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteOneFromCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = this.cart.items[cartProductIndex].quantity - 1;
  const updatedCartItems = [...this.cart.items];
  updatedCartItems[cartProductIndex].quantity = newQuantity;
  if (updatedCartItems[cartProductIndex].quantity <= 0) {
    updatedCartItems.splice(cartProductIndex, 1);
  }
  this.cart.items = updatedCartItems;
  return this.save();
}

userSchema.methods.clearCart = function() {
  this.cart = {items: []};
  return this.save();
}

module.exports = mongoose.model("User", userSchema);
