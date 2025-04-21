const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required  : true
    },
  },
  { timestamps: true } // Saves createdAt + updatedAt automatically 
);

module.exports = mongoose.model("Post", postSchema); //Mongoose will automatically create a "Post" collection inside the db