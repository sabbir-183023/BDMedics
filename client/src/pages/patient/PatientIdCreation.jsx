import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import "../../styles/patientidcreation.scss";
import axios from "axios";
import toast from "react-hot-toast";
import { IoCloudDoneSharp } from "react-icons/io5";
import { FaRegCopy } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const PatientIdCreation = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isIdCreated, setIsIdCreated] = useState(false);
  const [credentialData, setCredintialData] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/patientidcreate`,
        { name, phone, dob }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setPhone("");
        setName("");
        setDob(null);
        setSubmitLoading(false);
        setIsIdCreated(true);
        setCredintialData(res.data.patient);
      }
    } catch (error) {
      console.log(error);
      setSubmitLoading(false);
      toast.error(error.response.data.message);
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
      <div className="patientidcreation-container">
        <div className="patientidcreation-box-container">
          <h2>Create Patient ID</h2>
          <hr />
          {isIdCreated ? (
            <div className="show-created-credintials">
              <h2 className="success-icon">
                <IoCloudDoneSharp />
              </h2>
              <h3>Patient Id Created Sucessfully!</h3>
              <p>Please keep note of the patient ID</p>
              <div className="detailsofcredintials">
                <h4>Name: {credentialData?.name}</h4>
                <h4>Phone: {credentialData?.phone}</h4>
                <h4>Date of Birth: {credentialData?.dob}</h4>
                <h4 className="patient-id">
                  Patient ID: <span>{credentialData?.patientId}</span>{" "}
                  <label
                    title="copy"
                    onClick={() => copyToClipboard(credentialData?.patientId)}
                  >
                    <FaRegCopy />
                  </label>
                </h4>
              </div>
            </div>
          ) : (
            <form action="" onSubmit={handleSubmit}>
              <div className="phone">
                <label htmlFor="phone">Phone</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={11}
                  placeholder="e.g, 01234567891"
                  className="phone-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="name">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="dob">
                <label htmlFor="name">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
              <button
                disabled={
                  phone?.length !== 11 ||
                  name?.length === 0 ||
                  dob?.length === 0 ||
                  submitLoading
                }
              >
                Create
              </button>
              <div className="other-links-holder">
                <div className="link">
                  <span onClick={() => navigate("/patientidcheck")}>
                    Look for existing Patient ID
                  </span>
                </div>
                <div className="link">
                  <span onClick={() => navigate("/patientregister")}>
                    Patient Profile Registration
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PatientIdCreation;
