import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PaymentIntent from "../components/PaymentIntent";
import { getProductDetailsService } from "../services/product.services";

function Details() {
  const navigate = useNavigate();
  const params = useParams()

  const [productDetails, setProductDetails] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [showPaymentIntent, setShowPaymentIntent] = useState(false)

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await getProductDetailsService(params.productId);
      console.log(response)
      setProductDetails(response.data);
      setIsFetching(false);
    } catch (error) {
      navigate("/error");
    }
  };

  if (isFetching === true) {
    return <h3>... loading</h3>
  }

  const priceInEur = productDetails.price / 100;

  return (
    <div>
      <h1>Details of Product</h1>

      <div>

        <h3>Name: {productDetails.name}</h3>
        <h4>Price: EUR {priceInEur} </h4>

        <div style={{margin: "20px 20% 20px 20%"}}>
          { 
            showPaymentIntent === false
            ? <button onClick={() => setShowPaymentIntent(true)}>Purchase</button> 
            : <PaymentIntent productDetails={productDetails}/> 
          }
        </div>

      </div>

    </div>
  );
}

export default Details;
