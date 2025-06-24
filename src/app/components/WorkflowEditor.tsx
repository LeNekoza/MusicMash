"use client";

import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import TrackNode from "./TrackNode";
import MainNode from "./MainNode";
import { Track } from "../types";
import Image from "next/image";

const nodeTypes = {
  trackNode: TrackNode,
  mainNode: MainNode,
};

interface WorkflowEditorProps {
  tracks: Track[];
}

const initialNodes: Node[] = [
  {
    id: "main",
    type: "mainNode",
    position: { x: 400, y: 100 },
    data: { label: "Main Node" },
    deletable: false,
  },
];

const initialEdges: Edge[] = [];

export default function WorkflowEditor({ tracks }: WorkflowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  /*  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null); */

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addTrackNode = useCallback(
    (track: Track) => {
      // Check if node already exists
      const exists = nodes.some((node) => node.id === `track-${track.id}`);
      if (exists) {
        alert("This track is already added to the workflow!");
        return;
      }

      // Find the main node position
      const mainNode = nodes.find((node) => node.id === "main");
      const mainX = mainNode?.position.x || 400;
      const mainY = mainNode?.position.y || 100;

      // Count existing track nodes to determine angle
      const trackNodeCount = nodes.filter(
        (node) => node.type === "trackNode"
      ).length;

      // Position nodes in a circle around the main node
      const radius = 200;
      const angle = trackNodeCount * (360 / 8) * (Math.PI / 180); // 8 positions around circle
      const offsetX = Math.cos(angle) * radius;
      const offsetY = Math.sin(angle) * radius;

      const newNode: Node = {
        id: `track-${track.id}`,
        type: "trackNode",
        position: {
          x: mainX + offsetX,
          y: mainY + offsetY,
        },
        data: { track, label: track.name },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, nodes]
  );

  const clearWorkspace = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to clear the entire workspace? This action cannot be undone."
      )
    ) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      localStorage.removeItem("musicmash-workflow");
    }
  }, [setNodes, setEdges]);

  const exportWorkflow = useCallback(() => {
    const workflowData = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "musicmash-workflow.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  // Load saved workflow from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("musicmash-workflow");
    if (saved) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
        setNodes(savedNodes || initialNodes);
        setEdges(savedEdges || initialEdges);
      } catch (e) {
        console.warn("Failed to load saved workflow:", e);
      }
    }
  }, [setNodes, setEdges]);

  // Save workflow to localStorage
  useEffect(() => {
    const saveWorkflow = () => {
      localStorage.setItem(
        "musicmash-workflow",
        JSON.stringify({ nodes, edges })
      );
    };

    const timeoutId = setTimeout(saveWorkflow, 1000);
    return () => clearTimeout(timeoutId);
  }, [nodes, edges]);

  const connectedTracks = edges.filter((edge) => edge.target === "main").length;

  return (
    <div className="h-full flex">
      {/* Sidebar with track list */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 dark:bg-neutral-900 dark:border-neutral-700 flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="font-bold text-lg mb-2">Your Top Tracks</h3>
          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <span>{tracks.length} tracks available</span>
            <span>{connectedTracks} connected</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={clearWorkspace}
              className="flex-1 bg-red-500 text-white text-xs px-3 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={exportWorkflow}
              className="flex-1 bg-blue-500 text-white text-xs px-3 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Export
            </button>
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4">
            <div className="space-y-2">
              {tracks.map((track, index) => {
                const isAdded = nodes.some(
                  (node) => node.id === `track-${track.id}`
                );
                return (
                  <div
                    key={track.id}
                    className={`flex items-center space-x-3 p-3 rounded border transition-colors ${
                      isAdded
                        ? "bg-green-50 border-green-200 dark:bg-neutral-800 dark:border-neutral-700"
                        : "bg-white border-gray-200 hover:border-green-400 cursor-pointer dark:bg-neutral-800 dark:border-neutral-700"
                    }`}
                    onClick={() => !isAdded && addTrackNode(track)}
                  >
                    <span className="text-sm font-bold w-6">{index + 1}</span>
                    {track.album.images[0] && (
                      <Image
                        width={40}
                        height={40}
                        src={track.album.images[0].url}
                        alt={track.album.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {track.name}
                      </h4>
                      <p className="text-xs text-gray-600 truncate">
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </p>
                    </div>
                    {isAdded ? (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Added
                      </span>
                    ) : (
                      <button className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600 transition-colors">
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 relative h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-100"
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.2}
          maxZoom={2}
          deleteKeyCode="Delete"
          proOptions={{
            hideAttribution: true,
          }}
        >
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case "mainNode":
                  return "#10b981";
                case "trackNode":
                  return "#f3f4f6";
                default:
                  return "#e5e7eb";
              }
            }}
            className="!bg-white !border-2 !border-gray-300"
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            className="!bg-gray-50"
          />
        </ReactFlow>

        {/* Floating Instructions */}
        {nodes.length === 1 && edges.length === 0 && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-4 max-w-xs">
            <h4 className="font-semibold text-sm mb-2 dark:text-black">
              Getting Started
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Click tracks from the sidebar to add them</li>
              <li>• Drag connection handles to link tracks</li>
              <li>• Use mouse wheel to zoom</li>
              <li>• Press Delete to remove selected items</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
