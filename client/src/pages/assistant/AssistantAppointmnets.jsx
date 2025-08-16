import React from "react";
import { SmoothScrollToTop } from "../../components/SmoothScrollToTop";
import Layout from "../../components/layout/Layout";
import AssistantMenu from "../../components/menu/AssistantMenu";
import { Link, useParams } from "react-router-dom";
import "../../styles/AssistantAppointments.scss";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect } from "react";
import LoadingSpin from "../../components/spinner/LoadingSpin";
import { ImCross } from "react-icons/im";

const AssistantAppointmnets = () => {
  const { doctorId } = useParams();
  //   const { assistantId } = useParams();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  //state to update basic info
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [systolicBp, setSystolicBp] = useState("");
  const [diastolicBp, setDiastolicBp] = useState("");
  const [height, setheight] = useState("");
  const [weight, setweight] = useState("");
  const [temp, setTemp] = useState("");
  const [pulse, setPulse] = useState("");
  const [spo2, setSpo2] = useState("");

  const getAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${
          import.meta.env.VITE_API
        }/api/v1/appointment/get-doctor-appointments/${doctorId}`
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
  }, [doctorId]);

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

  //functionality to update basic info
  const [bisubmitLoading, setbisubmitLoading] = useState(false);
  const handleSubmitBasicInfo = async (e) => {
    e.preventDefault();
    try {
      setbisubmitLoading(true);
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_API
        }/api/v1/appointment/submit-basic-info/${editId}`,
        {
          systolicBp,
          diastolicBp,
          height,
          weight,
          temp,
          pulse,
          spo2,
          patientId,
        }
      );
      if (data?.success) {
        toast.success(data?.message);
        setEditId(null);
        getAppointments();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setbisubmitLoading(false);
    }
  };

  const fetchBasicInfo = (Id) => {
    const foundAppointment = appointments.find((a) => a._id === Id);
    setName(foundAppointment?.patientId?.name);
    setPatientId(foundAppointment?.patientId?.patientId);
    setSystolicBp(foundAppointment?.bp?.systolicBp);
    setDiastolicBp(foundAppointment?.bp?.diastolicBp);
    setheight(foundAppointment?.height?.value);
    setweight(foundAppointment?.weight?.value);
    setTemp(foundAppointment?.temp?.value);
    setPulse(foundAppointment?.pulse?.value);
    setSpo2(foundAppointment?.spo2?.value);
  };

  //table for showing data
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
              <>
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
                  <td><b>{a?.patientId?.name}</b></td>
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
                        <button>Details</button>
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
                          onClick={() => {
                            setEditId(a?._id);
                            fetchBasicInfo(a?._id);
                          }}
                        >
                          Basic Info
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
                          disabled={
                            a?._id === updateLoading ||
                            a?.status === "cancelled"
                          }
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
                <tr className="primary-measures">
                  <td></td>
                  <td>
                    BP:{" "}
                    <b>
                      {a?.bp?.systolicBp}/{a?.bp?.diastolicBp} mmHg
                    </b>
                  </td>
                  <td>
                    Height: <b>{a?.height?.value} CM </b>
                  </td>
                  <td>
                    Weight: <b>{a?.weight?.value} KG </b>
                  </td>
                  <td>
                    Temp: <b>{a?.temp?.value} °F</b>
                  </td>
                  <td>
                    Pulse: <b>{a?.pulse?.value} bpm</b>
                  </td>
                  <td>
                    SPO2: <b>{a?.spo2?.value} %</b>
                  </td>
                </tr>
              </>
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

  return (
    <Layout>
      <SmoothScrollToTop />
      <div className="assistantappointment-main-container">
        <div className="assistantappointment-container">
          <div className="menu-side">
            <AssistantMenu />
          </div>
          <div className="content-side">
            <h2>Appointments</h2>
            <hr />
            {editId && (
              <div className="basic-info-edit-div">
                <div className="basic-info-container">
                  <div className="cross-btn-container">
                    <div className="left"></div>
                    <div className="right">
                      <span
                        onClick={() => {
                          setEditId(null);
                        }}
                      >
                        <ImCross />
                      </span>
                    </div>
                  </div>
                  <h4 className="name">Basic Info. of {name}</h4>
                  <h4 className="patient-id">Patient Id: {patientId}</h4>
                  <form action="" onSubmit={handleSubmitBasicInfo}>
                    <table className="form-table">
                      <tr>
                        <td>
                          <label htmlFor="bp">BP</label>
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="Systolic"
                            className="bp"
                            value={systolicBp}
                            onChange={(e) => setSystolicBp(e.target.value)}
                          />{" "}
                          /{" "}
                          <input
                            type="number"
                            placeholder="Diastolic"
                            className="bp"
                            value={diastolicBp}
                            onChange={(e) => setDiastolicBp(e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <label htmlFor="height">Height</label>
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="CM"
                            value={height}
                            onChange={(e) => setheight(e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <label htmlFor="weight">Weight</label>
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="KG"
                            value={weight}
                            onChange={(e) => setweight(e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <label htmlFor="temp">Temparature</label>
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="°F"
                            value={temp}
                            onChange={(e) => setTemp(e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <label htmlFor="pulse">Pulse</label>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={pulse}
                            placeholder="bpm"
                            onChange={(e) => setPulse(e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <label htmlFor="SPO2">SPO2</label>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={spo2}
                            placeholder="%"
                            onChange={(e) => setSpo2(e.target.value)}
                          />
                        </td>
                      </tr>
                    </table>
                    <div className="button-contianer">
                      <button>
                        {bisubmitLoading ? (
                          <LoadingSpin height={"10px"} width={"10px"} />
                        ) : (
                          "Submit"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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

export default AssistantAppointmnets;
