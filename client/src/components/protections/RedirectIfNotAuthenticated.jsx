import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import Layout from "../layout/Layout";
import LoadingSpin from "../spinner/LoadingSpin";

const RedirectIfNotAuthenticated = ({ children }) => {
  const [auth] = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!auth?.user) {
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 3000); // 3 seconds delay

      return () => clearTimeout(timer); // Clean up if unmounted early
    }
  }, [auth]);

  if (!auth?.user && shouldRedirect) {
    return <Navigate to="/" replace />;
  }

  if (!auth?.user) {
    // Optional: return a loading spinner/message during the wait
    return (
      <Layout>
        <div style={{ height: "100%", width: "100%", display: "flex" }}>
          <h1
            style={{
              margin: "100px auto 0 auto",
            }}
          >
            Checking Authentication...
            <LoadingSpin height={"50px"} width={"50px"} />
          </h1>
        </div>
      </Layout>
    );
  }

  return children;
};

export default RedirectIfNotAuthenticated;
