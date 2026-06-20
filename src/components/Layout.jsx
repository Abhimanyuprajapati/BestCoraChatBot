import React, { useState } from 'react';
import { Button } from "@progress/kendo-react-buttons";
import { Outlet } from "react-router-dom";
import Header from './Header';
import "../style/layout.css";
import SideBar from './SideBar';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(true)

    const handleToggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <>
      <Header />
      <div className="toolbar">
        <Button
          fillMode="flat"
          style={{ padding: "8px 14px" }}
          onClick={handleToggleSidebar}   
          className="toggleBtn"
        >
          <img
            src="https://sttechexperiencesassets.blob.core.windows.net/whiteboard/aoai_2_hamburger.png"
            alt="hamburger"
          />
        </Button>
      </div>
      <div       >
        <SideBar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>
      <div
         className="containerLayout"
  style={{
    marginLeft: collapsed ? "50px" : "250px",
    width: collapsed ? "calc(100vw - 50px)" : "calc(100vw - 250px)"
  }}
      >
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
