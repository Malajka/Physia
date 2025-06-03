# Implementation Plan for Body Area Selection View

## 1. Overview

This view allows the user to select at most one body area (out of four) where they experience overload-related muscle pain. After selecting an area, the user can proceed to the muscle tests assessment step.

## 2. Routing and File Structure

- Route: `/body-parts` (Astro page at `src/pages/body-parts.astro`).
- Current project structure (per tech stack):
  - `src/pages` – Astro pages.
  - `src/components` – React/Shadcn UI components.
  - `src/lib/hooks` – Custom hooks.
- Proposed file layout:
  - Page: `src/pages/body-parts.astro` wrapped in `MainLayout`.
  - Components:
    - `src/components/body-area-selection/BodyPartSelector.tsx`
    - `src/components/body-area-selection/BodyPartButton.tsx`
    - `src/components/body-area-selection/NavigationNextButton.tsx`
  - Hook: `src/lib/hooks/useBodyParts.ts` to return state, error, loading, and `refresh()`.

## 3. Component Structure

- **BodyAreaSelectionPage** (Astro page): Wraps content in `MainLayout` and loads the client component.
  - **BodyPartSelector** (React, `client:load`): Handles data fetching, display of buttons, and selection logic.
    - **BodyPartButton** (React): Renders a single body part button with an icon and name.
  - **NavigationNextButton** (React): Renders the 'Next' button.

## 4. Component Details

### BodyPartSelector

- Description: Container that manages the list of body parts, selection state, and validation.
- Main elements:
  - Grid container (`<div className="grid grid-cols-2 gap-4">`).
  - List of `BodyPartButton` components.
  - Area for displaying error messages.
- Events:
  - Button `onClick` → `handleSelect(id)`.
- Validation:
  - Only one area can be selected. On second selection: set `error = "Select max 1 area"` and display the message.
- Types:
  - State:
    - `bodyParts: BodyPartDto[]`
    - `selectedBodyPartId: number | null`
    - `error: string | null`
    - `loading: boolean`
    - `fetchError: string | null`
- Props: none (fetches data internally).

### BodyPartButton

- Description: Represents a single body part selection button.
- Elements:
  - `<button>` with an SVG icon and text label.
- Events:
  - `onClick` → calls `onSelect(id)`.
- Props:
  - `id: number`
  - `name: string`
  - `selected: boolean`
  - `onSelect: (id: number) => void`

### NavigationNextButton

- Description: Next-step navigation button.
- Elements:
  - `<Button>` with label 'Next'.
- Events:
  - `onClick` → `navigate(`/muscle-tests/${selectedBodyPartId}`)`.
- Validation:
  - Disabled if `selectedBodyPartId` is `null`.
- Props:
  - `selectedBodyPartId: number | null`

## 5. Types

- `BodyPartDto`:
  - `id: number`
  - `name: string`
  - `created_at: string`
- `BodyPartVM` (optional view model): same as `BodyPartDto` or a subset.

## 6. State Management

- State variables:
  - `bodyParts: BodyPartDto[]`
  - `selectedBodyPartId: number | null`
  - `error: string | null`
  - `loading: boolean`
  - `fetchError: string | null`
- Hook: `useBodyParts()` returns these states and a `refresh()` function.

## 7. API Integration

- Endpoint: `GET /api/body_parts`
  - Request: none.
  - Response: `200 OK` with `BodyPartDto[]`.
- Usage: call `fetch('/api/body_parts')` inside `useBodyParts` hook.

## 8. User Interactions

1. User visits `/body-parts` → loader fetches data.
2. User clicks a body part button → selection state updates and button highlights.
3. User clicks another button after one is already selected → error message "Select max 1 area" appears.
4. User clicks 'Next' after a valid selection → navigates to `/muscle-tests/${selectedBodyPartId}`.

## 9. Conditions and Validation

- On initial load: 'Next' button is disabled.
- On valid selection: 'Next' button is enabled.
- On attempting a second selection: display "Select max 1 area" error.

## 10. Error Handling

- Fetch error: display an error message and a retry button.
- No data: display "No body areas available".

## 11. Implementation Steps

1. Create API route `src/pages/api/body_parts.ts` using `context.locals.supabase`.
2. Create Astro page `src/pages/body-parts.astro`, wrap content with `MainLayout`.
3. Implement `BodyPartSelector.tsx` in `src/components/body-area-selection`.
4. Implement `BodyPartButton.tsx` in the same directory.
5. Implement `NavigationNextButton.tsx` in the same directory.
6. Implement `useBodyParts` hook in `src/lib/hooks/useBodyParts.ts`.
7. Use `client:load` directive on the page to load `BodyPartSelector` component.
8. Style components with Tailwind and Shadcn UI.
9. Test selection, error handling, and navigation scenarios.
10. Add unit and end-to-end tests for selection and validation flows.
