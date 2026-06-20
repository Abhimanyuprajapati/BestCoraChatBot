import { useMemo, useState } from "react";
import ReactFlow, {
  Controls,
  MarkerType,
  MiniMap,
  useEdgesState,
  useNodesState,
} from "reactflow";
import dagre from "dagre";

import "reactflow/dist/style.css";

import '../style/BehaviorOntologyView.css'

const nodeWidth = 220;
const nodeHeight = 90;

const dagreGraph = new dagre.graphlib.Graph();

dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (entities, relationships) => {
  dagreGraph.setGraph({
    rankdir: "TB",
    ranksep: 120,
    nodesep: 90,
    edgesep: 40,
  });

  // ----------------------------
  // CREATE NODES
  // ----------------------------

  const nodes = entities.map((entity) => {
    dagreGraph.setNode(entity.name, {
      width: nodeWidth,
      height: nodeHeight,
    });

    const isCenter = entity.name === "Customer";

    return {
      id: entity.name,

      data: {
        label: (
          <div className="ontology-node">
            <div className="ontology-node-title">
              ◉ {entity.name}
            </div>

            <div className="ontology-node-key">
              PK: {entity.primary_key}
            </div>
          </div>
        ),
      },

      style: {
        border: isCenter
          ? "3px solid #12766e"
          : "1px solid #dfe5ea",

        borderRadius: "10px",

        background: "#ffffff",

        width: nodeWidth,

        fontSize: 16,

        padding: "10px 12px",

        boxShadow: isCenter
          ? "0 6px 20px rgba(18,118,110,0.20)"
          : "0 2px 10px rgba(22,38,56,0.08)",
      },
    };
  });

  // ----------------------------
  // CREATE EDGES
  // ----------------------------

  const edges = relationships.map((relationship, index) => {
    dagreGraph.setEdge(
      relationship.source_entity,
      relationship.target_entity
    );

    return {
      id: `rel-${index}`,

      source: relationship.source_entity,

      target: relationship.target_entity,

      label: relationship.relationship_name,

      type: "smoothstep",

      animated: true,

      markerEnd: {
        type: MarkerType.ArrowClosed,
      },

      style: {
        stroke: "#b9c2ca",
        strokeWidth: 1.8,
      },

      labelStyle: {
        fontSize: 14,
        fill: "#5a6570",
        fontStyle: "italic",
      },

      labelBgStyle: {
        fill: "#ffffff",
        fillOpacity: 0.95,
      },

      labelBgPadding: [8, 4],

      labelBgBorderRadius: 6,
    };
  });

  // ----------------------------
  // RUN DAGRE LAYOUT
  // ----------------------------

  dagre.layout(dagreGraph);

  // ----------------------------
  // APPLY POSITIONS
  // ----------------------------

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,

      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
};

const BehaviorOntologyView = ({ ontologyData }) => {
  const [activeOntologyTab, setActiveOntologyTab] =
    useState("graph");
  const resolvedOntology = ontologyData;

  const layoutedElements = useMemo(() => {
    return getLayoutedElements(
      resolvedOntology.entities || [],
      resolvedOntology.relationships || []
    );
  }, [resolvedOntology]);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    layoutedElements.nodes
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    layoutedElements.edges
  );

  return (
    <div className="ontology-wrap">
      <div className="ontology-content-pane">
        {activeOntologyTab === "graph" ? (
          <>
            <div className="ontology-pane-title">
              Entity Relationship Graph
            </div>

            <div className="ontology-graph">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                fitViewOptions={{
                  padding: 0.2,
                }}
                nodesDraggable
                panOnDrag
                proOptions={{
                  hideAttribution: true,
                }}
              >
                <MiniMap
                  zoomable
                  pannable
                  nodeStrokeWidth={3}
                />

                <Controls />
              </ReactFlow>
            </div>
          </>
        ) : (
          <>
            <div className="ontology-pane-title">
              RetailCustomerBehaviorOntology (JSON)
            </div>

            <pre className="ontology-json">
              {JSON.stringify(
                resolvedOntology,
                null,
                2
              )}
            </pre>
          </>
        )}
      </div>

      <div className="ontology-bottom-tabs">
        <button
          type="button"
          className={`ontology-tab-btn ${
            activeOntologyTab === "graph"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveOntologyTab("graph")
          }
        >
          Entity Relationship Graph
        </button>

        <button
          type="button"
          className={`ontology-tab-btn ${
            activeOntologyTab === "json"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveOntologyTab("json")
          }
        >
          RetailCustomerBehaviorOntology (JSON)
        </button>
      </div>
    </div>
  );
};

export default BehaviorOntologyView;
