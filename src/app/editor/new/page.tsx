/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter as useAppRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Sparkles, Building2, BookOpen, Layers } from "lucide-react";
import { LOCI_TEMPLATES } from "@/data/lociTemplates";
import { RoomItem } from "@/data/redditRooms";
import { getSafeImageUrl } from "@/lib/imageUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-neutral-200 pb-32">
      {/* Top Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md px-6 py-3.5 sm:px-12 flex justify-between items-center shrink-0 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-foreground">New Memory Palace</span>
            <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
              Builder
            </Badge>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/">Cancel</Link>
        </Button>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Configure Your Palace
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Name your subject, select distinct loci rooms, and jump straight into pinning your visual mnemonics.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col gap-8">
          {/* Palace Title Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="palace-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Palace Name / Medical Topic
            </label>
            <Input
              id="palace-title"
              type="text"
              placeholder="e.g. Pharmacology: Autonomic Nervous System & Beta Blockers"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-sm bg-card"
            />
          </div>

          {/* Mode Switcher Tabs */}
          <Tabs
            value={mode}
            onValueChange={(val) => setMode(val as "reddit" | "template")}
            className="w-full flex flex-col gap-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
              <TabsList className="h-10 p-1 bg-secondary/80">
                <TabsTrigger value="reddit" className="gap-2 text-xs font-semibold">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Reddit inside_mps Stream</span>
                  <Badge variant="outline" className="text-[9px] py-0 px-1 font-normal bg-card">
                    {redditRooms.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="template" className="gap-2 text-xs font-semibold">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Curated Layouts</span>
                </TabsTrigger>
              </TabsList>

              {mode === "reddit" && selectedRooms.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRooms([])}
                  className="text-xs text-muted-foreground hover:text-destructive self-start sm:self-auto h-7 px-2"
                >
                  Clear Selection ({selectedRooms.length})
                </Button>
              )}
            </div>

            {/* Section A: Scrollable Reddit inside_mps Gallery */}
            <TabsContent value="reddit" className="flex flex-col gap-4 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Select Your Loci Sequence ({selectedRooms.length} selected)
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Tap any room to toggle it in your spatial walkthrough order.
                  </p>
                </div>
              </div>

              {isLoadingRooms ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="h-48 bg-muted/40 animate-pulse border-border shadow-none" />
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
                        className={`group relative rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer h-52 sm:h-56 flex flex-col justify-end p-3.5 select-none ${
                          isSelected
                            ? "border-primary ring-2 ring-primary shadow-md scale-[1.01]"
                            : "border-border hover:border-foreground/40 bg-card shadow-2xs hover:shadow-sm"
                        }`}
                      >
                        <img
                          src={getSafeImageUrl(room.thumbUrl || room.imageUrl)}
                          alt={room.title}
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                        {/* Selection Badge with Order Number */}
                        <div className="absolute top-2.5 right-2.5 z-10">
                          {isSelected ? (
                            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-card">
                              {selectedIndex + 1}
                            </span>
                          ) : (
                            <span className="h-6 w-6 rounded-full bg-black/40 text-white/80 text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                              +
                            </span>
                          )}
                        </div>

                        {/* Room Title & Subreddit */}
                        <div className="relative z-10 flex flex-col gap-0.5 pointer-events-none">
                          {room.subreddit && (
                            <span className="text-[10px] text-white/70 font-semibold tracking-wider truncate">
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
            </TabsContent>

            {/* Section B: Curated Classic Themes */}
            <TabsContent value="template" className="grid gap-4 sm:grid-cols-2 mt-0">
              {LOCI_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <Card
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary shadow-xs"
                        : "hover:border-foreground/40 shadow-2xs"
                    }`}
                  >
                    <CardHeader className="p-5">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl">{tpl.icon}</span>
                        {isSelected && (
                          <Badge variant="default" className="text-[10px] gap-1">
                            <Check className="h-3 w-3" /> Selected
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base font-bold mt-2">{tpl.title}</CardTitle>
                      <CardDescription>{tpl.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <div className="text-xs text-muted-foreground border-t border-border pt-3 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        <span>Generates {tpl.loci.length} distinct sequential rooms</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>

          {/* Sticky Bottom Dock */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border p-4 shadow-lg">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  {mode === "reddit" ? `${selectedRooms.length} Locations Selected` : "Curated Preset Template"}
                </span>
                {mode === "reddit" && selectedRooms.length === 0 && (
                  <Badge variant="destructive" className="text-[10px]">
                    Pick at least 1 room
                  </Badge>
                )}
              </div>

              <Button
                type="submit"
                disabled={mode === "reddit" && selectedRooms.length === 0}
                size="default"
                className="shadow-sm"
              >
                <span>Generate Palace</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
