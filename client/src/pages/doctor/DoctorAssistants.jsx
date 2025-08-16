import React, { useEffect, useState } from "react";
import { SmoothScrollToTop } from "../../components/SmoothScrollToTop";
import DoctorMenu from "../../components/menu/DoctorMenu";
import "../../styles/DoctorAssistants.scss";
import Layout from "../../components/layout/Layout";
import { ImCross } from "react-icons/im";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import LoadingSpin from "../../components/spinner/LoadingSpin";
import { MdDeleteOutline } from "react-icons/md";

const DoctorAssistants = () => {
  const [assistants, setAssistants] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [typingEmailTimeout, setEmailTypingTimeout] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { id } = useParams();
  const [fetchLoading, setFetchLoading] = useState(false);

  //fetch assistants
  const fetchAssistants = async () => {
    try {
      setFetchLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/doctor/get-assistants/${id}`
      );
      if (data?.success) {
        setAssistants(data?.assistants);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setFetchLoading(false);
    }
  };
  useEffect(() => {
    fetchAssistants();
    //eslint-disable-next-line
  }, [id]);

  //email change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailAvailable(null); // Reset availability

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setEmailAvailable({
        valid: false,
        message: "Invalid email format",
      });
      return;
    }

    if (typingEmailTimeout) {
      clearTimeout(typingEmailTimeout);
    }

    setEmailTypingTimeout(
      setTimeout(() => {
        checkEmail(value);
      }, 500)
    );
  };
  //check email
  const checkEmail = async (value) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/auth/check-email?email=${value}`
      );

      if (res.data.success) {
        setEmailAvailable({ valid: true, message: "" });
      } else {
        setEmailAvailable({
          valid: false,
          message: "This email already exists in database",
        });
      }
    } catch (err) {
      console.error("Error checking email", err);
      setEmailAvailable(null);
    }
  };

  //handle registration submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/assistant-register`,
        { name, phone, email, password, id }
      );
      if (data.success) {
        toast.success(data.message);
        setIsAddOpen(false);
        fetchAssistants();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  //assistant deleting fuctionality
  const [deletePopUp, setDeletePopUp] = useState(false);
  const [deletingName, setDeletingName] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAssistantDelete = async () => {
    try {
      setDeleteLoading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/doctor/delete-assistant/${deleteId}`
      );
      if (data?.success) {
        toast.success(data?.message);
        setDeletePopUp(false);
        fetchAssistants();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Layout>
      <SmoothScrollToTop />
      <div className="doctorassistants-main-container">
        <div className="doctorassistants-container">
          <div className="menu-side">
            <DoctorMenu />
          </div>
          <div className="content-side">
            <h2>Assistants</h2>
            <hr />
            <div className="add-assistants-btn">
              <button onClick={() => setIsAddOpen(true)}>Add Assistant</button>
            </div>
            {isAddOpen && (
              <div className="add-assistant-modal">
                <div className="cross-container">
                  <div className="left"></div>
                  <div className="right" onClick={() => setIsAddOpen(false)}>
                    <ImCross />
                  </div>
                </div>
                <form
                  action=""
                  className="add-assistant-form"
                  onSubmit={handleSubmit}
                >
                  <h2>Assistant Registration</h2>
                  <div className="name">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="phone">
                    <label htmlFor="name">Phone</label>
                    <input
                      type="number"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="email">
                    <label htmlFor="name">Email</label>
                    <input
                      className={
                        emailAvailable?.valid === false ? "danger" : ""
                      }
                      type="email"
                      value={email}
                      required
                      onChange={handleEmailChange}
                    />
                    {emailAvailable && (
                      <p
                        className="availability"
                        style={{
                          color: emailAvailable.valid ? "green" : "red",
                        }}
                      >
                        {emailAvailable.message}
                      </p>
                    )}
                  </div>
                  <div className="password">
                    <label htmlFor="name">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button
                    disabled={
                      name?.length < 1 ||
                      email?.length < 1 ||
                      phone?.length < 1 ||
                      password?.length < 1 ||
                      !emailAvailable?.valid ||
                      submitLoading
                    }
                  >
                    {submitLoading ? (
                      <LoadingSpin height={"15px"} width={"15px"} />
                    ) : (
                      "Add Now"
                    )}
                  </button>
                </form>
              </div>
            )}
            {/* popup delete div */}
            {deletePopUp && (
              <div className="delete-popup-div">
                <div className="text">
                  <p>
                    Are you sure? You want to delete <span>{deletingName}</span>
                    !
                  </p>
                </div>
                <div className="button-div">
                  <button
                    className="no"
                    onClick={() => {
                      setDeletePopUp(false);
                      setDeleteId("");
                    }}
                  >
                    No
                  </button>
                  <button className="yes" onClick={handleAssistantDelete}>
                    {deleteLoading ? (
                      <LoadingSpin height={"12px"} width={"12px"} />
                    ) : (
                      "Yes"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* fetching Assistants */}
            <div className="existing-assistants">
              <table>
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchLoading
                    ? // Show shimmer effect while loading
                      Array(5)
                        .fill()
                        .map((_, i) => (
                          <>
                            <tr key={`shimmer-${i}`} className="shimmer-effect">
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>
                            <tr key={`shimmer-${i}`} className="shimmer-effect">
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>
                          </>
                        ))
                    : // Show actual data when loaded
                      assistants?.map((a, i) => (
                        <tr key={i}>
                          <td>
                            <img
                              src={
                                a?.image?.length > 0
                                  ? `${import.meta.env.VITE_API}${a?.image}`
                                  : "/designpics/profile.png"
                              }
                              alt={i}
                            />
                          </td>
                          <td>{a?.name}</td>
                          <td>{a?.email}</td>
                          <td>{a?.phone}</td>
                          <td>{a?.address}</td>
                          <td>
                            <span
                              onClick={() => {
                                setDeletePopUp(true);
                                setDeletingName(a?.name);
                                setDeleteId(a?._id);
                              }}
                            >
                              <MdDeleteOutline />
                            </span>
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

export default DoctorAssistants;
