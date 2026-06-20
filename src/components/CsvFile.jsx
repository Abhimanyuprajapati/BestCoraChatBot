import React, { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { Spreadsheet } from "@progress/kendo-react-spreadsheet";
import BehaviorOntologyView from "./BehaviorOntologyView";


const normalizeTabsPayload = (payload) => {
  const rawTabs = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.tabs)
      ? payload.tabs
      : Array.isArray(payload?.response)
        ? payload.response
        : [];

  return rawTabs
    .map((tab) => ({
      tab: tab?.tab || tab?.tab_name || "",
      data: Array.isArray(tab?.data) ? tab.data : [],
    }))
    .filter((tab) => tab.tab);
};

const cleanSasUrl = (url) => {
  if (typeof url !== "string") {
    return "";
  }
  return url.replace(/%22$/, "").replace(/"$/, "").trim();
};

const parseCsvText = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return headers.reduce((obj, key, index) => {
      obj[key] = values[index] ?? "";
      return obj;
    }, {});
  });

  return rows;
};

const getColumnsFromRows = (rows) => {
  const columnSet = new Set();
  rows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => columnSet.add(key));
  });
  return Array.from(columnSet);
};

const toTitleCase = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\s+/g, "");

const buildOntologyFromConfig = (configJson) => {
  const tables = configJson?.tables || {};
  const entities = Object.entries(tables).map(([tableName, tableConfig]) => ({
    name: toTitleCase(tableName),
    source: tableConfig?.source_table || tableName,
    primary_key: tableConfig?.key || "id",
    attributes: (tableConfig?.columns || []).map((column) => ({
      name: column,
      type: tableConfig?.types?.[column] || "string",
    })),
  }));

  const relationships = (configJson?.relationships || []).map((relationship) => ({
    source_entity: toTitleCase(relationship?.from),
    target_entity: toTitleCase(relationship?.to),
    relationship_name: relationship?.name || `${relationship?.from}_to_${relationship?.to}`,
    source_key: relationship?.fromKey || "",
    target_key: relationship?.toKey || "",
  }));

  return {
    ontology_name: configJson?.name || "DynamicOntology",
    version: "1.0",
    domain: configJson?.scenario || "Generated Scenario",
    description: configJson?.description || "Generated from ZIP config",
    entities,
    relationships,
  };
};

const buildSpreadsheetSheets = (tabName, rows) => {
  const columns = getColumnsFromRows(rows);
  const headerCells = columns.map((column) => ({
    value: column,
    bold: true,
    background: "#eef5fc",
  }));

  const dataRows = rows.map((row) => ({
    cells: columns.map((column) => ({
      value: row?.[column] ?? "",
    })),
  }));

  return [
    {
      name: tabName || "Sheet1",
      rows: [{ cells: headerCells }, ...dataRows],
    },
  ];
};

const toIndexedArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.keys(value)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => value[key]);
};

const cellValue = (cell) => {
  if (!cell || typeof cell !== "object") {
    return "";
  }
  if (cell.value !== undefined && cell.value !== null) {
    return String(cell.value);
  }
  if (cell.formula !== undefined && cell.formula !== null) {
    return String(cell.formula);
  }
  return "";
};

const rowsFromSpreadsheetJson = (spreadsheetJson) => {
  const firstSheet = spreadsheetJson?.sheets?.[0];
  const sheetRows = toIndexedArray(firstSheet?.rows);
  if (sheetRows.length === 0) {
    return [];
  }

  const headerCells = toIndexedArray(sheetRows[0]?.cells);
  const headers = headerCells.map((cell) => cellValue(cell).trim());
  if (headers.length === 0) {
    return [];
  }

  const dataRows = sheetRows.slice(1);
  return dataRows
    .map((row) => {
      const cells = toIndexedArray(row?.cells);
      return headers.reduce((obj, header, index) => {
        if (!header) {
          return obj;
        }
        obj[header] = cellValue(cells[index]);
        return obj;
      }, {});
    })
    .filter((row) => Object.keys(row).length > 0);
};

