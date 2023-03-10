const router = require("express").Router();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // make sure to add your Stripe Secret Key to the .env

const Product = require("../models/Product.model.js")
const Payment = require("../models/Payment.model.js")

//     make sure the route is private by adding the middleware to access the buyer id (not done in this example)
//                                   |
router.post("/create-payment-intent", async (req, res, next) => {

  const productId = req.body._id; // this is the productId. It can also be sent via params

  try {

    // here we obtain the correct price directly from the database to avoid manipulations of price done in the frontend
    const product = await Product.findById(productId)
    const priceToPay = product.price // if not stored in cents, make sure to convert them to cents

    const paymentIntent = await stripe.paymentIntents.create({
      // amount: 1400, // always in cents
      amount: priceToPay, // always in cents
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // here we create a new Payment that will track the purchases made
    await Payment.create({
      price: priceToPay,
      product: productId,
      status: "incomplete",
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      // buyer: req.payload // example to add who bought the product (not done in this example)
    })
  
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
    
  } catch (error) {
    next(error)
  }

});

//     make sure the route is private by adding the middleware to access the buyer id (not done in this example)
//                                    |
router.patch("/update-payment-intent", async (req, res, next) => {
  const { clientSecret, paymentIntentId } = req.body;

  try {
    await Payment.findOneAndUpdate({
      clientSecret: clientSecret,
      paymentIntentId: paymentIntentId,
    },{ 
      status: "succeeded" 
    });
    res.status(200).json();
  } catch (error) {
    next(error);
  }
});

module.exports = router
