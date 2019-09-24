import React from "react";
import { Link } from "react-router-dom";
import networkError from "../styles/network-error.jpg";
const NetworkError = () => (
  <div>
    <img
      src={networkError}
      style={{
        width: "85%",
        height: "500px",
        display: "block",
        margin: "auto",
        position: "relative"
      }}
    />
    <center>
      <Link to="/">Refresh</Link>
    </center>
  </div>
);
export default NetworkError;
