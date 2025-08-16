// components/RedirectIfAuthenticated.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../context/useAuth";

const RedirectIfAuthenticated = ({ children }) => {
  const [auth] = useAuth();

  if (auth?.user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RedirectIfAuthenticated;
