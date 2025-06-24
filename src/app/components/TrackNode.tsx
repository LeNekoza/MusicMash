import { Handle, Position } from "@xyflow/react";
import { Track } from "../types";

interface TrackNodeData {
  track: Track;
  label: string;
}

export default function TrackNode({ data }: { data: TrackNodeData }) {
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-4 min-w-[250px] hover:border-green-400 transition-colors">
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500"
      />

      <div className="flex items-center space-x-3">
        {data.track?.album?.images?.[0] && (
          <img
            src={data.track.album.images[0].url}
            alt={data.track.album.name}
            className="w-12 h-12 rounded object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate text-gray-900">
            {data.track?.name || data.label}
          </h3>
          {data.track?.artists && (
            <p className="text-xs text-gray-600 truncate">
              {data.track.artists.map((artist) => artist.name).join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
