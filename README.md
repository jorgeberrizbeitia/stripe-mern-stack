# STRIPE SETUP FOR MERN STACK

[Stripe](https://stripe.com/) is one of the most used packages for creating a payment platform in a web app. It makes use of a secure flow added in both the Frontend and the Backend.

Although Stripe has different flows and interactions possible for different payment enviroments, the following example will focus on a simple flow where the user sees a Document they want to purchase, adds some credit card information, the payment is received in the stripe dashboard and our app will create a Document for the Transaction.

# PRE STEPS

This example asumes you already have a MERN full stack flow where a user can see the details of a Product they would like to purchase, including the price. The user will attempt to purchase that single Product.

After this example is implemente, additional modifications could be done, like changing quantities, or even creating a shopping cart flow where multiple documents could be added for a single payment.

NOTE: All of the functionality will be made on a Stripe Test Mode where you will be able to implement and test the full payment flow, however, all payment attempts will be made with test credit card information provided by stripe. Also the credentials needed (even though they should always be kept private) will be for Test Mode only. If you wish to implement this package on full production (being able to receive real payments), you will need to link a real bank account and finish the stripe account process, but this is not the focus of the example.

# STRIPE REGISTER

- Create an account or log into [Stripe](https://stripe.com/) and go to the Stripe Dashboard.

- Check on the right bottom segment, a section for Developers, where you will see a `Publishable key` and a `Secret key`. You will need to use these two values during the implementation.

- During the implementation, we will use two sections of the stripe web:

- Section 1. In the [Stripe](https://stripe.com/) dashboard, Go to the `Payments` tab. This is where you will see a history of payment attemps with different status (incomplete, succeeded and rejected). Remember all of this is in Test Mode.

- Section 2. Go to [Stripe Documentation](https://stripe.com/docs) and click on the `Payments` tab, then click on the `Acept Online Payments` card. From here, click on the top `React` and `Node` Options. Finally, from the two options, click on `Custom Payment Flow`. This is where you will see the expected result and the code provided by stripe to implement it. During this example you will see code snippets taken from this documentation and slighly modified to adapt it.

NOTE: this guided example has 2 main parts:

  - **Part 1.** Focuses on implementing a basic payment platform that receives a product and allows the user to make a payment based on the product price. After payment is completed a simple redirect will happen. The payment history will be available in the stripe web dashboard.
  - **Part 2.** Focuses on creating a new Model that will store in our database the payment history through documents that will record when a user attepts to purchase and item, and if it succeeded or failed in doing so.

# PART 1. IMPLEMENTING PAYMENT PROCESS AND FORM THROUGH STRIPE.

## 1.1. BACKEND CONFIG. Apply all below steps on your Server side.

- Note: we will asume you already have a model for the Products to be bought with their `price`. For best practices the `price` value for the products should be set in cents and as an integer, not EUR/USD. This is not only a recommendation as it is commonly done, but also facilitates the use of Stripe (which takes payment values in cents)

- Install the stripe package required in the backend

```bash
npm install stripe
```

- Add a variable to the `.env` file named `STRIPE_SECRET_KEY` with the value for your stripe `Secret key`.

```.env
STRIPE_SECRET_KEY=value
```

- Create a route file where we will store our payment routes. The first one will receive a payment intent from the Frontend and send the payment intent to Stripe.

```javascript
// in "routes/index.routes.js"

// ...

const paymentRoutes = require("./payment.routes")
router.use("/payment", paymentRoutes)

// ...
```

```javascript
// in "routes/payment.routes.js"

const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // make sure to add your Stripe Secret Key to the .env

router.post("/create-payment-intent", async (req, res) => {

  const productId = req.body._id; // this is how we will receive the productId the user is trying to purchase. This can also later be set to receive via params.

  try {

    // TODO . this is where you will later get the correct price to be paid

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1400, // this is an example for an amount of 14 EUR used for testing.
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // TODO on part 2. this is where you will later create a Payment Document later
  
    res.send({
      clientSecret: paymentIntent.client_secret, // the client secret will be sent to the FE after the stripe payment intent creation
    });
    
  } catch (error) {
    next(error)
  }
});

module.exports = router
```

***

## 1.2. FRONTEND CONFIG. Apply all below steps on your Client side.

- Install the required packages used for Stripe in the Frontend

```bash
npm install @stripe/react-stripe-js @stripe/stripe-js
```

- Create a `.env.local` file. Inside, add a variable to named `REACT_APP_STRIPE_PUBLISHABLE_KEY` with the value for your stripe `Publishable key`. Also add a variable that points to the current Frontend url, this is used for a stripe redirection process. *Important:* the current naming `REACT_APP_VARIABLE NAME` applies to projects created with create-react-app. If using VITE, rename to `VITE_VARIABLE NAME`.

```.env
REACT_APP_CLIENT_URL=http://localhost:3000
REACT_APP_STRIPE_PUBLISHABLE_KEY=value

# ... or

VITE_CLIENT_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=value
```

- Create a `<CheckoutForm>` component that will render the credit card form. This component will contact Stripe for card approval and it will also later contact our backend for changing the status of our `Payment` documents.

- You can find all the code for this component below. Most of the code comes from the stripe documentatio. We only make a small change in `return_url:` where we indicate the URL the user should be redirected after payment. Currently: `${process.env.REACT_APP_CLIENT_URL}` or `${import.meta.env.VITE_CLIENT_URL}` which will point to home. This can later be changed if we want a specific page for payment success.

- Asides from that, we won't need to make any changes to this file.

```jsx
// in "src/components/CheckoutForm.jsx"

import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        // !IMPORTANT. If using VITE, make sure you use the correct variable naming and usage (import.meta.env.VITE_VARIABLE_NAME)
        return_url: `${process.env.REACT_APP_CLIENT_URL}`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs"
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      {/* <LinkAuthenticationElement
        id="link-authentication-element"
        onChange={(e) => setEmail(e.target.value)}
      /> */}
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <button disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}

export default CheckoutForm;
```

- Create a component called `<PaymentIntent>` that will receive the product to buy, and when rendered, will contact the backend to create a payment intent both in stripe and later in our Database. Then it will render the previously created `<CheckoutForm>`.

- You can find the code for the component below. Most of the code comes from the stripe documentation with some slight modifications. You can see the component should receive a prop with the product to purchase as `productDetails`. Also in the function `handleUseEffect`, you can see the connection with the service/route to create the payment intent in the backend when the component renders for the first time.

```jsx
// in "src/components/PaymentIntent.jsx"

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutForm from "./CheckoutForm";

import axios from "axios";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY); // Make sure you add your publishable API key to the .env.local
// !IMPORTANT. If using VITE, make sure you use the correct variable naming and usage (import.meta.env.VITE_VARIABLE_NAME)

function PaymentIntent({ productDetails }) {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    handleUseEffect()
  }, []);
  
  const handleUseEffect = async () => {
    //                                                        this is the product that the user is trying to purchase, sent to the backend
    //                                                                                                  |
     const response = await axios.post("http://localhost:5005/api/payment/create-payment-intent", productDetails)
    // !IMPORTANT: Adapt the request structure to the one in your project (services, .env, auth, etc...)

    setClientSecret(response.data.clientSecret)
  }

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="App">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}

export default PaymentIntent;
```

- Go to the component where you are displaying the details of the Product the user is attempting the Buy.

- Add a new state `showPaymentIntent` that will be used to render the `<PaymentIntent>` and `<CheckoutForm>` when the user wants to buy the product. The value should be a `boolean` that starts as `false`.

```jsx
const [showPaymentIntent, setShowPaymentIntent] = useState(false)
```

- Anywhere in the same component (where you have access to the details of the product) add a ternary that will display the button to purchase if `showPaymentIntent` is `false` and the `<PaymentIntent>` component if `true`. The button will toggle the state.

- Make sure `<PaymentIntent>` is passing props with the details of the product. You should be able to have this data in this component.

```jsx
<div>
  { 
    showPaymentIntent === false
    ? <button onClick={() => setShowPaymentIntent(true)}>Purchase</button> 
    : <PaymentIntent productDetails={ /* pass the details of the product to buy here as props */ }/> 
  }
</div>
```

- You can now test the process before making the final changes:

  - Go to the Product details in the browser. Try to click on the button to `Purchase`. You should see the Card Checkout Form in the page.
  - Before filling out the card info. Check the Stripe Dashboard in the `Payments` tab. You should see a paymentIntent marked as incomplete for EUR 14.00
  - Go back to the checkout form and try the following Test Card provided by Stripe:
    - Card Number 4242 4242 4242 4242
    - Expiration Date: Any future date.
    - CVC: Any 3 digit number.
    - Country: Any value.
    - Click `Pay`.
    - You should be redirected to the home page (we will change this flow later).
    - Go back to the stripe dashboard and you should see the payment succeeded.
    - The above card will test a succesfull card, you can also test a rejected card with the card number: 4000 0000 0000 9995

- The last step of this part will be passing the correct product price to stripe for the payment.

- Go to the backend on `payment.routes.js`, and right before creating the payment Intent, look for your product document using the `productId`. Then replace in the amount property where it says `1400` for the correct product price. You can also add a description property with information from the product or buyer. This will be displayed in the Stripe Dashboard.

```jsx
// in "routes/payment.routes.js"

// ... "/create-payment-intent" route

// this is where you will get the correct price to be paid
const product = await Product.findById(productId)
const priceToPay = product.price // if not stored in cents, make sure to convert them to cents

// ... payment intent creation
```

- Test again and you should be able to receive payments based on the correct product price.

- NOTE: It is important that the product price comes directly from the database (even when it exists in the req.body) and any calculations needed are always done in the server. This prevents the information from being manipulated in the frontend before requesting the payment intent.


# PART 2. CREATING A MODEL THAT STORES PAYMENT INTENT INFORMATION IN OUR DATABASE

## 2.1. BACKEND CONFIG. Apply all below steps on your Server side.

- Create a new `Schema` and `Model` that will keep track of user purchases with the following properties:
  - price: Price at the moment of the transaction in cents. Created specifically for the transaction in case the product changes its price later.
  - paymentIntentId: used for updating the status securely
  - clientSecret: used for updating the status securely
  - status: Defines the state of the purchase. Starts as "incomplete" and changes to "succeeded" based on Stripe response.
  - product: For a relation to the product bought. 
  - buyer: For a relation to the user who bought the product (Not implemented in the example code, uncomment when adding the user id from auth)

```javascript
// in "models/Payment.model.js"

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  price: Number, 
  paymentIntentId: String, 
  clientSecret: String, 
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

```

- Go to the `payment.routes.js` and import the `Payment` Model.

```jsx
// in "routes/payment.routes.js"

// ... requires

const Payment = require("../models/Payment.model.js")

// ... routes
```

- Inside the post route, right after the creation of the payment intent and before the `res.send`, create a new document of `Payment` with all the required information

```jsx
// in "routes/payment.routes.js"

// ... payment intent creation

await Payment.create({
  price: priceToPay,
  product: productId,
  status: "incomplete",
  paymentIntentId: paymentIntent.id,
  clientSecret: paymentIntent.client_secret,
  // buyer: req.payload // example to add who bought the product (not done in this example)
})

// ... res.send
```

- In this same `payment.routes.js` add a new route that will update the status of the Payment with the proper value (succeeded or failed).

- NOTE: The route will look for the `Payment` document by `clientSecret` and `paymentIntentId` for security reasons. The `paymentIntentId` is never shared with the Frontend from our Server, and the Frontend only has access to it from Stripe after the payment is fully processed.

```jsx
// in "routes/payment.routes.js"

// ... previous routes

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

// ... module.exports

```

***

## 2.2. FRONTEND CONFIG. Apply all below steps on your Client side.

- Create a component called `<PaymentSuccess>` that will be invoked when receiving confirmation from stripe regarding "succeeded" payment.

- This component will receive the `client secret` and the `payment intent id` in the form of queries. When testing you will see it in the URL. So the idea of the component is that it will extract the information from `queries` and contact the backend through the `updatePaymentIntentService` to update the `Payment` document.

```jsx
// in "src/components/PaymentSuccess.jsx"

import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import axios from "axios";

const PaymentSuccess = () => {

  const navigate = useNavigate();
  const location = useLocation()

  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    handleUseEffect();
  }, []);

  const handleUseEffect = async () => {

    // below is a way to extract queries from the search queries.
    // unfortunately, react-router-dom doesn't come with a proper way to extract them, similar to useParams
    const clientSecret = new URLSearchParams(location.search).get(
      "payment_intent_client_secret"
    );
    const paymentIntentId = new URLSearchParams(location.search).get(
      "payment_intent"
    );

    const paymentIntentInfo = {
      clientSecret: clientSecret,
      paymentIntentId: paymentIntentId
    }

    try {
      await axios.patch("http://localhost:5005/api/payment/update-payment-intent", paymentIntentInfo)
      // !IMPORTANT: Adapt the request structure to the one in your project (services, .env, auth, etc...)

      setIsFetching(false);
    } catch (error) {
      navigate("/error");
    }
  };

  if (isFetching) {
    return <h3>... updating payment</h3>;
  }

  return (
    <div>
      <div>
        <h1>Thank you for your order!</h1>
        <Link to={"/"}>Go back to Home</Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
```

- Go to your `App.js` and add a Frontend route for `/payment-success` that will render the component `<PaymentSuccess>`

```jsx
// in "src/App.jsx"

// ... previous <Route>

<Route path="/payment-success" element={ <PaymentSuccess/> }/>

// ... error <Route>

```

Go to the `<CheckoutForm>` component. Go to the line where it says `return_url: ... `. This is what happends when the payment is approved by Stripe, currently it simply sends the user to `"/"`. So let's add the rest of the path so it redirects to `"/payment-success"` like below:

```jsx
// in "src/components/CheckoutForm.jsx"

// ... inside handleSubmit

// if using create-react-app:
return_url: `${process.env.REACT_APP_CLIENT_URL}/payment-success`,

// ... or if using VITE:
return_url: `${import.meta.env.VITE_CLIENT_URL}/payment-success`,

// ...
```

- DONE!

  - To test the flow, attempt to purchase a product, same as in Part 1. 
  - As soon as you can see the checkout form a new document of `Payment` should be created with status `incomplete`
  - when you fill the checkout form with the test credit card, you should be redirected to a page that says `Thank you for your order!`.
  - Now the same document that was created should display a status `succeeeded`

### If you have any doubts or something doesn't work properly, you can check the code inside the repository for a working example of the flow.
