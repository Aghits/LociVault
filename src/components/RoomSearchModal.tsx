/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { RoomItem } from "@/data/redditRooms";
import { getSafeImageUrl } from "@/lib/imageUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { Search, Building2, Link as LinkIcon } from "lucide-react";

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
];

export default function RoomSearchModal({
  isOpen,
  onClose,
  onSelectRoom,
  title = "Choose Memory Palace Room",
}: RoomSearchModalProps) {
  const [activeTab, setActiveTab] = useState<string>("reddit");
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

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic);
    if (topic === "inside_mps (All)") {
      setQuery("");
      fetchRooms("", "inside_mps");
    } else {
      setQuery(topic);
      fetchRooms(topic, "search");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      fetchRooms("", "inside_mps");
    } else {
      fetchRooms(query, "search");
    }
  };

  const handlePastedUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedUrl.trim()) return;

    const name = pastedName.trim() || "Custom Locus Room";
    onSelectRoom({ name, imageUrl: pastedUrl.trim() });
    setPastedUrl("");
    setPastedName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="shrink-0 pb-2">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-bold">{title}</DialogTitle>
            <Badge variant="outline" className="text-[10px]">
              Spatial Locus
            </Badge>
          </div>
          <DialogDescription>
            Select a high-resolution interior room to use as a background for your spatial memory palace.
          </DialogDescription>
        </DialogHeader>

        {/* Animated Tabs Switcher */}
        <div className="mb-3 shrink-0">
          <AnimatedTabs
            tabs={[
              {
                id: "reddit",
                label: "Reddit inside_mps Library",
                icon: <Building2 className="h-3.5 w-3.5" />,
              },
              {
                id: "url",
                label: "Custom Room URL",
                icon: <LinkIcon className="h-3.5 w-3.5" />,
              },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="w-full grid grid-cols-2"
            layoutId="room-modal-tabs"
          />
        </div>

        {/* Tab 1: Reddit Room Feed */}
        {activeTab === "reddit" && (
          <div className="flex-1 flex flex-col gap-3 overflow-hidden mt-0">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Filter rooms by style (e.g. Victorian, Library, Modern, Clinic)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <Button type="submit" disabled={isLoading} size="sm" className="h-9 px-4">
                {isLoading ? "Loading..." : "Filter"}
              </Button>
            </form>

            {/* Quick Topic Chips */}
            <div className="flex flex-wrap gap-1.5 shrink-0 max-h-16 overflow-y-auto pr-1">
              {ROOM_SUGGESTIONS.map((topic) => {
                const isActive = selectedTopic === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicClick(topic)}
                    className={`px-2.5 py-0.5 rounded-md border text-[11px] font-medium transition-colors cursor-pointer select-none ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-secondary/60 hover:bg-secondary text-foreground"
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>

            {/* Room Grid */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-[240px]">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-44 rounded-xl bg-muted/60 animate-pulse border border-border" />
                  ))}
                </div>
              ) : rooms.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-xl">
                  <p className="text-xs font-semibold text-foreground">No rooms match &quot;{query}&quot;</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setQuery("");
                      setSelectedTopic("inside_mps (All)");
                      fetchRooms("", "inside_mps");
                    }}
                  >
                    Show All Rooms
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-1">
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => {
                        onSelectRoom({
                          name: room.title.split("(")[0].trim(),
                          imageUrl: room.imageUrl,
                        });
                        onClose();
                      }}
                      className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-primary transition-all duration-200 flex flex-col h-44 shadow-2xs hover:shadow-xs cursor-pointer text-left"
                    >
                      <div className="flex-1 overflow-hidden relative bg-muted">
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
                      <div className="p-2 bg-card border-t border-border/40 shrink-0">
                        <span className="text-[11px] font-semibold text-foreground line-clamp-1 block" title={room.title}>
                          {room.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Room URL */}
        {activeTab === "url" && (
          <div className="flex-1 flex flex-col justify-center py-6 mt-0">
            <form onSubmit={handlePastedUrlSubmit} className="flex flex-col gap-4 max-w-md mx-auto w-full">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="room-url-input" className="text-xs font-semibold text-foreground">
                  Room Photo Direct URL
                </label>
                <Input
                  id="room-url-input"
                  type="url"
                  placeholder="https://example.com/panoramic-living-room.jpg"
                  value={pastedUrl}
                  onChange={(e) => setPastedUrl(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="room-name-input" className="text-xs font-semibold text-foreground">
                  Locus Room Name (Optional)
                </label>
                <Input
                  id="room-name-input"
                  type="text"
                  placeholder="e.g. My Modern Study Room"
                  value={pastedName}
                  onChange={(e) => setPastedName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <Button type="submit" disabled={!pastedUrl.trim()} className="mt-2">
                Use Custom Room
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
