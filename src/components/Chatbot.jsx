import "../style/mainchat.css";
import React, { useEffect, useMemo, useState } from "react";
import MainContent from './MainContent';
import ChatBotNew from './ChatBotNew';
import { useUIState } from "../context/UIStateContext";

const getViewModeFromAgentResponse = (apiPayload) => {
  const agentUsed = (apiPayload?.agent_used || "").toLowerCase();
console.log("agentUsed", agentUsed);

  

  if (agentUsed.includes("accelerator discovery agent")) {
    return "discovery-agent";
  }

  if (agentUsed.includes("data generator agent")) {
    return "data-generator";
  }

  if (agentUsed.includes("lab generator agent")) {
    return "lab-exercises";
  }

  if (agentUsed.includes("deployment script generator agent")) {
    return "lab-ready";
  }

  return "idle";
};

export const Chatbot = () => {
  const { state, dispatch } = useUIState();
  const [viewMode, setViewMode] = useState("idle");
  const [agentResponse, setAgentResponse] = useState(null);
  const [chatWidth, setChatWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);

  const minChatWidth = 420;
  const maxChatWidth = 720;

  const clampWidth = useMemo(
    () => (value) => Math.min(maxChatWidth, Math.max(minChatWidth, value)),
    [maxChatWidth, minChatWidth],
  );

  useEffect(() => {
    const savedWidth = Number(localStorage.getItem("chat-panel-width"));

    if (Number.isFinite(savedWidth) && savedWidth > 0) {
      setChatWidth(clampWidth(savedWidth));
    }
  }, [clampWidth]);

  useEffect(() => {
    localStorage.setItem("chat-panel-width", String(chatWidth));
  }, [chatWidth]);

  useEffect(() => {
    if (!isResizing) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      const nextWidth = window.innerWidth - event.clientX - 12;
      setChatWidth(clampWidth(nextWidth));
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      document.body.classList.remove("split-resize-active");
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.classList.remove("split-resize-active");
    };
  }, [clampWidth, isResizing]);

  useEffect(() => {
    if (!state.isChatbotVisible && isResizing) {
      setIsResizing(false);
      document.body.classList.remove("split-resize-active");
    }
  }, [isResizing, state.isChatbotVisible]);

  const handleNewLab = () => {
    setViewMode("idle");
    setAgentResponse(null);
  };

  const handleAgentResponse = (payload) => {
    setAgentResponse(payload);
    setViewMode(getViewModeFromAgentResponse(payload));
  };

  const handleCloseChatbot = () => {
    dispatch({ type: "HIDE_CHATBOT" });
  };

  return (
    <>
    <div className="appChatBox">
      <div className={`main-container ${!state.isChatbotVisible ? "chat-hidden" : ""}`}>
        <MainContent
          viewMode={viewMode}
          agentResponse={agentResponse}
        />
        {state.isChatbotVisible && (
          <div
            className={`splitter ${isResizing ? "isResizing" : ""}`}
            onPointerDown={() => {
              setIsResizing(true);
              document.body.classList.add("split-resize-active");
            }}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize chatbot panel"
          />
        )}
        <div
          className={`chat-panel ${!state.isChatbotVisible ? "chat-panel-hidden" : ""}`}
          style={{ width: `${chatWidth}px` }}
          aria-hidden={!state.isChatbotVisible}
        >
          <ChatBotNew
            onNewLab={handleNewLab}
            onAgentResponse={handleAgentResponse}
            onCloseChatbot={handleCloseChatbot}
          />
        </div>
      </div>
    </div>
    </>
  )
}
