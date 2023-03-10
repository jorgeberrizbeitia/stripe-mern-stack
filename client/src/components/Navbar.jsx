import { Link } from "react-router-dom";

function Navbar() {
  const navStyles = {
    display: "flex",
    justifyContent: "space-evenly",
    margin: "20px",
  };

  return (
    <nav style={navStyles}>
      <Link to="/">Home</Link>
      <Link to="/product/create">Create Product</Link>
      <Link to="/product/list">See all Products</Link>
    </nav>
  );
}

export default Navbar;
