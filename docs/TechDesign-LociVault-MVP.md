\# Technical Design Document: LociVault MVP



\## Overview



This document defines how to build LociVault as quickly and safely as possible using Antigravity.



\*\*Goal:\*\* Launch a usable MVP within days, not weeks.



\*\*Success Criteria:\*\*



\* You can create a memory palace.

\* You can drag mnemonic images into loci.

\* You can save and reopen palaces.

\* Five medical students can use it without guidance.



\---



\# Recommended Approach



\## Primary Recommendation



\### Antigravity + Supabase + Vercel



Why this is the best fit:



1\. Fastest path to launch.

2\. Free tiers are sufficient.

3\. Minimal infrastructure management.

4\. Easy to rebuild if something breaks.

5\. Simple architecture Antigravity can reliably generate.



\### Trade-Offs



\*\*Pros\*\*



\* Very fast MVP development.

\* Minimal maintenance.

\* No backend servers to manage.



\*\*Cons\*\*



\* Less flexibility than custom infrastructure.

\* Reliance on Supabase services.

\* Some generated code may require manual fixes.



\---



\# Alternative Options



| Option                 | Pros            | Cons            | Recommended? |

| ---------------------- | --------------- | --------------- | ------------ |

| Antigravity + Supabase | Fastest         | Less control    | Yes          |

| Replit Full Stack      | Easy deployment | More debugging  | Maybe        |

| Cursor + Next.js       | Flexible        | Requires coding | Later        |

| Custom Backend         | Maximum control | Slowest         | No           |



\---



\# High-Level Architecture



```text

User

&#x20; ↓

Next.js Frontend

&#x20; ↓

Supabase Auth (optional)

&#x20; ↓

Supabase Database

&#x20; ↓

Supabase Storage

```



No custom backend required for MVP.



\---



\# Core Features



\## Feature 1 — Memory Palace Generation



\### User Flow



1\. User clicks Generate Palace.

2\. App searches free location images.

3\. App returns a set of visually distinct locations.

4\. User selects a palace.



\### Recommendation



Use free image providers only.



Possible sources:



\* Unsplash

\* Pexels

\* Pixabay



Store image metadata in Supabase.



\### MVP Simplification



Instead of generating entire buildings:



Generate:



\* Hallway

\* Living room

\* Kitchen

\* Classroom

\* Library



Users only need distinct loci.



\---



\## Feature 2 — Drag-and-Drop Mnemonic Placement



\### User Flow



1\. User uploads image.

2\. Image appears in sidebar.

3\. User drags image onto locus.

4\. Position is saved.



\### Recommendation



Use a simple drag-and-drop library.



Store:



```json

{

&#x20; "imageId": "123",

&#x20; "x": 200,

&#x20; "y": 400,

&#x20; "locusId": "abc"

}

```



Avoid advanced physics or snapping.



Keep it simple.



\---



\## Feature 3 — Save Memory Palaces



\### User Flow



1\. User clicks Save.

2\. Palace data stored in database.

3\. Palace reopens exactly as saved.



\### MVP Rule



Autosave is optional.



Manual save button is sufficient.



\---



\# Database Design



\## Users



```sql

users

```



| Field      | Type      |

| ---------- | --------- |

| id         | uuid      |

| email      | text      |

| created\_at | timestamp |



\---



\## Palaces



```sql

palaces

```



| Field      | Type      |

| ---------- | --------- |

| id         | uuid      |

| user\_id    | uuid      |

| title      | text      |

| created\_at | timestamp |



\---



\## Loci



```sql

loci

```



| Field       | Type    |

| ----------- | ------- |

| id          | uuid    |

| palace\_id   | uuid    |

| image\_url   | text    |

| order\_index | integer |



\---



\## Placements



```sql

placements

```



| Field              | Type    |

| ------------------ | ------- |

| id                 | uuid    |

| locus\_id           | uuid    |

| uploaded\_image\_url | text    |

| x                  | integer |

| y                  | integer |



\---



\# Storage Strategy



\## Supabase Storage



Store:



\* Uploaded mnemonic images

\* Generated palace thumbnails



Do not store external location images initially.



Store URLs only.



This keeps storage costs near zero.



\---



\# Authentication



\## MVP Recommendation



\### Option A



No authentication.



Single-user mode.



Store locally.



Fastest.



\### Option B



Google login.



More professional.



Slightly slower to build.



\### Recommendation



Start with Option A.



Add Google login after validation.



\---



\# UI Structure



\## Home Screen



```text

LociVault



\[ Generate Palace ]



Saved Palaces

```



\---



\## Palace Editor



```text

Sidebar

\- Uploaded Images



Main Area

\- Loci Images



Save Button

```



\---



\## Saved Palaces



```text

Palace Card

Palace Card

Palace Card

```



Keep everything visually calm.



\---



\# Design System



\## Colors



```css

\--background: #fafafa;

\--surface: #ffffff;

\--border: #e5e7eb;

\--text: #111827;

```



\---



\## Typography



```css

Inter

```



Simple.



Readable.



Medical students already have enough cognitive load.



\---



\# Antigravity Workflow



\## Prompt 1



```text

Build a web application called LociVault.



Users can:



1\. Generate memory palace locations using free location images.

2\. Upload mnemonic images.

3\. Drag images onto locations.

4\. Save and load palaces.



Style:

\- Minimal

\- Calm

\- Clean

\- Distraction free



Use:

\- Next.js

\- Supabase

\- Tailwind



Keep architecture extremely simple.

```



\---



\## Prompt 2



```text

Implement drag-and-drop mnemonic placement.



Requirements:

\- Upload image

\- Drag image onto locus

\- Save coordinates

\- Reload coordinates

```



\---



\## Prompt 3



```text

Implement save/load functionality using Supabase.



Tables:

\- palaces

\- loci

\- placements



Keep implementation minimal.

```



\---



\# Deployment



\## Recommended



Vercel



Benefits:



\* Free

\* One-click deployment

\* Works well with generated Next.js apps



\---



\# Cost Breakdown



\## Development



| Service     | Cost     |

| ----------- | -------- |

| Antigravity | Existing |

| Supabase    | Free     |

| Vercel      | Free     |

| Storage     | Free     |

| Total       | $0       |



\---



\## First 5 Users



Expected monthly cost:



$0



\---



\# What NOT To Build



Do not build:



\* Shared palaces

\* Search across palaces

\* AI mnemonic generation

\* Collaboration

\* Mobile app

\* Review mode



Every extra feature delays validation.



\---



\# Definition of Technical Success



The MVP succeeds if:



1\. You use it yourself.

2\. Five medical students use it.

3\. Users create at least one real palace.

4\. Save/load works reliably.

5\. Drag-and-drop works reliably.



Nothing else matters for MVP validation.



\---



\# Launch Plan



Day 1



\* Build project

\* Generate palace workflow



Day 2



\* Drag-and-drop



Day 3



\* Save/load



Day 4



\* Testing



Day 5



\* Invite medical students



Launch immediately after core workflow works.



Do not wait for perfection.



```

```



