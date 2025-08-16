import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import DoctorMenu from "../../components/menu/DoctorMenu";
import "../../styles/DoctorTransactions.scss";
import { useParams } from "react-router-dom";
import axios from "axios";
import { SmoothScrollToTop } from "../../components/SmoothScrollToTop";

const DoctorTransactions = () => {
  const { id } = useParams();

  //fetching transaction
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  console.log(transactions);

  const fetchTransacions = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    fetchTransacions();
    // eslint-disable-next-line
  }, [page, id]);
  return (
    <Layout>
      <SmoothScrollToTop />
      <div className="doctortransactions-main-container">
        <div className="doctortransactions-container">
          <div className="menu-side">
            <DoctorMenu />
          </div>
          <div className="content-side">
            <h2>Transactions</h2>
            <div className="transaction-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Last Numbers</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && transactions.length === 0
                    ? // Shimmer loading effect
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={`shimmer-${i}`} className="shimmer-row">
                          <td>
                            <div className="shimmer"></div>
                          </td>
                          <td>
                            <div className="shimmer"></div>
                          </td>
                          <td>
                            <div className="shimmer"></div>
                          </td>
                          <td>
                            <div className="shimmer"></div>
                          </td>
                          <td>
                            <div className="shimmer"></div>
                          </td>
                        </tr>
                      ))
                    : transactions?.map((t, i) => (
                        <tr key={i}>
                          <td>
                            {new Date(t?.createdAt).toLocaleString("en-US", {
                              day: "numeric", // 21
                              month: "long", // July
                              year: "numeric",
                              hour: "numeric", // 12
                              minute: "2-digit", // 13
                              hour12: true, // AM/PM
                            })}
                          </td>
                          <td>{t?.paymentMethod}</td>
                          <td>Tk. {t?.amount}</td>
                          <td>{t?.lastNumbers}</td>
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
                        </tr>
                      ))}
                </tbody>
              </table>
              {transactions?.length === 0 && !loading && (
                <h1 className="empty">{"<Empty>"}</h1>
              )}
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorTransactions;
