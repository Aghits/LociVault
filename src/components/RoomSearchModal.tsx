/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { RoomItem } from "@/data/redditRooms";
import { getSafeImageUrl } from "@/lib/imageUtils";

interface RoomSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom: (room: { name: string; imageUrl: string }) => void;
  title?: string;
}

const ROOM_SUGGESTIONS = [
  "inside_mps (All)",
  "Victorian Library",
  "Medical Clinic",
  "Cozy Living Room",
  "Grand Hall",
  "Modern Architecture",
  "Laboratory",
  "Old Bookstore",
  "Lecture Hall",
  "Courtyard",
  "Art Museum",
];

export default function RoomSearchModal({
  isOpen,
  onClose,
  onSelectRoom,
  title = "Choose Memory Palace Room",
}: RoomSearchModalProps) {
  const [activeTab, setActiveTab] = useState<"reddit" | "search" | "url">("reddit");
  const [query, setQuery] = useState("");
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("inside_mps (All)");

  // URL paste state
  const [pastedUrl, setPastedUrl] = useState("");
  const [pastedName, setPastedName] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const fetchRooms = async (searchQuery: string = "", feedName: string = "inside_mps") => {
    setIsLoading(true);
    try {
      let endpoint = `/api/search-rooms?feed=${encodeURIComponent(feedName)}&limit=100`;
      if (searchQuery.trim()) {
        endpoint += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      Promise.resolve().then(() => {
        fetchRooms("", "inside_mps");
      });
    }
  }, [isOpen]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic);
    if (topic === "inside_mps (All)") {
      setActiveTab("reddit");
      setQuery("");
      fetchRooms("", "inside_mps");
    } else {
      setActiveTab("search");
      setQuery(topic);
      fetchRooms(topic, "search");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setActiveTab("search");
    fetchRooms(query.trim(), "search");
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedUrl.trim()) return;
    const name = pastedName.trim() || "Custom Palace Room";
    onSelectRoom({ name, imageUrl: pastedUrl.trim() });
    setPastedUrl("");
    setPastedName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 flex flex-col gap-5 relative max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <span>🏛️</span>
              <span>{title}</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium">
              Reddit r/inside_mps ({rooms.length} rooms)
            </span>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center text-sm font-medium transition-colors cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-2 shrink-0">
          <button
            onClick={() => {
              setActiveTab("reddit");
              setSelectedTopic("inside_mps (All)");
              fetchRooms("", "inside_mps");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "reddit"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            🌟 Scroll Reddit inside_mps Feed ({rooms.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("search");
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "search"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            🔍 Search Room Styles
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "url"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            🔗 Paste Room Image Link
          </button>
        </div>

        {/* Topic Suggestion Chips */}
        {activeTab !== "url" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 no-scrollbar">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
              Rooms:
            </span>
            {ROOM_SUGGESTIONS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleTopicClick(topic)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                  selectedTopic === topic
                    ? "bg-neutral-900 text-white shadow-2xs"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        )}

        {/* Search Bar if on Search Tab */}
        {activeTab === "search" && (
          <form onSubmit={handleSearchSubmit} className="flex gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rooms (e.g. vintage library, modern kitchen, operating room, cathedral)..."
              className="flex-1 h-10 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="h-10 px-4 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>
        )}

        {/* Room Gallery Stream with Smooth Scrolling */}
        {activeTab !== "url" && (
          <div className="flex-1 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-44 rounded-xl bg-neutral-100 animate-pulse border border-neutral-200/60"
                  />
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">🏛️</span>
                <p className="text-sm font-semibold text-neutral-800">No rooms found</p>
                <p className="text-xs text-muted max-w-xs">
                  Try scrolling the main feed or searching for general room terms.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pb-2">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => {
                      onSelectRoom({ name: room.title, imageUrl: room.imageUrl });
                      onClose();
                    }}
                    className="group relative rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden hover:border-neutral-900 transition-all duration-200 flex flex-col h-48 shadow-2xs hover:shadow-md cursor-pointer"
                  >
                    <div className="flex-1 overflow-hidden relative bg-neutral-900">
                      <img
                        src={getSafeImageUrl(room.thumbUrl || room.imageUrl)}
                        alt={room.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      {room.subreddit && (
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[9px] font-semibold">
                          {room.subreddit}
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 bg-white border-t border-neutral-100 flex flex-col gap-1">
                      <p className="text-[11px] font-semibold text-neutral-900 truncate leading-tight" title={room.title}>
                        {room.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>{room.source}</span>
                        <span className="text-neutral-900 font-semibold group-hover:underline">Select &rarr;</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Paste Custom Room URL */}
        {activeTab === "url" && (
          <form onSubmit={handleUrlSubmit} className="flex-1 flex flex-col gap-5 py-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pasted-room-url" className="text-xs font-semibold text-neutral-700">
                Room Image Web URL
              </label>
              <input
                id="pasted-room-url"
                type="url"
                required
                value={pastedUrl}
                onChange={(e) => setPastedUrl(e.target.value)}
                placeholder="https://i.redd.it/... or direct link to room image"
                className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pasted-room-name" className="text-xs font-semibold text-neutral-700">
                Room Name / Spot Name
              </label>
              <input
                id="pasted-room-name"
                type="text"
                value={pastedName}
                onChange={(e) => setPastedName(e.target.value)}
                placeholder="e.g. Victorian Library Second Floor"
                className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all"
              />
            </div>

            {pastedUrl && (
              <div className="h-40 rounded-xl bg-neutral-50 border border-neutral-200 p-2 flex items-center justify-center overflow-hidden">
                <img
                  src={pastedUrl}
                  alt="Room Preview"
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={!pastedUrl.trim()}
              className="mt-auto h-11 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 active:bg-neutral-950 disabled:opacity-50 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Use as Palace Room</span>
              <span>&rarr;</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
