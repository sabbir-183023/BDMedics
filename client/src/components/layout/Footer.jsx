import React from "react";
import "../../styles/footer.scss";
import { Link } from "react-router-dom";
import { FaSquareFacebook } from "react-icons/fa6";
import { BsInstagram } from "react-icons/bs";
import { FaSquareXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <div className="footer-container">
      <div className="footer-inner-container">
        <div className="main-footer">
          <div className="left-div">
            <div className="image-container">
              <Link to="/">
                <img src="/BDMedics.png" alt="logo" />
              </Link>
              <p>One stop appointment solution</p>
            </div>
            <div className="social-container">
              <div className="inner-container">
                <span>
                  <FaSquareFacebook />
                </span>
                <span>
                  <BsInstagram />
                </span>
                <span>
                  <FaSquareXTwitter />
                </span>
              </div>
            </div>
          </div>
          <div className="middle-div">
            <h2>Shortcuts</h2>
            <p>
              <Link to="/about">About Us</Link>{" "}
            </p>
            <p>
              <Link to="/contact">Contact Us</Link>{" "}
            </p>
            <p>
              <Link to="/">Blogs</Link>{" "}
            </p>
            <p>
              <Link to="/">Career</Link>{" "}
            </p>
            <p>
              <Link to="/doctorregister">Doctor Registration</Link>{" "}
            </p>
          </div>
          <div className="right-div">
            <h2>Trust & Legal</h2>
            <p>
              <Link to="/">Privacy & Policy</Link>{" "}
            </p>
            <p>
              <Link to="/">Terms & Conditions</Link>{" "}
            </p>
          </div>
        </div>
        <div className="copyright-container">
          <p>© 2025 BDMedics. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
