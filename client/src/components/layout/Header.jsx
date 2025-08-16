import React, { useEffect, useRef, useState } from "react";
import "../../styles/header.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { TiThMenu } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import useAuth from "../../context/useAuth";
import Cookies from "js-cookie";
import { MdDashboard } from "react-icons/md";
import { MdManageAccounts } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import { IoMdArrowDropdown } from "react-icons/io";
import Logo from "../../../public/BDMedicsHeader.png";
import { FaCaretDown } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const Header = () => {
  const location = useLocation();

  //MOBILE MENU FUCTIONALITY
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const sideMenuRef = useRef(null);
  const navigate = useNavigate();

  const [auth, setAuth] = useAuth();

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  // Close the menu if clicked on the overlay
  const handleOverlayClick = () => {
    setMenuOpen(false);
  };

  //search input page for mobile
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  //logout
  const handleLogout = () => {
    // 1. Remove cookies
    Cookies.remove("token");
    Cookies.remove("user");

    // 2. Clear auth context
    setAuth({
      user: null,
      token: "",
    });
    // 3. Redirect to login
    navigate("/login");
  };

  const [isProfileMenuVisible, setProfileMenuVisible] = useState(false);
  const hideTimeoutRef = useRef(null);

  const handleProfileEnter = () => {
    clearTimeout(hideTimeoutRef.current);
    setProfileMenuVisible(true);
  };

  const handleProfileLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setProfileMenuVisible(false);
    }, 2500);
  };

  //services sub menus
  const [isServicesMenuVisible, setServicesMenuVisible] = useState(false);
  const hideServicesTimeoutRef = useRef(true);

  const handleServicesEnter = () => {
    clearTimeout(hideServicesTimeoutRef.current);
    setServicesMenuVisible(true);
  };

  const handleServicesLeave = () => {
    hideServicesTimeoutRef.current = setTimeout(() => {
      setServicesMenuVisible(false);
    }, 2500);
  };

  // mobile menu services sub
  const [showServices, setShowServices] = useState(false);

  // Fetch subscription status
  const [subscription, setSubscription] = useState(null);
  const id = auth?.user?._id;

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
    fetchSubscription(id);
  }, [id]); // Add id as dependency

  return (
    // laptop menu
    <>
      <div className="header-container">
        <div className="inner-header">
          <div className="nav-logo-holder">
            <Link to="/">
              <img src={Logo} alt="logo" />
            </Link>
          </div>
          <div className="search-bar-holder">
            <div className="search">
              <input type="text" placeholder="Find Doctors" />
              <button>
                <FaSearch />
              </button>
            </div>
          </div>
          <div className={"links-and-login-holder"}>
            <Link
              className={location.pathname === "/" ? "active-link" : ""}
              to="/"
            >
              Home
            </Link>
            <Link
              className={location.pathname === "/doctors" ? "active-link" : ""}
              to="/doctors"
            >
              Doctors
            </Link>
            <Link
              className={
                location.pathname === "/patientidcreation"
                  ? "active-link"
                  : location.pathname === "/patientregister"
                  ? "active-link"
                  : location.pathname === "/doctorregister"
                  ? "active-link"
                  : location.pathname === "/patientidcheck"
                  ? "active-link"
                  : ""
              }
              onMouseEnter={handleServicesEnter}
              onMouseLeave={handleServicesLeave}
            >
              Services
            </Link>
            <Link
              className={location.pathname === "/about" ? "active-link" : ""}
              to="/about"
            >
              About
            </Link>
            <Link
              className={location.pathname === "/contact" ? "active-link" : ""}
              to="/contact"
            >
              Contact
            </Link>
            {auth?.user ? (
              <button
                className="avatar-icon"
                onMouseEnter={handleProfileEnter}
                onMouseLeave={handleProfileLeave}
              >
                <img
                  src={
                    auth?.user?.image
                      ? `${import.meta.env.VITE_API}${auth?.user?.image}`
                      : `/designpics/profile.png`
                  }
                  alt="profile-img"
                />
                <IoMdArrowDropdown />
              </button>
            ) : (
              <button onClick={() => navigate("/login")}>
                <Link className="login-btn">Login</Link>
              </button>
            )}
          </div>
          {isProfileMenuVisible && (
            <div
              className="profile-sub-menus"
              onMouseEnter={handleProfileEnter}
              onMouseLeave={() => setProfileMenuVisible(false)}
            >
              <ul>
                <li
                  onClick={() =>
                    navigate(
                      auth?.user?.role === 1
                        ? `/admin-dashboard/${auth?.user?._id}`
                        : auth?.user?.role === 2
                        ? `/doctor-dashboard/${auth?.user?._id}`
                        : auth?.user?.role === 3
                        ? `/assistant-dashboard/${auth?.user?.doctorRef}/${auth?.user?._id}`
                        : `/patient-dashboard/${auth?.user?.ref}`
                    )
                  }
                >
                  <MdDashboard />
                  Dashboard
                </li>
                <li onClick={() => navigate("/my-account")}>
                  <MdManageAccounts />
                  My Account
                </li>
                <li onClick={handleLogout}>
                  <IoLogOut />
                  Log Out
                </li>
              </ul>
            </div>
          )}
          {isServicesMenuVisible && (
            <div
              className="services-sub-menus"
              onMouseEnter={handleServicesEnter}
              onMouseLeave={() => setServicesMenuVisible(false)}
            >
              <ul>
                <li onClick={() => navigate("/patientidcreation")}>
                  Patient Id Creation
                </li>
                <li onClick={() => navigate("/patientidcheck")}>
                  Exixting Patient Id Check
                </li>
                <li onClick={() => navigate("/patientregister")}>
                  Paitent Profile Registration
                </li>
                <li onClick={() => navigate("/doctorregister")}>
                  Doctor Registration
                </li>
              </ul>
            </div>
          )}
          {isProfileMenuVisible && (
            <div
              className="profile-sub-menus"
              onMouseEnter={handleProfileEnter}
              onMouseLeave={() => setProfileMenuVisible(false)}
            >
              <ul>
                <li
                  onClick={() =>
                    navigate(
                      auth?.user?.role === 1
                        ? `/admin-dashboard/${auth?.user?._id}`
                        : auth?.user?.role === 2
                        ? `/doctor-dashboard/${auth?.user?._id}`
                        : auth?.user?.role === 3
                        ? `/assistant-dashboard/${auth?.user?.doctorRef}/${auth?.user?._id}`
                        : `/patient-dashboard/${auth?.user?.ref}`
                    )
                  }
                >
                  <MdDashboard />
                  Dashboard
                </li>
                <li onClick={() => navigate("/my-account")}>
                  <MdManageAccounts />
                  My Account
                </li>
                <li onClick={handleLogout}>
                  <IoLogOut />
                  Log Out
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {auth?.user && auth?.user?.role === 2 && (
        <div className="notification-bar">
          {!auth?.user?.allInfoUpdated && (
            <div className="complete-account-notification">
              <p>
                Complete your account from{" "}
                <Link to={"/my-account"}>My Acoount</Link>! Otherwise it won't
                be showing to public.
              </p>
            </div>
          )}

          <div
            className={`complete-payment-notification ${
              subscription && !subscription.isActive ? "show" : ""
            }`}
          >
            <p>
              Make payment from <Link to="/my-account">My Account</Link>, Please
              wait if paid.
            </p>
          </div>
        </div>
      )}
      {/* mobile menu */}
      <div className="mobile-menu">
        <div className="mobile-menu-logo-holder">
          <Link to="/">
            <img src="/BDMedicsHeader.png" alt="mobile-logo" />
          </Link>
        </div>
        <div className="bar-holder">
          <span className="search-icon" onClick={() => setIsSearchOpen(true)}>
            <FaSearch />
          </span>
          <span onClick={toggleMenu} ref={menuButtonRef}>
            <TiThMenu />
          </span>
        </div>
      </div>
      {/* Outer overlay (clicking this closes the menu) */}
      {isMenuOpen && (
        <div className="overlay" onClick={handleOverlayClick}></div>
      )}
      {/* mobile popup menu */}
      <div
        className={`side-menu ${isMenuOpen ? "active" : ""}`}
        ref={sideMenuRef}
      >
        <div className="upper-mobile-sidemenu-header">
          <div className="logo-holder-side">
            <Link to="/">
              <img src="/BDMedicsHeader.png" alt="mobile-logo" />
            </Link>
          </div>
          <div className="cross-holder">
            <span onClick={handleOverlayClick}>
              <ImCross />
            </span>
          </div>
        </div>
        <hr />
        <div className="menu-item-holder">
          <Link
            className={location.pathname === "/" ? "active-link" : ""}
            to="/"
          >
            Home
          </Link>
          <Link
            className={location.pathname === "/doctors" ? "active-link" : ""}
            to="/doctors"
          >
            Doctors
          </Link>

          {/* Services Menu Item */}
          <div className="services-container">
            <Link
              className={`services-trigger ${
                location.pathname === "/patientidcreation"
                  ? "active-link"
                  : location.pathname === "/patientregister"
                  ? "active-link"
                  : location.pathname === "/doctorregister"
                  ? "active-link"
                  : location.pathname === "/patientidcheck"
                  ? "active-link"
                  : ""
              }`}
              onClick={() => setShowServices(!showServices)}
            >
              Services{" "}
              <FaCaretDown
                className={`caret ${showServices ? "rotate-up" : ""}`}
              />
            </Link>
            <div className={`services-dropdown ${showServices ? "show" : ""}`}>
              <ul>
                <li onClick={() => navigate("/patientidcreation")}>
                  Patient Id Creation
                </li>
                <li onClick={() => navigate("/patientidcheck")}>
                  Exixting Patient Id Check
                </li>
                <li onClick={() => navigate("/patientregister")}>
                  Patient Profile Registration
                </li>
                <li onClick={() => navigate("/doctorregister")}>
                  Doctor Registration
                </li>
              </ul>
            </div>
          </div>

          {/* Following Menu Items */}
          <Link
            className={location.pathname === "/about" ? "active-link" : ""}
            to="/about"
          >
            About
          </Link>
          <Link
            className={location.pathname === "/contact" ? "active-link" : ""}
            to="/contact"
          >
            Contact
          </Link>
          <Link
            className={location.pathname === "/dashboard" ? "active-link" : ""}
            to={
              auth?.user?.role === 1
                ? `/admin-dashboard/${auth?.user?._id}`
                : auth?.user?.role === 2
                ? `/doctor-dashboard/${auth?.user?._id}`
                : auth?.user?.role === 3
                ? `/assistant-dashboard/${auth?.user?.doctorRef}/${auth?.user?._id}`
                : `/patient-dashboard/${auth?.user?._id}`
            }
          >
            Dashboard
          </Link>
          <Link
            className={location.pathname === "/my-account" ? "active-link" : ""}
            to="/my-account"
          >
            My Account
          </Link>
          {auth?.user ? (
            <button onClick={handleLogout}>Log Out</button>
          ) : (
            <button onClick={() => navigate("/login")}>Log In</button>
          )}
        </div>
      </div>
      {/* search overlay  */}
      <div
        className={`search-input-overlay ${isSearchOpen ? "active" : ""}`}
        onClick={() => setIsSearchOpen(false)}
      >
        <div className="search-box" onClick={(e) => e.stopPropagation()}>
          <div className="cross-container">
            <span className="close-icon" onClick={() => setIsSearchOpen(false)}>
              <ImCross />
            </span>
          </div>
          <form className="search">
            <input type="text" placeholder="Find Doctors" />
            <button>
              <FaSearch />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Header;
