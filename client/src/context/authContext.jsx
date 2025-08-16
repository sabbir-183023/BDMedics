import { createContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });

  const updateAuth = () => {
    const token = Cookies.get("token");
    const userCookie = Cookies.get("user");

    if (token && userCookie) {
      try {
        const user = JSON.parse(userCookie);
        setAuth({ user, token });
        axios.defaults.headers.common["Authorization"] = token;
      } catch (error) {
        Cookies.remove("token");
        Cookies.remove("user");
        console.log(error);
      }
    }
  };

  useEffect(() => {
    updateAuth();
  }, []);

  return (
    <AuthContext.Provider value={[auth, setAuth, updateAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
