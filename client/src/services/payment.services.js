import service from "./config.services";

const createPaymentIntentService = (productToBuy) => {
  return service.post("/payment/create-payment-intent", productToBuy)
}

const updatePaymentIntentService = (paymentIntentInfo) => {
  return service.patch("/payment/update-payment-intent", paymentIntentInfo)
}

export { createPaymentIntentService, updatePaymentIntentService };
