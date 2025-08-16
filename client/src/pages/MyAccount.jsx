import React, { useEffect, useState } from "react";
import "../styles/myaccount.scss";
import Layout from "../components/layout/Layout";
import useAuth from "../context/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { FaPencil } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { TiTickOutline } from "react-icons/ti";
import LoadingSpin from "../components/spinner/LoadingSpin";
import { MdDelete } from "react-icons/md";
import Select from "react-select";
import { IoCheckmarkDoneCircle } from "react-icons/io5";

const MyAccount = () => {
  const [auth, setAuth] = useAuth();
  const [name, setName] = useState(auth?.user?.name);
  const [phone, setPhone] = useState(auth?.user?.phone);
  const [email, setEmail] = useState(auth?.user?.email);
  const [address, setAddress] = useState(auth?.user?.address);
  const [username, setUsername] = useState(auth?.user?.username);
  const [degree, setDegree] = useState(auth?.user?.degree);
  const [title, setTitle] = useState(auth?.user?.title);
  const [description, setDescription] = useState(auth?.user?.description);
  const navigate = useNavigate();

  // get Specialities
  const [specialities, setSpecialities] = useState([]);

  const getSpecialities = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/speciality/get-speciality`
      );
      if (res.data.success) {
        setSpecialities(res?.data?.speacilities);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSpecialities();
  }, []);

  //image upload and it's functions
  const [isImgUploadOpen, setIsImgUploadOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imgUpLoading, setImgUpLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateImg = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("profileImage", image);

    try {
      setImgUpLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/upload-profile-pic`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status) {
        toast.success("Image Uploaded Successfully!");
        // 🔄 Update the auth context user
        const updatedUser = response.data.user;

        setAuth({
          ...auth,
          user: updatedUser,
        });

        Cookies.set("user", JSON.stringify(updatedUser));

        setIsImgUploadOpen(false); // optional: close modal
        setImgUpLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message);
      setImgUpLoading(false);
    }
  };

  //name update
  const [isNameEditOpen, setIsNameEditOpen] = useState(false);

  const handleNameUpdate = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API}/api/v1/auth/name-update`,
        { name }
      );
      if (res.data?.success) {
        toast.success("Name updated successfully!");

        const updatedUser = res.data.user;
        setAuth({
          ...auth,
          user: updatedUser,
        });

        Cookies.set("user", JSON.stringify(updatedUser));
        setIsNameEditOpen(false);
      } else {
        toast.error(res.data?.message || "Failed to update name");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  //phone update
  const [isPhoneEditOpen, setIsPhoneEditOpen] = useState(false);

  const handlePhoneUpdate = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API}/api/v1/auth/phone-update`,
        { phone }
      );
      if (res.data?.success) {
        toast.success("Phone updated successfully!");

        const updatedUser = res.data.user;
        setAuth({
          ...auth,
          user: updatedUser,
        });

        Cookies.set("user", JSON.stringify(updatedUser));
        setIsPhoneEditOpen(false);
      } else {
        toast.error(res.data?.message || "Failed to update phone");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  //Email update
  const [isEmailEditOpen, setIsEmailEditOpen] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleEmailUpdate = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API}/api/v1/auth/email-update`,
        { email, otp }
      );
      if (res.data?.success) {
        toast.success("Email updated successfully!");

        const updatedUser = res.data.user;
        setAuth({
          ...auth,
          user: updatedUser,
        });

        Cookies.set("user", JSON.stringify(updatedUser));
        setIsEmailEditOpen(false);
        setOtpSent(false);
        setOtp("");
      } else {
        toast.error(res.data?.message || "Failed to update Email");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // Send OTP to email
  const handleSendOtp = async () => {
    setBtnLoad(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/send-otp-for-email-change`,
        { email }
      );
      if (res.data.success) {
        setOtpSent(true);
        setTimer(30); // Start a 60-second countdown
        toast.success("An OTP is sent to your new email.");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message);
    }
    setBtnLoad(false);
  };

  // Countdown timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleCancelEmailUpdate = () => {
    setIsEmailEditOpen(false);
    setOtp("");
    setOtpSent(false);
  };

  //Address update
  const [isAddressEditOpen, setIsAddressEditOpen] = useState(false);

  const handleAddressUpdate = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API}/api/v1/auth/address-update`,
        { address }
      );
      if (res.data?.success) {
        toast.success("Address updated successfully!");

        const updatedUser = res.data.user;
        setAuth({
          ...auth,
          user: updatedUser,
        });

        Cookies.set("user", JSON.stringify(updatedUser));
        setIsAddressEditOpen(false);
      } else {
        toast.error(res.data?.message || "Failed to update Address");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //username update
  const [isUsernameEditOpen, setIsUsernameEditOpen] = useState(false);
  const [available, setAvailable] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const forbiddenChars = /[A-Z\s"#%<>?@[\]^`{|}\\]/;

  //username change
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setAvailable(null); // Reset availability

    // If empty, skip everything
    if (!value) {
      return;
    }

    // Validate first before availability check
    if (forbiddenChars.test(value)) {
      setAvailable({
        valid: false,
        message:
          "Username cannot contain uppercase letters, spaces, or URL-unsafe characters.",
      });
      return;
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    setTypingTimeout(
      setTimeout(() => {
        checkUsername(value);
      }, 500)
    );
  };

  //username check
  const checkUsername = async (value) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API
        }/api/v1/auth/check-username?username=${value}`
      );

      if (res.data.success) {
        setAvailable({ valid: true, message: "Username is available" });
      } else {
        setAvailable({ valid: false, message: "Username is already taken" });
      }
    } catch (err) {
      console.error("Error checking username", err);
      setAvailable(null);
    }
  };
  //username update submit
  const handleUsernameUpdate = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API}/api/v1/auth/username-update`,
        { username }
      );
      if (res.data?.success) {
        toast.success("Username updated successfully!");
        setAvailable(null);

        const updatedUser = res.data.user;
        setAuth({
          ...auth,
          user: updatedUser,
        });

        Cookies.set("user", JSON.stringify(updatedUser));
        setIsUsernameEditOpen(false);
      } else {
        toast.error(res.data?.message || "Failed to update Degree");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //degree update
  const [isDegreeEditOpen, setIsDegreeEditOpen] = useState(false);

  const handleDegreeUpdate = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API}/api/v1/auth/degree-update`,
        { degree }
      );
      if (res.data?.success) {
        toast.success("Degree updated successfully!");

        const updatedUser = res.data.user;
        setAuth({
          ...auth,
          user: updatedUser,
        });

        Cookies.set("user", JSON.stringify(updatedUser));
        setIsDegreeEditOpen(false);
      } else {
        toast.error(res.data?.message || "Failed to update Degree");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //Title update
  const [isTitleEditOpen, setIsTitleEditOpen] = useState(false);

  const handleTitleUpdate = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API}/api/v1/auth/title-update`,
        { title }
      );
      if (res.data?.success) {
        toast.success("Title updated successfully!");

        const updatedUser = res.data.user;
        setAuth({
          ...auth,
          user: updatedUser,
        });

        Cookies.set("user", JSON.stringify(updatedUser));
        setIsTitleEditOpen(false);
      } else {
        toast.error(res.data?.message || "Failed to update Title");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  //Description update
  const [isDescriptionEditOpen, setIsDescriptionEditOpen] = useState(false);

  const handleDescriptionUpdate = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API}/api/v1/auth/description-update`,
        { description }
      );
      if (res.data?.success) {
        toast.success("Description updated successfully!");

        const updatedUser = res.data.user;
        setAuth({
          ...auth,
          user: updatedUser,
        });

        Cookies.set("user", JSON.stringify(updatedUser));
        setIsDescriptionEditOpen(false);
      } else {
        toast.error(res.data?.message || "Failed to update Description");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //signature upload
  const [isSignUploadOpen, setIsSignUploadOpen] = useState(false);
  const [signature, setSignature] = useState(null);
  const [signPreview, setSignPreview] = useState(null);
  const [signUpLoading, setSignUpLoading] = useState(false);

  const handleSignFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignature(file);
      setSignPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateSign = async () => {
    if (!signature) return;

    const formData = new FormData();
    formData.append("signatureImage", signature);

    try {
      setSignUpLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/upload-signature-pic`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status) {
        toast.success("Signature Uploaded Successfully!");
        // 🔄 Update the auth context user
        const updatedUser = response.data.user;

        setAuth({
          ...auth,
          user: updatedUser,
        });

        Cookies.set("user", JSON.stringify(updatedUser));

        setIsSignUploadOpen(false); // optional: close modal
        setSignUpLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message);
      setSignUpLoading(false);
    }
  };

  //slides image upload
  const [slideImages, setSlideImages] = useState([]);
  const [slidePreviews, setSlidePreviews] = useState([]);
  const maxSlides = 5;
  const [uploading, setUploading] = useState(false);
  const [isSlideUploadOpen, setIsSlideUploadOpen] = useState(false);

  const handleSlideFilesChange = (files) => {
    const newFiles = Array.from(files);
    const totalFiles = slideImages.length + newFiles.length;

    if (totalFiles > maxSlides) {
      toast.error("You can only upload up to 5 images.");
      return;
    }

    const previews = newFiles?.map((file) => URL.createObjectURL(file));
    setSlideImages((prev) => [...prev, ...newFiles]);
    setSlidePreviews((prev) => [...prev, ...previews]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleSlideFilesChange(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeSlide = (index) => {
    setSlideImages((prev) => prev.filter((_, i) => i !== index));
    setSlidePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSlides = async () => {
    if (slideImages.length === 0) return;

    const formData = new FormData();
    slideImages.forEach((file) => {
      formData.append("slideImages", file);
    });

    try {
      setUploading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/upload-slide-pics`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Slides Uploaded Successfully!");
        // Optionally update UI or context
        setSlideImages([]);
        setSlidePreviews([]);
        setIsSlideUploadOpen(false);
        // 🔄 Update the auth context user
        const updatedUser = response.data.user;

        setAuth({
          ...auth,
          user: updatedUser,
        });

        Cookies.set("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  //deleting single image
  const [imageDeletePopupOpen, setImageDeletePopupOpen] = useState(false);
  const [selectedImageToDelete, setSelectedImageToDelete] = useState(null);
  const [imgDelLoading, setImgDelLoading] = useState(false);
  const [isSpecialityEditOpen, setIsSpecialityEditOpen] = useState(false);

  const handleImageDelete = async (imagePath) => {
    try {
      setImgDelLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/delete-slide-pic`,
        { imagePath }
      );

      if (response.data.success) {
        toast.success("Slide image deleted!");

        // update auth context or refresh
        const updatedUser = response.data.user;
        setAuth({ ...auth, user: updatedUser });
        Cookies.set("user", JSON.stringify(updatedUser));
        setImageDeletePopupOpen(false);
        setSelectedImageToDelete(null);
        setImgDelLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete image.");
      setImageDeletePopupOpen(false);
      setSelectedImageToDelete(null);
      setImgDelLoading(false);
    }
  };

  // update speciality
  const [selectedSpecialities, setSelectedSpecialities] = useState(() => {
    // Handle case where speciality might be string or array
    const userSpecialities = auth?.user?.speciality;
    if (!userSpecialities) return [];

    if (Array.isArray(userSpecialities)) {
      return userSpecialities?.map((sp) => ({
        value: sp,
        label: sp,
      }));
    }

    // If it's a string, convert to array with one item
    return [
      {
        value: userSpecialities,
        label: userSpecialities,
      },
    ];
  });

  const handleSpecialityUpdate = async () => {
    try {
      // Extract just the values from selectedSpecialities
      const specialitiesArray = selectedSpecialities.map((sp) => sp.label);
      const res = await axios.put(
        `${import.meta.env.VITE_API}/api/v1/auth/speciality-update`,
        { speciality: specialitiesArray }
      );

      if (res.data?.success) {
        toast.success("Specialities updated successfully!");
        const updatedUser = res.data.user;
        setAuth({
          ...auth,
          user: updatedUser,
        });
        Cookies.set("user", JSON.stringify(updatedUser));
        setIsSpecialityEditOpen(false);
      } else {
        toast.error(res.data?.message || "Failed to update Specialities");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //subscription activation
  const [isPaymentOn, setIsPaymentOn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Bkash");
  const [lastNumbers, setLastNumbers] = useState("");
  const [amount, setAmount] = useState("");
  const [orderSubmitLoading, setOrderSubmitLoading] = useState(false);
  const [submitComplete, setSubmitComplete] = useState(false);

  const submitOrder = async () => {
    try {
      setOrderSubmitLoading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/transaction/subscription-order`,
        { paymentMethod, lastNumbers, amount }
      );
      if (data?.success) {
        toast?.success(data?.message);
        setOrderSubmitLoading(false);
        setSubmitComplete(true);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      setOrderSubmitLoading(false);
    }
  };

  // Fetch subscription status
  const [fetchLoading, setFetchLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const id = auth?.user?._id;

  const fetchSubscription = async () => {
    try {
      setFetchLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/auth/subscription-status/${id}`
      );
      setSubscription(res.data.subscription);
      setFetchLoading((prev) => ({
        ...prev,
        subscription: res.data.subscription,
      }));
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription status");
    } finally {
      setFetchLoading(false);
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
        fetchSubscription(); // Refresh status if expired
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

  //fetch and get doctor availability
  // Add these state variables at the top of your component
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [availability, setAvailability] = useState({
    weeklySchedule: [
      { day: 0, name: "Sunday", enabled: false, slots: [] },
      {
        day: 1,
        name: "Monday",
        enabled: true,
        slots: [{ start: "09:00", end: "17:00" }],
      },
      {
        day: 2,
        name: "Tuesday",
        enabled: true,
        slots: [{ start: "09:00", end: "17:00" }],
      },
      {
        day: 3,
        name: "Wednesday",
        enabled: true,
        slots: [{ start: "09:00", end: "17:00" }],
      },
      {
        day: 4,
        name: "Thursday",
        enabled: true,
        slots: [{ start: "09:00", end: "17:00" }],
      },
      {
        day: 5,
        name: "Friday",
        enabled: true,
        slots: [{ start: "09:00", end: "17:00" }],
      },
      { day: 6, name: "Saturday", enabled: false, slots: [] },
    ],
    holidays: [],
    dailyLimit: 10,
  });

  // Fetch doctor availability
  const fetchAvailability = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/auth/get-availability/${
          auth.user._id
        }`
      );
      if (data?.success) {
        setAvailability(data.availability);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load availability settings");
    }
  };

  // Save availability to backend
  const saveAvailability = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/set-availability`,
        {
          doctorId: auth.user._id,
          availability,
        }
      );

      if (data?.success) {
        toast.success("Availability saved successfully");
        setIsAvailabilityOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save availability");
    }
  };

  // Toggle day availability - fixed version
  const toggleDay = (dayIndex) => {
    setAvailability((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)); // Deep clone
      const day = updated.weeklySchedule[dayIndex];

      // Toggle enabled status
      day.enabled = !day.enabled;

      // If enabling, ensure at least one default slot if empty
      if (day.enabled && day.slots.length === 0) {
        day.slots = [{ start: "09:00", end: "17:00" }];
      }
      // If disabling, clear all slots
      else if (!day.enabled) {
        day.slots = [];
      }

      return updated;
    });
  };

  // Add time slot - fixed version
  const addTimeSlot = (dayIndex) => {
    setAvailability((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.weeklySchedule[dayIndex].slots.push({
        start: "09:00",
        end: "17:00",
      });
      return updated;
    });
  };

  // Update time slot - fixed version
  const updateTimeSlot = (dayIndex, slotIndex, field, value) => {
    setAvailability((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.weeklySchedule[dayIndex].slots[slotIndex][field] = value;
      return updated;
    });
  };

  // Remove time slot - fixed version
  const removeTimeSlot = (dayIndex, slotIndex) => {
    setAvailability((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.weeklySchedule[dayIndex].slots.splice(slotIndex, 1);

      // If last slot was removed and day is enabled, add a default slot
      const day = updated.weeklySchedule[dayIndex];
      if (day.enabled && day.slots.length === 0) {
        day.slots = [{ start: "09:00", end: "17:00" }];
      }

      return updated;
    });
  };

  // Add holiday
  const addHoliday = (date) => {
    if (!date) return;
    setAvailability((prev) => ({
      ...prev,
      holidays: [...prev.holidays, date],
    }));
  };

  // Remove holiday
  const removeHoliday = (index) => {
    setAvailability((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((_, i) => i !== index),
    }));
  };

  // Fetch availability on component mount
  useEffect(() => {
    if (auth?.user?.role === 2) {
      // Only for doctors
      fetchAvailability();
    }
    //eslint-disable-next-line
  }, [auth?.user?._id]);

  return (
    <Layout
      title={"My Account - BDMedics"}
      description={
        "Securely log in to your BDMedics account. Access doctor appointments, e-prescriptions, and health records. বাংলাদেশের শীর্ষ ডিজিটাল হেলথকেয়ার প্ল্যাটফর্মে সাইন ইন করুন।"
      }
      keywords={
        "BDMedics login, doctor portal login, patient health records, e-prescription access, medical dashboard, ডাক্তার লগইন, রোগী প্রোফাইল, স্বাস্থ্য রেকর্ড, বিডমেডিক্স সাইন ইন, বিডমেডিক্স লগইন, ডাক্তার পোর্টাল, রোগীর তথ্য, প্রেসক্রিপশন ম্যানেজমেন্ট, অনলাইন স্বাস্থ্য সেবা, BDMedics সাইন ইন"
      }
      author={"BDMedics"}
    >
      {/* img upload div */}
      {isImgUploadOpen && (
        <div className="img-up-open">
          <div className="cross-container">
            <div className="left"></div>
            <div className="right">
              <p onClick={() => setIsImgUploadOpen(false)}>
                <ImCross />
              </p>
            </div>
          </div>
          <div className="img-up">
            <input type="file" id="fileUpload" onChange={handleFileChange} />
            <label htmlFor="fileUpload">📁 Upload Image</label>
          </div>
          {preview && (
            <div className="img-show">
              <img src={preview} alt="Preview" />
            </div>
          )}
          <div className="btn-contnr">
            <button
              disabled={!preview || imgUpLoading}
              onClick={handleUpdateImg}
            >
              Upload
            </button>
          </div>
        </div>
      )}
      {/* Signature upload div */}
      {isSignUploadOpen && (
        <div className="img-up-open signature">
          <div className="cross-container">
            <div className="left"></div>
            <div className="right">
              <p onClick={() => setIsSignUploadOpen(false)}>
                <ImCross />
              </p>
            </div>
          </div>
          <div className="img-up">
            <input
              type="file"
              id="fileUpload"
              onChange={handleSignFileChange}
            />
            <label htmlFor="fileUpload">📁 Upload Signature</label>
          </div>
          {signPreview && (
            <div className="img-show">
              <img src={signPreview} alt="Preview" />
            </div>
          )}
          <div className="btn-contnr">
            <button
              disabled={!signPreview || signUpLoading}
              onClick={handleUpdateSign}
            >
              Upload
            </button>
          </div>
        </div>
      )}
      {/* slide image upload */}
      {isSlideUploadOpen && (
        <div className="img-up-open">
          <div className="cross-container">
            <div className="left"></div>
            <div className="right">
              <p onClick={() => setIsSlideUploadOpen(false)}>
                <ImCross />
              </p>
            </div>
          </div>
          <div
            className="img-up drag-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              id="slideUpload"
              accept="image/*"
              multiple
              onChange={(e) => handleSlideFilesChange(e.target.files)}
              hidden
            />
            <label htmlFor="slideUpload" className="drop-zone">
              📁 Drag & Drop or Click to Upload (Max {maxSlides})
            </label>
          </div>
          <div className="img-show-multiple">
            {slidePreviews.map((src, index) => (
              <div key={index} className="img-wrapper">
                <img src={src} alt={`Slide ${index}`} />
                <button onClick={() => removeSlide(index)}>
                  <ImCross />
                </button>
              </div>
            ))}
          </div>

          <div className="btn-contnr">
            <button
              disabled={uploading || slideImages.length === 0}
              onClick={handleUploadSlides}
            >
              Upload
            </button>
          </div>
        </div>
      )}

      {/* image delete popup */}
      {imageDeletePopupOpen && (
        <div className="image-delete-popup">
          <h3>Are you sure? Do you want to delete this image?</h3>
          <div className="make-sure-button">
            <button
              className="no-btn"
              onClick={() => setImageDeletePopupOpen(false)}
            >
              No
            </button>
            <button
              className="yes-btn"
              onClick={() => {
                handleImageDelete(selectedImageToDelete);
              }}
            >
              {imgDelLoading ? (
                <LoadingSpin height={"15px"} width={"15px"} />
              ) : (
                "Yes"
              )}
            </button>
          </div>
        </div>
      )}
      <div className="my-account-container">
        <div className="my-account-title-part">
          <div className="title-container">
            <h1>My Account</h1>
            <p>
              <Link to={"/"}>Home</Link> /{" "}
              <Link to={"/my-account"}>My Account</Link>
            </p>
          </div>
        </div>
        <div className="my-account-element-container-wrapper">
          <div className="my-account-element-container">
            <div className="photo-container">
              <div className="photo-holder">
                <div className="action-icons">
                  <p onClick={() => setIsImgUploadOpen(true)}>
                    <FaPencil />
                  </p>
                </div>
                <img
                  src={
                    auth?.user?.image
                      ? `${import.meta.env.VITE_API}${auth?.user?.image}`
                      : "./designpics/profile.png"
                  }
                  alt="Profile Avatar"
                  className="profile-pic"
                />
              </div>
            </div>
            <h3>Basic Info</h3>
            <div className="basic-info">
              <div>
                <label htmlFor="name">Name: </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isNameEditOpen}
                />
                {isNameEditOpen ? (
                  <span className="tick-mark" onClick={handleNameUpdate}>
                    <TiTickOutline />
                  </span>
                ) : (
                  <span onClick={() => setIsNameEditOpen(true)}>
                    <FaPencil />
                  </span>
                )}
              </div>
              <div>
                <label htmlFor="name">Phone: </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isPhoneEditOpen}
                />
                {isPhoneEditOpen ? (
                  <span className="tick-mark" onClick={handlePhoneUpdate}>
                    <TiTickOutline />
                  </span>
                ) : (
                  <span onClick={() => setIsPhoneEditOpen(true)}>
                    <FaPencil />
                  </span>
                )}
              </div>
              <div>
                <label htmlFor="email">Email: </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEmailEditOpen || otpSent}
                />
                {otpSent && (
                  <div style={{ marginTop: "5px" }}>
                    <label htmlFor="otp">OTP: </label>
                    <input
                      type="number"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                )}
                {isEmailEditOpen ? (
                  otpSent ? (
                    <div className="button-wrapper">
                      <div>
                        <button onClick={handleEmailUpdate}>
                          {btnLoad ? (
                            <LoadingSpin height={"20px"} width={"20px"} />
                          ) : (
                            "Update Email"
                          )}
                        </button>
                        <span
                          onClick={handleCancelEmailUpdate}
                          className="cancel-btn"
                        >
                          <ImCross />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="button-wrapper">
                      {btnLoad ? (
                        <LoadingSpin height={"20px"} width={"20px"} />
                      ) : (
                        <div>
                          <button
                            onClick={handleSendOtp}
                            className="send-otp-b"
                          >
                            Send OTP
                          </button>
                          <span
                            onClick={handleCancelEmailUpdate}
                            className="cancel-btn"
                          >
                            <ImCross />
                          </span>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <span onClick={() => setIsEmailEditOpen(true)}>
                    <FaPencil />
                  </span>
                )}
              </div>
              <div>
                <label htmlFor="address">Address: </label>
                <textarea
                  className="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!isAddressEditOpen}
                />
                {isAddressEditOpen ? (
                  <span className="tick-mark" onClick={handleAddressUpdate}>
                    <TiTickOutline />
                  </span>
                ) : (
                  <span onClick={() => setIsAddressEditOpen(true)}>
                    <FaPencil />
                  </span>
                )}
              </div>
            </div>
            {auth?.user?.role === 2 && (
              <>
                <h3>Doctor's Info</h3>
                <div className="doctors-info">
                  <div className="username-div">
                    <div className="one-line-elements">
                      <label htmlFor="username">Username: </label>
                      <input
                        type="text"
                        value={username}
                        onChange={handleUsernameChange}
                        disabled={!isUsernameEditOpen}
                        className={available?.valid === false ? "danger" : ""}
                      />
                      {isUsernameEditOpen ? (
                        <button
                          className="tick-mark"
                          onClick={handleUsernameUpdate}
                          disabled={available?.valid === false}
                        >
                          <TiTickOutline />
                        </button>
                      ) : (
                        <span onClick={() => setIsUsernameEditOpen(true)}>
                          <FaPencil />
                        </span>
                      )}
                    </div>
                    {available && (
                      <p
                        className="availability"
                        style={{ color: available.valid ? "green" : "red" }}
                      >
                        {available.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="degree">Degree: </label>
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      disabled={!isDegreeEditOpen}
                    />
                    {isDegreeEditOpen ? (
                      <span className="tick-mark" onClick={handleDegreeUpdate}>
                        <TiTickOutline />
                      </span>
                    ) : (
                      <span onClick={() => setIsDegreeEditOpen(true)}>
                        <FaPencil />
                      </span>
                    )}
                  </div>
                  <div className="speciality">
                    <label htmlFor="speciality">Speciality: </label>
                    {isSpecialityEditOpen ? (
                      <div className="speciality-update">
                        <Select
                          className="select-speciality"
                          options={specialities?.map((sp) => ({
                            value: sp?._id,
                            label: `${sp?.name + "-" + sp?.localName}`,
                          }))}
                          isMulti
                          isSearchable
                          value={selectedSpecialities}
                          onChange={(selectedOptions) =>
                            setSelectedSpecialities(selectedOptions)
                          }
                        />
                        <p className="missing-speciality">
                          Is your speciality missing in the list?{" "}
                          <Link to={"/contact"}>Please Contact Us!</Link>
                        </p>
                        <div className="speciality-action-buttons">
                          <button
                            className="speciality-cancel"
                            onClick={() => {
                              setIsSpecialityEditOpen(false);
                              setSelectedSpecialities(
                                auth?.user?.speciality?.map((sp) => ({
                                  value: sp,
                                  label: sp,
                                }))
                              );
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="tick-mark"
                            onClick={handleSpecialityUpdate}
                          >
                            <TiTickOutline />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <textarea
                          type="text"
                          value={
                            Array.isArray(auth?.user?.speciality)
                              ? auth.user.speciality.join(", ")
                              : auth?.user?.speciality || ""
                          }
                          disabled
                        />
                        <span onClick={() => setIsSpecialityEditOpen(true)}>
                          <FaPencil />
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <h4>Doctors Profile Info</h4>
                <div className="doctor-profile">
                  <div>
                    <label htmlFor="title">Title: </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={!isTitleEditOpen}
                    />
                    {isTitleEditOpen ? (
                      <span className="tick-mark" onClick={handleTitleUpdate}>
                        <TiTickOutline />
                      </span>
                    ) : (
                      <span onClick={() => setIsTitleEditOpen(true)}>
                        <FaPencil />
                      </span>
                    )}
                  </div>
                  <div>
                    <label htmlFor="description">Description: </label>
                    <textarea
                      value={description}
                      className="description"
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={!isDescriptionEditOpen}
                    />
                    {isDescriptionEditOpen ? (
                      <span
                        className="tick-mark"
                        onClick={handleDescriptionUpdate}
                      >
                        <TiTickOutline />
                      </span>
                    ) : (
                      <span onClick={() => setIsDescriptionEditOpen(true)}>
                        <FaPencil />
                      </span>
                    )}
                  </div>
                  <div>
                    <label htmlFor="signature">Signature:</label>
                    {!auth?.user?.signature ? (
                      <span>{"<blank>"}</span>
                    ) : (
                      <img
                        src={`${import.meta.env.VITE_API}${
                          auth?.user?.signature
                        }`}
                        alt=""
                      />
                    )}
                    <span onClick={() => setIsSignUploadOpen(true)}>
                      <FaPencil />
                    </span>
                  </div>
                  {/* Availability Management Section */}
                  <div className="availability-management">
                    <h3>Appointment Availability</h3>
                    <button
                      className="btn manage-availability-btn"
                      onClick={() => setIsAvailabilityOpen(true)}
                    >
                      Manage Availability
                    </button>

                    {isAvailabilityOpen && (
                      <div className="availability-modal">
                        <div className="modal-header">
                          <h3>Manage Your Availability</h3>
                          <button onClick={() => setIsAvailabilityOpen(false)}>
                            <ImCross />
                          </button>
                        </div>

                        <div className="modal-content">
                          <div className="settings-section">
                            <h4>General Settings</h4>
                            <div className="form-group">
                              <label>Daily Appointment Limit:</label>
                              <input
                                type="number"
                                value={availability?.dailyLimit}
                                onChange={(e) =>
                                  setAvailability((prev) => ({
                                    ...prev,
                                    dailyLimit: parseInt(e.target.value) || 10,
                                  }))
                                }
                                min="1"
                              />
                            </div>
                          </div>

                          <div className="weekly-schedule">
                            <h4>Weekly Schedule</h4>
                            {availability?.weeklySchedule?.map(
                              (day, dayIndex) => (
                                <div
                                  key={day.day}
                                  className={`day-schedule ${
                                    day.enabled ? "active" : ""
                                  }`}
                                >
                                  <div className="day-header">
                                    <label className="day-toggle">
                                      <input
                                        type="checkbox"
                                        checked={day.enabled}
                                        onChange={() => toggleDay(dayIndex)}
                                      />
                                      {day.name}
                                    </label>

                                    {day.enabled && (
                                      <button
                                        className="add-slot-btn"
                                        onClick={() => addTimeSlot(dayIndex)}
                                      >
                                        + Add Time Slot
                                      </button>
                                    )}
                                  </div>

                                  {day.enabled &&
                                    day.slots.map((slot, slotIndex) => (
                                      <div
                                        key={slotIndex}
                                        className="time-slot"
                                      >
                                        <input
                                          type="time"
                                          value={slot.start}
                                          onChange={(e) =>
                                            updateTimeSlot(
                                              dayIndex,
                                              slotIndex,
                                              "start",
                                              e.target.value
                                            )
                                          }
                                        />
                                        <span>to</span>
                                        <input
                                          type="time"
                                          value={slot.end}
                                          onChange={(e) =>
                                            updateTimeSlot(
                                              dayIndex,
                                              slotIndex,
                                              "end",
                                              e.target.value
                                            )
                                          }
                                        />
                                        <button
                                          className="remove-slot"
                                          onClick={() =>
                                            removeTimeSlot(dayIndex, slotIndex)
                                          }
                                          disabled={day.slots.length <= 1} // Don't allow removing last slot
                                        >
                                          <ImCross />
                                        </button>
                                      </div>
                                    ))}
                                </div>
                              )
                            )}
                          </div>

                          <div className="holidays-section">
                            <h4>Holidays & Exceptions</h4>
                            <div className="add-holiday">
                              <input
                                type="date"
                                onChange={(e) => addHoliday(e.target.value)}
                              />
                              <button
                                onClick={() => {
                                  const input =
                                    document.querySelector(
                                      ".add-holiday input"
                                    );
                                  if (input.value) addHoliday(input.value);
                                  input.value = "";
                                }}
                              >
                                Add Holiday
                              </button>
                            </div>
                            <div className="holiday-list">
                              {availability?.holidays?.map((date, index) => (
                                <div key={index} className="holiday-item">
                                  <span>
                                    {new Date(date).toLocaleDateString()}
                                  </span>
                                  <button onClick={() => removeHoliday(index)}>
                                    <ImCross />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="modal-footer">
                          <button
                            className="cancel-btn"
                            onClick={() => setIsAvailabilityOpen(false)}
                          >
                            Cancel
                          </button>
                          <button
                            className="save-btn"
                            onClick={saveAvailability}
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="subscription-and-payment">
                    <h3>Subscription & Payment</h3>
                    <div
                      className={`subscription-status ${
                        fetchLoading ? "loading" : ""
                      }`}
                    >
                      <table>
                        <tr>
                          <td>Subscription Status</td>
                          <td>
                            <span
                              className={
                                subscription?.isActive
                                  ? "active-state"
                                  : "inactive-state"
                              }
                            >
                              {fetchLoading
                                ? ""
                                : subscription?.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>Expiry Date</td>
                          <td>
                            {fetchLoading
                              ? ""
                              : new Date(
                                  subscription?.expiryDate
                                ).toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td>Remaining</td>
                          <td>
                            {fetchLoading
                              ? ""
                              : timeRemaining !== null
                              ? formatTimeRemaining(timeRemaining)
                              : "..."}
                          </td>
                        </tr>
                      </table>
                    </div>
                    <div className="fees-and-charges">
                      <h4>Subscription Plans</h4>
                      <p>30 Days/1 Month -- Tk. 99</p>
                      <p>180 Days/6 Months -- Tk. 570</p>
                      <p>365 Days/1 Year -- Tk. 1100</p>
                    </div>
                    {submitComplete ? (
                      <div className="order-complete">
                        <p>
                          <IoCheckmarkDoneCircle />
                        </p>
                        <h5>
                          Your subscription order has successfully been
                          submitted. <br />
                          Please wait for a while. We will send you an email{" "}
                          <br />
                          when we confirm payment.
                        </h5>
                        <div className="check-transactions">
                          <button
                            onClick={() =>
                              navigate(
                                `/doctor-dashboard/transactions/${auth?.user?._id}`
                              )
                            }
                          >
                            Check Transactions
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="payment">
                        {!isPaymentOn && (
                          <div className="button-container">
                            <button
                              className="activativate"
                              onClick={() => setIsPaymentOn(true)}
                            >
                              Activate Subscription
                            </button>
                          </div>
                        )}
                        {isPaymentOn && (
                          <div className="payment-form">
                            <div className="image-holder">
                              <img
                                src={
                                  paymentMethod === "Bkash"
                                    ? "../../public/designpics/payment/Bkash.jpg"
                                    : "../../public/designpics/payment/Nagad.jpg"
                                }
                                alt=""
                              />
                            </div>
                            <div className="form-holder">
                              <form action="" onSubmit={submitOrder}>
                                <div className="method">
                                  <label className="titles" htmlFor="method">
                                    Payment Method:
                                  </label>
                                  <span>
                                    <input
                                      type="radio"
                                      id="bkash"
                                      name="payment"
                                      value="Bkash"
                                      checked={paymentMethod === "Bkash"}
                                      onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                      }
                                    />
                                    <label htmlFor="bkash">Bkash</label>
                                  </span>

                                  <span>
                                    <input
                                      type="radio"
                                      id="Nagad"
                                      name="payment"
                                      value="Nagad"
                                      checked={paymentMethod === "Nagad"}
                                      onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                      }
                                    />
                                    <label htmlFor="Nagad">Nagad</label>
                                  </span>
                                </div>
                                <div className="referance">
                                  <label htmlFor="referance" className="titles">
                                    Last 3 Digit of Account Number:
                                  </label>
                                  <input
                                    type="text"
                                    maxLength={3}
                                    required
                                    value={lastNumbers}
                                    onChange={(e) =>
                                      setLastNumbers(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="amount">
                                  <label htmlFor="amount" className="titles">
                                    Amount:
                                  </label>
                                  <input
                                    type="number"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                  />
                                </div>
                              </form>
                              <div className="button-holder">
                                <button
                                  className="cancel-btn"
                                  onClick={() => setIsPaymentOn(false)}
                                  disabled={orderSubmitLoading}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="submit-btn"
                                  onClick={submitOrder}
                                  disabled={orderSubmitLoading}
                                >
                                  {orderSubmitLoading ? (
                                    <LoadingSpin
                                      height={"15px"}
                                      width={"15px"}
                                    />
                                  ) : (
                                    "Submit"
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="slide-img-up-div">
                    <h3>Slide Images</h3>
                    <div className="slide-images">
                      <div className="single-images">
                        {auth?.user?.slides?.map((image, i) => (
                          <div className="single-image" key={i}>
                            <img
                              src={`${import.meta.env.VITE_API}${image}`}
                              alt={image}
                            />
                            <span
                              className="delete-icon"
                              onClick={() => {
                                setSelectedImageToDelete(image);
                                setImageDeletePopupOpen(true);
                              }}
                            >
                              <MdDelete />
                            </span>
                          </div>
                        ))}
                        {auth?.user?.slides.length !== 5 && (
                          <div
                            className="add-button"
                            onClick={() => setIsSlideUploadOpen(true)}
                          >
                            <p>+</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyAccount;
