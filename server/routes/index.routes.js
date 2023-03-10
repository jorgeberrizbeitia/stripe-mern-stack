const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

const productRoutes = require("./product.routes")
router.use("/product", productRoutes)

const paymentRoutes = require("./payment.routes")
router.use("/payment", paymentRoutes)

module.exports = router;
