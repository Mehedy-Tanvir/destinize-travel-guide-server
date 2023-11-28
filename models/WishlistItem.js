const { model, Schema } = require("mongoose");

const WishlistItemSchema = new Schema({
  tourist: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tourPackage: {
    type: Schema.Types.ObjectId,
    ref: "Tour",
    required: true,
  },
});

const WishlistItem = model("wishlistItem", WishlistItemSchema);

module.exports = WishlistItem;
