const { model, Schema } = require("mongoose");

const ReviewSchema = new Schema({
  tourGuideId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
  },
});

const Review = model("Review", ReviewSchema);

module.exports = Review;
