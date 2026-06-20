import React, { createContext, useContext, useMemo, useReducer } from "react";

const UIStateContext = createContext(null);

const initialUIState = {
  isChatbotVisible: true,
};

const uiReducer = (state, action) => {
  switch (action.type) {
    case "SHOW_CHATBOT":
      return { ...state, isChatbotVisible: true };
    case "HIDE_CHATBOT":
      return { ...state, isChatbotVisible: false };
    case "TOGGLE_CHATBOT":
      return { ...state, isChatbotVisible: !state.isChatbotVisible };
    default:
      return state;
  }
};

export const UIStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialUIState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>
  );
};

export const useUIState = () => {
  const context = useContext(UIStateContext);

  if (!context) {
    throw new Error("useUIState must be used within UIStateProvider");
  }

  return context;
};

