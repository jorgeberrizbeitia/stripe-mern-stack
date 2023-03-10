const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  price: Number, // the price of the transaction at the moment of purchase, in cents.
  paymentIntentId: String, // used for updating the status securely
  clientSecret: String, // used for updating the status securely
  status: {
    type: String,
    enum: ["incomplete", "succeeded"],
    default: "incomplete",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  // buyer: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User"
  // },
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
