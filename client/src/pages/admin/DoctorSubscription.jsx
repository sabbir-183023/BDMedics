import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useNavigate, useParams } from "react-router-dom";
import AdminMenu from "../../components/menu/AdminMenu";
import "../../styles/DoctorSubscription.scss";
import { FaArrowLeft } from "react-icons/fa6";
import axios from "axios";
import toast from "react-hot-toast";
import { TiTickOutline } from "react-icons/ti";
import { FaPencil } from "react-icons/fa6";
import LoadingSpin from "../../components/spinner/LoadingSpin";

const DoctorSubscription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // subscription activation states
  const [subscription, setSubscription] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [durationValue, setDurationValue] = useState(1);
  const [durationUnit, setDurationUnit] = useState("days");
  const [timeRemaining, setTimeRemaining] = useState(null);

  //fetch doctor
  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/admin/single-doctor-info/${id}`
      );
      if (data?.success) {
        setDoctor(data?.doctor);
      }
    } catch (error) {
      console.log(error);
      navigate("/subscriptions"); // Redirect on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
    // eslint-disable-next-line
  }, [id]);

  // subscription activation functionality

  useEffect(() => {
    if (subscription?.isActive && isEditing) {
      setDurationValue(subscription.duration.value);
      setDurationUnit(subscription.duration.unit);
    }
  }, [isEditing, subscription]);

  // Fetch subscription status
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/auth/subscription-status/${id}`
      );
      setSubscription(res.data.subscription);
      setDoctor((prev) => ({ ...prev, subscription: res.data.subscription }));
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription status");
    } finally {
      setLoading(false);
    }
  };

  // Handle subscription activation/update
  const handleSubscriptionUpdate = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/activate-subscription`,
        { durationValue, durationUnit, userId: id }
      );
      toast.success("Subscription updated successfully");
      setSubscription(res.data.user.subscription);
      setIsEditing(false);
      fetchDoctor();
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error(
        error.response?.data?.message || "Failed to update subscription"
      );
    }
  };

  // Format time remaining
  const formatTimeRemaining = (ms) => {
    if (!ms) return "00:00:00";

    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Update countdown timer
  useEffect(() => {
    if (!subscription?.isActive || !subscription?.expiryDate) return;

    const updateTimer = () => {
      const now = new Date();
      const expiry = new Date(subscription.expiryDate);
      const remaining = expiry - now;

      if (remaining <= 0) {
        setTimeRemaining(0);
        fetchSubscription();
        return;
      }

      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [subscription]);

  // Initial fetch
  useEffect(() => {
    fetchSubscription();
    // eslint-disable-next-line
  }, []);

  //fetching transaction
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTransacions = async () => {
    try {
      const { data } = await axios.get(
        `${
          import.meta.env.VITE_API
        }/api/v1/transaction/transactions/${id}?page=${page}&limit=5`
      );
      if (data?.success) {
        if (page === 1) {
          setTransactions(data.transactions);
        } else {
          setTransactions((prev) => [...prev, ...data.transactions]);
        }
        setHasMore(data.page < data.pages);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    fetchTransacions();
    // eslint-disable-next-line
  }, [page, id]);

  //Payment verification
  const [verifyLoading, setVerifyLoading] = useState(null);

  const paymentVerification = async ({ transactionId }, { verification }) => {
    try {
      setVerifyLoading(transactionId);
      const { data } = await axios.put(
        `${
          import.meta.env.VITE_API
        }/api/v1/transaction/verify-transaction/${transactionId}`,
        {
          verification,
        }
      );
      if (data?.success) {
        toast.success(data?.message);
        // Update the specific transaction in state
        setTransactions((prevTransactions) =>
          prevTransactions.map((transaction) =>
            transaction._id === transactionId
              ? { ...transaction, verification }
              : transaction
          )
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.log(error);
    } finally {
      setVerifyLoading(null);
    }
  };

  return (
    <Layout>
      <div className="single-subscriptions-main-container">
        <div className="single-subscriptions-container">
          <div className="menu-side">
            <AdminMenu />
          </div>
          <div className="content-side">
            <div className="back-button">
              <span onClick={() => navigate("/subscriptions")} title="Back">
                <FaArrowLeft />
              </span>
            </div>
            <div className={`details-holder ${loading ? "loading" : ""}`}>
              {loading ? (
                <div className="skeleton-loader">
                  <div className="skeleton-avatar"></div>
                  <div className="skeleton-line-container">
                    <div className="skeleton-label"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-label"></div>
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-label"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-label"></div>
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-label"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-label"></div>
                    <div className="skeleton-line medium"></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="contents-details">
                    <img
                      src={
                        doctor?.image?.length > 0
                          ? `${import.meta.env.VITE_API}${doctor?.image}`
                          : "/designpics/profile.png"
                      }
                      alt={`${doctor?.name}'s profile`}
                    />
                    <p>
                      <label>Name: </label>
                      {doctor?.name}
                    </p>
                    <p>
                      <label>Degree: </label> {doctor?.degree}
                    </p>
                    <p>
                      <label>Email: </label>
                      {doctor?.email}
                    </p>
                    <p>
                      <label>Phone: </label>
                      {doctor?.phone}
                    </p>
                    <p>
                      <label>Address: </label>
                      {doctor?.address}
                    </p>
                    <p>
                      <label>Speciality: </label>
                      {doctor?.speciality}
                    </p>
                  </div>
                  <div className="subscription-details-and-action">
                    <h2>Subscription Details</h2>
                    <table>
                      <tbody>
                        <tr>
                          <td>Current Status:</td>
                          <td
                            className={
                              doctor?.subscription?.isActive
                                ? "active-state"
                                : "inactive-state"
                            }
                          >
                            {doctor?.subscription?.isActive
                              ? "Active"
                              : "Inactive"}
                          </td>
                        </tr>
                        <tr>
                          <td>Last Activated On:</td>
                          <td>
                            {doctor?.subscription?.lastActivated
                              ? new Date(
                                  doctor.subscription.lastActivated
                                ).toLocaleString()
                              : "Never"}
                          </td>
                        </tr>
                        <tr>
                          <td>Last Duration:</td>
                          <td>
                            {doctor?.subscription?.duration
                              ? `${doctor.subscription.duration.value} ${doctor.subscription.duration.unit}`
                              : "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td>Expiry Date & Time:</td>
                          <td>
                            {doctor?.subscription?.expiryDate
                              ? new Date(
                                  doctor.subscription.expiryDate
                                ).toLocaleString()
                              : "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td>Last Payment Status:</td>
                          <td
                            className={
                              doctor?.subscription?.lastPaymentStatus === "Paid"
                                ? "paid"
                                : doctor?.subscription?.lastPaymentStatus ===
                                  "Unpaid"
                                ? "unpaid"
                                : "pending-confirmation"
                            }
                          >
                            {doctor?.subscription?.lastPaymentStatus || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td>Subscription Remaining:</td>
                          <td>
                            {timeRemaining !== null
                              ? formatTimeRemaining(timeRemaining)
                              : "..."}
                          </td>
                        </tr>

                        {/* subscription activation */}
                        <tr className="activation-functionality">
                          {isEditing ? (
                            <div className="subscription-edit">
                              <div className="duration-controls">
                                <input
                                  type="number"
                                  min="1"
                                  value={durationValue}
                                  onChange={(e) =>
                                    setDurationValue(
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                />
                                <select
                                  value={durationUnit}
                                  onChange={(e) =>
                                    setDurationUnit(e.target.value)
                                  }
                                >
                                  <option value="minutes">Minutes</option>
                                  <option value="hours">Hours</option>
                                  <option value="days">Days</option>
                                </select>
                              </div>
                              <div className="action-buttons">
                                <button onClick={handleSubscriptionUpdate}>
                                  <TiTickOutline /> Save
                                </button>
                                <button
                                  onClick={() => setIsEditing(false)}
                                  className="cancel-btn"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : !subscription?.isActive ? (
                            <div className="subscription-inactive">
                              <button
                                onClick={() => setIsEditing(true)}
                                className="activate-btn"
                              >
                                Activate Subscription
                              </button>
                            </div>
                          ) : (
                            <div className="subscription-active">
                              <button
                                onClick={() => setIsEditing(true)}
                                className="edit-btn"
                              >
                                <FaPencil /> Extend Subscription
                              </button>
                            </div>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="last-five-transactions">
                    <h2>Recent Transactions</h2>
                    <table className="payment-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Payment Method</th>
                          <th>Last Numbers</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                          <th>Verified By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions?.map((t, i) => (
                          <tr key={i}>
                            <td>
                              {new Date(t?.createdAt).toLocaleString("en-US", {
                                day: "numeric", // 21
                                month: "long", // July
                                year: "numeric", // 25
                                hour: "numeric", // 12
                                minute: "2-digit", // 13
                                hour12: true, // AM/PM
                              })}
                            </td>
                            <td>{t?.paymentMethod}</td>
                            <td>{t?.lastNumbers}</td>
                            <td>Tk. {t?.amount}</td>
                            <td>
                              <span
                                className={
                                  t?.verification === "Pending"
                                    ? "status-pending"
                                    : t?.verification === "Accepted"
                                    ? "status-accepted"
                                    : "status-rejected"
                                }
                              >
                                {t?.verification}
                              </span>
                            </td>
                            <td className="update-buttons">
                              {verifyLoading === t?._id ? (
                                <LoadingSpin height={"15px"} width={"15px"} />
                              ) : (
                                <>
                                  {t?.verification === "Pending" ||
                                  t?.verification === "Accepted" ? (
                                    <button
                                      className="btn-reject"
                                      onClick={() => {
                                        paymentVerification(
                                          { transactionId: t?._id },
                                          { verification: "Rejected" }
                                        );
                                      }}
                                    >
                                      Reject
                                    </button>
                                  ) : (
                                    ""
                                  )}
                                  {t?.verification === "Pending" ||
                                  t?.verification === "Rejected" ? (
                                    <button
                                      className="btn-accept"
                                      onClick={() => {
                                        paymentVerification(
                                          { transactionId: t?._id },
                                          { verification: "Accepted" }
                                        );
                                      }}
                                    >
                                      Accept
                                    </button>
                                  ) : (
                                    ""
                                  )}
                                </>
                              )}
                            </td>
                            <td className="verified-by">
                              {t?.verifiedBy?.name}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {hasMore && (
                      <div className="load-more-container">
                        <button
                          onClick={loadMore}
                          disabled={loading}
                          className="load-more-btn"
                        >
                          {loading ? "Loading..." : "Show More"}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorSubscription;
