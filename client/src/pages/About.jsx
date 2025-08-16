import React from "react";
import Layout from "../components/layout/Layout";
import "../styles/about.scss";
import { Link } from "react-router-dom";
import { SmoothScrollToTop } from "../components/SmoothScrollToTop";

const About = () => {
  return (
    <Layout>
      <SmoothScrollToTop/>
      <div className="about-container">
        <div className="about-title-part">
          <div className="title-container">
            <h1>About Us</h1>
            <p>
              <Link to={"/"}>Home</Link> / <Link to={"/about"}>About Us</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
