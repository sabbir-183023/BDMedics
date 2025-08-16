import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import "../styles/doctorregister.scss";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingSpin from "../components/spinner/LoadingSpin";
import { SmoothScrollToTop } from "../components/SmoothScrollToTop";

const DoctorRegister = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [available, setAvailable] = useState(null); // true, false, or null
  const [emailAvailable, setEmailAvailable] = useState(null); // true, false, or null
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [typingEmailTimeout, setEmailTypingTimeout] = useState(null);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [timer, setTimer] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const forbiddenChars = /[A-Z\s"#%<>?@[\]^`{|}\\]/;

  //username change
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setAvailable(null); // Reset availability

    // If empty, skip everything
    if (!value) {
      return;
    }

    // Validate first before availability check
    if (forbiddenChars.test(value)) {
      setAvailable({
        valid: false,
        message:
          "Username cannot contain uppercase letters, spaces, or URL-unsafe characters.",
      });
      return;
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    setTypingTimeout(
      setTimeout(() => {
        checkUsername(value);
      }, 500)
    );
  };

  //email change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailAvailable(null); // Reset availability

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setEmailAvailable({
        valid: false,
        message: "Invalid email format",
      });
      return;
    }

    if (typingEmailTimeout) {
      clearTimeout(typingEmailTimeout);
    }

    setEmailTypingTimeout(
      setTimeout(() => {
        checkEmail(value);
      }, 500)
    );
  };
  //username check
  const checkUsername = async (value) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API
        }/api/v1/auth/check-username?username=${value}`
      );

      if (res.data.success) {
        setAvailable({ valid: true, message: "Username is available" });
      } else {
        setAvailable({ valid: false, message: "Username is already taken" });
      }
    } catch (err) {
      console.error("Error checking username", err);
      setAvailable(null);
    }
  };
  //check email
  const checkEmail = async (value) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/auth/check-email?email=${value}`
      );

      if (res.data.success) {
        setEmailAvailable({ valid: true, message: "" });
      } else {
        setEmailAvailable({ valid: false, message: "Email already exist" });
      }
    } catch (err) {
      console.error("Error checking email", err);
      setEmailAvailable(null);
    }
  };

  // Send OTP to email
  const handleSendOtp = async () => {
    setBtnLoad(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/send-otp`,
        { email }
      );
      if (res.data.success) {
        setOtpSent(true);
        setTimer(30); // Start a 60-second countdown
        toast.success("OTP sent to your email.");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("User already exist!");
    }
    setBtnLoad(false);
  };

  // Countdown timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Verify OTP
  const handleVerifyOtp = async () => {
    setBtnLoad(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/verify-otp`,
        { email, otp }
      );
      if (res.data.success) {
        setOtpVerified(true);
        toast.success("OTP verified successfully!");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify OTP.");
    }
    setBtnLoad(false);
  };

  // Handle registration submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      toast.error("Please verify the OTP before registering.");
      return;
    }
    try {
      setBtnLoad(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/register`,
        { name, username, phone, email, password, otp }
      );
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
        setBtnLoad(false);
      } else {
        toast.error(data.message);
        setBtnLoad(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      setBtnLoad(false);
    }
  };

  return (
    <Layout
      title={"Doctor Register - BDMedics"}
      description={
        "Register as a doctor on BDMedics (বিডমেডিক্সে ডাক্তার হিসেবে রেজিস্টার করুন) to manage patient appointments, e-prescriptions (ই-প্রেসক্রিপশন), and health records. বাংলাদেশের #1 Telehealth Platform for Doctors."
      }
      keywords={
        "doctor registration BDMedics, বিডমেডিক্স ডাক্তার রেজিস্ট্রেশন,telehealth platform Bangladesh, ডিজিটাল হেলথকেয়ার প্ল্যাটফর্ম, e-prescription system, ই-প্রেসক্রিপশন সিস্টেম,doctor dashboard, ডাক্তার ড্যাশবোর্ড,online patient management, অনলাইন রোগী ব্যবস্থাপনা, medical professionals Bangladesh, বাংলাদেশের ডাক্তারদের জন্য"
      }
      author={"BDMedics"}
    >
      <SmoothScrollToTop />
      <div className="login-container">
        <div className="login-fullbox">
          <div className="image-container-box">
            <img src="./designpics/register.png" alt="login-image" />
          </div>
          <div className="other-element-box">
            <h1>Doctor Registration</h1>
            <div action="" className="login-form-container">
              <div className="email-container">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={emailAvailable?.valid === false ? "danger" : ""}
                  required
                  disabled={otpVerified}
                />
                {emailAvailable && (
                  <p
                    className="availability"
                    style={{ color: emailAvailable.valid ? "green" : "red" }}
                  >
                    {emailAvailable.message}
                  </p>
                )}
                {!otpSent && (
                  <button
                    onClick={handleSendOtp}
                    disabled={
                      !email ||
                      emailAvailable === null ||
                      emailAvailable.valid === false
                    }
                  >
                    {btnLoad ? (
                      <LoadingSpin height={"20px"} width={"20px"} />
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                )}
              </div>
              {otpSent && !otpVerified && (
                <div className="otp-container">
                  <label htmlFor="otp">OTP</label>
                  <input
                    type="number"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <div>
                    {!otpSent ? (
                      "" // Show nothing when OTP is not sent
                    ) : timer !== 0 ? (
                      <p>Resend OTP in {timer} seconds</p> // Show countdown when OTP is sent and timer is not 0
                    ) : (
                      <span
                        className="text-center d-block text-primary text-decoration-underline"
                        style={{ cursor: "pointer" }}
                        onClick={handleSendOtp}
                      >
                        Resend OTP!
                      </span> // Show 'Send' when OTP is sent and timer is 0
                    )}
                  </div>
                  <button
                    type="button"
                    className="submit-button"
                    onClick={handleVerifyOtp}
                  >
                    {btnLoad ? (
                      <span>
                        <LoadingSpin height={"25px"} width={"25px"} />
                      </span>
                    ) : (
                      "Verify Otp"
                    )}
                  </button>
                </div>
              )}
              {otpVerified && (
                <div className="login-form-container">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    name="username"
                    required
                    value={username}
                    onChange={handleUsernameChange}
                    className={available?.valid === false ? "danger" : ""}
                  />
                  {available && (
                    <p
                      className="availability"
                      style={{ color: available.valid ? "green" : "red" }}
                    >
                      {available.message}
                    </p>
                  )}
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="phone"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <label htmlFor="password" required>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button onClick={handleSubmit}>
                    {btnLoad ? (
                      <LoadingSpin height={"25px"} width={"25px"} />
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="other-register-holder">
              <p>
                Already have an account?
                <Link to={"/login"}>Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorRegister;
