const router = require("express").Router();

const Product = require("../models/Product.model");

// GET "/api/product" => To send all products
router.get("/", async (req, res, next) => {
  try {
    const response = await Product.find()
    res.json(response)
  } catch(err) {
    next(err)
  }
})

// GET "/api/product/:productId" => To render details of a single product // ! see if needed
router.get("/:productId", async (req, res, next) => {
  try {
    const response = await Product.findById(req.params.productId)
    res.json(response)
  } catch(err) {
    next(err)
  }
})

// POST "/api/product" => To create a new product with name and price
router.post("/", async (req, res, next) => {
  const { name, price } = req.body;
  try {
    const response = await Product.create({
      name: name,
      price: price, // always in cents
    })
    res.json(response)
  } catch(err) {
    next(err)
  }
})

module.exports = router;
