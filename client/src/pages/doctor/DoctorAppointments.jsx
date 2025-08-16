import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import DoctorMenu from "../../components/menu/DoctorMenu";
import "../../styles/DoctorAppointments.scss";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingSpin from "../../components/spinner/LoadingSpin";

const DoctorAppointments = () => {
  //fetch appointments
  const { id } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${
          import.meta.env.VITE_API
        }/api/v1/appointment/get-doctor-appointments/${id}`
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
  }, [id]);

  //update booking status
  const [updateLoading, setUpdateLoading] = useState(null);
  const updateStatus = async (appointmentId, status) => {
    try {
      setUpdateLoading(appointmentId);
      const { data } = await axios.put(
        `${
          import.meta.env.VITE_API
        }/api/v1/appointment/update-appointment-status/${appointmentId}`,
        { status }
      );
      if (data?.success) {
        toast.success(data?.message);
        getAppointments(); // Refresh the list after update
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setUpdateLoading(null);
    }
  };

  // Filter appointments for today
  const todayAppointments = appointments.filter((a) => {
    return new Date(a.date).toDateString() === new Date().toDateString();
  });

  // Filter upcoming appointments (after today)
  const upcomingAppointments = appointments.filter((a) => {
    return (
      new Date(a.date) > new Date() &&
      new Date(a.date).toDateString() !== new Date().toDateString()
    );
  });
  // Filter Past appointments (after today)
  const pastAppointments = appointments.filter((a) => {
    return (
      new Date(a.date) < new Date() &&
      new Date(a.date).toDateString() !== new Date().toDateString()
    );
  });

  const renderTable = (appointmentsList, title) => {
    const isPastAppointments = title === "Appointments History";
    const isTodayAppointments = title === "Today's Appointments";
    const isUpcomingAppointments = title === "Upcoming Appointments";
    return (
      <div className="appointment-table-section">
        <h3>{title}</h3>
        <table>
          <thead>
            <tr>
              <th>SL</th>
              <th>Appointment Date</th>
              <th>Time</th>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Booking Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointmentsList?.map((a, i) => (
              <tr key={i}>
                <td>{a?.sl}</td>
                <td>
                  {new Date(a?.date).toLocaleString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    weekday: "long",
                  })}
                </td>
                <td>{a?.slot}</td>
                <td>{a?.patientId?.patientId}</td>
                <td>{a?.patientId?.name}</td>
                <td>{a?.patientId?.phone}</td>
                <td>
                  <span className={`status-${a?.status.toLowerCase()}`}>
                    {a?.status}
                  </span>
                </td>
                <td className="action-btns">
                  {/* for past appointments */}
                  {isPastAppointments && (
                    <>
                      <Link to={`/appointment-details/${a?._id}`}>Details</Link>
                      {a?.status !== "cancelled" &&
                        a?.status !== "completed" && (
                          <button
                            className="cancel"
                            onClick={() => updateStatus(a?._id, "cancelled")}
                          >
                            {a?._id === updateLoading ? (
                              <LoadingSpin height={"10px"} width={"10px"} />
                            ) : (
                              "Cancel"
                            )}
                          </button>
                        )}
                    </>
                  )}
                  {/* For today's appointments */}
                  {isTodayAppointments && (
                    <>
                      {a?.status !== "arrived" && (
                        <button
                          className="arrived"
                          onClick={() => updateStatus(a?._id, "arrived")}
                        >
                          {a?._id === updateLoading ? (
                            <LoadingSpin height={"10px"} width={"10px"} />
                          ) : (
                            "Arrived"
                          )}
                        </button>
                      )}
                      <button
                        disabled={a?.status !== "arrived"}
                        onClick={() =>
                          navigate(`/doctor-dashboard/appointment/${a?._id}`)
                        }
                      >
                        Consult
                      </button>
                      {a?.status === "arrived" && (
                        <button
                          className="cancel"
                          onClick={() => updateStatus(a?._id, "cancelled")}
                        >
                          {a?._id === updateLoading ? (
                            <LoadingSpin height={"10px"} width={"10px"} />
                          ) : (
                            "Cancel"
                          )}
                        </button>
                      )}
                    </>
                  )}

                  {/* For upcoming appointments */}
                  {isUpcomingAppointments && (
                    <>
                      <button
                        className="cancel"
                        onClick={() => updateStatus(a?._id, "cancelled")}
                      >
                        {a?._id === updateLoading ? (
                          <LoadingSpin height={"10px"} width={"10px"} />
                        ) : (
                          "Cancel"
                        )}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {appointmentsList?.length === 0 && (
              <tr>
                <td colSpan="7" className="no-appointments">
                  No {title.toLowerCase()} available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Layout>
      <div className="doctorappointments-main-container">
        <div className="doctorappointments-container">
          <div className="menu-side">
            <DoctorMenu />
          </div>
          <div className="content-side">
            <h2>Appointments</h2>
            <hr />
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
                <>
                  {renderTable(todayAppointments, "Today's Appointments")}
                  {renderTable(upcomingAppointments, "Upcoming Appointments")}
                  {renderTable(pastAppointments, "Appointments History")}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorAppointments;
