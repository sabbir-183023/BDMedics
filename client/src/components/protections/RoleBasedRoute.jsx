// components/RoleBasedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import Layout from "../layout/Layout";
import LoadingSpin from "../spinner/LoadingSpin";

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const [auth] = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (auth?.user && !allowedRoles.includes(auth.user.role)) {
      const timer = setTimeout(() => {
        setShouldRedirect(true);
        setIsChecking(false);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsChecking(false);
    }
  }, [auth, allowedRoles]);

  if (isChecking) {
    return (
      <Layout>
        <div style={{ height: "100%", width: "100%", display: "flex" }}>
          <h1
            style={{
              margin: "100px auto 0 auto",
            }}
          >
            Checking Permissions...
            <LoadingSpin height={"50px"} width={"50px"} />
          </h1>
        </div>
      </Layout>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleBasedRoute;
