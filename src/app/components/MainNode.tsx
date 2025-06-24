import { Handle, Position } from "@xyflow/react";

export default function MainNode() {
  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-xl border-2 border-green-400 p-6 min-w-[300px] text-white">
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 bg-white"
      />

      <div className="text-center">
        <div className="text-2xl mb-2">🧠</div>
        <h2 className="font-bold text-lg mb-1">Main Node</h2>
        <p className="text-green-100 text-sm">Connect here to start</p>
      </div>
    </div>
  );
}
