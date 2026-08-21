/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { SearchResultImage } from "@/app/api/search-images/route";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Link as LinkIcon, Sparkles } from "lucide-react";

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

  const handlePastedUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedUrl.trim()) return;

    const name = pastedName.trim() || "Web Image";
    onSelectImage({ name, src: pastedUrl.trim() }, true);
    setPastedUrl("");
    setPastedName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="shrink-0 pb-2">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-bold">Add Mnemonic Image</DialogTitle>
            <Badge variant="outline" className="text-[10px]">
              High-Yield
            </Badge>
          </div>
          <DialogDescription>
            Search medical illustrations or paste an image URL to attach to your memory spots.
          </DialogDescription>
        </DialogHeader>

        {/* Search Mode Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "search" | "url")}
          className="w-full flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="w-full grid grid-cols-2 h-9 mb-3 shrink-0">
            <TabsTrigger value="search" className="text-xs font-semibold gap-1.5">
              <Search className="h-3.5 w-3.5" />
              <span>Search Medical Library</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs font-semibold gap-1.5">
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Direct Image URL</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Live Keyword Search */}
          <TabsContent value="search" className="flex-1 flex flex-col gap-3 overflow-hidden mt-0">
            {/* Search Bar Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(query);
              }}
              className="flex gap-2 shrink-0"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="e.g. Heart, Beta Receptors, Mitochondria, Stethoscope..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <Button type="submit" disabled={isLoading} size="sm" className="h-9 px-4">
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </form>

            {/* Quick Keyword Chips */}
            <div className="flex flex-wrap gap-1.5 shrink-0">
              {POPULAR_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    setQuery(topic);
                    handleSearch(topic);
                  }}
                  className="px-2.5 py-0.5 rounded-md border border-border bg-secondary/60 hover:bg-secondary text-[11px] font-medium text-foreground transition-colors cursor-pointer select-none"
                >
                  {topic}
                </button>
              ))}
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-[220px]">
              {isLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-lg bg-muted/60 animate-pulse border border-border" />
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-xl">
                  <p className="text-xs font-semibold text-foreground">No images found for &quot;{query}&quot;</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Try another search term or paste a direct image URL above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-1">
                  {results.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => {
                        onSelectImage({ name: img.title || "Mnemonic Image", src: img.thumbUrl || img.fullUrl }, true);
                        onClose();
                      }}
                      className="group relative rounded-lg border border-border bg-card overflow-hidden hover:border-primary transition-all duration-200 flex flex-col h-32 shadow-2xs hover:shadow-xs cursor-pointer text-left"
                    >
                      <div className="flex-1 overflow-hidden relative bg-muted">
                        <img
                          src={img.thumbUrl || img.fullUrl}
                          alt={img.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-1.5 bg-card border-t border-border/40 shrink-0">
                        <span className="text-[10px] font-medium text-foreground line-clamp-1 block" title={img.title}>
                          {img.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 2: Direct URL Paste */}
          <TabsContent value="url" className="flex-1 flex flex-col justify-center py-4 mt-0">
            <form onSubmit={handlePastedUrlSubmit} className="flex flex-col gap-4 max-w-md mx-auto w-full">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="url-input" className="text-xs font-semibold text-foreground">
                  Image Direct URL
                </label>
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com/medical-diagram.jpg"
                  value={pastedUrl}
                  onChange={(e) => setPastedUrl(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="url-name" className="text-xs font-semibold text-foreground">
                  Mnemonic Label (Optional)
                </label>
                <Input
                  id="url-name"
                  type="text"
                  placeholder="e.g. Beta-1 Agonist Diagram"
                  value={pastedName}
                  onChange={(e) => setPastedName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <Button type="submit" disabled={!pastedUrl.trim()} className="mt-2">
                Add Image to Library
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
