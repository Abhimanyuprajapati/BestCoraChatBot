import React, { useEffect, useMemo, useState } from "react";
import MarkdownViewer from "./MarkdownViewer";
import BehaviorOntologyView from "./BehaviorOntologyView";
import Dashboard from "./Dashboard";
import { AcceleratorCard } from "./AcceleratorCard";
import { CsvFile } from "./CsvFile";

const MainContent = ({
  viewMode,
  agentResponse,
}) => {

  return (
    <div className="main-content">
      {viewMode === "idle" && <Dashboard />}
      {viewMode === "data-generator" && <CsvFile data={agentResponse?.result?.response}/>} 
      {viewMode === "discovery-agent" && <AcceleratorCard data={agentResponse?.result?.response}/> }
      {viewMode === "lab-exercises" && <AcceleratorCard data={agentResponse?.result?.response}/> }
      {viewMode === "lab-ready" && <AcceleratorCard data={agentResponse?.result?.response} /> }
    </div>
  );
};

export default MainContent;
