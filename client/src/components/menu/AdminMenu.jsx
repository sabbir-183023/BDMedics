import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../context/useAuth";
import "../../styles/AdminMenu.scss"; 

const AdminMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [auth] = useAuth();

  const currentPath = location.pathname;
  const overviewPath = `/admin-dashboard/${auth?.user?._id}`;

  return (
    <ul className="admin-menu">
      <li
        className={currentPath === overviewPath ? "active" : ""}
        onClick={() => navigate(overviewPath)}
      >
        Overview
      </li>
      <li
        className={currentPath === "/specialities" ? "active" : ""}
        onClick={() => navigate("/specialities")}
      >
        Specialities
      </li>
      <li
        className={currentPath === "/subscriptions" ? "active" : ""}
        onClick={() => navigate("/subscriptions")}
      >
        Subscriptions
      </li>
    </ul>
  );
};

export default AdminMenu;
