import React from "react";
import Layout from "../../components/layout/Layout";
import DoctorMenu from "../../components/menu/DoctorMenu";
import "../../styles/DoctorDashboard.scss";
import { SmoothScrollToTop } from "../../components/SmoothScrollToTop";

const DoctorsDashboard = () => {
  return (
    <Layout>
      <SmoothScrollToTop />
      <div className="doctordashboard-main-container">
        <div className="doctordashboard-container">
          <div className="menu-side">
            <DoctorMenu />
          </div>
          <div className="content-side">
            <h2>Overview</h2>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorsDashboard;
