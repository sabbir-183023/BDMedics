import React, { useEffect, useState } from "react";
import "../../styles/DoctorAppointmentConsult.scss";
import Layout from "../../components/layout/Layout";
import { SmoothScrollToTop } from "../../components/SmoothScrollToTop";
import DoctorMenu from "../../components/menu/DoctorMenu";
import { IoChevronBackCircle } from "react-icons/io5";
import useAuth from "../../context/useAuth";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";
import { useNavigate, useParams } from "react-router-dom";
import { TfiWorld, TfiLocationPin } from "react-icons/tfi";
import { MdOutlineMedicalServices } from "react-icons/md";
import { PiGraduationCapBold } from "react-icons/pi";
import axios from "axios";
import { LuFlipVertical } from "react-icons/lu";
import toast from "react-hot-toast";
import LoadingSpin from "../../components/spinner/LoadingSpin";
import { FiSave } from "react-icons/fi";
import { IoTrashBinSharp } from "react-icons/io5";
import { ImCross } from "react-icons/im";

const DoctorAppointmentConsult = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const { appoitmentid } = useParams();

  //Fetch Appointment Info
  const [appointment, setAppointment] = useState({
    siggesttions: [],
    findings: [],
    investigations: [],
    medicines: [],
    nextAppointment: "",
  });
  const [fetchLoading, setFetchLoading] = useState(false);

  const fetchAppointment = async (appId) => {
    try {
      setFetchLoading(true);
      const { data } = await axios.get(
        `${
          import.meta.env.VITE_API
        }/api/v1/appointment/get-appointment/${appId}`
      );
      if (data?.success) {
        setAppointment({
          ...data?.appointment,
          investigations: data?.appointment?.investigations || [],
          findings: data?.appointment?.findings || [],
          medicines: data?.appointment?.medicines || [],
          nextAppointment: data?.appointment?.nextAppointment || [],
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFetchLoading(false);
    }
  };
  useEffect(() => {
    fetchAppointment(appoitmentid);
  }, [appoitmentid]);

  //Generating qr code
  const qrCodeData = `https://bdmedics.com/${auth?.user?.username}`;
  const [qrCodeImage, setQrCodeImage] = useState("");

  //app-id-barcode
  const appIdBarcodeValue = appoitmentid;
  const [barcodeImage, setBarcodeImage] = useState("");

  //patient-id-barcode
  const pidValue = appointment?.patientId;
  const [pIdBarcodeImage, setPidBarcodeImage] = useState("");

  useEffect(() => {
    const qrCanvas = document.createElement("canvas");
    const qrContext = qrCanvas.getContext("2d");
    const qrSvg = document.querySelector("#qr-code");
    if (qrSvg) {
      const qrSvgData = new XMLSerializer().serializeToString(qrSvg);
      const qrSvgBlob = new Blob([qrSvgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const qrSvgURL = URL.createObjectURL(qrSvgBlob);
      const qrImg = new Image();
      qrImg.onload = () => {
        const scale = 4;
        qrCanvas.width = qrImg.width * scale;
        qrCanvas.height = qrImg.height * scale;
        qrContext.scale(scale, scale);
        qrContext.drawImage(qrImg, 0, 0);
        setQrCodeImage(qrCanvas.toDataURL("image/png"));
      };
      qrImg.src = qrSvgURL;
    }

    const barcodeCanvas = document.createElement("canvas");
    const barcodeContext = barcodeCanvas.getContext("2d");
    const barcodeSvg = document.querySelector("#appid-barcode");
    if (barcodeSvg) {
      const barcodeSvgData = new XMLSerializer().serializeToString(barcodeSvg);
      const barcodeSvgBlob = new Blob([barcodeSvgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const barcodeSvgURL = URL.createObjectURL(barcodeSvgBlob);
      const barcodeImg = new Image();
      barcodeImg.onload = () => {
        const scale = 3;
        barcodeCanvas.width = barcodeImg.width * scale;
        barcodeCanvas.height = barcodeImg.height * scale;
        barcodeContext.scale(scale, scale);
        barcodeContext.drawImage(barcodeImg, 0, 0);
        setBarcodeImage(barcodeCanvas.toDataURL("image/png"));
      };
      barcodeImg.src = barcodeSvgURL;
    }

    const pidBarcodeCanvas = document.createElement("canvas");
    const pIdBarcodeContext = pidBarcodeCanvas.getContext("2d");
    const pidBarcodeSvg = document.querySelector("#pid-barcode");
    if (pidBarcodeSvg) {
      const pidBarcodeSvgData = new XMLSerializer().serializeToString(
        pidBarcodeSvg
      );
      const pidBarcodeSvgBlob = new Blob([pidBarcodeSvgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const pidBarcodeSvgURL = URL.createObjectURL(pidBarcodeSvgBlob);
      const pidBarcodeImg = new Image();
      pidBarcodeImg.onload = () => {
        const scale = 3;
        pidBarcodeCanvas.width = pidBarcodeImg.width * scale;
        pidBarcodeCanvas.height = pidBarcodeImg.height * scale;
        pIdBarcodeContext.scale(scale, scale);
        pIdBarcodeContext.drawImage(pidBarcodeImg, 0, 0);
        setPidBarcodeImage(pidBarcodeCanvas.toDataURL("image/png"));
      };
      pidBarcodeImg.src = pidBarcodeSvgURL;
    }
  }, [appointment]);

  //Age Calculator
  const calculateAge = (dobString) => {
    if (!dobString) return null;

    const dob = new Date(dobString);
    const now = new Date();

    // Check if the date is valid
    if (isNaN(dob.getTime())) return null;

    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();

    // Adjust for negative months/days
    if (days < 0) {
      months--;
      // Get the last day of the previous month
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years}y ${months}m ${days}d`;
  };

  //calculate BMI
  const calculateBMI = (heightCm, weightKg) => {
    if (!heightCm || !weightKg) return null;

    // Convert height from cm to meters
    const heightM = heightCm / 100;

    // BMI formula: weight (kg) / (height (m))^2
    const bmi = (weightKg / (heightM * heightM)).toFixed(1);

    return bmi;
  };

  //Updating Prescription Functionality
  const [timingInput, setTimingInput] = useState(false);
  const [newInvestigations, setNewInvestigations] = useState("");
  const [newFinding, setNewFinding] = useState("");
  const [medicinesInput, setMedicinesInput] = useState({
    name: "",
    duration: "",
    morning: "",
    midday: "",
    night: "",
    timing: "",
  });

  const updateField = (e, field, value) => {
    e.preventDefault();
    if (!value.trim()) return; // Prevent adding empty values
    setAppointment((prev) => ({ ...prev, [field]: [...prev[field], value] }));
    if (field === "findings") {
      setNewFinding("");
    } else {
      setNewInvestigations("");
    }
  };

  const addMedicine = (e) => {
    e.preventDefault();
    if (!medicinesInput.name.trim()) return;

    setAppointment((prev) => ({
      ...prev,
      medicines: [...prev.medicines, medicinesInput],
    }));

    setMedicinesInput({
      name: "",
      duration: "",
      morning: "",
      midday: "",
      night: "",
      timing: "",
    });
  };

  // update appointment data
  const [updateLoading, setUpdateLoading] = useState(false);

  const updateAppointmet = async () => {
    setUpdateLoading(true);
    try {
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_API
        }/api/v1/appointment/update-appointment/${appoitmentid}`,
        { appointment }
      );
      if (data?.success) {
        toast.success(data?.message);
        fetchAppointment(appoitmentid);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  //remove medicine
  const removeMedicine = (index) => {
    setAppointment((prev) => {
      const updatedMedicines = [...prev.medicines];
      updatedMedicines.splice(index, 1);
      return {
        ...prev,
        medicines: updatedMedicines,
      };
    });
  };

  //remove findings
  const removeFindings = (index) => {
    const updatedFindings = [...appointment.findings];
    updatedFindings.splice(index, 1);
    setAppointment((prev) => ({
      ...prev,
      findings: updatedFindings,
    }));
  };

  //remove findings
  const removeInvestigations = (index) => {
    const updatedInvestigations = [...appointment.investigations];
    updatedInvestigations.splice(index, 1);
    setAppointment((prev) => ({
      ...prev,
      investigations: updatedInvestigations,
    }));
  };

  //functionality to update basic info
  //state to update basic info
  const [editBasicMeasurement, setEditBasicMeasurement] = useState(false);
  const name = appointment?.patientData?.name;
  const patientId = appointment?.patientId;
  const [systolicBp, setSystolicBp] = useState("");
  const [diastolicBp, setDiastolicBp] = useState("");
  const [height, setheight] = useState("");
  const [weight, setweight] = useState("");
  const [temp, setTemp] = useState("");
  const [pulse, setPulse] = useState("");
  const [spo2, setSpo2] = useState("");
  const [bisubmitLoading, setbisubmitLoading] = useState(false);
  const handleSubmitBasicInfo = async (e) => {
    e.preventDefault();
    try {
      setbisubmitLoading(true);
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_API
        }/api/v1/appointment/submit-basic-info/${appoitmentid}`,
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
        setEditBasicMeasurement(false);
        fetchAppointment(appoitmentid);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setbisubmitLoading(false);
    }
  };

  const fetchBasicInfo = (appointment) => {
    setSystolicBp(appointment?.bp?.systolicBp);
    setDiastolicBp(appointment?.bp?.diastolicBp);
    setheight(appointment?.height?.value);
    setweight(appointment?.weight?.value);
    setTemp(appointment?.temp?.value);
    setPulse(appointment?.pulse?.value);
    setSpo2(appointment?.spo2?.value);
  };

  useEffect(() => {
    fetchBasicInfo(appointment);
  }, [appointment]);

  return (
    <Layout>
      <div style={{ display: "none" }}>
        <QRCode id="qr-code" value={qrCodeData} size={150} />
        <Barcode
          id="appid-barcode"
          value={appIdBarcodeValue}
          width={3}
          displayValue={false}
        />
        <Barcode
          id="pid-barcode"
          value={pidValue}
          width={7}
          displayValue={false}
        />
      </div>
      <SmoothScrollToTop />
      <div className="doctorconsult-main-container">
        <div className="doctorconsult-container">
          <div className="menu-side">
            <DoctorMenu />
          </div>
          <div className="content-side">
            <div className="title-div">
              <h2>PRESCRIPTION</h2>
            </div>
            {editBasicMeasurement && (
              <div className="basic-info-edit-div">
                <div className="basic-info-container">
                  <div className="cross-btn-container">
                    <div className="left"></div>
                    <div className="right">
                      <span
                        onClick={() => {
                          setEditBasicMeasurement(false);
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
                      <button disabled={bisubmitLoading}>
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
            <div className="buttons">
              <div className="back-button">
                <span
                  title="Back"
                  onClick={() =>
                    navigate(
                      `/doctor-dashboard/appointments/${auth?.user?._id}`
                    )
                  }
                >
                  <IoChevronBackCircle />
                </span>
              </div>
              <div className="right-buttons">
                <button
                  onClick={updateAppointmet}
                  className="save-button"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <LoadingSpin height={"10px"} width={"10px"} />
                  ) : (
                    <>
                      <FiSave />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
            {fetchLoading ? (
              <div className="shimmer-overlay">
                {/* Header Section */}
                <div className="shimmer-header">
                  <div className="shimmer-qr"></div>
                  <div className="shimmer-header-content">
                    <div className="shimmer-line wide"></div>
                    <div className="shimmer-line medium"></div>
                    <div className="shimmer-line medium"></div>
                    <div className="shimmer-line wide"></div>
                    <div className="shimmer-line wide"></div>
                  </div>
                  <div className="shimmer-patient-info">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="shimmer-info-row">
                        <div className="shimmer-label"></div>
                        <div className="shimmer-value"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Barcode Section */}
                <div className="shimmer-barcode-container">
                  <div className="shimmer-barcode-left">
                    <div className="shimmer-barcode"></div>
                  </div>
                  <div className="shimmer-barcode-right">
                    <div className="shimmer-barcode"></div>
                  </div>
                </div>

                {/* Measurements Table */}
                <div className="shimmer-table">
                  <div className="shimmer-table-header">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="shimmer-table-cell"></div>
                    ))}
                  </div>
                  <div className="shimmer-table-row">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="shimmer-table-cell"></div>
                    ))}
                  </div>
                </div>

                {/* Prescription Body */}
                <div className="shimmer-prescription-body">
                  <div className="shimmer-left-body">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="shimmer-section">
                        <div className="shimmer-section-title"></div>
                        <div className="shimmer-content">
                          {[...Array(3)].map((_, j) => (
                            <div key={j} className="shimmer-item">
                              <div className="shimmer-date"></div>
                              <div className="shimmer-list">
                                {[...Array(2)].map((_, k) => (
                                  <div
                                    key={k}
                                    className="shimmer-list-item"
                                  ></div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="shimmer-input-group">
                          <div className="shimmer-input"></div>
                          <div className="shimmer-button"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="shimmer-right-body">
                    <div className="shimmer-section-title"></div>
                    <div className="shimmer-medicine-list">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="shimmer-medicine-item">
                          <div className="shimmer-medicine-count"></div>
                          <div className="shimmer-medicine-details">
                            <div className="shimmer-medicine-name"></div>
                            <div className="shimmer-medicine-timing"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="shimmer-medicine-form">
                      <div className="shimmer-form-line">
                        <div className="shimmer-input wide"></div>
                        <div className="shimmer-input narrow"></div>
                      </div>
                      <div className="shimmer-form-line">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="shimmer-input narrow"></div>
                        ))}
                        <div className="shimmer-icon"></div>
                      </div>
                      <div className="shimmer-button"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="prescription-holder">
                <div className="prescription">
                  <div className="header">
                    <img src={qrCodeImage} alt="QR Code" className="qr-code" />
                    <div className="left-header">
                      <h3>{auth?.user?.name}</h3>
                      <h4>
                        <PiGraduationCapBold /> {auth?.user?.degree}
                      </h4>
                      <MdOutlineMedicalServices />{" "}
                      {auth?.user?.speciality?.map((s, i, arr) => {
                        const englishSpecialty = s?.split("-")[0];
                        return (
                          <span key={i} className="speacility">
                            {englishSpecialty}
                            {i < arr.length - 1 && ", "}
                          </span>
                        );
                      })}
                      <h4>
                        {" "}
                        <TfiLocationPin /> {auth?.user?.address}
                      </h4>
                      <h4>
                        <TfiWorld /> www.bdmedics.com/{auth?.user?.username}
                      </h4>
                    </div>
                    <div className="right-header">
                      <table>
                        <tr>
                          <td>Patient ID</td>
                          <td>: {appointment?.patientId}</td>
                        </tr>
                        <tr>
                          <td>Patient Name</td>
                          <td>: {appointment?.patientData?.name}</td>
                        </tr>
                        <tr>
                          <td>Age</td>
                          <td>
                            : {calculateAge(appointment?.patientData?.dob)}
                          </td>
                        </tr>
                        <tr>
                          <td>Mobile</td>
                          <td>: {appointment?.patientData?.phone}</td>
                        </tr>
                        <tr>
                          <td>Email</td>
                          <td>
                            :{" "}
                            {appointment?.patientEmail?.email
                              ? appointment?.patientEmail?.email
                              : "Unregistered Account"}
                          </td>
                        </tr>
                      </table>
                    </div>
                  </div>
                  <div className="barcode-container">
                    <div className="left-barcode">
                      <span>AID: </span>
                      <span className="appointment-no">
                        {appoitmentid.toUpperCase()}
                      </span>
                      <span>PID: </span>
                      <img src={pIdBarcodeImage} alt="pIdBarcodeImage" />
                    </div>
                    <div className="right-barcode">
                      <span>AID: </span>
                      <img src={barcodeImage} alt="barcode-img" />
                    </div>
                  </div>
                  <table className="basic-measurement">
                    <tr>
                      <th>BP</th>
                      <th>Ht(cm)</th>
                      <th>Wt(kg)</th>
                      <th>BMI</th>
                      <th>Temp</th>
                      <th>Pulse</th>
                      <th>SPO2(%)</th>
                    </tr>
                    <tr>
                      <td>
                        {appointment?.bp?.diastolicBp
                          ? appointment?.bp?.systolicBp +
                            "/" +
                            appointment?.bp?.diastolicBp
                          : "null"}
                      </td>
                      <td>{appointment?.height?.value || "null"}</td>
                      <td>{appointment?.weight?.value || "null"}</td>
                      <td>
                        {calculateBMI(
                          appointment?.height?.value,
                          appointment?.weight?.value
                        ) || "null"}
                      </td>
                      <td>{appointment?.temp?.value || "null"}</td>
                      <td>{appointment?.pulse?.value || "null"}</td>
                      <td>{appointment?.spo2?.value || "null"}</td>
                    </tr>
                    <tr>
                      <td className="last-table-td" colSpan={7}>
                        <button onClick={() => setEditBasicMeasurement(true)}>
                          Edit Basic Measurements
                        </button>
                      </td>
                    </tr>
                  </table>
                  <div className="prescription-body">
                    <div className="left-body">
                      <div className="history-findings">
                        <h5>History</h5>
                        <div className="show-history">
                          <span>25/5/2012</span>
                        </div>
                      </div>
                      <div className="clinical-findings">
                        <h5>Clinical Findings</h5>
                        <div className="show-findings">
                          <ul>
                            {appointment?.findings?.map((item, index) => (
                              <li key={index}>
                                {item}{" "}
                                <span
                                  onClick={() => removeFindings(index)}
                                  className="remove-findings"
                                >
                                  <IoTrashBinSharp />
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="add-clinical-f">
                          <form
                            onSubmit={(e) =>
                              updateField(e, "findings", newFinding)
                            }
                          >
                            <input
                              type="text"
                              value={newFinding}
                              onChange={(e) => setNewFinding(e.target.value)}
                            />
                            <button type="submit">Add</button>
                          </form>
                        </div>
                      </div>
                      <div className="investigation">
                        <h5>Investigations</h5>
                        <div className="show-investigations">
                          <ul>
                            {appointment?.investigations?.map((item, index) => (
                              <li key={index}>
                                {item}{" "}
                                <span
                                  onClick={() => removeInvestigations(index)}
                                >
                                  <IoTrashBinSharp />
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="add-investigation">
                          <form
                            onSubmit={(e) =>
                              updateField(
                                e,
                                "investigations",
                                newInvestigations
                              )
                            }
                          >
                            <input
                              type="text"
                              value={newInvestigations}
                              onChange={(e) =>
                                setNewInvestigations(e.target.value)
                              }
                            />
                            <button type="submit">Add</button>
                          </form>
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="right-body">
                      <h4>Medicines</h4>
                      <div className="show-medicines">
                        <table>
                          {appointment?.medicines?.map((m, i) => (
                            <tr>
                              <td className="count">{i + 1 + ")"}</td>
                              <td>
                                <p>
                                  {m?.name}
                                  <span> - ({m?.duration})</span>
                                </p>
                                <p>
                                  {m?.timing
                                    ? m?.timing
                                    : m?.morning +
                                      "+" +
                                      m?.midday +
                                      "+" +
                                      m?.night}
                                </p>
                              </td>
                              <td className="remove-btn">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeMedicine(i);
                                  }}
                                  className="remove-button"
                                >
                                  <IoTrashBinSharp />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </table>
                      </div>
                      <div className="add-medicine">
                        <form onSubmit={addMedicine}>
                          <div className="first-line">
                            <input
                              className="medicine-name"
                              placeholder="Tab. XXXX 50mg"
                              type="text"
                              value={medicinesInput.name}
                              onChange={(e) =>
                                setMedicinesInput({
                                  ...medicinesInput,
                                  name: e.target.value,
                                })
                              }
                            />
                            <input
                              className="duration"
                              type="text"
                              placeholder="__ days"
                              value={medicinesInput.duration}
                              onChange={(e) =>
                                setMedicinesInput({
                                  ...medicinesInput,
                                  duration: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="second-line">
                            {!timingInput ? (
                              <>
                                <input
                                  className="timing-different"
                                  type="text"
                                  placeholder="Morning"
                                  value={medicinesInput.morning}
                                  onChange={(e) =>
                                    setMedicinesInput({
                                      ...medicinesInput,
                                      morning: e.target.value,
                                    })
                                  }
                                />
                                <input
                                  className="timing-different"
                                  type="text"
                                  placeholder="Midday"
                                  value={medicinesInput.midday}
                                  onChange={(e) =>
                                    setMedicinesInput({
                                      ...medicinesInput,
                                      midday: e.target.value,
                                    })
                                  }
                                />
                                <input
                                  className="timing-different"
                                  type="text"
                                  placeholder="Night"
                                  value={medicinesInput.night}
                                  onChange={(e) =>
                                    setMedicinesInput({
                                      ...medicinesInput,
                                      night: e.target.value,
                                    })
                                  }
                                />
                              </>
                            ) : (
                              <input
                                className="timing-one"
                                type="text"
                                placeholder="Explain Timing"
                                value={medicinesInput.timing}
                                onChange={(e) =>
                                  setMedicinesInput({
                                    ...medicinesInput,
                                    timing: e.target.value,
                                  })
                                }
                              />
                            )}

                            <span onClick={() => setTimingInput(!timingInput)}>
                              <LuFlipVertical />
                            </span>
                          </div>
                          <button type="submit">Add</button>
                        </form>
                      </div>
                      <div className="signature">
                        <div className="left-blank"></div>
                        <div className="right-sig">
                          {auth?.user?.signature && (
                            <img
                              src={`${import.meta.env.VITE_API}${
                                auth?.user?.signature
                              }`}
                            />
                          )}
                          <hr />
                          <p>Signature</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="end-button">
              <button
                onClick={updateAppointmet}
                className="save-button"
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <LoadingSpin height={"10px"} width={"10px"} />
                ) : (
                  <>
                    <FiSave />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorAppointmentConsult;
