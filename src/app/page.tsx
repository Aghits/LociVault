"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, ArrowRight, BookOpen, Layers, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 sm:px-12 flex justify-between items-center shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
            LV
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground">LociVault</span>
            <span className="text-[10px] text-muted-foreground font-medium">Spatial Recall for Medicine</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px] text-muted-foreground font-normal">
            Local-First Mode
          </Badge>
          <Button asChild size="sm">
            <Link href="/editor/new">
              <Plus className="mr-1 h-3.5 w-3.5" />
              New Palace
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 sm:px-12 flex flex-col gap-10">
        {/* Welcome Banner */}
        <section className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
            Memory Palaces, <span className="text-muted-foreground font-normal">built in minutes.</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Layout sequential loci using real interior architecture from Reddit, position high-yield mnemonic images, and study spatial associations for exams.
          </p>
        </section>

        {/* Quick Launch Card */}
        <Card className="border-border bg-card shadow-xs overflow-hidden relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Building2 className="h-3 w-3" /> Architecture Stream
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  Zero Setup
                </Badge>
              </div>
            </div>
            <CardTitle className="text-lg font-bold mt-2">Generate a New Palace</CardTitle>
            <CardDescription>
              Pick from 36+ real Reddit interior rooms (clinics, libraries, cozy halls) or use classical layouts to start organizing your mnemonics.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Button asChild size="default" className="shadow-xs">
              <Link href="/editor/new">
                <span>Start Creator</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Saved Palaces Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">Your Saved Palaces</h2>
              <Badge variant="secondary" className="text-[11px] font-semibold">
                <AnimatedCounter value={palaces.length} />
              </Badge>
            </div>
            {palaces.length > 0 && (
              <Button asChild variant="outline" size="sm">
                <Link href="/editor/new">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Palace
                </Link>
              </Button>
            )}
          </div>

          {palaces.length === 0 ? (
            <Card className="border-dashed border-border bg-muted/30 py-12 text-center flex flex-col items-center justify-center shadow-none">
              <div className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center mb-3 text-muted-foreground shadow-2xs">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No palaces created yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
                Click &quot;Start Creator&quot; above to select your loci rooms and position your first medical mnemonics.
              </p>
              <Button asChild size="sm" className="mt-5">
                <Link href="/editor/new">Create Your First Palace</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {palaces.map((palace) => (
                <Card
                  key={palace.id}
                  className="flex flex-col justify-between hover:border-foreground/30 hover:shadow-md transition-all duration-200 group"
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/editor/${palace.id}`} className="flex-1 focus:outline-none">
                        <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">
                          {palace.title}
                        </CardTitle>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPalaceToDelete(palace);
                        }}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                        title="Delete memory palace"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete {palace.title}</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Badge variant="outline" className="text-[10px] gap-1 font-normal py-0">
                        <Layers className="h-2.5 w-2.5" />
                        <AnimatedCounter value={palace.lociCount} />
                        <span>{palace.lociCount === 1 ? "room" : "rooms"}</span>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardFooter className="p-5 pt-0 flex justify-between items-center text-xs text-muted-foreground border-t border-border/40 mt-3">
                    <span className="text-[11px]">{new Date(palace.createdAt).toLocaleDateString()}</span>
                    <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold">
                      <Link href={`/editor/${palace.id}`}>
                        <span>Study</span>
                        <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(palaceToDelete)} onOpenChange={(open) => !open && setPalaceToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Memory Palace?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong className="text-foreground">&quot;{palaceToDelete?.title}&quot;</strong>? This action will permanently remove all loci and positioned mnemonics.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setPalaceToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>
              Delete Palace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clean Footer */}
      <footer className="border-t border-border py-6 px-6 sm:px-12 mt-auto text-center text-xs text-muted-foreground bg-card">
        <p>&copy; {new Date().getFullYear()} LociVault &middot; Calm, distraction-free spatial learning.</p>
      </footer>
    </div>
  );
}
