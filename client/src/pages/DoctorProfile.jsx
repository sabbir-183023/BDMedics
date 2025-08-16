import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/DoctorProfille.scss";
import { AiOutlineMail } from "react-icons/ai";
import { IoLocationOutline } from "react-icons/io5";
import { SlGraduation } from "react-icons/sl";
import { FaArrowRightLong } from "react-icons/fa6";
import { SmoothScrollToTop } from "../components/SmoothScrollToTop";
import toast from "react-hot-toast";
import { ImCross } from "react-icons/im";
import useAuth from "../context/useAuth";
import { CiBookmarkCheck } from "react-icons/ci";
import LoadingSpin from "../components/spinner/LoadingSpin";

const DoctorProfile = () => {
  const { username } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [auth] = useAuth();
  const navigate = useNavigate();

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/doctor/${username}`
      );
      if (data?.success) {
        setDoctor(data?.doctor);
        setTimeout(() => setLoaded(true), 100);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
    //eslint-disable-next-line
  }, [username]);

  useEffect(() => {
    if (doctor?.slides?.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % doctor.slides.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [doctor?.slides]);

  //appointment processing
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [patientInfoFound, setPatientInfoFound] = useState(false);
  const [patientInfo, setPatientInfo] = useState({});
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [appointment, setAppointment] = useState({});

  const [appointmentDate, setAppointmentDate] = useState("");
  // const [appointmentLimit, setAppointmentLimit] = useState(0);
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  useEffect(() => {
    if (auth?.user?.ref) {
      setPatientId(auth.user.ref);
    }
  }, [auth?.user?.ref]);

  //patient info getting
  const fetchPatientInfo = async () => {
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

  // In your DoctorProfile component
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isAvailable, setIsAvailable] = useState(null);
  const [availableAppointments, setAvailableAppointments] = useState(null);
  const [bookLoading, setBookLoading] = useState(false);

  // Simplified availability check
  const checkAvailability = async (date) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/appointment/availability`,
        {
          params: { doctorId: doctor._id, date },
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

  //book appointment function
  const bookAppointment = async () => {
    setBookLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/appointment/book`,
        {
          doctorId: doctor._id,
          patientId,
          date: appointmentDate,
          slot: selectedSlot,
          isWaitlisted: isWaitlisted,
        }
      );

      if (data?.success) {
        toast.success(data.message);
        setPatientInfo({});
        setPatientInfoFound(false);
        setSelectedSlot("");
        setIsWaitlisted(false);
        setBookingCompleted(true);
        setAppointment(data?.appointment);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setBookLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Layout>
        <div className="doctor-profile-main-container">
          <div className="doctor-profile-container shimmer-loading">
            <div className="img-div shimmer">
              <div className="shimmer-bg"></div>
            </div>
            <div className="other-elements-div">
              <div className="primary-details shimmer">
                <div className="shimmer-bg"></div>
                <div className="shimmer-bg" style={{ width: "70%" }}></div>
                <div className="shimmer-bg" style={{ width: "50%" }}></div>
                <div className="shimmer-bg" style={{ width: "80%" }}></div>
                <div className="shimmer-bg" style={{ width: "60%" }}></div>
              </div>
              <div className="secondary-details shimmer">
                <div className="shimmer-bg"></div>
                <div className="shimmer-bg"></div>
                <div className="shimmer-bg"></div>
              </div>
              <div className="slide-box shimmer">
                <div className="shimmer-bg"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SmoothScrollToTop />
      <div className="doctor-profile-main-container">
        <div className={`doctor-profile-container ${loaded ? "loaded" : ""}`}>
          <div className="img-div">
            <img
              src={
                doctor?.image
                  ? `${import.meta.env.VITE_API}${doctor?.image}`
                  : "./designpics/default-doctor.png"
              }
              alt={username}
            />
          </div>
          <div className="other-elements-div">
            <div className="primary-details">
              <h1>{doctor?.name}</h1>
              {doctor?.speciality?.map((s, i, arr) => {
                const englishSpecialty = s?.split("-")[0];
                return (
                  <span key={i} className="speacility">
                    {englishSpecialty}
                    {i < arr.length - 1 && ", "}
                  </span>
                );
              })}
              <p className="email">
                <AiOutlineMail />
                {doctor?.email}
              </p>
              <p className="address">
                <IoLocationOutline />
                {doctor?.address}
              </p>
              <p className="degree">
                <SlGraduation />
                {doctor?.degree}
              </p>
              {!isAppointmentOpen && (
                <div className="btn-container">
                  <button
                    className="get-appointment"
                    disabled={!doctor?.subscription?.isActive}
                    onClick={() => setIsAppointmentOpen(true)}
                  >
                    Book Appointment <FaArrowRightLong />
                  </button>
                  <br />
                  {!doctor?.subscription?.isActive && (
                    <button className="btn">Want to take appointment</button>
                  )}
                </div>
              )}
              {isAppointmentOpen && (
                <div className="appointment-taking-div-container">
                  <div className="appointment-taking-div">
                    <div className="button-cross">
                      <button
                        onClick={() => {
                          setIsAppointmentOpen(false);
                          setPatientInfo({});
                          setPatientInfoFound(false);
                        }}
                      >
                        <ImCross />
                      </button>
                    </div>
                    {bookingCompleted ? (
                      <div className="booking-complete">
                        <h1>Serial</h1>
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
                          <button
                            onClick={() => {
                              setBookingCompleted(false),
                                setIsAppointmentOpen(false);
                            }}
                          >
                            Ok
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label htmlFor="patient-id">Patient Id:</label>
                          <input
                            type="text"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            disabled={auth?.user?.ref?.length > 0}
                          />
                        </div>
                        {!patientInfoFound && (
                          <button className="btn" onClick={fetchPatientInfo}>
                            Get Info
                          </button>
                        )}
                        {!patientInfoFound && (
                          <div className="extra-links">
                            <div className="link">
                              <span onClick={() => navigate("/patientidcheck")}>
                                Check existing patient
                              </span>
                            </div>
                            <div className="link">
                              <span
                                onClick={() => navigate("/patientidcreation")}
                              >
                                Create new patient Id
                              </span>
                            </div>
                          </div>
                        )}
                        {patientInfoFound && (
                          <>
                            <div>
                              <label htmlFor="patient-name">
                                Patient Name:
                              </label>{" "}
                              <span>{patientInfo?.name}</span>
                            </div>
                            <div>
                              <label htmlFor="phone">Phone:</label>{" "}
                              <span>{patientInfo?.phone}</span>
                            </div>
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
                            {selectedSlot && (
                              <button
                                className="book-button"
                                onClick={bookAppointment}
                                disabled={bookLoading}
                              >
                                {bookLoading ? (
                                  <LoadingSpin height={"10px"} width={"10px"} />
                                ) : (
                                  `Book (${selectedSlot})`
                                )}
                                {/* This will show just the start time */}
                              </button>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="secondary-details">
              <h1 className="title">{doctor?.title}</h1>
              <p className="description">{doctor?.description}</p>
            </div>
            {doctor?.slides?.length > 0 && (
              <div className="slide-box">
                {doctor?.slides?.map((img, i) => (
                  <img
                    key={i}
                    src={`${import.meta.env.VITE_API}${img}`}
                    alt={`Slide ${i}`}
                    className={i === currentSlide ? "slide active" : "slide"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfile;
