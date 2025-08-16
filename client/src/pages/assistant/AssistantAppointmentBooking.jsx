import React, { useEffect, useState } from "react";
import { SmoothScrollToTop } from "../../components/SmoothScrollToTop";
import AssistantMenu from "../../components/menu/AssistantMenu";
import Layout from "../../components/layout/Layout";
import "../../styles/AssistantAppointmentBooking.scss";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import LoadingSpin from "../../components/spinner/LoadingSpin";
import { CiBookmarkCheck } from "react-icons/ci";
import { IoCloudDoneSharp } from "react-icons/io5";

const AssistantAppointmentBooking = () => {
  const { doctorId } = useParams();
  //search by phone
  const [searchPhone, setSearchPhone] = useState("");
  const [getLoading, setGetLoading] = useState(false);
  const [searchedPatientInfo, setSearchedPatientInfo] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  //booking appointment
  const [patientInfo, setPatientInfo] = useState({});
  const [patientId, setPatientId] = useState("");
  const [patientInfoFound, setPatientInfoFound] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isAvailable, setIsAvailable] = useState(null);
  const [isWaitlisted, setIsWaitlisted] = useState(false);
  const [availableAppointments, setAvailableAppointments] = useState(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [appointment, setAppointment] = useState({});

  //create new patient
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isIdCreated, setIsIdCreated] = useState(false);
  const [credentialData, setCredintialData] = useState({});

  //search patient by phone
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
        setSearchedPatientInfo(res?.data?.searchResult);
        setGetLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.message);
      setGetLoading(false);
    }
  };

  //patient info getting
  const fetchPatientInfo = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/auth/patientInfo/${patientId}`
      );
      if (data?.success) {
        setPatientInfo(data?.patient);
        setPatientInfoFound(true);
        toast.success(data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // availability check
  const checkAvailability = async (date) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/appointment/availability`,
        {
          params: { doctorId, date },
        }
      );
      setAvailableSlots(data.availableSlots); // This sets the whole object
      setIsWaitlisted(data?.isWaitlisted);
      setIsAvailable(isAvailable);
      setAvailableAppointments(data?.availableAppointments);
    } catch (error) {
      toast.error("Failed to check availability");
      console.error(error);
    }
  };

  //generate time slots
  const generateTimeSlots = (selectedDate, doctorSchedule) => {
    if (!selectedDate || !doctorSchedule || !doctorSchedule.weeklySchedule)
      return [];

    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)

    // Check if the selected date is in holidays
    if (doctorSchedule.holidays && doctorSchedule.holidays.length > 0) {
      const selectedDateStr = date.toISOString().split("T")[0]; // Get YYYY-MM-DD format
      const isHoliday = doctorSchedule.holidays.some((holiday) => {
        const holidayDate = new Date(holiday);
        const holidayDateStr = holidayDate.toISOString().split("T")[0];
        return selectedDateStr === holidayDateStr;
      });

      if (isHoliday) {
        return [];
      }
    }

    // Safely find the day schedule
    const daySchedule =
      doctorSchedule.weeklySchedule?.find((d) => d.day === dayOfWeek) || null;

    if (
      !daySchedule ||
      !daySchedule.enabled ||
      !daySchedule.slots ||
      daySchedule.slots.length === 0
    ) {
      return [];
    }

    return daySchedule.slots.map((slot) => ({
      time: `${slot.start} - ${slot.end}`,
      available: true, // You might want to check bookedCount here
    }));
  };

  const timeSlots = generateTimeSlots(appointmentDate, availableSlots);

  //book appointment function
  const bookAppointment = async () => {
    try {
      setBookLoading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/appointment/book`,
        {
          doctorId,
          patientId,
          date: appointmentDate,
          slot: selectedSlot,
          isWaitlisted: isWaitlisted,
        }
      );

      if (data?.success) {
        toast.success(data.message);
        setAppointment(data?.appointment);
        setPatientInfo({});
        setPatientInfoFound(false);
        setSelectedSlot("");
        setIsWaitlisted(false);
        setPatientId("");
        setSearchPhone("");
        setSearchedPatientInfo([]);
        setBookingCompleted(true);
        setIsIdCreated(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setBookLoading(false);
    }
  };

  //patient creation
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

  // Fetch subscription status
  const [subscription, setSubscription] = useState(null);

  const fetchSubscription = async (userId) => {
    if (!userId) return; // Don't make the request if no user ID

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/auth/subscription-status/${userId}`
      );
      setSubscription(res.data.subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription status");
    }
  };

  // Initial fetch and refetch when ID changes
  useEffect(() => {
    fetchSubscription(doctorId);
  }, [doctorId]); // Add id as dependency

  return (
    <Layout>
      <SmoothScrollToTop />
      <div className="assistantappbooking-main-container">
        <div className="assistantappbooking-container">
          <div className="menu-side">
            <AssistantMenu />
          </div>
          <div className="content-side">
            <div className="title-div">
              <h2>Appointment Booking</h2>
            </div>
            <div className="all-forms-container">
              <div className="two-forms-div">
                <div className="form-one">
                  <form action="">
                    <h3>Check Patient by Phone</h3>
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
                          <div
                            className="shimmer-line"
                            style={{ width: "70%" }}
                          ></div>
                          <div
                            className="shimmer-line"
                            style={{ width: "50%" }}
                          ></div>
                          <div
                            className="shimmer-line"
                            style={{ width: "30%" }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    searchedPatientInfo?.length > 0 && (
                      <div className="result-holder">
                        <label className="search-declaration">
                          With the number "{searchPhone}", the following results
                          are found:
                        </label>
                        {searchedPatientInfo?.map((p, i) => (
                          <div
                            key={i}
                            className="info-div"
                            onClick={() => {
                              setPatientInfo(p);
                              setPatientInfoFound(true);
                              setPatientId(p?.patientId);
                              toast.success("Ready to book!");
                            }}
                          >
                            <div className="left-info">
                              <p>
                                <b>Name:</b> {p?.name}
                              </p>
                              <p>
                                <b>Date of Birth:</b> {p?.dob}
                              </p>
                              <h3>
                                Patient ID: <span>{p?.patientId}</span>{" "}
                              </h3>
                            </div>
                            <div className="right-arrow">
                              <FaArrowRight />
                            </div>
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
                </div>
                <div className="form-two">
                  <div className="form">
                    <h3>Book Appointment</h3>
                    {bookingCompleted ? (
                      <div className="booking-complete">
                        <h1>
                          <CiBookmarkCheck />
                          {appointment?.sl}
                        </h1>
                        <h4>Appointment booking Completed</h4>
                        <h3>For</h3>
                        <table>
                          <tr>
                            <td>PatientId:</td>
                            <td>{appointment?.patientId}</td>
                          </tr>
                          <tr>
                            <td>Date:</td>
                            <td>
                              {new Date(appointment?.date).toLocaleString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  weekday: "long",
                                }
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Time:</td>
                            <td>{appointment?.slot}</td>
                          </tr>
                        </table>
                        <div className="btn-cont">
                          <button onClick={() => setBookingCompleted(false)}>
                            Ok
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="patient-id">Patient Id:</label>
                        <div className="patient-id-sharing">
                          <input
                            type="text"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            disabled={patientInfoFound}
                          />
                          {patientInfoFound && (
                            <button
                              onClick={() => {
                                setPatientInfoFound(false);
                                setPatientId("");
                              }}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        {!patientInfoFound && (
                          <button className="btn" onClick={fetchPatientInfo}>
                            Get Info
                          </button>
                        )}
                        {patientInfoFound && (
                          <>
                            <table className="patient-basic-info">
                              <tr>
                                <td>
                                  <label htmlFor="patient-name">
                                    Patient Name:{" "}
                                  </label>
                                </td>
                                <td>
                                  <span> {patientInfo?.name}</span>
                                </td>
                              </tr>
                              <td>
                                <label htmlFor="phone">Phone:</label>
                              </td>
                              <td>
                                <span>{patientInfo?.phone}</span>
                              </td>
                            </table>
                            <div className="appointment-date">
                              <label htmlFor="appointment-date">
                                Appointment Date:
                              </label>
                              <input
                                type="date"
                                value={appointmentDate}
                                onChange={(e) => {
                                  setAppointmentDate(e.target.value);
                                  checkAvailability(e.target.value);
                                }}
                                min={new Date().toISOString().split("T")[0]}
                              />
                            </div>
                            {appointmentDate && (
                              <div className="slots-container">
                                <h4>Available Time Slots:</h4>
                                {timeSlots.length > 0 ? (
                                  <div className="time-slots">
                                    {timeSlots.map((slot, index) => (
                                      <button
                                        key={index}
                                        className={`time-slot ${
                                          selectedSlot === slot.time
                                            ? "selected"
                                            : ""
                                        }`}
                                        onClick={() =>
                                          setSelectedSlot(slot.time)
                                        }
                                        disabled={!slot.available}
                                      >
                                        {slot.time}{" "}
                                        {availableAppointments > 0
                                          ? "(Available)"
                                          : "(Booked)"}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <p>No available slots for this date</p>
                                )}
                              </div>
                            )}
                            {!subscription?.isActive && (
                              <p style={{ textAlign: "center", color: "red", marginBottom:"0" }}>
                                Doctor's Subscription Expired!
                              </p>
                            )}
                            {selectedSlot && (
                              <button
                                className="book-button"
                                onClick={bookAppointment}
                                disabled={!subscription?.isActive}
                              >
                                {bookLoading ? (
                                  <LoadingSpin height={"10px"} width={"10px"} />
                                ) : (
                                  `Book (${selectedSlot})`
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Create Patient */}
              <div className="one-form-div">
                <div className="form-contaiiner">
                  <h2>Create A New Patient</h2>
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
                        </h4>
                        <div className="btn-cont">
                          <button
                            onClick={() => {
                              setPatientInfo(credentialData);
                              setPatientInfoFound(true);
                              setPatientId(credentialData?.patientId);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                              toast.success("Ready to book!");
                            }}
                          >
                            Book Appointment
                          </button>
                        </div>
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
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AssistantAppointmentBooking;
