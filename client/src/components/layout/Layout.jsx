import React from "react";
import { Toaster } from "react-hot-toast";
import Header from "./Header";
import Footer from "./Footer";
import { Helmet } from "react-helmet";
import "../../styles/layout.scss";

const Layout = ({ children, title, description, keywords, author}) => {
  return (
    <div className="layout-container">
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <meta name="copyright" content={"BDMedics Bangladesh"} />
        <title>{title}</title>
      </Helmet>
      <Header />
      <Toaster/>
      <main  className="children" style={{ minHeight: "81vh" }}>{children}</main>
      <Footer />
    </div>
  );
};

Layout.defaultProps = {
  title: "BDMEDICS",
  description: "All healthcare solutions in one place",
  keywords:
    "healthcare, doctors, appointments, patienet, bestmedicinedoctorsinbd",
  author: "sabbir",
};

export default Layout;
