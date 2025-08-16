import React from "react";
import Layout from "../../components/layout/Layout";
import AdminMenu from "../../components/menu/AdminMenu";
import "../../styles/Specialities.scss";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingSpin from "../../components/spinner/LoadingSpin";
import { useEffect } from "react";
import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import { ImCancelCircle } from "react-icons/im";

const Specialities = () => {
  //getting all speciality
  const [specialities, setSpecialities] = useState([]);
  const [getLoading, setGetLoading] = useState(false);

  const getSpecialities = async () => {
    try {
      setGetLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/speciality/get-speciality`
      );
      if (res.data.success) {
        setSpecialities(res?.data?.speacilities);
        setGetLoading(false);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      setGetLoading(false);
    }
  };

  useEffect(() => {
    getSpecialities();
  }, []);

  //add speciality
  const [name, setName] = useState("");
  const [localName, setLocalName] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/speciality/add-speciality`,
        {
          name,
          localName,
        }
      );
      console.log("res" + res);
      if (res.data.success) {
        toast.success(res.data.message);
        setName("");
        setLocalName("");
        setSubmitLoading(false);
        setSpecialities([...specialities, res?.data?.newSpeciality]);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      setSubmitLoading(false);
    }
  };

  //delete speciality
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteSpeciality = async (id) => {
    setDeletingId(id);
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API}/api/v1/speciality/delete-speciality`,
        {
          data: { id },
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setSpecialities((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setDeletingId(null); // reset loading
    }
  };

  //   editing specialities
  const [editActiveId, setEditActiveId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLocalName, setEditLocalName] = useState("");
  const [editLoadingId, setLoadingEditId] = useState(null);

  const handleEditUpload = async (id) => {
    setLoadingEditId(id);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API}/api/v1/speciality/edit-speciality`,
        {
          id,
          editName,
          editLocalName,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setSpecialities((prev) =>
          prev.map((s) =>
            s._id === res.data.updatedSpeciality._id
              ? res.data.updatedSpeciality
              : s
          )
        );
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setEditActiveId(null);
      setLoadingEditId(null);
    }
  };

  return (
    <Layout>
      <div className="specialities-main-container">
        <div className="specialities-container">
          <div className="menu-side">
            <AdminMenu />
          </div>
          <div className="content-side">
            <h2>Specialities</h2>
            <div className="add-new-speciality">
              <form action="speciality-add" onSubmit={handleSubmit}>
                <h4>Add a new speciality</h4>
                <div>
                  <label htmlFor="name">Title:</label>
                  <input
                    required
                    type="text"
                    placeholder="for e.g. Medicine"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="local-name">Local Name:</label>
                  <input
                    required
                    type="text"
                    placeholder="for e.g. মেডিসিন"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                  />
                </div>
                {submitLoading ? (
                  <LoadingSpin height={"20px"} width={"20px"} />
                ) : (
                  <button disabled={name.length < 1 || localName.length < 1}>
                    Add +
                  </button>
                )}
              </form>
            </div>
            <h3>List of Specialities</h3>
            <div className="speciality-lists">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Local Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getLoading && (
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
                  {specialities?.map((s, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>
                        {editActiveId === s?._id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        ) : (
                          s?.name
                        )}
                      </td>
                      <td>
                        {editActiveId === s?._id ? (
                          <input
                            type="text"
                            value={editLocalName}
                            onChange={(e) => setEditLocalName(e.target.value)}
                          />
                        ) : (
                          s?.localName
                        )}
                      </td>
                      <td>
                        {editActiveId === s?._id ? (
                          <span
                            className="action tick"
                            title="Do it"
                            onClick={() => handleEditUpload(s?._id)}
                          >
                            {editLoadingId === s?._id ? (
                              <LoadingSpin height={"15px"} width={"15px"} />
                            ) : (
                              <TiTick />
                            )}
                          </span>
                        ) : (
                          <span
                            title="Edit"
                            className="action edit"
                            onClick={() => {
                              setEditActiveId(s?._id);
                              setEditName(s?.name);
                              setEditLocalName(s?.localName);
                            }}
                          >
                            <CiEdit />
                          </span>
                        )}
                        {editActiveId === s._id ? (
                          <span
                            title="cancel"
                            className="action delete"
                            onClick={() => setEditActiveId(null)}
                          >
                            <ImCancelCircle />
                          </span>
                        ) : (
                          <span
                            title="Delete"
                            className="action delete"
                            onClick={() => handleDeleteSpeciality(s?._id)}
                          >
                            {deletingId === s._id ? (
                              <LoadingSpin height={"15px"} width={"15px"} />
                            ) : (
                              <MdDeleteOutline />
                            )}
                          </span>
                        )}
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

export default Specialities;
