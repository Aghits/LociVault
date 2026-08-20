# Product Requirements: LociVault MVP

## Product Overview
**App Name:** LociVault
**Tagline:** Build memory palaces in minutes, not hours.
**Vision:** Help medical students and learners create, organize, and study visual memory palaces quickly and without friction.

## Core User Story
> "Sarah is a medical student preparing for a pharmacology exam. She needs to memorize dozens of drugs and mechanisms. Instead of spending an hour searching for images and building slides, she opens LociVault, generates a memory palace, places mnemonic images into loci, saves it, and starts studying immediately."

## Must-Have Features (Phase 1 MVP)
1. **Memory Palace Generation**
   - User can generate a palace containing multiple loci (visually distinct locations like a hallway, living room, kitchen, classroom, library).
   - Images for loci should be retrieved from free, high-quality public search APIs (e.g., Unsplash) or predefined high-quality static assets.
2. **Drag-and-Drop Mnemonic Placement**
   - User can upload custom mnemonic images.
   - User can drag images onto loci.
   - Placement coordinates (x, y) must persist and reload accurately.
3. **Save Memory Palaces**
   - User can save palaces manually (metadata stored in Supabase).
   - Saved palaces load correctly when selected from the list.

## Nice-to-Have Features (Post-MVP)
- Google authentication
- Basic review mode / study mode
- Palace thumbnails
- Import mnemonic images from URLs

## NOT in MVP
- Shared memory palaces / collaborative studying
- Search across all saved palaces
- Native mobile application
- AI-generated mnemonic suggestions

## Success Metrics
- **Personal usage:** Daily use by the founder
- **Launch adoption:** 5 medical students using it without manual guidance
- **Retention:** Users create at least one real palace successfully and save it
