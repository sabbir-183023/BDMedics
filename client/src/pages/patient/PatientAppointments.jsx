import React, { useEffect, useState } from "react";
import "../../styles/PatientAppointments.scss";
import PatientMenu from "../../components/menu/PatientMenu";
import Layout from "../../components/layout/Layout";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const PatientAppointments = () => {
  const { patientId } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${
          import.meta.env.VITE_API
        }/api/v1/appointment/get-user-appointments/${patientId}`
      );
      if (data?.success) {
        setAppointments(data?.appointments);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getAppointments();
    //eslint-disable-next-line
  }, [patientId]);

  return (
    <Layout>
      <div className="patientappointments-main-container">
        <div className="patientappointments-container">
          <div className="menu-side">
            <PatientMenu />
          </div>
          <div className="content-side">
            <h2>Appointments</h2>
            <div className="table-container">
              {loading ? (
                <div className="shimmer-container">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="shimmer-row">
                      <div className="shimmer-cell"></div>
                      <div className="shimmer-cell"></div>
                      <div className="shimmer-cell"></div>
                      <div className="shimmer-cell"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Appointment Date</th>
                      <th>Time</th>
                      <th>Doctor</th>
                      <th>Booking Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments?.map((a, i) => (
                      <tr key={i}>
                        <td>
                          {new Date(a?.date).toLocaleString("en-US", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            weekday: "long",
                          })}
                        </td>
                        <td>{a?.slot}</td>
                        <td>
                          <Link to={`/${a?.doctorId?.username}`}>
                            {a?.doctorId?.name}
                          </Link>
                        </td>
                        <td>
                          <span className={`status-${a?.status.toLowerCase()}`}>
                            {a?.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientAppointments;
