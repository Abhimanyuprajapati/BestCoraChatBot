import { Route, Routes } from "react-router-dom";
import "@progress/kendo-theme-default/dist/all.css";
import Layout from "./components/Layout";
import { Chatbot } from "./components/Chatbot";
import { UIStateProvider } from "./context/UIStateContext";

const App = () => {
  return (
    <UIStateProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Chatbot />} />
        </Route>

        <Route path="*" element={<Chatbot />} />
      </Routes>
    </UIStateProvider>
  );
};

export default App;