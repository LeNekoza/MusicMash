"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import WorkflowEditor from "./components/WorkflowEditor";
import { Track } from "./types";

export default function Home() {
  const { data: session, status } = useSession();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopTracks = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/spotify/top-tracks");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch tracks");
      }

      setTracks(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTopTracks();
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md">
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">MusicMash</h1>
          <p className="text-gray-600 mb-6">
            Create visual playlists by connecting your favorite Spotify tracks
          </p>
          <button
            onClick={() => signIn("spotify")}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            Sign in with Spotify
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading your top tracks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <h2 className="font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={fetchTopTracks}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center flex-shrink-0 dark:bg-neutral-900 dark:border-neutral-700">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🎵</span>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            MusicMash
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Visual Music Workflow
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Welcome, {session.user?.name}
          </span>
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        <WorkflowEditor tracks={tracks} />
      </div>
    </div>
  );
}
