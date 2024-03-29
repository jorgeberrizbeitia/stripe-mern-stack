import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ! BASIC FLOW TO CREATE A NEW PRODUCT ONLY FOR TESTING

function Create() {
  const navigate = useNavigate();

  const [name, setName] = useState(""); 
  const [price, setPrice] = useState(0);

  const handleNameChange = (event) => setName(event.target.value);
  const handlePriceChange = (event) => setPrice(event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const priceInCents = price * 100

    const newProduct = {
      name: name,
      price: priceInCents,
    };

    try {

      await axios.post("http://localhost:5005/api/product", newProduct)
      // !IMPORTANT: Adapt the request structure to the one in your project (services, .env, auth, etc...)

      navigate("/product/list")

    } catch (error) {
      navigate("/error");
    }
  };

  return (
    <div>
      <h1>Form to Add Items</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: </label>
          <input type="text" name="name" onChange={handleNameChange} />
        </div>

        <div>
          <label>Price: </label>
          <input type="number" name="name" onChange={handlePriceChange} />
        </div>

        <button>Add</button>
      </form>
    </div>
  );
}

export default Create;