export const CsvFile = ({ data }) => {
  const effectiveProps = data;  //  || DUMMY_RESPONSE 
  const spreadsheetRef = useRef(null);
  const [zipTabs, setZipTabs] = useState([]);
  const [ontologyConfig, setOntologyConfig] = useState(null);
  const sourceTabsFromPayload = useMemo(
    () => normalizeTabsPayload(effectiveProps),
    [effectiveProps]
  );
  const sourceTabs = sourceTabsFromPayload.length > 0 ? sourceTabsFromPayload : zipTabs;
  const ontologyTabId = "behavior-ontology";
  const allTabs = useMemo(() => {
    const baseTabs = [...sourceTabs];
    if (ontologyConfig) {
      baseTabs.push({
        tab: ontologyTabId,
        data: [],
      });
    }
    return baseTabs;
  }, [sourceTabs, ontologyConfig]);
  const [activeCsvTab, setActiveCsvTab] = useState(sourceTabs[0]?.tab || "");
  const [tableDataByTab, setTableDataByTab] = useState({});
  const [editModeByTab, setEditModeByTab] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isZipLoading, setIsZipLoading] = useState(false);

  const csvTabs = useMemo(
    () =>
      allTabs.map((tab) => ({
        id: tab.tab,
        label: tab.tab === ontologyTabId ? "behavior-ontology" : tab.tab,
      })),
    [allTabs]
  );

  useEffect(() => {
    if (allTabs.length === 0) {
      return;
    }

    if (!activeCsvTab || !allTabs.some((tab) => tab.tab === activeCsvTab)) {
      setActiveCsvTab(allTabs[0].tab);
    }
  }, [activeCsvTab, allTabs]);

  useEffect(() => {
    const nextData = {};
    sourceTabs.forEach((tab) => {
      nextData[tab.tab] = (tab.data || []).map((row) => ({ ...row }));
    });
    setTableDataByTab(nextData);
    setEditModeByTab({});
    setSaveStatus("");
  }, [sourceTabs]);

  useEffect(() => {
    const responseZipUrl = cleanSasUrl(effectiveProps?.response_zip_sas_url);
    // console.log("responseZipUrl", responseZipUrl);
    if (!responseZipUrl || sourceTabsFromPayload.length > 0) {
      return;
    }

    let cancelled = false;

    const loadCsvFromZip = async () => {
      setIsZipLoading(true);
      try {
        const zipResponse = await fetch(responseZipUrl);
        console.log("zipResponse", zipResponse);
        if (!zipResponse.ok) {
          throw new Error(`ZIP download failed with status ${zipResponse.status}`);
        }

        const zipBlob = await zipResponse.blob();
        const zip = await JSZip.loadAsync(zipBlob);
        const extractedTabs = [];

        const allFiles = Object.values(zip.files).filter((file) => !file.dir);
        const csvEntries = allFiles.filter((file) => file.name.toLowerCase().endsWith(".csv"));
        const configEntry = allFiles.find(
          (file) =>
            file.name.toLowerCase().endsWith("ontology_config.json") ||
            file.name.toLowerCase().includes("/config/")
        );

        for (const entry of csvEntries) {
          const csvText = await entry.async("string");
          const parsedRows = parseCsvText(csvText);
          const tabName = entry.name.split("/").pop()?.replace(/\.csv$/i, "") || entry.name;

          extractedTabs.push({
            tab: tabName,
            data: parsedRows,
          });

          console.log(`[CSV ZIP] ${entry.name}`, parsedRows);  
        }

        if (configEntry) {
          const configText = await configEntry.async("string");
          const parsedConfig = JSON.parse(configText);
          if (!cancelled) {
            setOntologyConfig(buildOntologyFromConfig(parsedConfig));
          }
          console.log("[ZIP CONFIG]", parsedConfig);
        }

        if (!cancelled) {
          setZipTabs(extractedTabs);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("ZIP fetch/unzip failed:", error);
          setSaveStatus(`Failed to unzip CSVs: ${error.message}`);
        }
      } finally {
        if (!cancelled) {
          setIsZipLoading(false);
        }
      }
    };

    loadCsvFromZip();

    return () => {
      cancelled = true;
    };
  }, [effectiveProps?.response_zip_sas_url, sourceTabsFromPayload.length]);

  const currentRows = tableDataByTab[activeCsvTab] || [];
  const currentColumns = useMemo(() => getColumnsFromRows(currentRows), [currentRows]);
  const spreadsheetSheets = useMemo(
    () => buildSpreadsheetSheets(activeCsvTab, currentRows),
    [activeCsvTab, currentRows]
  );
  const spreadsheetKey = useMemo(
    () => `${activeCsvTab}-${currentRows.length}-${currentColumns.join("|")}`,
    [activeCsvTab, currentRows.length, currentColumns]
  );
  const isOntologyTab = activeCsvTab === ontologyTabId;
  const isEditMode = !isOntologyTab && Boolean(editModeByTab[activeCsvTab]);

  const handleToggleEdit = () => {
    if (isOntologyTab) {
      return;
    }
    setEditModeByTab((previous) => ({
      ...previous,
      [activeCsvTab]: !previous[activeCsvTab],
    }));
    setSaveStatus("");
  };

  const handleCellChange = (rowIndex, columnKey, value) => {
    setTableDataByTab((previous) => {
      const rows = previous[activeCsvTab] || [];
      const updatedRows = rows.map((row, index) =>
        index === rowIndex ? { ...row, [columnKey]: value } : row
      );

      return {
        ...previous,
        [activeCsvTab]: updatedRows,
      };
    });
  };

  const handleSaveTable = async () => {
    const nextTableDataByTab = { ...tableDataByTab };

    if (!isOntologyTab && spreadsheetRef.current?.toJSON) {
      try {
        const spreadsheetJson = spreadsheetRef.current.toJSON();
        const updatedRows = rowsFromSpreadsheetJson(spreadsheetJson);
        if (updatedRows.length > 0) {
          nextTableDataByTab[activeCsvTab] = updatedRows;
        }
      } catch (error) {
        console.error("Unable to read Spreadsheet data before save:", error);
      }
    }

    setTableDataByTab(nextTableDataByTab);

    const tabs = sourceTabs.map((tab) => ({
      tab_name: tab.tab,
      data: nextTableDataByTab[tab.tab] || [],
    }));
    const sessionId = effectiveProps?.sessionId || effectiveProps?.session_id || "";
    const requestBody = {
      session_id: sessionId,
      tabs,
    };

    setIsSaving(true);
    setSaveStatus("");

    console.log("requestBody", requestBody);
    try {
      const response = await fetch("https://func-data-updator.azurewebsites.net/api/update-full-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Save failed with status ${response.status}${errorText ? `: ${errorText}` : ""}`
        );
      }

      setSaveStatus("Saved successfully.");
      setEditModeByTab((previous) => ({
        ...previous,
        [activeCsvTab]: false,
      }));
    } catch (error) {
      setSaveStatus(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (allTabs.length === 0) {
    return (
      <div className="panel-shell">
        <div className="ontology-pane-title">
          {isZipLoading ? "Loading CSV files from ZIP..." : "No tabular data available."}
        </div>
        {!!saveStatus && (
          <div className="table-toolbar">
            <span className="save-status-text">{saveStatus}</span>
          </div>
        )}
      </div>
    );
  }

  const fullArtifactsZipUrl = cleanSasUrl(effectiveProps?.full_artifacts_zip_sas_url);

  return (
    <div className="panel-shell">
      <div className="tab-strip">
        {csvTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`panel-tab ${activeCsvTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveCsvTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="table-toolbar">
        {fullArtifactsZipUrl && (
          <a
            href={fullArtifactsZipUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="edit-table-btn"
            style={{ textDecoration: "none" }}
          >
            Download Full Artifacts
          </a>
        )}
        <button
          type="button"
          className="save-table-btn"
          onClick={handleSaveTable}
          disabled={isSaving || !isEditMode || isOntologyTab}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          className="edit-table-btn"
          onClick={handleToggleEdit}
          disabled={isSaving || !activeCsvTab || isOntologyTab}
        >
          {isEditMode ? "Disable Edit" : "Edit"}
        </button>
        {saveStatus && <span className="save-status-text">{saveStatus}</span>}
      </div>

      <div className="table-wrap">
        {isOntologyTab ? (
          <BehaviorOntologyView ontologyData={ontologyConfig} />
        ) : (
          <Spreadsheet
            ref={spreadsheetRef}
            key={spreadsheetKey}
            style={{ width: "100%", height: 650 }}
            defaultProps={{ sheets: spreadsheetSheets }}
          />
        )}
      </div>
    </div>
  );
};

export default CsvFile;
