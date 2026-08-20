# AGENTS.md — Master Plan for LociVault

## Project Overview & Stack
**App:** LociVault
**Overview:** LociVault is a minimalist web application designed for medical students to build memory palaces in minutes. It allows users to generate visually distinct loci (locations), upload mnemonic images, drag-and-drop them into place, and save/load palaces to focus their time on studying rather than manual organization.
**Stack:** Next.js, Supabase Database & Storage, Tailwind CSS
**Critical Constraints:** Single-user mode for MVP (storing locally or simple database record), distraction-free calm look & feel, mobile responsive, load time under 3 seconds, WCAG 2.1 AA accessibility.

## Setup & Commands
Execute these commands for standard development workflows. Do not invent new package manager commands.
- **Setup:** `npm install`
- **Development:** `npm run dev`
- **Testing:** `npm test`
- **Linting & Formatting:** `npm run lint`
- **Build:** `npm run build`

## Protected Areas
Do NOT modify these areas without explicit human approval:
- **Infrastructure:** Vercel deployment configurations and workspace settings.
- **Database Migrations:** Supabase database setup files and seed scripts.

## Coding Conventions
- **Formatting:** Enforce ESLint and Prettier rules strictly.
- **Architecture rules:** Routes/controllers handle request/response only. Put business logic in `services/` or `core/`.
- **Testing Expectations:** All core flows and helper functions must be validated with tests.
- **Type Safety:** The `any` type is FORBIDDEN. Use `unknown` with type guards. All parameters and return values must be typed.

## How I Should Think
1. **Understand Intent First:** Before answering, identify what the user actually needs.
2. **Ask If Unsure:** If critical information is missing, ask before proceeding.
3. **Plan Before Coding:** Propose a plan, ask for approval, then implement.
4. **Verify After Changes:** Run tests/linters or manual checks after each change.
5. **Explain Trade-offs:** When recommending something, mention alternatives.

## What NOT To Do
- Do NOT delete files without explicit confirmation.
- Do NOT modify database schemas without backup plan.
- Do NOT add features not in the current phase.
- Do NOT skip tests for "simple" changes.
- Do NOT bypass failing tests or pre-commit hooks.
- Do NOT use deprecated libraries or patterns.

## Agent Behaviors
1. **Plan Before Execution:** ALWAYS propose a brief step-by-step plan before changing more than one file.
2. **Refactor Over Rewrite:** Prefer refactoring existing functions incrementally rather than completely rewriting large blocks of code.
3. **Context Compaction:** Write states to `MEMORY.md` instead of filling context history during long sessions.
4. **Iterative Verification:** Run tests or linters after each logical change. Fix errors before proceeding (See `REVIEW-CHECKLIST.md`).
