const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number, // the price for the product. For best practice, it should be set in cents and as integer. not EUR/USD.
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
