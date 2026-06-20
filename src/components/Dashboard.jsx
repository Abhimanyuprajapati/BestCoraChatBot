import React, { useState } from "react";
import "../style/dashboard.css";
import { useNavigate } from "react-router-dom";


const Dashboard = () => {
 
  return (
    <>
      <div className="app-container">
        <header className="header-dashboard">
          <div className="toolbar-left">
            <div className="search-box">
              <svg
                className="search-icon"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M13.7 12.3 17 15.6l-1.4 1.4-3.3-3.3a6 6 0 1 1 1.4-1.4ZM8.5 13A4.5 4.5 0 1 0 8.5 4a4.5 4.5 0 0 0 0 9Z"
                  fill="currentColor"
                />
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search accelerators"
              />
            </div>
            <button type="button" className="btn-sort" >
              Sort by
            </button>
          </div>
        </header>

        <main>
         <div>
          CORA  part (Iitial screen to display)
         </div>
        </main>
      </div>
    </>
  );
};


export default Dashboard;
