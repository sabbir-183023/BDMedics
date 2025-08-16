import React from "react";
import Layout from "../../components/layout/Layout";
import "../../styles/AdminDashboard.scss";
import AdminMenu from "../../components/menu/AdminMenu";

const AdminDashboard = () => {
  return (
    <Layout>
      <div className="admindashboard-main-container">
        <div className="admindashboard-container">
          <div className="menu-side">
            <AdminMenu />
          </div>
          <div className="content-side">Overview</div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
