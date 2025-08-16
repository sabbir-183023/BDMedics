import React, { useCallback, useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/Layout";
import AdminMenu from "../../components/menu/AdminMenu";
import "../../styles/subscriptions.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Subscriptions = () => {
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  const fetchDoctors = useCallback(async (currentPage) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/admin/all-doctors/${currentPage}`
      );

      if (res.data.doctors.length === 0) {
        setHasMore(false);
      } else {
        setDoctors((prev) =>
          currentPage === 1 ? res.data.doctors : [...prev, ...res.data.doctors]
        );
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors(page);
  }, [page, fetchDoctors]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, loading]);
  return (
    <Layout>
      <div className="subscriptions-main-container">
        <div className="subscriptions-container">
          <div className="menu-side">
            <AdminMenu />
          </div>
          <div className="content-side">
            <h2>Subscriptions</h2>
            <div className="show-list-of-doctors">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Payment Status</th>
                    <th>Last Subscription Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <tr key={`loading-${i}`} className="loading-row">
                          <td>
                            <span className="loading-placeholder"></span>
                          </td>
                          <td>
                            <span className="loading-placeholder"></span>
                          </td>
                          <td>
                            <span className="loading-placeholder"></span>
                          </td>
                          <td>
                            <span className="loading-placeholder"></span>
                          </td>
                          <td>
                            <span className="loading-placeholder"></span>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  {!loading &&
                    doctors?.map((d, i) => (
                      <tr key={i} onClick={() => navigate(`/subscriptions/${d?._id}`)}>
                        <td data-label="Name">{d?.name}</td>
                        <td data-label="Address">{d?.address}</td>
                        <td
                          data-label="Status"
                          data-active={d?.subscription?.isActive}
                        ></td>
                        <td data-label="Payment Status">
                          {d?.subscription?.lastPaymentStatus}
                        </td>
                        <td data-label="Last Subscription">
                          {d?.subscription?.lastActivated
                            ? new Date(
                                d.subscription.lastActivated
                              ).toLocaleDateString()
                            : "Never"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Subscriptions;
