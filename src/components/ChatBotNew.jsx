import React, { useEffect, useId, useRef, useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Chat } from "@progress/kendo-react-conversational-ui";
import {
  arrowsRotateOutlineIcon,
  thumbDownOutlineIcon,
  thumbUpOutlineIcon,
  trashIcon,
} from "@progress/kendo-svg-icons";
import axios from "axios";
import {
  ArrowCounterclockwise20Filled,
  Dismiss20Filled,
} from "@fluentui/react-icons";
import MarkdownViewer from "./MarkdownViewer";
import "../style/chatbot.css";

const bot = {
  id: 0,
  name: "Cora",
};

const user = {
  id: 1,
  name: "You",
};

const createInitialMessages = () => [];

const MASTER_AGENT_API_URL =
  "aPI Call";
const HARDCODED_USER_ID = "abc_user";
const THINKING_MESSAGE_ID = "cora-thinking-indicator";

const mapSuggestionValues = (value) => {
  if (value == null) {
    return [];
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    // Handle cases where API returns a JSON string array:
    // e.g. "[\"this is first\", \"this is second\"]"
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        return mapSuggestionValues(parsed);
      } catch (error) {
        // Treat it as plain text if JSON parsing fails.
      }
    }

    return [trimmed];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => mapSuggestionValues(item));
  }

  if (typeof value === "object") {
    const candidate =
      value.question ||
      value.text ||
      value.label ||
      value.title ||
      value.suggested_question ||
      value.suggested_questions;

    return mapSuggestionValues(candidate);
  }

  return [];
};

const extractFollowUpSuggestions = (payload,answerText) => {
  const response = payload || {};
  const extracted = mapSuggestionValues(response.suggested_question);
  const unique = [...new Set(extracted)].slice(0, 3);

  if (unique.length > 0) {
    return unique;
  }

  return [];
};

