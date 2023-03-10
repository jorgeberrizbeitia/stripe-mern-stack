import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Create from "./pages/Create";
import Home from "./pages/Home";
import List from "./pages/List";
import Error from "./pages/errors/Error";
import NotFound from "./pages/errors/NotFound";
import Details from "./pages/Details";
import PaymentSuccess from "./components/PaymentSuccess";

function App() {
  return (
    <div className="App">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/create" element={<Create />} />
        <Route path="/product/list" element={<List />} />
        <Route path="/product/:productId/details" element={<Details />} />
        <Route path="/payment-success" element={ <PaymentSuccess/> }/>

        {/* error handlers */}
        <Route path="/error" element={<Error />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
