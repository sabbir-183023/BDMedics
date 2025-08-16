import React, { useState } from "react";
import "../../styles/patientidcreation.scss";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { FaRegCopy } from "react-icons/fa6";
import { SmoothScrollToTop } from "../../components/SmoothScrollToTop";

const PatientIdCheck = () => {
  const [searchPhone, setSearchPhone] = useState("");
  const [patientInfo, setPatientInfo] = useState({});
  const [getLoading, setGetLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const searchPatients = async (e) => {
    e.preventDefault();
    try {
      setGetLoading(true);
      setHasSearched(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/searchpatientbyphone`,
        { searchPhone }
      );
      console.log(res);
      if (res?.data?.success) {
        setPatientInfo(res?.data?.searchResult);
        setGetLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.message);
      setGetLoading(false);
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
      <SmoothScrollToTop/>
      <div className="patientidcreation-container">
        <div className="ckeck-existing-patient-id">
          <h2>Check Existing Patient ID</h2>
          <hr />
          <form>
            <div>
              <label htmlFor="">Phone</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
                placeholder="e.g, 01234567891"
                className="phone-input"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
            </div>
            <button
              disabled={searchPhone.length !== 11}
              onClick={searchPatients}
            >
              Search
            </button>
          </form>

          {getLoading ? (
            <div className="result-holder">
              {/* Two shimmering loading boxes */}
              {[1, 2].map((item) => (
                <div key={item} className="info-div loading-shimmer">
                  <div className="shimmer-line" style={{ width: "70%" }}></div>
                  <div className="shimmer-line" style={{ width: "50%" }}></div>
                  <div className="shimmer-line" style={{ width: "30%" }}></div>
                </div>
              ))}
            </div>
          ) : (
            patientInfo?.length > 0 && (
              <div className="result-holder">
                <label className="search-declaration">
                  With the number "{searchPhone}", the following results are
                  found:
                </label>
                {patientInfo?.map((p, i) => (
                  <div key={i} className="info-div">
                    <p>
                      <b>Name:</b> {p?.name}
                    </p>
                    <p>
                      <b>Date of Birth:</b> {p?.dob}
                    </p>
                    <h3>
                      Patient ID: <span>{p?.patientId}</span>{" "}
                      <label
                        title="copy"
                        onClick={() => copyToClipboard(p?.patientId)}
                      >
                        <FaRegCopy />
                      </label>
                    </h3>
                  </div>
                ))}
              </div>
            )
          )}
          {hasSearched && patientInfo?.length === 0 ? (
            <label className="search-declaration">
              No results are found with the number "{searchPhone}"
            </label>
          ) : null}
          <p className="go-back" onClick={() => navigate("/patientidcreation")}>
            Go Back
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PatientIdCheck;
