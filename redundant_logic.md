# Redundant Logic Analysis - EHub Client Service

This report identifies duplicate functionalities and overlapping logic within the `client-service` to improve maintainability and code quality.

## 1. Local Utility Redundancies

### 1.1 Date Formatting
- **Location:** `client-service/src/components/features/events/RegistrationsTab/RegistrationsTab.jsx` (Lines 5-8)
- **Redundancy:** Defines a local `formatDateShort` function.
- **Suggested Refactoring:** Move date formatting logic to a centralized utility file (e.g., `src/utils/dateUtils.js`) to be shared across the application.

### 1.2 Inline Common Components
- **Location:** `client-service/src/components/features/events/TeamTab/TeamTab.jsx` (Lines 14-36)
- **Redundancy:** Defines `SectionTitle` and `InputField` as local components within the file.
- **Suggested Refactoring:** 
    - Move `SectionTitle` to `src/components/common/Section/SectionTitle.jsx`.
    - Refactor `InputField` to use the existing `src/components/common/Input/Input.jsx` or unify them if `InputField` has unique styles that are generally useful.

---

## 2. Hook & Service Overlaps

### 2.1 Dashboard Data Fetching
- **Location:** `src/hooks/useOrganizerDashboard.js` and `src/hooks/useParticipantDashboard.js`
- **Redundancy:** Both hooks implement manual `useEffect` with `cancelled` flags and `loading` states for fetching event lists.
- **Suggested Refactoring:** 
    - Create a generic `useFetch` or `useApi` hook to handle the `loading`, `error`, and `cancelled` boilerplate.
    - Better yet, adopt a library like **TanStack Query (React Query)** to handle caching, loading states, and automatic refetching.

### 2.2 Event vs. Team Service Logic
- **Location:** `src/services/eventService.js` and `src/services/teamService.js`
- **Redundancy:** `eventService` handles some team-related actions (e.g., `updateManualReview`, `finalizeResults`), while `teamService` handles others (e.g., `getTeamsByEvent`).
- **Suggested Refactoring:** Clearly separate domain logic. Move all team-specific API calls to `teamService.js` and keep `eventService.js` focused on event lifecycle and registration management.

---

## 3. UI/UX Logic Duplication

### 3.1 Status Badge Styling
- **Location:** `src/components/features/events/RegistrationsTab/RegistrationsTab.jsx` and `src/components/features/events/SubmissionsTab/SubmissionsTab.jsx`
- **Redundancy:** Both components define local mappings for status colors and styles (e.g., `STATUS_CONFIG` in `RegistrationsTab`).
- **Suggested Refactoring:** Centralize status styling in `src/utils/theme.js` or create a dedicated `StatusBadge` component that accepts a status prop and applies the correct theme-based styling.

### 3.2 Member List Rendering
- **Location:** `src/components/features/events/OrgTeamsTab/OrgTeamsTab.jsx` and `src/components/features/events/TeamTab/TeamTab.jsx`
- **Redundancy:** Both files implement logic to render a list of team members with avatars and leader crowns.
- **Suggested Refactoring:** Extract a `TeamMemberList` or `MemberAvatar` component into `src/components/features/events/common/` to ensure consistent look and feel and reduce code duplication.

### 3.3 Loading Spinner Duplication
- **Location:** `src/App.jsx`
- **Redundancy:** `PageSpinner` and `AppRoutes` both define their own loading spinner UI.
- **Suggested Refactoring:** Create a reusable `Spinner` or `LoadingOverlay` component in `src/components/common/` to be used globally.

---

## 4. Service Pattern Redundancy

### 4.1 Response Data Unwrapping
- **Location:** All service files (`authService.js`, `eventService.js`, `teamService.js`, etc.)
- **Redundancy:** Every method explicitly does `const response = await api.get(...); return response.data;`.
- **Suggested Refactoring:** Add a response interceptor in `api.js` to automatically return `response.data` for successful requests, or create a helper wrapper in `api.js` to reduce this boilerplate in every service method.

---

## Summary of Deliverables
| Redundancy | Severity | Impact | Recommendation |
| :--- | :--- | :--- | :--- |
| Inline UI Components | Low | Maintainability | Extract to `common/` |
| Local Utilities (Date) | Low | Consistency | Move to `utils/` |
| Dashboard Boilerplate | Medium | DX / Performance | Use `useApi` hook or React Query |
| Service Domain Overlap | Medium | Architecture | Strict domain separation |
| Style Logic Duplication | Medium | UI Consistency | Centralize in `theme.js` or shared components |
