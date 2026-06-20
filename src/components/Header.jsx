
import {
  AppBar,
  AppBarSection,
} from "@progress/kendo-react-layout";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useUIState } from "../context/UIStateContext";

import "../style/header.css";
import logout from "../assets/logout.png";

const Header = () => {
  const user = localStorage.getItem("username");
  // console.log(user);

  const navigate = useNavigate();
  const { instance } = useMsal();
  const { dispatch } = useUIState();

  const handleHomeRoute = () => {
    navigate("/");
  };

  const handleLogoutRoute = async (event) => {
    event.stopPropagation();
    await instance.logoutRedirect();
  };

  const handleShowChatbot = (event) => {
    event.stopPropagation();
    dispatch({ type: "SHOW_CHATBOT" });
    navigate("/");
  };

  return (
    <>
      <AppBar className="appBar">
        <AppBarSection
          style={{ flex: 1, display: "flex", justifyContent: "left" }}
        >
          <div onClick={handleHomeRoute} className="logobox">
            <div>
<span className="lab_logo">Cora</span>
            </div>
            
           
           <div>
              <span className="chatbotToggleBtn" onClick={handleShowChatbot} title="Show chatbot">
                <img
                  src="https://sttechexperiencesassets.blob.core.windows.net/whiteboard/cora_ai.png"
                  alt="Show chatbot"
                  className="chatbotToggleImage"
                />
              </span>
              <span>{user}</span>
              <span className="logoutbox" onClick={handleLogoutRoute}>
              <img
                src={logout}
                alt="logout"
                width={40}
                className="logoutImage"
              />
            </span>
           </div>
            
          </div>
        </AppBarSection>
      </AppBar>
    </>
  );
};

export default Header;
