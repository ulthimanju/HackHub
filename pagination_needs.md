# Pagination Analysis - EHub Client Service

This report identifies areas within the `client-service` and its supporting APIs where pagination should be implemented to ensure scalability and performance as the platform grows.

## 1. API Endpoints Requiring Pagination

Currently, most list-fetching endpoints return all records at once. These should be refactored to support `page` and `size` (or `limit` and `offset`) parameters.

### 1.1 Event Service (`src/services/eventService.js`)
- `getAllEvents`: As the number of global events grows, fetching all events will become slow and memory-intensive.
- `getOrganizerEvents`: Organizers with many historical events will experience lag.
- `getParticipantEvents`: Heavy users will be affected.
- `getEventRegistrations`: Popular events with thousands of participants will likely time out or crash the browser tab.

### 1.2 Team Service (`src/services/teamService.js`)
- `getTeamsByEvent`: Large hackathons can have hundreds of teams.
- `suggestMembers`: Matchmaking results should be paginated to show the most relevant matches first.

### 1.3 Auth Service
- `getUsersBySkills`: (Used by Matchmaking) Searching for developers by skill across the entire user base definitely requires pagination.

---

## 2. UI Components Requiring Pagination

Displaying large lists without pagination (or virtualization) leads to poor UX, high memory usage, and slow DOM updates.

### 2.1 Event Discovery
- **Component:** `src/pages/ExploreEvents.jsx`
- **Current State:** Fetches and filters the entire event list in memory.
- **Suggested Change:** Implement server-side filtering and pagination. Add a "Load More" button or a standard numeric pager.

### 2.2 Organizer Management Tabs
- **Component:** `src/components/features/events/RegistrationsTab/RegistrationsTab.jsx`
- **Need:** High. This is the most likely place to encounter hundreds or thousands of rows.
- **Component:** `src/components/features/events/OrgTeamsTab/OrgTeamsTab.jsx`
- **Need:** Medium. Large events will have many teams.
- **Component:** `src/components/features/events/SubmissionsTab/SubmissionsTab.jsx`
- **Need:** Medium. Displays projects for evaluation.

### 2.3 Public Leaderboard
- **Component:** `src/components/features/events/LeaderboardTab/LeaderboardTab.jsx`
- **Need:** Medium. While only the top teams are usually of interest, a full ranking requires pagination.

### 2.4 Matchmaking
- **Component:** `src/components/features/events/TeamTab/MatchmakingPanel.jsx`
- **Need:** Medium. Suggestions for common skills could return many users.

---

## 3. Suggested Implementation Strategy

### 3.1 Backend (Spring Boot Services)
- Use Spring Data's `Pageable` and `Page<T>` in repositories and controllers.
- Update endpoints to accept `page` and `size` query parameters.
- Return a wrapper object containing the content and metadata:
  ```json
  {
    "content": [...],
    "totalPages": 10,
    "totalElements": 100,
    "size": 10,
    "number": 0
  }
  ```

### 3.2 Frontend (React)
- **Data Fetching:** Update services to pass pagination params.
- **State Management:** Use a library like **TanStack Query** which has built-in support for "Infinite Queries" (Load More) or paginated queries.
- **Shared Component:** Create a reusable `Pagination` component in `src/components/common/` to provide a consistent UI for switching pages.

---

## Summary of Pagination Needs
| Feature | Priority | Implementation Level |
| :--- | :--- | :--- |
| Global Event List | High | API + UI (Explore) |
| Event Registrations | High | API + UI (Organizer Tab) |
| Teams List | Medium | API + UI (Organizer/Team Tabs) |
| Matchmaking Results | Medium | API + UI (Matchmaking Panel) |
| My Events | Low | API + UI (Dashboard) |
