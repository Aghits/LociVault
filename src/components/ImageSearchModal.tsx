/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { SearchResultImage } from "@/app/api/search-images/route";

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (image: { name: string; src: string }, addToCanvasDirectly?: boolean) => void;
}

const POPULAR_TOPICS = [
  "Heart Anatomy",
  "Brain",
  "Neuron",
  "Pill Capsule",
  "Stethoscope",
  "Lungs",
  "Microscope",
  "Bacteria",
  "DNA Helix",
  "Kidney",
  "Syringe",
  "Eye Anatomy",
];

export default function ImageSearchModal({
  isOpen,
  onClose,
  onSelectImage,
}: ImageSearchModalProps) {
  const [activeTab, setActiveTab] = useState<"search" | "url">("search");
  const [query, setQuery] = useState("Heart");
  const [results, setResults] = useState<SearchResultImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Direct URL paste state
  const [pastedUrl, setPastedUrl] = useState("");
  const [pastedName, setPastedName] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search-images?q=${encodeURIComponent(searchQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (!hasSearched) {
        Promise.resolve().then(() => {
          handleSearch("Heart");
        });
      }
    }
  }, [isOpen, hasSearched]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handlePastedUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedUrl.trim()) return;

    const name = pastedName.trim() || "Web Image";
    onSelectImage({ name, src: pastedUrl.trim() }, true);
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
        className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 flex flex-col gap-5 relative max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <span>🔍</span>
              <span>Find Online Images</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              100% Free Live Web Search
            </span>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center text-sm font-medium transition-colors"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-2 shrink-0">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "search"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Live Web Image Search
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "url"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Paste Image Link (Google Images)
          </button>
        </div>

        {/* Tab 1: Live Web Search */}
        {activeTab === "search" && (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Search Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(query);
              }}
              className="flex gap-2 shrink-0"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search millions of images (e.g. acetylcholine, kidney, skeleton, aspirin)..."
                  className="w-full h-11 pl-4 pr-10 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs p-1"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="h-11 px-5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 active:bg-neutral-950 disabled:opacity-50 transition-colors shadow-xs shrink-0 flex items-center gap-1.5"
              >
                {isLoading ? "Searching..." : "Search Web"}
              </button>
            </form>

            {/* Quick Suggestion Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 no-scrollbar">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
                Quick:
              </span>
              {POPULAR_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    setQuery(topic);
                    handleSearch(topic);
                  }}
                  className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium transition-colors shrink-0 whitespace-nowrap"
                >
                  {topic}
                </button>
              ))}
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-36 rounded-xl bg-neutral-100 animate-pulse border border-neutral-200/60"
                    />
                  ))}
                </div>
              ) : results.length === 0 && hasSearched ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                  <span className="text-3xl">🔍</span>
                  <p className="text-sm font-semibold text-neutral-800">No images found</p>
                  <p className="text-xs text-muted max-w-xs">
                    Try searching for broader medical terms or common object names.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-2">
                  {results.map((img) => (
                    <div
                      key={img.id}
                      className="group relative rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden hover:border-neutral-900 transition-all duration-200 flex flex-col justify-between h-40 shadow-2xs hover:shadow-md"
                    >
                      <div className="flex-1 overflow-hidden p-2 flex items-center justify-center bg-white">
                        <img
                          src={img.thumbUrl}
                          alt={img.title}
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain rounded transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      <div className="p-2 bg-white border-t border-neutral-100 flex flex-col gap-1">
                        <p className="text-[11px] font-medium text-neutral-800 truncate leading-tight" title={img.title}>
                          {img.title}
                        </p>
                        <div className="flex items-center justify-between gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectImage({ name: img.title, src: img.fullUrl || img.thumbUrl }, true);
                              onClose();
                            }}
                            className="flex-1 py-1 px-1.5 bg-neutral-900 text-white rounded text-[10px] font-semibold hover:bg-neutral-800 transition-colors text-center"
                            title="Place directly in the current locus"
                          >
                            + Place
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectImage({ name: img.title, src: img.fullUrl || img.thumbUrl }, false);
                              onClose();
                            }}
                            className="py-1 px-1.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded text-[10px] font-medium transition-colors"
                            title="Add to Mnemonic Library sidebar"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Paste Image Link */}
        {activeTab === "url" && (
          <form onSubmit={handlePastedUrlSubmit} className="flex-1 flex flex-col gap-5 py-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pasted-url" className="text-xs font-semibold text-neutral-700">
                Image Web Address (URL)
              </label>
              <input
                id="pasted-url"
                type="url"
                required
                value={pastedUrl}
                onChange={(e) => setPastedUrl(e.target.value)}
                placeholder="https://example.com/image.png or copy image address from Google..."
                className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all"
              />
              <p className="text-[11px] text-muted">
                Tip: On Google Images, right-click any picture and select <strong>&quot;Copy Image Address&quot;</strong>, then paste it here.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pasted-name" className="text-xs font-semibold text-neutral-700">
                Mnemonic Name (Optional)
              </label>
              <input
                id="pasted-name"
                type="text"
                value={pastedName}
                onChange={(e) => setPastedName(e.target.value)}
                placeholder="e.g. Acetylcholine Receptors"
                className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all"
              />
            </div>

            {pastedUrl && (
              <div className="h-32 rounded-xl bg-neutral-50 border border-neutral-200 p-2 flex items-center justify-center overflow-hidden">
                <img
                  src={pastedUrl}
                  alt="Preview"
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
              className="mt-auto h-11 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 active:bg-neutral-950 disabled:opacity-50 transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Import & Place Image</span>
              <span>&rarr;</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
