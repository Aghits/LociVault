# Product Requirements Document: LociVault MVP

## Product Overview

**App Name:** LociVault
**Tagline:** Build memory palaces in minutes, not hours.
**Launch Goal:** Create a tool I personally use and validate with at least 5 medical students.
**Target Launch:** Within a few days

---

## Who It's For

### Primary User: Medical Student

Medical students frequently memorize large volumes of information using mnemonics and memory palace techniques.

**Their Current Pain:**

* Manually searching for memory palace location images
* Organizing mnemonic images in Google Slides
* Spending more time building study systems than studying

**What They Need:**

* Fast memory palace creation
* Simple visual organization
* Easy saving and retrieval

### Example User Story

"Meet Sarah, a medical student preparing for a pharmacology exam. She needs to memorize dozens of drugs and mechanisms. Instead of spending an hour searching for images and building slides, she opens LociVault, generates a memory palace, places mnemonic images into loci, saves it, and starts studying immediately."

---

## The Problem We're Solving

Memory palaces are powerful but tedious to create.

Today, many students:

1. Search for location images manually.
2. Search for mnemonic images manually.
3. Organize everything in Google Slides.

This process creates friction and discourages consistent use of memory palace techniques.

LociVault removes this friction by generating memory palace locations and providing a dedicated workspace for mnemonic placement.

### Why Existing Solutions Fall Short

| Current Solution              | Limitation                                  |
| ----------------------------- | ------------------------------------------- |
| Google Slides                 | Not designed for memory palaces             |
| Generic image folders         | Poor organization of loci                   |
| Manual memory palace creation | Time-consuming                              |
| Flashcard apps                | Not optimized for spatial memory techniques |

---

## User Journey

### Discovery → First Use → Success

### 1. Discovery Phase

* Student needs to memorize large amounts of information.
* Existing workflow feels slow.
* Learns about LociVault.

### 2. Onboarding (First 5 Minutes)

* Opens LociVault.
* Clicks "Generate Memory Palace."
* Receives a set of loci.

### 3. Core Usage Loop

* Select locus.
* Upload or drag mnemonic image.
* Arrange images.
* Save palace.

### 4. Success Moment

Student completes an entire memory palace in minutes instead of building it manually.

"Aha!" moment:

> "I spent my time memorizing, not organizing."

---

## MVP Features

### Must Have for Launch

#### 1. Memory Palace Generation

**What:** Generate or search memory palace location images.

**User Story:**
As a student, I want ready-made loci so that I can start studying immediately.

**Success Criteria:**

* [ ] User can generate a palace
* [ ] Palace contains multiple loci
* [ ] Locations are visually distinct

**Priority:** P0 (Critical)

---

#### 2. Drag-and-Drop Mnemonic Placement

**What:** Place mnemonic images into specific loci.

**User Story:**
As a student, I want to place mnemonic images in locations so that I can build a memory palace visually.

**Success Criteria:**

* [ ] User can upload images
* [ ] User can drag images into loci
* [ ] Placement persists after saving

**Priority:** P0 (Critical)

---

#### 3. Save Memory Palaces

**What:** Save completed palaces for later review.

**User Story:**
As a student, I want to save my palace so that I can revisit it whenever I study.

**Success Criteria:**

* [ ] User can save palace
* [ ] Saved palace loads correctly
* [ ] Google Drive integration works if implemented

**Priority:** P0 (Critical)

---

### Nice to Have (If Time Allows)

* Google authentication
* Basic review mode
* Palace thumbnails
* Import image from URL

---

### NOT in MVP (Saving for Later)

* Shared memory palaces
* Search across all saved palaces
* Mobile application
* AI-generated mnemonic suggestions
* Collaborative studying

**Why we're waiting:** Keeps the MVP launchable within days.

---

## How We'll Know It's Working

### Launch Success Metrics (First 30 Days)

| Metric                   | Target    | Measure       |
| ------------------------ | --------- | ------------- |
| Personal usage           | Daily use | Self-tracking |
| Medical student adoption | 5 users   | User feedback |

### Growth Metrics (Months 2-3)

| Metric        | Target | Measure         |
| ------------- | ------ | --------------- |
| Active users  | 20+    | Usage analytics |
| Saved palaces | 50+    | Database count  |

---

## Look & Feel

**Design Vibe:**

* Minimal
* Clean
* Intuitive
* Distraction-free
* Calm

### Visual Principles

1. Focus on studying, not interface complexity.
2. Reduce visual clutter.
3. Keep interactions obvious and simple.

### Key Screens

#### Home

Purpose:
Generate a new memory palace.

#### Palace Editor

Purpose:
Place mnemonic images into loci.

#### Saved Palaces

Purpose:
Access previously created palaces.

---

### Simple Wireframe

```text
┌──────────────────────────────┐
│          LociVault           │
├──────────────────────────────┤
│                              │
│  Generate Memory Palace      │
│                              │
├──────────────────────────────┤
│     Saved Palaces            │
├──────────────────────────────┤
│      Create New Palace       │
└──────────────────────────────┘
```

---

## Technical Considerations

**Platform:** Web

**Responsive:** Yes

**Performance:**

* Initial load under 3 seconds

**Accessibility:**

* WCAG 2.1 AA minimum

**Security & Privacy:**

* User study content remains private
* Secure Google authentication if used

**Scalability:**

* Optimized for solo usage and small beta testing

---

## Quality Standards

### What This App Will NOT Accept

* Placeholder content in production
* Broken drag-and-drop interactions
* Missing save functionality
* Unresponsive mobile layouts
* Unclear navigation

---

## Budget & Constraints

**Development Budget:** Free

**Monthly Operating Cost:** Free whenever possible

**Timeline:** A few days

**Team:** Solo builder

---

## Open Questions & Assumptions

### Assumptions

* Medical students are willing to switch from Google Slides.
* Generated loci are sufficient for most study sessions.
* Users prefer speed over extensive customization.

### Open Questions

* Best free source for location images?
* Should palaces be image-based or room-based?
* Is Google Drive enough or is local storage sufficient?

---

## Launch Strategy

### Soft Launch

* Personal usage first
* Invite 5 medical students

### Feedback Collection

* Direct conversations
* Simple feedback form

### Iteration Cycle

* Weekly updates

---

## Definition of Done for MVP

The MVP is ready when:

* [ ] Memory palace generation works
* [ ] Drag-and-drop placement works
* [ ] Save/load works
* [ ] Mobile responsive
* [ ] End-to-end workflow tested
* [ ] At least one real palace created successfully

---

## Next Steps

1. Create Technical Design Document (Part 3)
2. Select free tech stack
3. Build MVP
4. Test with 5 medical students
5. Launch

---

Document Status: Draft — Ready for Technical Design
Created: May 30, 2026