const SuggestedQuestionReplyIcon = () => {
  const gradientId = useId().replace(/:/g, "");

  return (
    <span className="assistantSuggestionIconWrap" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        fill="none"
        viewBox="0 0 16 16"
        focusable="false"
        className="assistantSuggestionIcon"
      >
        <path
          fill={`url(#${gradientId})`}
          d="M3.333 3.333V6q0 .834.584 1.417Q4.5 8 5.333 8h6.117l-2.4-2.4.95-.933 4 4-4 4-.95-.934 2.4-2.4H5.333a3.21 3.21 0 0 1-2.358-.975A3.21 3.21 0 0 1 2 6V3.333z"
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="20.5%" stopColor="#4299E0" />
            <stop offset="46.91%" stopColor="#CA42E0" />
            <stop offset="79.5%" stopColor="#FF5F46" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
};

export const ChatBotNew = ({ onNewLab, onAgentResponse, onCloseChatbot }) => {
  const [messages, setMessages] = useState(createInitialMessages);
  const [isSending, setIsSending] = useState(false);
  const [feedbackByMessageId, setFeedbackByMessageId] = useState({});
  const chatBodyRef = useRef(null);
  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  );

  // scroll
  useEffect(() => {
    const chatBodyElement = chatBodyRef.current;

    if (!chatBodyElement) {
      return undefined;
    }

    const scrollToLatestMessage = () => {
      const messageListElement = chatBodyElement.querySelector(".k-message-list");

      if (!messageListElement) {
        return;
      }

      messageListElement.scrollTop = messageListElement.scrollHeight;
    };

    const rafId = window.requestAnimationFrame(() => {
      scrollToLatestMessage();
      window.setTimeout(scrollToLatestMessage, 0);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [messages]);

  const welcomeActions = [
    "Hi ? suggested question",
  ];

  const pushAssistantMessage = (text, suggestions = [], delay = 0) => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.floor(Math.random() * 1000),
          author: bot,
          text,
          suggestions: suggestions.slice(0, 3),
          timestamp: new Date(),
        },
      ]);
    }, delay);
  };

  const showThinkingIndicator = () => {
    setMessages((prev) => {
      const exists = prev.some((message) => message.id === THINKING_MESSAGE_ID);

      if (exists) {
        return prev;
      }

      return [
        ...prev,
        {
          id: THINKING_MESSAGE_ID,
          author: bot,
          text: "",
          typing: true,
          timestamp: new Date(),
        },
      ];
    });
  };

  const hideThinkingIndicator = () => {
    setMessages((prev) =>
      prev.filter((message) => message.id !== THINKING_MESSAGE_ID),
    );
  };

  const resetConversation = () => {
    setMessages(createInitialMessages());
    setFeedbackByMessageId({});
    onNewLab?.();
  };

  const handleSendMessage = async (event) => {
    const userText = (event.message.text || "").trim();

    if (!userText || isSending) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: user,
        text: userText,
        timestamp: new Date(),
      },
    ]);

    try {
      setIsSending(true);

      showThinkingIndicator();

      const response = await axios.post(
        MASTER_AGENT_API_URL,
        {
          query: userText,
          session_id: sessionId,
          user_id: HARDCODED_USER_ID,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      hideThinkingIndicator();

      // chatbot answer
      const chatbotAnswer = response.data?.result?.response?.answer;
      // suggested question
      if (chatbotAnswer?.trim()) {
        const followups = extractFollowUpSuggestions(response.data, chatbotAnswer);
        pushAssistantMessage(chatbotAnswer, followups);
      }
      // full response body
      onAgentResponse?.(response.data);
    } catch (error) {
      hideThinkingIndicator();

      pushAssistantMessage("Oops! Something went wrong. Please try again.", []);

      console.error("API Error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const showWelcome = messages.length === 0;

  const handleWelcomeActionClick = (text) => {
    handleSendMessage({
      message: { text },
    });
  };

  const handleFeedback = (messageId, feedbackType) => {
    setFeedbackByMessageId((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === feedbackType ? null : feedbackType,
    }));
  };

  const handleCopyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => String(message?.author?.id) === String(user.id));

    if (lastUserMessage?.text) {
      handleSendMessage({ message: { text: lastUserMessage.text } });
    }
  };

  const ChatMessageContent = ({ item }) => {
    const messageText = item?.text || "";

    if (!messageText) {
      return null;
    }

    const isBotMessage = String(item?.author?.id) === String(bot.id);

    if (!isBotMessage) {
      return <span className="chatPlainMessage">{messageText}</span>;
    }

    const selectedFeedback = feedbackByMessageId[item.id];
    const suggestions = Array.isArray(item?.suggestions) ? item.suggestions : [];

    return (
      <div className="assistantMessageContent">
        <div className="chatMarkdownMessage">
          <MarkdownViewer markdownString={messageText} />
        </div>

        {suggestions.length > 0 && (
          <div className="assistantFollowups">
            {suggestions.map((suggestion) => (
              <button
                key={`${item.id}-${suggestion}`}
                type="button"
                className="assistantFollowupBtn"
                onClick={() => handleWelcomeActionClick(suggestion)}
              >
                <SuggestedQuestionReplyIcon />
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="assistantActionBar">
          <Button
            className={`assistantActionBtn ${selectedFeedback === "useful" ? "active" : ""}`}
            fillMode="flat"
            size="small"
            svgIcon={thumbUpOutlineIcon}
            title="Useful"
            aria-label="Useful"
            onClick={() => handleFeedback(item.id, "useful")}
          />
          <Button
            className={`assistantActionBtn ${selectedFeedback === "not-useful" ? "active" : ""}`}
            fillMode="flat"
            size="small"
            svgIcon={thumbDownOutlineIcon}
            title="Not useful"
            aria-label="Not useful"
            onClick={() => handleFeedback(item.id, "not-useful")}
          />
          <Button
            className="assistantActionBtn"
            fillMode="flat"
            size="small"
            svgIcon={arrowsRotateOutlineIcon}
            title="Regenerate"
            aria-label="Regenerate"
            onClick={handleRegenerate}
          />
          <button
            type="button"
            className="assistantActionBtn"
            title="Copy"
            aria-label="Copy"
            onClick={() => handleCopyMessage(messageText)}
          >
            <span className="assistantActionIcon" aria-hidden="true">⧉</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="chatWrapper">
      <div className="chatHeader">
        <div className="chatHeaderBrand">
          <div className="chatTitle">Cora</div>
          <div className="chatsubtitle">Cora NEW</div>
        </div>
        <div className="chatHeaderButtons">
          <button
            className="iconButton"
            title="New chat"
            onClick={resetConversation}
          >
            <ArrowCounterclockwise20Filled />
          </button>
          <button className="iconButton" title="Thread history">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2.5a5.5 5.5 0 1 1-3.89 9.39" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M2.5 7.25V3.5M2.5 3.5h3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 4.5V8l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="iconButton" title="More options">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="3" r="1.25" fill="currentColor" />
              <circle cx="8" cy="8" r="1.25" fill="currentColor" />
              <circle cx="8" cy="13" r="1.25" fill="currentColor" />
            </svg>
          </button>

          <button
            className="iconButton"
            title="Close sidebar"
            onClick={onCloseChatbot}
          >
            <Dismiss20Filled />
          </button>
        </div>
      </div>

      <div className="chatBody" ref={chatBodyRef}>
        {showWelcome && (
          <div className="genieWelcome">
            <div className="genieIcon"> 
              <img
                  src="https://sttechexperiencesassets.blob.core.windows.net/whiteboard/cora_ai.png"
                  alt="Show chatbot"
                  className="chatbotToggleImageCora"
              />
            </div>
            <h2 className="genieHeading">Cora</h2>
            <p className="genieSubheading">Run multi-step data and AI tasks</p>
            <div className="genieActions">
              {welcomeActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="genieActionBtn"
                  onClick={() => handleWelcomeActionClick(action)}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        <Chat
          messages={messages}
          authorId={user.id}
          messageContentTemplate={ChatMessageContent}
          onSendMessage={handleSendMessage}
          placeholder={isSending ? "Waiting for response..." : "Ask Cora..."}
        />
      </div>
      <div className="chatAccuracyNote">Always review the accuracy of responses.</div>
    </div>
  );
};

export default ChatBotNew;
