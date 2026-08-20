"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Palace {
  id: string;
  title: string;
  createdAt: string;
  lociCount: number;
}

export default function Home() {
  const [palaces, setPalaces] = useState<Palace[]>([]);
  const [palaceToDelete, setPalaceToDelete] = useState<Palace | null>(null);

  useEffect(() => {
    // Load from localStorage for MVP local-first persistence inside useEffect asynchronously
    const loadPalaces = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("locivault_palaces");
        if (saved) {
          try {
            setPalaces(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to load local palaces:", e);
          }
        }
      }
    };
    Promise.resolve().then(loadPalaces);
  }, []);

  const confirmDelete = () => {
    if (!palaceToDelete) return;
    try {
      const updated = palaces.filter((p) => p.id !== palaceToDelete.id);
      setPalaces(updated);
      localStorage.setItem("locivault_palaces", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to delete palace:", err);
    } finally {
      setPalaceToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-neutral-200">
      {/* Header */}
      <header className="border-b border-border bg-surface px-6 py-4 sm:px-12 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-neutral-900">LociVault</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200 font-medium">MVP</span>
        </div>
        <div className="text-sm text-muted">
          For Medical Students
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 sm:px-12 flex flex-col gap-12">
        
        {/* Hero Section */}
        <section className="flex flex-col gap-4 text-center sm:text-left py-6">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl leading-tight">
            Build memory palaces <br className="hidden sm:inline" />
            <span className="text-neutral-500 font-medium">in minutes, not hours.</span>
          </h1>
          <p className="text-md text-muted max-w-xl leading-relaxed">
            Generate visually distinct rooms (loci), upload your custom mnemonic images, drag-and-drop them in place, and study with spatial recall.
          </p>
        </section>

        {/* Action / Generator Card */}
        <section>
          <div className="relative group overflow-hidden rounded-xl border border-neutral-200 bg-surface p-8 shadow-xs hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 h-40 w-40 bg-neutral-50 rounded-full translate-x-20 -translate-y-20 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-neutral-900">Start a New Memory Palace</h2>
                <p className="text-sm text-muted max-w-md">
                  Choose a layout (e.g. Hallway, Living Room, Classroom) or scroll real Reddit interior rooms to build your palace.
                </p>
              </div>
              <Link
                id="btn-generate-palace"
                href="/editor/new"
                className="inline-flex items-center justify-center h-11 px-6 font-medium text-sm text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 active:bg-neutral-950 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              >
                Generate Palace
              </Link>
            </div>
          </div>
        </section>

        {/* Saved Palaces Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Your Saved Palaces</h2>
            <span className="text-xs text-neutral-400 font-medium">{palaces.length} {palaces.length === 1 ? "palace" : "palaces"}</span>
          </div>
          
          {palaces.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center flex flex-col items-center justify-center bg-neutral-50/50">
              <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">
                📚
              </div>
              <p className="text-sm text-neutral-600 font-medium mb-1">No palaces created yet</p>
              <p className="text-xs text-muted max-w-xs leading-relaxed">
                Click &quot;Generate Palace&quot; above to layout your first loci and mnemonic placements.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {palaces.map((palace) => (
                <div
                  key={palace.id}
                  className="p-5 rounded-xl border border-neutral-200 bg-surface shadow-2xs hover:border-neutral-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between h-36 relative group"
                >
                  <div className="flex justify-between items-start gap-3">
                    <Link href={`/editor/${palace.id}`} className="flex-1">
                      <h3 className="font-semibold text-neutral-900 group-hover:text-black transition-colors line-clamp-1">
                        {palace.title}
                      </h3>
                      <p className="text-xs text-muted mt-1">{palace.lociCount} loci (locations)</p>
                    </Link>

                    {/* Delete Palace Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPalaceToDelete(palace);
                      }}
                      className="h-8 w-8 rounded-lg bg-neutral-50 hover:bg-red-50 text-neutral-400 hover:text-red-600 border border-neutral-200/60 hover:border-red-200 flex items-center justify-center text-xs transition-all opacity-80 group-hover:opacity-100 cursor-pointer shrink-0"
                      title="Delete this memory palace"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-xs text-neutral-400 pt-2 border-t border-neutral-100">
                    <span>{new Date(palace.createdAt).toLocaleDateString()}</span>
                    <Link
                      href={`/editor/${palace.id}`}
                      className="text-neutral-700 font-semibold hover:text-black flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-200"
                    >
                      <span>Study & Edit</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      {palaceToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPalaceToDelete(null)}
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
              Are you sure you want to delete <strong className="text-neutral-900">&quot;{palaceToDelete.title}&quot;</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setPalaceToDelete(null)}
                className="h-9 px-4 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="h-9 px-4 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 active:bg-red-800 transition-colors shadow-xs cursor-pointer"
              >
                Delete Palace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 sm:px-12 mt-auto text-center text-xs text-neutral-400 bg-surface">
        <p>&copy; {new Date().getFullYear()} LociVault. Designed for calm, distraction-free studying.</p>
      </footer>
    </div>
  );
}
