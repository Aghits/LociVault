/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter as useAppRouter } from "next/navigation";
import Link from "next/link";
import { LOCI_TEMPLATES } from "@/data/lociTemplates";
import { RoomItem } from "@/data/redditRooms";
import { getSafeImageUrl } from "@/lib/imageUtils";

export default function NewPalace() {
  const router = useAppRouter();
  const [mode, setMode] = useState<"reddit" | "template">("reddit");
  const [title, setTitle] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("clinic");

  // Reddit inside_mps rooms
  const [redditRooms, setRedditRooms] = useState<RoomItem[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<Array<{ name: string; imageUrl: string }>>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  // Initial load
  useEffect(() => {
    const loadInitialRooms = async () => {
      setIsLoadingRooms(true);
      try {
        const res = await fetch("/api/search-rooms?feed=inside_mps&limit=100");
        if (res.ok) {
          const data = await res.json();
          const list: RoomItem[] = data.rooms || [];
          setRedditRooms(list);

          // Pre-select first 4 rooms as starter palace
          if (list.length >= 4) {
            setSelectedRooms(
              list.slice(0, 4).map((r, idx) => ({
                name: `Room ${idx + 1}: ${r.title.split("(")[0].trim()}`,
                imageUrl: r.imageUrl,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to load Reddit rooms:", err);
      } finally {
        setIsLoadingRooms(false);
      }
    };
    Promise.resolve().then(loadInitialRooms);
  }, []);

  const toggleRoomSelection = (room: RoomItem) => {
    const isSelected = selectedRooms.some((r) => r.imageUrl === room.imageUrl);
    if (isSelected) {
      setSelectedRooms((prev) => prev.filter((r) => r.imageUrl !== room.imageUrl));
    } else {
      setSelectedRooms((prev) => [
        ...prev,
        {
          name: `Spot ${prev.length + 1}: ${room.title.split("(")[0].trim()}`,
          imageUrl: room.imageUrl,
        },
      ]);
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    let loci = [];
    let templateId = "custom";
    let defaultTitle = "My Memory Palace";

    if (mode === "template") {
      const template = LOCI_TEMPLATES.find((t) => t.id === selectedTemplateId);
      if (!template) return;
      templateId = template.id;
      defaultTitle = `${template.title} Palace`;
      loci = template.loci.map((l) => ({
        ...l,
        placements: [],
      }));
    } else {
      if (selectedRooms.length === 0) return;
      templateId = "reddit-inside-mps";
      defaultTitle = "Reddit Interior Palace";
      loci = selectedRooms.map((r, idx) => ({
        id: `locus-custom-${idx + 1}-${Date.now()}`,
        name: r.name || `Locus ${idx + 1}`,
        imageUrl: r.imageUrl,
        description: `Memory spot ${idx + 1} from Reddit inside_mps architecture feed.`,
        placements: [],
      }));
    }

    const finalTitle = title.trim() || defaultTitle;
    const palaceId = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

    const newPalace = {
      id: palaceId,
      title: finalTitle,
      templateId,
      createdAt: new Date().toISOString(),
      lociCount: loci.length,
      loci,
    };

    try {
      const existing = localStorage.getItem("locivault_palaces");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newPalace);
      localStorage.setItem("locivault_palaces", JSON.stringify(list));
      router.push(`/editor/${palaceId}`);
    } catch (err) {
      console.error("Failed to save new palace:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-neutral-200 pb-28">
      {/* Header */}
      <header className="border-b border-border bg-surface px-6 py-4 sm:px-12 flex justify-between items-center shrink-0 sticky top-0 z-30 backdrop-blur-md bg-surface/90">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-semibold tracking-tight text-neutral-900 hover:text-black">
            LociVault
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200 font-medium">
            New Palace
          </span>
        </div>
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
          Back to Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col gap-7">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Create Memory Palace
          </h1>
          <p className="text-sm text-muted">
            Scroll through real rooms from Reddit (`inside_mps`) and tap the ones you want as your sequential memory spots.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col gap-7">
          {/* Palace Title */}
          <div className="flex flex-col gap-2">
            <label htmlFor="palace-title" className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Palace Name / Subject
            </label>
            <input
              id="palace-title"
              type="text"
              placeholder="e.g. Pharmacology: Autonomic Nervous System"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-3.5 bg-surface border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all duration-200"
            />
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
            <button
              type="button"
              onClick={() => setMode("reddit")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                mode === "reddit"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <span>🌟</span>
              <span>Scroll Reddit `inside_mps` Rooms ({redditRooms.length})</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">Live Feed</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("template")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                mode === "template"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <span>🏛️</span>
              <span>Classic Curated Themes</span>
            </button>
          </div>

          {/* Section A: Scrollable Reddit inside_mps Gallery */}
          {mode === "reddit" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">
                    Scroll & Pick Your Locations ({selectedRooms.length} selected)
                  </h2>
                  <p className="text-xs text-muted">
                    Tap any room to toggle it in your sequential memory journey.
                  </p>
                </div>

                {selectedRooms.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedRooms([])}
                    className="text-xs text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              {isLoadingRooms ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-8">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-48 rounded-2xl bg-neutral-100 animate-pulse border border-neutral-200/60" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {redditRooms.map((room) => {
                    const isSelected = selectedRooms.some((r) => r.imageUrl === room.imageUrl);
                    const selectedIndex = selectedRooms.findIndex((r) => r.imageUrl === room.imageUrl);

                    return (
                      <div
                        key={room.id}
                        onClick={() => toggleRoomSelection(room)}
                        className={`group relative rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer h-52 sm:h-56 flex flex-col justify-end p-3 ${
                          isSelected
                            ? "border-neutral-900 ring-3 ring-neutral-900 shadow-lg scale-[1.02]"
                            : "border-neutral-200 hover:border-neutral-400 bg-neutral-100 shadow-2xs hover:shadow-md"
                        }`}
                      >
                        <img
                          src={getSafeImageUrl(room.thumbUrl || room.imageUrl)}
                          alt={room.title}
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                        {/* Selection Badge with Order Number */}
                        <div className="absolute top-2.5 right-2.5">
                          {isSelected ? (
                            <span className="h-7 w-7 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-white">
                              {selectedIndex + 1}
                            </span>
                          ) : (
                            <span className="h-6 w-6 rounded-full bg-black/40 text-white/70 text-xs font-medium flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                              +
                            </span>
                          )}
                        </div>

                        {/* Room Title & Subreddit */}
                        <div className="relative z-10 flex flex-col gap-0.5">
                          {room.subreddit && (
                            <span className="text-[10px] text-neutral-300 font-semibold uppercase tracking-wider truncate">
                              {room.subreddit}
                            </span>
                          )}
                          <span className="text-xs font-bold text-white leading-snug line-clamp-2" title={room.title}>
                            {room.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section B: Classic Curated Themes */}
          {mode === "template" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {LOCI_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-5 rounded-2xl border text-left flex flex-col gap-3 transition-all duration-200 cursor-pointer ${
                    selectedTemplateId === tpl.id
                      ? "border-neutral-900 bg-white shadow-xs ring-2 ring-neutral-100"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-2xl">{tpl.icon}</span>
                    {selectedTemplateId === tpl.id && (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-neutral-900 text-white rounded-md">
                        Selected
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-md">{tpl.title}</h3>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{tpl.description}</p>
                  </div>
                  <div className="text-xs text-neutral-400 border-t border-neutral-100 pt-2 mt-auto w-full">
                    Generates {tpl.loci.length} distinct locations
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Sticky Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-6 py-3.5 shadow-lg flex items-center justify-between max-w-5xl mx-auto rounded-t-2xl sm:bottom-4 sm:border sm:rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-neutral-900">
                {mode === "reddit" ? `${selectedRooms.length} Rooms Chosen` : "5 Locations Template"}
              </span>
              {mode === "reddit" && selectedRooms.length === 0 && (
                <span className="text-xs text-amber-600 font-medium">Select at least 1 room</span>
              )}
            </div>

            <button
              type="submit"
              disabled={mode === "reddit" && selectedRooms.length === 0}
              className="h-10 px-6 bg-neutral-900 text-white rounded-xl font-bold text-xs hover:bg-neutral-800 active:bg-neutral-950 disabled:opacity-50 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Generate Palace</span>
              <span className="text-xs opacity-70">&rarr;</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
