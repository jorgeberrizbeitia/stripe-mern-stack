import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllProductsService } from "../services/product.services";

function List() {
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await getAllProductsService();
      setAllProducts(response.data);
      setIsFetching(false);
    } catch (error) {
      navigate("/error");
    }
  };

  if (isFetching === true) {
    return <h3>... loading</h3>
  }

  return (
    <div>
      <h1>List of Products</h1>

      {allProducts.length > 0 ? (
        <div>
          {allProducts.map((eachProduct) => {
            return (
              <div key={eachProduct._id}>
                <h3>{eachProduct.name}</h3>
                <Link to={`/product/${eachProduct._id}/details`}> See more from: {eachProduct.name}</Link>
              </div>
            );
          })}
        </div>
      ) : (
        <h3>There are no products</h3>
      )}
    </div>
  );
}

export default List;
