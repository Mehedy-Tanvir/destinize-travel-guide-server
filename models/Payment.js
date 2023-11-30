const { model, Schema } = require("mongoose");
const PaymentSchema = new Schema({
  booking: {
    type: Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
});
const Payment = model("Payment", PaymentSchema);
module.exports = Payment;
