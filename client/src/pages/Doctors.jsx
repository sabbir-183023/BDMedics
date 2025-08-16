import React, { useEffect, useState, useRef, useCallback } from "react";
import Layout from "../components/layout/Layout";
import "../styles/doctors.scss";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import LoadingSpin from "../components/spinner/LoadingSpin";
import { MdLocationPin } from "react-icons/md";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const loaderRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = useRef(true);

  // Cache management
  const cacheDoctors = (data, currentPage, hasMoreState) => {
    const cache = {
      data,
      page: currentPage,
      hasMore: hasMoreState,
      timestamp: Date.now()
    };
    sessionStorage.setItem("cachedDoctors", JSON.stringify(cache));
  };

  const getCachedDoctors = () => {
    const cached = sessionStorage.getItem("cachedDoctors");
    if (!cached) return null;
    
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > 300000) return null;
    return parsed;
  };

  const fetchDoctors = useCallback(async (currentPage, isInitialLoad = false) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/doctor/all-doctors/${currentPage}`
      );

      if (res.data.doctors.length === 0) {
        setHasMore(false);
      } else {
        setDoctors(prev => {
          // For initial load or page 1, replace completely
          if (currentPage === 1 || isInitialLoad) {
            return res.data.doctors;
          }
          // For subsequent pages, append new doctors
          return [...prev, ...res.data.doctors];
        });
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    // Handle back navigation from profile
    if (location.state?.fromProfile) {
      const cached = getCachedDoctors();
      if (cached) {
        setDoctors(cached.data);
        setPage(cached.page);
        setHasMore(cached.hasMore);
        
        const scrollY = sessionStorage.getItem("scrollPosition");
        if (scrollY) {
          setTimeout(() => window.scrollTo(0, parseInt(scrollY)), 0);
        }
        
        // Clear the navigation state
        navigate(location.pathname, { replace: true, state: {} });
        return;
      }
    }
    
    // Normal initial load
    if (isInitialMount.current) {
      fetchDoctors(1, true);
      isInitialMount.current = false;
    }
    //eslint-disable-next-line
  }, [location.state]);

  useEffect(() => {
    // Only fetch new pages when not restoring from cache
    if (page > 1 && !location.state?.fromProfile) {
      fetchDoctors(page);
    }
    //eslint-disable-next-line
  }, [page]);

  useEffect(() => {
    // Cache doctors whenever they change
    if (doctors.length > 0) {
      cacheDoctors(doctors, page, hasMore);
    }
  }, [doctors, page, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, loading]);

  const handleCardClick = (username) => {
    sessionStorage.setItem("scrollPosition", window.scrollY);
    cacheDoctors(doctors, page, hasMore);
    navigate(`/${username}`, { state: { fromDoctors: true } });
  };

  return (
    <Layout>
      <div className="doctors-container">
        <div className="doctors-title-part">
          <div className="title-container">
            <h1>Doctors</h1>
            <p>
              <Link to={"/"}>Home</Link> / <Link to={"/doctors"}>Doctors</Link>
            </p>
          </div>
        </div>
        <div className="doctor-list-container">
          <div className="doctors-grid">
            {initialLoad ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={`shimmer-${index}`} className="doctor-card shimmer-card">
                  <div className="shimmer-image"></div>
                  <div className="shimmer-line shimmer-title"></div>
                  <div className="shimmer-line shimmer-degree"></div>
                  <div className="shimmer-specialties">
                    <div className="shimmer-specialty"></div>
                    <div className="shimmer-specialty"></div>
                  </div>
                  <div className="shimmer-line shimmer-address"></div>
                  <div className="shimmer-button"></div>
                </div>
              ))
            ) : (
              doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="doctor-card"
                  onClick={() => handleCardClick(doctor?.username)}
                >
                   <img
                      src={
                        doctor?.image
                          ? `${import.meta.env.VITE_API}${doctor.image}`
                          : "/designpics/default-doctor.png"
                      }
                      alt={doctor.name}
                    />
                    <h3>{doctor?.name}</h3>
                    <p className="degrees">{doctor?.degree}</p>
                    <div className="speacilities">
                      {doctor?.speciality?.map((s, i) => {
                        const englishSpecialty = s?.split("-")[0];
                        return (
                          <p key={i} className="speacility">
                            {englishSpecialty}
                          </p>
                        );
                      })}
                    </div>
                    <p className="doctors-address">
                      <span>
                        <MdLocationPin />
                      </span>
                      {doctor?.address}
                    </p>
                    <button className="visit-profile-btn">Visit Profile</button>
                </div>
              ))
            )}
          </div>
          <div ref={loaderRef} className="load-more">
            {loading && <LoadingSpin height={"40px"} width={"40px"} />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Doctors;