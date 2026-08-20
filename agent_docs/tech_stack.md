# Tech Stack & Tools

- **Frontend:** Next.js (App Router, React 19)
- **Backend:** Next.js API Routes (Serverless) / Supabase Client
- **Database:** Supabase Database (PostgreSQL)
- **Styling:** Tailwind CSS + Vanilla CSS custom variables for calm theme
- **Authentication:** None for MVP (Option A: Single-user mode, local/anonymous access first)

## Error Handling Pattern
```javascript
// Canonical Supabase call pattern
import { supabase } from '@/lib/supabaseClient';

export async function fetchPalaces() {
  try {
    const { data, error } = await supabase
      .from('palaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    return { data, error: null };
  } catch (err) {
    console.error('fetchPalaces failed:', err);
    return { data: null, error: err.message || 'An unexpected error occurred.' };
  }
}
```

## Styling & Component Examples
```tsx
// Example of a calm, minimal UI component structure
import React from 'react';

export default function HomeButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 bg-white text-gray-800 border border-gray-200 rounded-md shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium tracking-wide"
    >
      {label}
    </button>
  );
}
```
