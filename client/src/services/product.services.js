import service from "./config.services";

const createOneProductService = (newProduct) => {
  return service.post("/product", newProduct);
};

const getAllProductsService = () => {
  return service.get("/product");
};

const getProductDetailsService = (productId) => {
  return service.get(`/product/${productId}`);
};

export { createOneProductService, getAllProductsService, getProductDetailsService };
