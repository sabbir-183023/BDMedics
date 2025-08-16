import React, { useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useAuth from "../../context/useAuth";
import "../../styles/PatientMenu.scss";
import { GoSidebarCollapse } from "react-icons/go";
import { RxCross2 } from "react-icons/rx";

const PatientMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [auth] = useAuth();

  const currentPath = location.pathname;
  const overviewPath = `/patient-dashboard/${auth?.user?.ref}`;
  const transactionPath = `/patient-appointments/${auth?.user?.ref}`;

  //MOBILE MENU FUCTIONALITY
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const sideMenuRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="patientmenu-container">
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
            <Link to={transactionPath}>Transactions</Link>
          </div>
        </div>

        {/* desktop view */}
        <ul className="patient-menu">
          <li
            className={currentPath === overviewPath ? "active" : ""}
            onClick={() => navigate(overviewPath)}
          >
            Overview
          </li>
          <li
            className={currentPath === transactionPath ? "active" : ""}
            onClick={() => navigate(transactionPath)}
          >
            Appointments
          </li>
        </ul>
      </div>
    </>
  );
};

export default PatientMenu;
