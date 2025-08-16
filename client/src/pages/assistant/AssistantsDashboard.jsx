import React from "react";
import Layout from "../../components/layout/Layout";
import { SmoothScrollToTop } from "../../components/SmoothScrollToTop";
import AssistantMenu from "../../components/menu/AssistantMenu";
import '../../styles/AssistantDashboard.scss'

const AssistantsDashboard = () => {
  return (
    <Layout>
      <SmoothScrollToTop />
      <div className="assistantdashboard-main-container">
        <div className="assistantdashboard-container">
          <div className="menu-side">
            <AssistantMenu />
          </div>
          <div className="content-side">
            <h2>Overview</h2>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AssistantsDashboard;
