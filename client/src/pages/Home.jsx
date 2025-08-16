import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { SmoothScrollToTop } from "../components/SmoothScrollToTop";
import "../styles/Home.scss";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  // Banner content (image URLs and text)
  const banners = [
    {
      image: "../../public/designpics/homepagebanner1.png",
      title: "Book Your\nAppointment Through",
      highlight: "BDMedics",
    },
    {
      image: "../../public/designpics/homepagebanner2.png", // Replace with your 2nd image
      title: "Find Trusted\nDoctors Near You",
      highlight: "Instantly",
    },
    {
      image: "../../public/designpics/homepagebanner3.png", // Replace with your 3rd image
      title: "Manage Your\nHealth Records",
      highlight: "Securely",
    },
  ];

  const [currentBanner, setCurrentBanner] = useState(0);
  const [fade, setFade] = useState(true);

  // Rotate banners every 5 seconds with fade animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Trigger fade-out
      setTimeout(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
        setFade(true); // Trigger fade-in
      }, 500); // Match this delay with CSS transition time
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <Layout
      title={"Home - BDMEDICS"}
      description={
        "BDMedics connects patients with doctors seamlessly. Book appointments online, manage prescriptions, and store your health records securely in one place. Doctors can efficiently handle patient documents, prescriptions, and appointments—all in a user-friendly platform. Sign up today for smarter healthcare management! BDMedics: Book doctors online, manage e-prescriptions, and store health records securely. বাংলাদেশের শীর্ষ অনলাইন ডাক্তার অ্যাপয়েন্টমেন্ট ও প্রেসক্রিপশন ম্যানেজমেন্ট প্ল্যাটফর্ম।"
      }
      keywords={
        "online doctor appointment, book doctor online, digital prescription, patient health records, doctor-patient portal, telemedicine platform, e-prescription system, medical appointment booking, secure health profile, find doctors near me, healthcare management, online doctor appointment Bangladesh, book doctor Dhaka, digital prescription, e-health Bangladesh, ডাক্তার অ্যাপয়েন্টমেন্ট, প্রেসক্রিপশন ম্যানেজমেন্ট, স্বাস্থ্য রেকর্ড, BDMedics"
      }
      author={"BDMedics"}
    >
      <SmoothScrollToTop />
      <div
        className="banner-div"
        style={{ backgroundImage: `url(${banners[currentBanner].image})` }}
      >
        <h1 className={fade ? "fade-in" : "fade-out"}>
          {banners[currentBanner].title.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              <br />
            </React.Fragment>
          ))}
          <span>{banners[currentBanner].highlight}</span>
        </h1>
        <button className="see-doctors" onClick={() => navigate('/doctors')}>See Doctors</button>
      </div>
      <div className="locating-div">
        <div className="left">
          <img src="../../public/designpics/bdmap.png" alt="bd-map" />
        </div>
        <div className="right">
          <h1 className="first-child">Locate The Best Doctors</h1>
          <h1 className="second-child">Near You</h1>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
