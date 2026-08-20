# Testing Strategy

## Frameworks
- **Unit/Integration Tests:** Jest / React Testing Library (for utility functions and UI component rendering)
- **E2E / Interface Tests:** Cypress or Playwright (optional for MVP, focus on manual browser tests first)

## Rules & Requirements
- **Verification Loop:** Before committing or pushing code, verify that:
  1. The Next.js application builds without errors using `npm run build`.
  2. The linter passes using `npm run lint`.
- **Manual Verification:**
  - Verify drag-and-drop interactions manually across mouse/touch actions.
  - Verify that reloading the page restores placed mnemonic images to their exact coordinates.

## Execution
- Command to run all tests: `npm test`
- Command to build application: `npm run build`
