"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  external_urls: { spotify: string };
}

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
    return <div className="p-8">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">MusicMash</h1>
        <p className="mb-4">Sign in with Spotify to see your top tracks</p>
        <button
          onClick={() => signIn("spotify")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Sign in with Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Top Tracks</h1>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading your top tracks...</div>
      ) : (
        <div className="grid gap-4">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center space-x-4 p-4 border rounded"
            >
              <span className="text-lg font-bold w-8">{index + 1}</span>
              {track.album.images[0] && (
                <img
                  src={track.album.images[0].url}
                  alt={track.album.name}
                  className="w-16 h-16 rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{track.name}</h3>
                <p className="text-gray-600">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </p>
                <p className="text-sm text-gray-500">{track.album.name}</p>
              </div>
              <a
                href={track.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Open in Spotify
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
