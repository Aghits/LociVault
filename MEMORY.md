# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal
**Current Task:** Phase 3: Supabase Database Schema & Sync Integration. Transition from pure local storage storage to Supabase database saving (tables: palaces, loci, placements) to support permanent cloud backup.
**Next Steps:**
1. Formulate the SQL schema migrations/scripts based on database design (palaces, loci, placements).
2. Wire up the save triggers in `src/app/editor/[id]/page.tsx` to push and fetch data from Supabase backend.
3. Test cloud data retention.

## 📂 Architectural Decisions
- **2026-05-30** - Workspace setup initiated. Decided to build a React/Next.js single-page application structure for the MVP to reduce routing overhead. Local state storage is preferred initially, with a clean sync to Supabase.
- **2026-05-30** - Successfully bootstrapped Next.js App Router project using TypeScript, ESLint, and Tailwind CSS v4. Verified compilation and formatting rules.
- **2026-05-30** - Implemented client-side memory palace wizard and workspace editor under `/editor/new` and `/editor/[id]` with HTML5 drag-and-drop placements layer and mobile-friendly tap-to-place mechanisms.
- **2026-08-20** - Refactored placed mnemonics from pill badges to plain images with smooth drag-to-reposition on canvas, size adjustments (S/M/L), and an Expanded Image & Study Note Modal with real-time auto-saving.
- **2026-08-21** - Integrated live In-App Image Search (Wikimedia Commons + Unsplash + URL paste) for mnemonics.
- **2026-08-21** - Integrated live Reddit `inside_mps` (`https://www.reddit.com/user/cdozprime/m/inside_mps/`) via zero-credential live RSS feed stream + 44 curated high-res interior photos in the Palace Creation Wizard (`/editor/new`) and Editor (`/editor/[id]`), allowing users to scroll real interior photos, generate custom palaces, swap room backgrounds, or add new loci.

## 🐛 Known Issues & Quirks
- Image tag optimization warning bypassed by adding `/* eslint-disable @next/next/no-img-element */` due to dynamic Unsplash and custom uploaded Base64 inputs.

## 📜 Completed Phases
- [x] Initial workspace documentation setup (AGENTS.md, MEMORY.md, REVIEW-CHECKLIST.md, agent_docs/)
- [x] Next.js app scaffolding & configuration
- [x] Palace Editor UI & Loci generation wizard (Local storage persistence, plain images, free movement, expanded note modal)
- [x] In-app live mnemonic image search (Wikimedia + Unsplash + URL import)
- [x] In-app live Reddit `inside_mps` room feed & palace generator (live RSS stream + scrollable photo gallery)
- [ ] Database schema creation & cloud sync
