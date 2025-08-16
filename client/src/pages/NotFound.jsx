// pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { TbFlagQuestion } from "react-icons/tb";

const NotFound = () => {
  return (
    <Layout>
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h1 style={{ textAlign: "center", color: "#F42A41", margin:"0", fontSize:"100px" }}>
          <TbFlagQuestion />
        </h1>
        <h1 style={{ fontSize: "72px", marginBottom: "20px", marginTop:"0" }}>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          style={{
            marginTop: "20px",
            display: "inline-block",
            textDecoration: "underline",
            color: "#007bff",
          }}
        >
          Go back home
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
