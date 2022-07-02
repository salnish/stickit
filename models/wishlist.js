const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  products: [
    {
      pro_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
    },
  ],
});
const wishlist = mongoose.model("wishlist", wishlistSchema);
module.exports = wishlist;