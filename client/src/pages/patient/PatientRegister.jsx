import React, { useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { SmoothScrollToTop } from "../../components/SmoothScrollToTop";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/PatientRegister.scss";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingSpin from "../../components/spinner/LoadingSpin";
import { IoCloudDoneSharp } from "react-icons/io5";
import { FaRegCopy } from "react-icons/fa6";

const PatientRegister = () => {
  const [havingPatientId, setHavingPatientId] = useState(true);

  // not having patient id
  const [email, setEmail] = useState("");
  const [typingEmailTimeout, setEmailTypingTimeout] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null); // true, false, or null

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [timer, setTimer] = useState(0);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState(null);
  const [password, setPassword] = useState("");

  const [successful, setSuccessful] = useState(false);
  const [createdUser, setCreatedUser] = useState({});
  const [createdPatient, setCreatedPatient] = useState({});

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
        `${import.meta.env.VITE_API}/api/v1/auth/send-patient-otp`,
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

  // Handle registration submission not having patient id
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      toast.error("Please verify the OTP before registering.");
      return;
    }
    try {
      setBtnLoad(true);
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_API
        }/api/v1/auth/patient-register-without-patientId`,
        { name, phone, email, dob, password, otp }
      );
      if (data.success) {
        toast.success(data.message);
        setBtnLoad(false);
        setSuccessful(true);
        setCreatedPatient(data?.patient);
        setCreatedUser(data?.user);
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

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Patient Id coppied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  //with patient id registration
  const [patientId, setPatientId] = useState("");
  const [patientIdAvailable, setPatientIdAvailable] = useState(null);
  const [typingPatientIdTimeout, setTypingPatientIdTimeout] = useState(null);

  const [patientIdSet, setPatientIdSet] = useState(false);
  const navigate = useNavigate();
  //patient id change
  const handlePatientIdChange = (e) => {
    const value = e.target.value;
    setPatientId(value);
    setPatientIdAvailable(null); // Reset availability

    console.log(patientIdAvailable);
    if (typingPatientIdTimeout) {
      clearTimeout(typingPatientIdTimeout);
    }

    setTypingPatientIdTimeout(
      setTimeout(() => {
        checkPatientId(value);
      }, 500)
    );
  };

  const checkPatientId = async (value) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API
        }/api/v1/auth/check-patientId?patientId=${value}`
      );

      if (res.data.success) {
        // Backend found the patient ID (exists: true/false in response)
        setPatientIdAvailable({
          valid: res.data.exists, // true if ID exists
          message: res.data.exists
            ? "Patient ID found (can register)"
            : "Patient ID could not found",
        });
      } else {
        // Backend indicates failure (likely already registered)
        setPatientIdAvailable({
          valid: false,
          message: res.data.message || "Patient ID already registered",
        });
      }
    } catch (err) {
      console.error("Error checking patientId", err);
      setPatientIdAvailable({
        valid: false,
        message: "Error checking patient ID",
      });
    }
  };

  // Verify OTP
  const handleVerifyOtpForWithPId = async () => {
    setBtnLoad(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/verify-otp-with-pId`,
        { email, otp, patientId }
      );
      console.log(res);
      if (res.data.success) {
        setOtpVerified(true);
        toast.success("OTP verified successfully!");
        setName(res?.data?.patient?.name);
        setPhone(res?.data?.patient?.phone);
        setDob(res?.data?.patient?.dob);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify OTP.");
    }
    setBtnLoad(false);
  };

  // Handle registration submission not having patient id
  const handleSubmitwithPId = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      toast.error("Please verify the OTP before registering.");
      return;
    }
    try {
      setBtnLoad(true);
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_API
        }/api/v1/auth/patient-register-with-patientId`,
        { name, phone, email, dob, password, otp, patientId }
      );
      if (data.success) {
        toast.success(data.message + `,Please Login`);
        setBtnLoad(false);
        navigate("/login");
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
      title={"Patient Registration - BDMedics"}
      description={
        "Register for a free BDMedics account to book doctor appointments, access e-prescriptions, and manage health records. বাংলাদেশের শীর্ষ ডিজিটাল হেলথকেয়ার প্ল্যাটফর্মে নিবন্ধন করুন।"
      }
      keywords={
        "BDMedics sign up, patient registration, doctor appointment booking, e-prescription access, health records, রোগী নিবন্ধন, ডাক্তার অ্যাপয়েন্টমেন্ট, স্বাস্থ্য রেকর্ড, বিডমেডিক্স রেজিস্ট্রেশন, অনলাইন মেডিকেল সেবা, প্রেসক্রিপশন ম্যানেজমেন্ট, বিডমেডিক্স একাউন্ট খুলুন"
      }
      author={"BDMedics"}
    >
      <SmoothScrollToTop />
      <div className="pregister-container">
        <div className="pregister-fullbox">
          <div className="image-container-box">
            <img src="./designpics/preg.png" alt="preg-image" />
          </div>
          <div className="other-element-box">
            <h1>Patient Registration</h1>
            <div className="having-or-not-patientId">
              <div
                className="having-pid"
                onClick={() => {
                  setHavingPatientId(true);
                  setPatientId("");
                  setEmail("");
                  setEmailAvailable(null);
                  setOtp("");
                  setOtpSent(false);
                  setOtpVerified(false);
                  setPhone("");
                  setName("");
                  setDob(null);
                  setPassword("");
                  setSuccessful(false);
                  setPatientIdAvailable(null);
                  setTypingPatientIdTimeout(null);
                  setPatientIdSet(false);
                }}
                style={{
                  backgroundColor: havingPatientId ? "#f42a41" : undefined,
                  color: havingPatientId ? "white" : undefined,
                }}
              >
                <span>Having Patient ID</span>
              </div>
              <div
                className="not-having-pid"
                onClick={() => {
                  setHavingPatientId(false);
                  setPatientId("");
                  setEmail("");
                  setEmailAvailable(null);
                  setOtp("");
                  setOtpSent(false);
                  setOtpVerified(false);
                  setPhone("");
                  setName("");
                  setDob(null);
                  setPassword("");
                  setSuccessful(false);
                  setPatientIdAvailable(null);
                  setTypingPatientIdTimeout(null);
                  setPatientIdSet(false);
                }}
                style={{
                  backgroundColor: !havingPatientId ? "#f42a41" : undefined,
                  color: !havingPatientId ? "white" : undefined,
                }}
              >
                <span>Not Having Patient ID</span>
              </div>
            </div>
            {/* not having patient id */}
            {!havingPatientId ? (
              <>
                {successful ? (
                  <div className="new-user-created">
                    <h2 className="success-icon">
                      <IoCloudDoneSharp />
                    </h2>
                    <h3>Patient Id Created Sucessfully!</h3>
                    <p>Please keep note of the patient ID</p>
                    <div className="detailsofcredintials">
                      <h4>Name: {createdUser?.name}</h4>
                      <h4>Phone: {createdUser?.phone}</h4>
                      <h4>Date of Birth: {createdPatient?.dob}</h4>
                      <h4 className="patient-id">
                        Patient ID: <span>{createdPatient?.patientId}</span>{" "}
                        <label
                          title="copy"
                          onClick={() =>
                            copyToClipboard(createdPatient?.patientId)
                          }
                        >
                          <FaRegCopy />
                        </label>
                      </h4>
                    </div>
                  </div>
                ) : (
                  <div action="" className="not-having-pid-form-container">
                    <div className="email-container">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleEmailChange}
                        className={
                          emailAvailable?.valid === false ? "danger" : ""
                        }
                        required
                        disabled={otpVerified}
                      />
                      {emailAvailable && (
                        <p
                          className="availability"
                          style={{
                            color: emailAvailable.valid ? "green" : "red",
                          }}
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
                      <div className="not-having-pid-form-container">
                        <label htmlFor="name">Name</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <label htmlFor="phone">Phone</label>
                        <input
                          type="phone"
                          name="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                        <label htmlFor="dob">Date of Birth</label>
                        <input
                          type="date"
                          name="dob"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
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
                )}
              </>
            ) : (
              <div className="having-pid-form-container">
                <div className="patientIdContainer">
                  <label htmlFor="">Patient ID</label>
                  <input
                    type="text"
                    maxLength={6}
                    onChange={handlePatientIdChange}
                    value={patientId}
                    disabled={patientIdSet}
                    className={
                      patientIdAvailable?.valid === false ? "danger" : ""
                    }
                    required
                  />
                  {patientIdAvailable && (
                    <p
                      className="availability"
                      style={{
                        color: patientIdAvailable?.valid ? "green" : "red",
                      }}
                    >
                      {patientIdAvailable?.message}
                    </p>
                  )}
                  {!patientIdSet && (
                    <button
                      disabled={!patientIdAvailable?.valid}
                      onClick={() => {
                        setPatientIdSet(true);
                        setPatientIdAvailable({ message: "", valid: "true" });
                      }}
                    >
                      Next
                    </button>
                  )}
                  {patientIdSet && (
                    <div className="email-container">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleEmailChange}
                        className={
                          emailAvailable?.valid === false ? "danger" : ""
                        }
                        required
                        disabled={otpVerified}
                      />
                      {emailAvailable && (
                        <p
                          className="availability"
                          style={{
                            color: emailAvailable.valid ? "green" : "red",
                          }}
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
                  )}
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
                        onClick={handleVerifyOtpForWithPId}
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
                    <div className="not-having-pid-form-container">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="phone"
                        name="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                      <label htmlFor="dob">Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
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
                      <button onClick={handleSubmitwithPId}>
                        {btnLoad ? (
                          <LoadingSpin height={"25px"} width={"25px"} />
                        ) : (
                          "Sign Up"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
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

export default PatientRegister;
