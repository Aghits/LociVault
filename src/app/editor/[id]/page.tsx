/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ImageSearchModal from "@/components/ImageSearchModal";
import RoomSearchModal from "@/components/RoomSearchModal";
import { getSafeImageUrl } from "@/lib/imageUtils";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Search,
  Upload,
  Image as ImageIcon,
  FileText,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Layers,
  Sparkles,
  X,
} from "lucide-react";

interface Mnemonic {
  id: string;
  name: string;
  src: string;
}

interface Placement {
  id: string;
  mnemonicId: string;
  name: string;
  src: string;
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  size?: number; // size in px (default: 80)
  note?: string; // custom study note
}

interface Locus {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  placements: Placement[];
}

interface Palace {
  id: string;
  title: string;
  templateId: string;
  createdAt: string;
  lociCount: number;
  loci: Locus[];
}

export default function PalaceEditor() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [palace, setPalace] = useState<Palace | null>(null);
  const [activeLocusIndex, setActiveLocusIndex] = useState(0);

  // Custom uploaded mnemonics library
  const [mnemonicLibrary, setMnemonicLibrary] = useState<Mnemonic[]>([]);
  const [selectedMnemonic, setSelectedMnemonic] = useState<Mnemonic | null>(null);

  // Selected placement on canvas
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);

  // Expanded Image & Note Modal state
  const [expandedPlacementId, setExpandedPlacementId] = useState<string | null>(null);

  // Online Image Search Modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Room Search / Change Modal state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomModalMode, setRoomModalMode] = useState<"swap" | "add">("swap");

  // Image Fit mode (contain = 100% uncropped full image, cover = fill entire screen)
  const [imageFit, setImageFit] = useState<"contain" | "cover">("contain");

  // Delete Confirmation Modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Dragging placement state
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingPlacementRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
    rect: DOMRect;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  // Load palace on mount
  useEffect(() => {
    if (!id) return;
    const initializeData = () => {
      try {
        const saved = localStorage.getItem("locivault_palaces");
        if (saved) {
          const list = JSON.parse(saved) as Palace[];
          const found = list.find((p) => p.id === id);
          if (found) {
            const formattedLoci = found.loci.map((l) => ({
              ...l,
              placements: (l.placements || []).map((p) => ({
                ...p,
                size: p.size || 80,
                note: p.note || "",
              })),
            }));
            setPalace({ ...found, loci: formattedLoci });
          } else {
            router.push("/");
          }
        } else {
          router.push("/");
        }

        // Load general custom mnemonics from localStorage if any
        const savedMnemonics = localStorage.getItem("locivault_custom_mnemonics");
        if (savedMnemonics) {
          setMnemonicLibrary(JSON.parse(savedMnemonics));
        } else {
          const defaultMnemonics: Mnemonic[] = [
            {
              id: "m-1",
              name: "Beta Blocker (B-Pill)",
              src: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
            },
            {
              id: "m-2",
              name: "Calcium Channel (Heart)",
              src: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=400&q=80",
            },
            {
              id: "m-3",
              name: "Stethoscope Diagnostic",
              src: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80",
            },
          ];
          setMnemonicLibrary(defaultMnemonics);
          localStorage.setItem("locivault_custom_mnemonics", JSON.stringify(defaultMnemonics));
        }
      } catch (e) {
        console.error("Failed to load palace editor:", e);
      }
    };
    Promise.resolve().then(initializeData);
  }, [id, router]);

  // Save changes back to localStorage
  const handleSave = () => {
    if (!palace) return;
    setIsSaving(true);
    try {
      const saved = localStorage.getItem("locivault_palaces");
      if (saved) {
        const list = JSON.parse(saved) as Palace[];
        const index = list.findIndex((p) => p.id === palace.id);
        if (index !== -1) {
          list[index] = palace;
          localStorage.setItem("locivault_palaces", JSON.stringify(list));
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      } else {
        setSaveStatus("error");
      }
    } catch (e) {
      console.error(e);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleDeleteCurrentPalace = () => {
    if (!palace) return;
    try {
      const saved = localStorage.getItem("locivault_palaces");
      if (saved) {
        const list = JSON.parse(saved) as Palace[];
        const updated = list.filter((p) => p.id !== palace.id);
        localStorage.setItem("locivault_palaces", JSON.stringify(updated));
      }
      router.push("/");
    } catch (err) {
      console.error("Failed to delete palace:", err);
    }
  };

  // Upload custom mnemonic image file
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const src = uploadEvent.target?.result as string;
      if (!src) return;

      const newMnemonic: Mnemonic = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        src,
      };

      const updated = [newMnemonic, ...mnemonicLibrary];
      setMnemonicLibrary(updated);
      localStorage.setItem("locivault_custom_mnemonics", JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  // Add image chosen from online search modal
  const handleSelectOnlineImage = (
    image: { name: string; src: string },
    addToCanvasDirectly: boolean = false
  ) => {
    const newMnemonic: Mnemonic = {
      id: `online-${Date.now()}`,
      name: image.name,
      src: image.src,
    };

    const updated = [newMnemonic, ...mnemonicLibrary];
    setMnemonicLibrary(updated);
    localStorage.setItem("locivault_custom_mnemonics", JSON.stringify(updated));

    if (addToCanvasDirectly) {
      placeMnemonicAtCoords(50, 50, newMnemonic);
    }
  };

  // Place mnemonic at specific canvas percentage coordinates (x: 0-100, y: 0-100)
  const placeMnemonicAtCoords = useCallback(
    (x: number, y: number, mnemonic: Mnemonic) => {
      if (!palace) return;

      const placementId = `placement-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newPlacement: Placement = {
        id: placementId,
        mnemonicId: mnemonic.id,
        name: mnemonic.name,
        src: mnemonic.src,
        x: Math.max(2, Math.min(98, x)),
        y: Math.max(2, Math.min(98, y)),
        size: 80,
        note: "",
      };

      const updatedLoci = [...palace.loci];
      updatedLoci[activeLocusIndex].placements = [
        ...updatedLoci[activeLocusIndex].placements,
        newPlacement,
      ];

      setPalace({ ...palace, loci: updatedLoci });
      setSelectedPlacementId(placementId);
      setSelectedMnemonic(null);
    },
    [palace, activeLocusIndex]
  );

  // Swap Room or Add New Room
  const handleSelectRoom = (room: { name: string; imageUrl: string }) => {
    if (!palace) return;

    if (roomModalMode === "swap") {
      const updatedLoci = [...palace.loci];
      updatedLoci[activeLocusIndex] = {
        ...updatedLoci[activeLocusIndex],
        name: room.name,
        imageUrl: room.imageUrl,
      };
      setPalace({ ...palace, loci: updatedLoci });
    } else {
      const newLocus: Locus = {
        id: `locus-${Date.now()}`,
        name: room.name,
        imageUrl: room.imageUrl,
        description: `Memory spot ${palace.loci.length + 1} from architecture library.`,
        placements: [],
      };
      const updatedLoci = [...palace.loci, newLocus];
      setPalace({
        ...palace,
        lociCount: updatedLoci.length,
        loci: updatedLoci,
      });
      setActiveLocusIndex(updatedLoci.length - 1);
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!palace || !canvasRef.current) return;

    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (!dataStr) return;
      const mnemonic = JSON.parse(dataStr) as Mnemonic;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      placeMnemonicAtCoords(x, y, mnemonic);
    } catch (err) {
      console.error("Drop failed:", err);
    }
  };

  // Tap / Click to Place
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedMnemonic || !palace || !canvasRef.current) {
      setSelectedPlacementId(null);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    placeMnemonicAtCoords(x, y, selectedMnemonic);
  };

  const handleRemovePlacement = (placementId: string) => {
    if (!palace) return;

    const updatedLoci = [...palace.loci];
    updatedLoci[activeLocusIndex].placements = updatedLoci[activeLocusIndex].placements.filter(
      (p) => p.id !== placementId
    );

    setPalace({ ...palace, loci: updatedLoci });
    if (selectedPlacementId === placementId) {
      setSelectedPlacementId(null);
    }
    if (expandedPlacementId === placementId) {
      setExpandedPlacementId(null);
    }
  };

  const handleChangePlacementSize = (placementId: string, newSize: number) => {
    if (!palace) return;

    const updatedLoci = [...palace.loci];
    updatedLoci[activeLocusIndex].placements = updatedLoci[activeLocusIndex].placements.map((p) =>
      p.id === placementId ? { ...p, size: newSize } : p
    );

    setPalace({ ...palace, loci: updatedLoci });
  };

  const handleUpdatePlacementNote = (placementId: string, note: string) => {
    if (!palace) return;

    const updatedLoci = [...palace.loci];
    updatedLoci[activeLocusIndex].placements = updatedLoci[activeLocusIndex].placements.map((p) =>
      p.id === placementId ? { ...p, note } : p
    );

    setPalace({ ...palace, loci: updatedLoci });
  };

  const handleUpdatePlacementName = (placementId: string, name: string) => {
    if (!palace) return;

    const updatedLoci = [...palace.loci];
    updatedLoci[activeLocusIndex].placements = updatedLoci[activeLocusIndex].placements.map((p) =>
      p.id === placementId ? { ...p, name } : p
    );

    setPalace({ ...palace, loci: updatedLoci });
  };

  // --- REPOSITIONING (DRAGGING PLACED IMAGES AROUND THE CANVAS) ---
  const handlePlacementMouseDown = (e: React.MouseEvent, placementId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!canvasRef.current || !palace) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const placement = palace.loci[activeLocusIndex].placements.find((p) => p.id === placementId);
    if (!placement) return;

    setSelectedPlacementId(placementId);
    setSelectedMnemonic(null);

    draggingPlacementRef.current = {
      id: placementId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: placement.x,
      initialY: placement.y,
      hasMoved: false,
      rect,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!draggingPlacementRef.current || !canvasRef.current) return;
      const { id: dragId, startX, startY, initialX, initialY, rect: cRect } = draggingPlacementRef.current;

      const dist = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
      if (dist > 4) {
        draggingPlacementRef.current.hasMoved = true;
      }

      const deltaXPercent = ((moveEvent.clientX - startX) / cRect.width) * 100;
      const deltaYPercent = ((moveEvent.clientY - startY) / cRect.height) * 100;

      const newX = Math.max(2, Math.min(98, initialX + deltaXPercent));
      const newY = Math.max(2, Math.min(98, initialY + deltaYPercent));

      setPalace((prev) => {
        if (!prev) return prev;
        const currentLoci = [...prev.loci];
        const locusPlacements = currentLoci[activeLocusIndex].placements.map((p) =>
          p.id === dragId ? { ...p, x: newX, y: newY } : p
        );
        currentLoci[activeLocusIndex] = {
          ...currentLoci[activeLocusIndex],
          placements: locusPlacements,
        };
        return { ...prev, loci: currentLoci };
      });
    };

    const handleMouseUp = () => {
      if (draggingPlacementRef.current && !draggingPlacementRef.current.hasMoved) {
        setExpandedPlacementId(placementId);
      }
      draggingPlacementRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Touch Support for Mobile / Tablet Dragging
  const handlePlacementTouchStart = (e: React.TouchEvent, placementId: string) => {
    e.stopPropagation();
    if (!canvasRef.current || !palace || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const placement = palace.loci[activeLocusIndex].placements.find((p) => p.id === placementId);
    if (!placement) return;

    setSelectedPlacementId(placementId);
    setSelectedMnemonic(null);

    draggingPlacementRef.current = {
      id: placementId,
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: placement.x,
      initialY: placement.y,
      hasMoved: false,
      rect,
    };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!draggingPlacementRef.current || moveEvent.touches.length !== 1) return;
      const t = moveEvent.touches[0];
      const { id: dragId, startX, startY, initialX, initialY, rect: cRect } = draggingPlacementRef.current;

      const dist = Math.hypot(t.clientX - startX, t.clientY - startY);
      if (dist > 4) {
        draggingPlacementRef.current.hasMoved = true;
      }

      const deltaXPercent = ((t.clientX - startX) / cRect.width) * 100;
      const deltaYPercent = ((t.clientY - startY) / cRect.height) * 100;

      const newX = Math.max(2, Math.min(98, initialX + deltaXPercent));
      const newY = Math.max(2, Math.min(98, initialY + deltaYPercent));

      setPalace((prev) => {
        if (!prev) return prev;
        const currentLoci = [...prev.loci];
        const locusPlacements = currentLoci[activeLocusIndex].placements.map((p) =>
          p.id === dragId ? { ...p, x: newX, y: newY } : p
        );
        currentLoci[activeLocusIndex] = {
          ...currentLoci[activeLocusIndex],
          placements: locusPlacements,
        };
        return { ...prev, loci: currentLoci };
      });
    };

    const handleTouchEnd = () => {
      if (draggingPlacementRef.current && !draggingPlacementRef.current.hasMoved) {
        setExpandedPlacementId(placementId);
      }
      draggingPlacementRef.current = null;
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  if (!palace) {
    return (
      <div className="min-h-screen bg-background text-muted-foreground flex items-center justify-center font-sans">
        <p className="text-sm font-medium animate-pulse">Loading memory palace editor...</p>
      </div>
    );
  }

  const activeLocus = palace.loci[activeLocusIndex];
  const activePlacement = activeLocus.placements.find((p) => p.id === selectedPlacementId);
  const expandedPlacement = activeLocus.placements.find((p) => p.id === expandedPlacementId);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-neutral-200">
      {/* Top Header */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md px-4 sm:px-8 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </Button>

          <span className="text-muted-foreground text-xs">/</span>

          <Input
            id="palace-editor-title"
            type="text"
            value={palace.title}
            onChange={(e) => setPalace({ ...palace, title: e.target.value })}
            className="h-8 text-xs font-bold bg-transparent border-transparent hover:border-border focus:border-primary px-2 transition-all max-w-[200px] sm:max-w-xs md:max-w-md truncate"
            title="Click to rename palace"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {saveStatus === "saved" && (
            <Badge variant="success" className="text-[10px] gap-1">
              <Check className="h-2.5 w-2.5" /> Saved
            </Badge>
          )}
          {saveStatus === "error" && (
            <Badge variant="destructive" className="text-[10px]">
              Save Failed
            </Badge>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Delete this memory palace"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span>Delete</span>
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="h-8 text-xs shadow-xs"
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            <span>{isSaving ? "Saving..." : "Save Palace"}</span>
          </Button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Mnemonic Sidebar (Drag Source) */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card p-4 flex flex-col gap-4 select-none shrink-0 overflow-y-auto max-h-[35vh] md:max-h-none">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Mnemonics
              </h2>
              <Badge variant="secondary" className="text-[10px]">
                {mnemonicLibrary.length}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Drag images onto the room, or tap to place.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1.5">
            <Button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              size="sm"
              className="w-full justify-start text-xs h-8"
            >
              <Search className="h-3.5 w-3.5 mr-2" />
              <span>Search Online Images</span>
            </Button>

            <label
              htmlFor="mnemonic-uploader"
              className="w-full h-8 rounded-md border border-border hover:border-foreground/30 bg-card shadow-2xs flex items-center justify-start px-3 gap-2 text-xs font-medium text-foreground cursor-pointer hover:bg-accent transition-colors"
            >
              <Upload className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Upload Custom File</span>
            </label>
            <input
              id="mnemonic-uploader"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <Separator />

          {/* Mnemonic Item List */}
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
            {mnemonicLibrary.map((m) => {
              const isSelected = selectedMnemonic?.id === m.id;
              return (
                <div
                  key={m.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/json", JSON.stringify(m));
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => setSelectedMnemonic(isSelected ? null : m)}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border text-left cursor-grab active:cursor-grabbing transition-all select-none group ${
                    isSelected
                      ? "border-primary bg-accent ring-1 ring-primary shadow-xs"
                      : "border-border bg-card hover:border-foreground/30 hover:bg-secondary/40 shadow-2xs"
                  }`}
                  title="Drag onto room or tap to place"
                >
                  <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border/40">
                    <img
                      src={m.src}
                      alt={m.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">Drag to room</p>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-bold shrink-0">
                      Active
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center Main Room Canvas Area */}
        <main className="flex-1 p-4 sm:p-6 flex flex-col gap-4 bg-muted/20 overflow-hidden">
          {/* Locus Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground">
                  Locus {activeLocusIndex + 1} of {palace.loci.length}: {activeLocus.name}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRoomModalMode("swap");
                    setIsRoomModalOpen(true);
                  }}
                  className="h-6 px-2 text-[10px] font-semibold"
                  title="Swap background room with another from architecture library"
                >
                  <ImageIcon className="h-3 w-3 mr-1" />
                  <span>Swap Room</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImageFit((prev) => (prev === "contain" ? "cover" : "contain"))}
                  className="h-6 px-2 text-[10px] font-semibold"
                  title={imageFit === "contain" ? "Switch to Fill View" : "Switch to Fit View"}
                >
                  <Maximize2 className="h-3 w-3 mr-1" />
                  <span>{imageFit === "contain" ? "Fit View" : "Fill View"}</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{activeLocus.description}</p>
            </div>

            {/* Selected Placement Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {activePlacement && (
                <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2.5 py-1 text-xs shadow-2xs">
                  <span className="text-muted-foreground font-medium text-[11px] truncate max-w-[80px]">
                    {activePlacement.name}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setExpandedPlacementId(activePlacement.id)}
                    className="h-6 px-2 text-[10px] gap-1 font-semibold"
                    title="Edit Study Note"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Note</span>
                  </Button>
                  <Separator orientation="vertical" className="h-3.5 mx-0.5" />
                  <Button
                    variant={activePlacement.size === 60 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleChangePlacementSize(activePlacement.id, 60)}
                    className="h-6 w-6 p-0 text-[10px] font-bold"
                  >
                    S
                  </Button>
                  <Button
                    variant={(activePlacement.size || 80) === 80 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleChangePlacementSize(activePlacement.id, 80)}
                    className="h-6 w-6 p-0 text-[10px] font-bold"
                  >
                    M
                  </Button>
                  <Button
                    variant={activePlacement.size === 120 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleChangePlacementSize(activePlacement.id, 120)}
                    className="h-6 w-6 p-0 text-[10px] font-bold"
                  >
                    L
                  </Button>
                  <Separator orientation="vertical" className="h-3.5 mx-0.5" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePlacement(activePlacement.id)}
                    className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Remove from room"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <Badge variant="outline" className="text-[11px] font-medium bg-card gap-1">
                <AnimatedCounter value={activeLocus.placements.length} />
                <span>{activeLocus.placements.length === 1 ? "mnemonic" : "mnemonics"} placed</span>
              </Badge>
            </div>
          </div>

          {/* Interactive Loci Drop Zone Canvas Container */}
          <div className="flex-1 min-h-[360px] relative rounded-2xl border border-border overflow-hidden bg-neutral-950 flex items-center justify-center p-2 select-none shadow-inner">
            {/* The Image Frame with Placements */}
            <div
              ref={canvasRef}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              onClick={handleCanvasClick}
              className={`relative ${
                imageFit === "contain"
                  ? "max-h-[calc(100vh-250px)] max-w-full flex items-center justify-center rounded-xl overflow-hidden shadow-2xl"
                  : "w-full h-full rounded-xl overflow-hidden"
              } ${selectedMnemonic ? "cursor-crosshair" : "cursor-default"}`}
            >
              {/* Background Locus Image */}
              <img
                src={getSafeImageUrl(activeLocus.imageUrl)}
                alt={activeLocus.name}
                referrerPolicy="no-referrer"
                className={`select-none pointer-events-none ${
                  imageFit === "contain"
                    ? "max-h-[calc(100vh-250px)] max-w-full w-auto h-auto object-contain block rounded-xl"
                    : "w-full h-full object-cover block"
                }`}
                draggable={false}
              />

              {/* Placements Layer: Rendered as Plain Images */}
              {activeLocus.placements.map((p) => {
                const isSelected = selectedPlacementId === p.id;
                const size = p.size || 80;
                const hasNote = Boolean(p.note && p.note.trim().length > 0);

                return (
                  <div
                    key={p.id}
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                    }}
                    onMouseDown={(e) => handlePlacementMouseDown(e, p.id)}
                    onTouchStart={(e) => handlePlacementTouchStart(e, p.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlacementId(p.id);
                    }}
                    className={`absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing group transition-transform ${
                      isSelected ? "ring-2 ring-primary ring-offset-2 scale-105 z-30" : "hover:scale-105 z-20"
                    }`}
                    title={`${p.name} (Click to expand & note)`}
                  >
                    {/* Plain Image Container */}
                    <div className="w-full h-full rounded-lg overflow-hidden bg-card/95 backdrop-blur-xs p-1.5 border border-border shadow-md flex items-center justify-center select-none relative">
                      <img
                        src={p.src}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain pointer-events-none select-none rounded"
                        draggable={false}
                      />

                      {/* Note Indicator Badge */}
                      {hasNote && (
                        <span
                          className="absolute top-1 left-1 h-3.5 w-3.5 rounded-full bg-amber-400 border border-card flex items-center justify-center text-[8px] shadow-xs"
                          title="Has study note"
                        >
                          📝
                        </span>
                      )}
                    </div>

                    {/* Floating Name Label on hover / selected */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-neutral-900/90 backdrop-blur-xs text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xs z-30 max-w-[140px] truncate">
                      {p.name}
                    </div>

                    {/* Quick Delete Badge */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePlacement(p.id);
                      }}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-card border border-border text-muted-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive shadow-xs flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all z-30 cursor-pointer"
                      title="Remove from palace"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Sequence Navigation Bar */}
          <div className="flex items-center justify-between gap-3 bg-card border border-border rounded-xl p-2.5 shrink-0 shadow-2xs">
            <Button
              variant="outline"
              size="sm"
              disabled={activeLocusIndex === 0}
              onClick={() => setActiveLocusIndex((prev) => Math.max(0, prev - 1))}
              className="h-8 px-3 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              <span>Previous</span>
            </Button>

            {/* Locus Carousel Strip with Animate-UI sliding indicator */}
            <div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto px-2">
              {palace.loci.map((loc, idx) => {
                const isActive = activeLocusIndex === idx;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setActiveLocusIndex(idx)}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none shrink-0 ${
                      isActive
                        ? "text-primary-foreground font-bold"
                        : "text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-locus-pill"
                        className="absolute inset-0 rounded-lg bg-primary shadow-xs -z-10"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 32,
                        }}
                      />
                    )}
                    <span className="h-4 w-4 rounded-full bg-background/20 text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[90px]">{loc.name}</span>
                    {loc.placements.length > 0 && (
                      <span className="text-[9px] opacity-80">({loc.placements.length})</span>
                    )}
                  </button>
                );
              })}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRoomModalMode("add");
                  setIsRoomModalOpen(true);
                }}
                className="h-7 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground shrink-0"
                title="Add another room to this palace"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Add Room</span>
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={activeLocusIndex === palace.loci.length - 1}
              onClick={() => setActiveLocusIndex((prev) => Math.min(palace.loci.length - 1, prev + 1))}
              className="h-8 px-3 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </main>
      </div>

      {/* Expanded Study Note Modal (Radix Dialog) */}
      {expandedPlacement && (
        <Dialog open={Boolean(expandedPlacement)} onOpenChange={(open) => !open && setExpandedPlacementId(null)}>
          <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
            <DialogHeader className="shrink-0 pb-2">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold">Study Mnemonic Association</DialogTitle>
                <Badge variant="secondary" className="text-[10px]">
                  Locus {activeLocusIndex + 1}
                </Badge>
              </div>
              <DialogDescription>
                Attach clinical indications, side effects, and vivid memory anchors to this location.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 flex flex-col sm:flex-row gap-4 overflow-y-auto py-2">
              {/* Image Preview */}
              <div className="sm:w-44 flex flex-col gap-2 shrink-0">
                <div className="h-44 w-full rounded-xl overflow-hidden bg-muted border border-border p-2 flex items-center justify-center">
                  <img
                    src={expandedPlacement.src}
                    alt={expandedPlacement.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <Input
                  type="text"
                  value={expandedPlacement.name}
                  onChange={(e) => handleUpdatePlacementName(expandedPlacement.id, e.target.value)}
                  className="h-8 text-xs font-semibold"
                  placeholder="Mnemonic title"
                />
              </div>

              {/* Note Textarea */}
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-semibold text-foreground">
                  Study Notes & Clinical Recall Cues
                </label>
                <textarea
                  value={expandedPlacement.note || ""}
                  onChange={(e) => handleUpdatePlacementNote(expandedPlacement.id, e.target.value)}
                  placeholder="e.g. Mechanism: Competitively blocks beta-1 adrenergic receptors in cardiac tissue. Lowers HR & BP. Side effects: Bradycardia, bronchospasm in asthma."
                  className="w-full flex-1 min-h-[140px] p-3 bg-muted/40 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none leading-relaxed"
                />
                <p className="text-[11px] text-muted-foreground">
                  Tip: Use sensory details (smell, color, movement) to cement long-term memory.
                </p>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border pt-4 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemovePlacement(expandedPlacement.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                <span>Delete from Palace</span>
              </Button>
              <Button size="sm" onClick={() => setExpandedPlacementId(null)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Online Image Search Modal */}
      <ImageSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectImage={handleSelectOnlineImage}
      />

      {/* Room Search / Change Modal */}
      <RoomSearchModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onSelectRoom={handleSelectRoom}
        title={roomModalMode === "swap" ? "Change Locus Room" : "Add New Palace Room"}
      />

      {/* Delete Palace Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Memory Palace?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong className="text-foreground">&quot;{palace.title}&quot;</strong>? This action will permanently remove all loci and positioned mnemonics.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteCurrentPalace}>
              Delete Palace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
