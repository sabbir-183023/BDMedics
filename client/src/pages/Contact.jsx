import React from "react";
import Layout from "../components/layout/Layout";
import "../styles/contact.scss";
import { Link } from "react-router-dom";
import { SmoothScrollToTop } from "../components/SmoothScrollToTop";

const Contact = () => {
  return (
    <Layout>
      <SmoothScrollToTop />
      <div className="contact-container">
        <div className="contact-title-part">
          <div className="title-container">
            <h1>Contact Us</h1>
            <p>
              <Link to={"/"}>Home</Link> /{" "}
              <Link to={"/contact"}>Contact Us</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
