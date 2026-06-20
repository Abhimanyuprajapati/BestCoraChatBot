import { useState, useMemo } from "react";
import { Menu } from "antd";
import "../style/sidebar.css";
import SVG from "react-inlinesvg";
import homeIconActive from "../assets/icons/HomeActive.svg";
import homeIconInactive from "../assets/icons/HomeInactive.svg";
import ShareIconInactive from "../assets/icons/sharelogo.svg";
import like from "../assets/icons/likelogo.svg";
import folder from "../assets/icons/filelogo.svg";
import share from "../assets/icons/shlogo.svg";

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

const SideBar = ({ collapsed }) => {
  const [selectedKeys, setSelectedKeys] = useState(["Home"]);

  const handleMenuClick = ({ key }) => {
    setSelectedKeys([key]);
  };

  const items = useMemo(
    () => [
      getItem(
        "Home",
        "Home",
        <SVG
          src={
            selectedKeys.includes("Home") ? homeIconActive : homeIconInactive
          }
        />,
      ),
      // getItem("Industry", "industry", <SVG src={ShareIconInactive} />),
      // getItem("Like", "like", <SVG src={like} />),
      // getItem("Folder", "folder", <SVG src={folder} />),
      // getItem("Share", "share", <SVG src={share} />),
    ],
    [selectedKeys],
  );

  return (
    <Menu
      className={`drawer expandedDrawer ${collapsed ? "drawerCollapsed" : "drawerExpanded"}`}
      mode="inline"
      inlineCollapsed={collapsed}
      selectedKeys={selectedKeys}
      items={items}
      onClick={handleMenuClick}
    />
  );
};

export default SideBar;
