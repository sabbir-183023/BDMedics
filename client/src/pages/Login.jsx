import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import "../styles/login.scss";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingSpin from "../components/spinner/LoadingSpin";
import useAuth from "../context/useAuth";
import { SmoothScrollToTop } from "../components/SmoothScrollToTop";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const navigate = useNavigate();
  const [, setAuth, updateAuth] = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsloading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/login`,
        {
          identifier,
          password,
        }
      );
      if (res.data?.success) {
        // Store token and optionally user info
        Cookies.set("token", res.data.token, { expires: 7 }); // expires in 7 days
        Cookies.set("user", JSON.stringify(res.data.user), { expires: 7 });
        toast.success(res?.data?.message);
        setIsloading(false);
        setIdentifier("");
        setPassword("");
        navigate("/");
        setAuth({ token: res.data.token, user: res.data.user });
        updateAuth();
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message);
      setIsloading(false);
    }
  };
  return (
    <Layout
      title={"Login - BDMedics"}
      description={
        "Securely log in to your BDMedics account. Access doctor appointments, e-prescriptions, and health records. বাংলাদেশের শীর্ষ ডিজিটাল হেলথকেয়ার প্ল্যাটফর্মে সাইন ইন করুন।"
      }
      keywords={
        "BDMedics login, doctor portal login, patient health records, e-prescription access, medical dashboard, ডাক্তার লগইন, রোগী প্রোফাইল, স্বাস্থ্য রেকর্ড, বিডমেডিক্স সাইন ইন, বিডমেডিক্স লগইন, ডাক্তার পোর্টাল, রোগীর তথ্য, প্রেসক্রিপশন ম্যানেজমেন্ট, অনলাইন স্বাস্থ্য সেবা, BDMedics সাইন ইন"
      }
      author={"BDMedics"}
    >
      <SmoothScrollToTop />
      <div className="login-container">
        <div className="login-fullbox">
          <div className="image-container-box">
            <img src="./designpics/login.png" alt="login-image" />
          </div>
          <div className="other-element-box">
            <h1>Login</h1>
            <form
              action=""
              className="login-form-container"
              onSubmit={handleSubmit}
            >
              <label htmlFor="email">Email/Phone</label>
              <input
                type="text"
                name="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Link>Forgot Password?</Link>
              <button>
                {isLoading ? (
                  <LoadingSpin height={"20px"} width={"20px"} />
                ) : (
                  "Login"
                )}
              </button>
            </form>
            <div className="other-register-holder">
              <Link to={'/patientregister'}>Patient Profile Registration</Link>
              <Link to={"/patientidcreation"}>Patient ID Creation</Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
