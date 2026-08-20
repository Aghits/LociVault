/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ImageSearchModal from "@/components/ImageSearchModal";
import RoomSearchModal from "@/components/RoomSearchModal";
import { getSafeImageUrl } from "@/lib/imageUtils";

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

  // Handle Mnemonic image upload
  const handleUploadMnemonic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newMnemonic: Mnemonic = {
        id: `m-custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        src: reader.result as string,
      };

      const updatedLib = [newMnemonic, ...mnemonicLibrary];
      setMnemonicLibrary(updatedLib);
      localStorage.setItem("locivault_custom_mnemonics", JSON.stringify(updatedLib));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMnemonic = (mnemonicId: string) => {
    const updatedLib = mnemonicLibrary.filter((m) => m.id !== mnemonicId);
    setMnemonicLibrary(updatedLib);
    localStorage.setItem("locivault_custom_mnemonics", JSON.stringify(updatedLib));
    if (selectedMnemonic?.id === mnemonicId) {
      setSelectedMnemonic(null);
    }
  };

  // Drag-and-Drop Handlers (Dragging from Sidebar to Canvas)
  const handleSidebarDragStart = (e: React.DragEvent, mnemonic: Mnemonic) => {
    e.dataTransfer.setData("application/json", JSON.stringify(mnemonic));
    setSelectedMnemonic(mnemonic);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const placeMnemonicAtCoords = useCallback((xPercent: number, yPercent: number, mnemonic: Mnemonic) => {
    if (!palace) return;

    const newPlacement: Placement = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      mnemonicId: mnemonic.id,
      name: mnemonic.name,
      src: mnemonic.src,
      x: Math.max(2, Math.min(98, xPercent)),
      y: Math.max(2, Math.min(98, yPercent)),
      size: 80,
      note: "",
    };

    const updatedLoci = [...palace.loci];
    updatedLoci[activeLocusIndex].placements = [
      ...(updatedLoci[activeLocusIndex].placements || []),
      newPlacement,
    ];

    setPalace({ ...palace, loci: updatedLoci });
    setSelectedMnemonic(null);
    setSelectedPlacementId(newPlacement.id);
  }, [palace, activeLocusIndex]);

  const handleSelectOnlineImage = (
    image: { name: string; src: string },
    addToCanvasDirectly: boolean = true
  ) => {
    const newMnemonic: Mnemonic = {
      id: `m-online-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: image.name,
      src: image.src,
    };

    const updatedLib = [newMnemonic, ...mnemonicLibrary];
    setMnemonicLibrary(updatedLib);
    localStorage.setItem("locivault_custom_mnemonics", JSON.stringify(updatedLib));

    if (addToCanvasDirectly) {
      placeMnemonicAtCoords(50, 50, newMnemonic);
    } else {
      setSelectedMnemonic(newMnemonic);
    }
  };

  // Room swap / add handler
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
        description: `Custom memory spot ${palace.loci.length + 1}`,
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

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
  };

  // Palace Save Logic
  const handleSave = () => {
    if (!palace) return;
    setIsSaving(true);
    setSaveStatus("idle");

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

  if (!palace) {
    return (
      <div className="min-h-screen bg-background text-neutral-600 flex items-center justify-center font-sans">
        <p className="text-sm font-medium">Loading memory palace editor...</p>
      </div>
    );
  }

  const activeLocus = palace.loci[activeLocusIndex];
  const activePlacement = activeLocus.placements.find((p) => p.id === selectedPlacementId);
  const expandedPlacement = activeLocus.placements.find((p) => p.id === expandedPlacementId);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-neutral-200">
      {/* Header */}
      <header className="border-b border-border bg-surface px-6 py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-semibold tracking-tight text-neutral-900 hover:text-black">
            LociVault
          </Link>
          <span className="text-xs text-neutral-300">/</span>
          <input
            id="palace-editor-title"
            type="text"
            value={palace.title}
            onChange={(e) => setPalace({ ...palace, title: e.target.value })}
            className="text-sm font-semibold text-neutral-800 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-neutral-900 focus:outline-none px-1 py-0.5 transition-colors max-w-xs sm:max-w-md"
            title="Edit Palace Title"
          />
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors mr-2">
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center justify-center h-8.5 px-3 font-medium text-xs text-neutral-600 hover:text-red-600 bg-white border border-neutral-200 hover:border-red-200 rounded-md transition-colors cursor-pointer"
            title="Delete this memory palace"
          >
            🗑️ Delete
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center h-8.5 px-4 font-medium text-xs text-white bg-neutral-900 rounded-md hover:bg-neutral-800 active:bg-neutral-950 disabled:opacity-50 shadow-xs transition-all duration-200 cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save Palace"}
          </button>
          {saveStatus === "saved" && (
            <span className="text-xs text-emerald-600 font-medium">✓ Saved!</span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs text-red-600 font-medium">✗ Save failed</span>
          )}
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Mnemonic Sidebar (Drag Source) */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-surface p-5 flex flex-col gap-4 select-none shrink-0 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Mnemonic Library</h2>
            <p className="text-xs text-muted leading-relaxed">
              Find online images or upload your own, then drag them onto the room.
            </p>
          </div>

          {/* Search Online & Upload Buttons */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full h-9 rounded-lg border border-neutral-900 bg-neutral-900 text-white shadow-xs flex items-center justify-center gap-2 text-xs font-semibold hover:bg-neutral-800 active:bg-neutral-950 transition-colors cursor-pointer"
            >
              <span>🔍</span>
              <span>Search Online Images</span>
            </button>

            <label
              htmlFor="mnemonic-uploader"
              className="w-full h-8.5 rounded-lg border border-neutral-200 hover:border-neutral-300 bg-white shadow-2xs flex items-center justify-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
            >
              <span>📤</span>
              <span>Upload Custom File</span>
            </label>
            <input
              id="mnemonic-uploader"
              type="file"
              accept="image/*"
              onChange={handleUploadMnemonic}
              className="hidden"
            />
          </div>

          {/* Tap-to-place helper */}
          {selectedMnemonic && (
            <div className="bg-neutral-900 text-white rounded-lg p-2.5 text-xs flex justify-between items-center shadow-xs">
              <span className="truncate pr-2">Tap locus to place <strong>{selectedMnemonic.name}</strong></span>
              <button onClick={() => setSelectedMnemonic(null)} className="text-neutral-400 hover:text-white p-0.5">✕</button>
            </div>
          )}

          {/* Draggable Mnemonics List */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-row md:flex-col gap-2.5 pb-2">
            {mnemonicLibrary.map((mnemonic) => (
              <div
                key={mnemonic.id}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, mnemonic)}
                onClick={() => setSelectedMnemonic(mnemonic)}
                className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-grab bg-white shadow-2xs hover:shadow-xs transition-all duration-200 shrink-0 md:shrink w-44 md:w-full group ${
                  selectedMnemonic?.id === mnemonic.id
                    ? "border-neutral-900 ring-2 ring-neutral-100"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className="relative h-11 w-11 rounded-md bg-neutral-100 overflow-hidden shrink-0 border border-neutral-100 flex items-center justify-center p-0.5">
                  <img
                    src={mnemonic.src}
                    alt={mnemonic.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain pointer-events-none rounded"
                  />
                </div>
                <div className="min-w-0 flex-1 flex flex-col">
                  <span className="text-xs font-medium text-neutral-800 truncate leading-tight">{mnemonic.name}</span>
                  <span className="text-[10px] text-neutral-400 mt-1 leading-none">Drag to room</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMnemonic(mnemonic.id);
                  }}
                  className="text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-xs"
                  title="Remove mnemonic"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Locus Workspace Panel */}
        <main className="flex-1 p-5 md:p-7 flex flex-col gap-4 bg-neutral-50/60 overflow-hidden">
          {/* Locus Heading info & Controls Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900">
                  Locus {activeLocusIndex + 1} of {palace.loci.length}: {activeLocus.name}
                </h2>
                <button
                  onClick={() => {
                    setRoomModalMode("swap");
                    setIsRoomModalOpen(true);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                  title="Swap background room with another from Reddit inside_mps"
                >
                  <span>🖼️</span>
                  <span>Swap Room</span>
                </button>
                <button
                  onClick={() => setImageFit((prev) => (prev === "contain" ? "cover" : "contain"))}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                  title={imageFit === "contain" ? "Switch to Fill Screen (Crop)" : "Switch to Fit Whole Room (Uncropped)"}
                >
                  <span>{imageFit === "contain" ? "📐 Fit View" : "🔲 Fill View"}</span>
                </button>
              </div>
              <p className="text-xs text-muted leading-relaxed">{activeLocus.description}</p>
            </div>

            {/* Selected Placement Controls (Size / Edit Note / Delete) */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {activePlacement && (
                <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-lg px-2.5 py-1 text-xs shadow-2xs">
                  <span className="text-neutral-500 font-medium text-[11px] truncate max-w-[90px]">{activePlacement.name}</span>
                  <button
                    onClick={() => setExpandedPlacementId(activePlacement.id)}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Expand Image and Edit Note"
                  >
                    <span>📝</span>
                    <span>Note</span>
                  </button>
                  <span className="w-px h-3 bg-neutral-200 mx-0.5" />
                  <button
                    onClick={() => handleChangePlacementSize(activePlacement.id, 60)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                      (activePlacement.size || 80) === 60 ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    S
                  </button>
                  <button
                    onClick={() => handleChangePlacementSize(activePlacement.id, 80)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                      (activePlacement.size || 80) === 80 ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={() => handleChangePlacementSize(activePlacement.id, 120)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                      (activePlacement.size || 80) === 120 ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    L
                  </button>
                  <span className="w-px h-3 bg-neutral-200 mx-0.5" />
                  <button
                    onClick={() => handleRemovePlacement(activePlacement.id)}
                    className="text-neutral-400 hover:text-red-600 text-xs px-1 cursor-pointer"
                    title="Remove selected image"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="text-xs px-2.5 py-1 rounded-md bg-white text-neutral-600 border border-neutral-200 font-medium shadow-2xs">
                {activeLocus.placements.length} {activeLocus.placements.length === 1 ? "mnemonic" : "mnemonics"} placed
              </div>
            </div>
          </div>

          {/* Interactive Loci Drop Zone Canvas Container */}
          <div className="flex-1 min-h-[350px] relative rounded-2xl border border-neutral-200 overflow-hidden bg-neutral-900/90 flex items-center justify-center p-2 select-none shadow-inner">
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
              {/* The Background Locus Image */}
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
                      isSelected ? "ring-2 ring-neutral-900 ring-offset-2 scale-105 z-30" : "hover:scale-105 z-20"
                    }`}
                    title={`${p.name} (Click to expand & note)`}
                  >
                    {/* Plain Image Container */}
                    <div className="w-full h-full rounded-lg overflow-hidden bg-white/95 backdrop-blur-xs p-1.5 border border-neutral-200/90 shadow-md flex items-center justify-center select-none relative">
                      <img
                        src={p.src}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain pointer-events-none select-none rounded"
                        draggable={false}
                      />
                      
                      {/* Note Indicator Badge */}
                      {hasNote && (
                        <span className="absolute top-1 left-1 h-3.5 w-3.5 rounded-full bg-amber-400 border border-white flex items-center justify-center text-[8px] shadow-xs" title="Has study note">
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
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-white border border-neutral-300 text-neutral-600 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all z-30"
                      title="Remove from palace"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Loci Sequence Navigation bar */}
          <div className="flex items-center justify-between shrink-0 pt-1">
            <button
              onClick={() => {
                setSelectedPlacementId(null);
                setActiveLocusIndex((i) => Math.max(0, i - 1));
              }}
              disabled={activeLocusIndex === 0}
              className="inline-flex items-center justify-center h-9 px-4 font-medium text-xs text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
            >
              &larr; Previous Locus
            </button>

            {/* Indicator dots & Add Locus Button */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                {palace.loci.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedPlacementId(null);
                      setActiveLocusIndex(idx);
                    }}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeLocusIndex ? "w-6 bg-neutral-900" : "w-2.5 bg-neutral-300 hover:bg-neutral-400"
                    }`}
                    title={`Go to Locus ${idx + 1}: ${palace.loci[idx].name}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setRoomModalMode("add");
                  setIsRoomModalOpen(true);
                }}
                className="h-8 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ml-2"
                title="Add another room locus from Reddit inside_mps"
              >
                <span>+</span>
                <span>Add Room</span>
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedPlacementId(null);
                setActiveLocusIndex((i) => Math.min(palace.loci.length - 1, i + 1));
              }}
              disabled={activeLocusIndex === palace.loci.length - 1}
              className="inline-flex items-center justify-center h-9 px-4 font-medium text-xs text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
            >
              Next Locus &rarr;
            </button>
          </div>
        </main>
      </div>

      {/* --- EXPANDED IMAGE & NOTE MODAL --- */}
      {expandedPlacement && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setExpandedPlacementId(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex flex-col gap-1 flex-1 mr-4">
                <input
                  type="text"
                  value={expandedPlacement.name}
                  onChange={(e) => handleUpdatePlacementName(expandedPlacement.id, e.target.value)}
                  className="text-lg font-bold text-neutral-900 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-neutral-900 focus:outline-none px-0.5 py-0.5 transition-colors"
                  placeholder="Mnemonic Name..."
                />
                <span className="text-xs text-neutral-400">
                  Location: Locus {activeLocusIndex + 1} ({activeLocus.name})
                </span>
              </div>
              <button
                onClick={() => setExpandedPlacementId(null)}
                className="h-8 w-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center text-sm font-medium transition-colors cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Expanded Image Preview + Note Editor */}
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              {/* Expanded Image Container */}
              <div className="md:w-1/2 flex flex-col items-center justify-center bg-neutral-50 rounded-xl border border-neutral-200/80 p-4 min-h-[220px] max-h-[300px] overflow-hidden">
                <img
                  src={expandedPlacement.src}
                  alt={expandedPlacement.name}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-xs select-none"
                />
              </div>

              {/* Note Input Field */}
              <div className="md:w-1/2 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="placement-note" className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                    <span>📝</span>
                    <span>Study Notes & Memory Hook</span>
                  </label>
                  <span className="text-[11px] text-neutral-400">Auto-saved</span>
                </div>

                <textarea
                  id="placement-note"
                  rows={6}
                  value={expandedPlacement.note || ""}
                  onChange={(e) => handleUpdatePlacementNote(expandedPlacement.id, e.target.value)}
                  placeholder="e.g. Mechanism: Competitively blocks beta-1 adrenergic receptors in cardiac tissue. Lowers HR and BP. Side effects: Bradycardia, fatigue."
                  className="w-full flex-1 p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all resize-none leading-relaxed"
                />

                <p className="text-[11px] text-muted">
                  Tip: Write vivid sensory associations to strengthen your spatial memory recall.
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-1">
              <button
                onClick={() => handleRemovePlacement(expandedPlacement.id)}
                className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1 transition-colors cursor-pointer"
              >
                Delete from Palace
              </button>

              <button
                onClick={() => setExpandedPlacementId(null)}
                className="h-9 px-5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 active:bg-neutral-950 transition-colors shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
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

      {/* Delete Palace Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 flex flex-col gap-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg shrink-0">
                🗑️
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-neutral-900">Delete Memory Palace?</h3>
                <p className="text-xs text-muted">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-200/70">
              Are you sure you want to delete <strong className="text-neutral-900">&quot;{palace.title}&quot;</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="h-9 px-4 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCurrentPalace}
                className="h-9 px-4 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 active:bg-red-800 transition-colors shadow-xs cursor-pointer"
              >
                Delete Palace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
