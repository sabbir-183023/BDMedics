import React from "react";
import "./Spinner.css"; // Import the CSS for the spinner

const LoadingSpin = ({ height, width }) => {
  return (
    <div className="spinner" style={{ height: height, width: width }}></div>
  );
};

export default LoadingSpin;
