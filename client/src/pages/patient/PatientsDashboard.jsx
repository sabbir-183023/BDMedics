import React from "react";
import Layout from "../../components/layout/Layout";
import PatientMenu from "../../components/menu/PatientMenu";
import "../../styles/PatientDashboard.scss";
import { SmoothScrollToTop } from "../../components/SmoothScrollToTop";

const PatientsDashboard = () => {
  return (
    <Layout>
      <SmoothScrollToTop />
      <div className="patientdashboard-main-container">
        <div className="patientdashboard-container">
          <div className="menu-side">
            <PatientMenu />
          </div>
          <div className="content-side">
            <h2>Overview</h2>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientsDashboard;
