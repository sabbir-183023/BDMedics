import React, { useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useAuth from "../../context/useAuth";
import "../../styles/AssistantMenu.scss";
import { GoSidebarCollapse } from "react-icons/go";
import { RxCross2 } from "react-icons/rx";

const AssistantMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [auth] = useAuth();

  const currentPath = location.pathname;
  const overviewPath = `/assistant-dashboard/${auth?.user?.doctorRef}/${auth?.user?._id}`;
  const appointmentPath = `/assistant-dashboard/appointments/${auth?.user?.doctorRef}/${auth?.user?._id}`;
  const appointmentBookingPath = `/assistant-dashboard/appointment-booking/${auth?.user?.doctorRef}/${auth?.user?._id}`;

  //MOBILE MENU FUCTIONALITY
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const sideMenuRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="assistantmenu-container">
        {/* Menu Button (for mobile view) */}
        <div className="menu-button">
          <span className="bar" onClick={toggleMenu} ref={menuButtonRef}>
            <GoSidebarCollapse />
          </span>
        </div>
        {/* mobile popup menu */}
        <div
          className={`side-menu ${isMenuOpen ? "active" : ""}`}
          ref={sideMenuRef}
        >
          <div className="mini-header">
            <div className="close-button" onClick={() => setMenuOpen(false)}>
              <span>
                <RxCross2 />
              </span>
            </div>
          </div>
          <div className="navigation-container">
            <Link to={overviewPath}>Overview</Link>
            <Link to={appointmentPath}>Appointments</Link>
            <Link to={appointmentBookingPath}>App. Booking</Link>
          </div>
        </div>

        {/* desktop view */}
        <ul className="assistant-menu">
          <li
            className={currentPath === overviewPath ? "active" : ""}
            onClick={() => navigate(overviewPath)}
          >
            Overview
          </li>
          <li
            className={currentPath === appointmentPath ? "active" : ""}
            onClick={() => navigate(appointmentPath)}
          >
            Appointments
          </li>
          <li
            className={currentPath === appointmentBookingPath ? "active" : ""}
            onClick={() => navigate(appointmentBookingPath)}
          >
            App. Booking
          </li>
        </ul>
      </div>
    </>
  );
};

export default AssistantMenu;
