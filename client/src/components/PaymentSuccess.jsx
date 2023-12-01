

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

    // below is one way to extract queries from the URL search queries.
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

      // below we contact the backend to update the payment from "incomplete" to "succeeded".
      // we pass the secure paymentIntentInfo that comes from stripe to prevent insecure updating of the property

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