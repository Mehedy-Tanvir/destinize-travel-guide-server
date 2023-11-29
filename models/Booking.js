const { model, Schema } = require("mongoose");
const BookingSchema = new Schema({
  tourist: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tourGuide: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tourPackage: {
    type: Schema.Types.ObjectId,
    ref: "Tour",
    required: true,
  },
  tourDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  discountedPrice: {
    type: Number,
  },
});

const Booking = model("Booking", BookingSchema);
module.exports = Booking;
