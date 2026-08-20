# Code Patterns

## Purpose
This file defines the implementation patterns the agent should follow for LociVault.
Prefer these patterns over inventing new ones.

## Architecture Pattern
- **Primary pattern:** Component-based UI with standard Next.js App Router layout.
- **Rule:** Keep database query and storage client logic separated from the React components. Place clients and utility functions under `src/utils/` or `src/lib/`.
- **Rule:** Keep frontend components clean and modular.

## Data Fetching
- **Primary approach:** Direct client-side calls to Supabase API via `@supabase/supabase-js` or React Server Components where appropriate.
- **Rule:** Use runtime checks for loading states and handle empty database tables gracefully.
- **Rule:** Keep credentials and secret keys strictly in `.env.local` environment variables.

## State Management
- **Client state:** React hooks (`useState`, `useContext`) and HTML5 Drag and Drop API state.
- **Forms:** Controlled components using simple React state.
- **Rule:** Keep it as simple as possible. Avoid adding Redux or heavy state management libraries unless local component state becomes unmanageable.

## Error Handling
- Wrap async calls in `try...catch` blocks.
- Inform the user of any errors using clear, calm toast or banner messages in the UI.
- Log error messages to the console for easier debugging during local runs.
- Fall back to standard placeholders if Unsplash or Supabase fetch fails.

## Validation
- Validate image file sizes and formats before uploading to Supabase Storage.
- Enforce coordinate boundary checks when storing drag-and-drop placements (X and Y coordinates should fit within the locus container).

## File and Naming Conventions
- **Files:** kebab-case for system files/routes (e.g. `palace-editor`), PascalCase for React component files (e.g. `LocusCard.jsx`).
- **Components / classes:** PascalCase
- **Functions / variables:** camelCase
- **Constants / env vars:** UPPER_SNAKE_CASE

## Testing Pattern
- Focus testing on core functionalities: palace creation, drag-and-drop coordinates save, and load utility functions.
- Run `npm test` to verify changes.

## Change Discipline
- One feature at a time — check correctness before proceeding.
- Do not add packages to `package.json` without verifying if native features (like HTML5 Drag and Drop or standard Web Fetch) can achieve the same result.
