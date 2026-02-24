# EHub — Client Service

React + Vite front-end for the EHub hackathon platform.

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build → dist/
npm run lint       # ESLint
```

Docker (production):
```bash
docker compose up --build client-service
```

---

## Directory Structure

```
src/
├── assets/            Static images, icons
├── components/
│   ├── common/        Reusable design-system primitives (Button, Input, Modal…)
│   ├── features/      Domain-specific composite components
│   │   ├── dashboard/ OrganizerDashboard, ParticipantDashboard
│   │   ├── events/    EventCard, EventForm, EventDetails tabs…
│   │   └── profile/   Profile form sections
│   └── layout/        MainLayout, NavItem, NotificationBell
├── constants/         App-wide enumerations and static data
├── context/           React context providers (AuthContext)
├── hooks/             Custom React hooks (see below)
├── pages/             Route-level page components
├── services/          Stateless API service modules
├── styles/            Global CSS
└── utils/             Pure helper functions
```

### Component layers ("Atomic" approach)

| Layer | Folder | Purpose |
|---|---|---|
| Primitives | `components/common/` | Single-responsibility UI atoms — no business logic, fully prop-driven |
| Features | `components/features/` | Compose primitives + hooks to implement domain features |
| Pages | `pages/` | Route entry-points — wire features together, own top-level data fetching |

---

## Path Aliases

Import with `@/` instead of relative `../../../` chains:

```js
// ✅ preferred
import Button from '@/components/common/Button/Button';
import { theme } from '@/utils/theme';

// ❌ avoid
import Button from '../../../components/common/Button/Button';
```

Alias is configured in `vite.config.js` (`resolve.alias`) and exposed to VS Code via `jsconfig.json`.

---

## Design System

All design tokens live in a single file: **`src/utils/theme.js`**.

```js
import { theme } from '@/utils/theme';

// usage
<div className={theme.surface.card}>…</div>
<Button variant="primary">Save</Button>
```

### Brand color
Single primary color (`brand-*`) with semantic variants:
- `brand-50` … `brand-700` — tints/shades
- `red-*` — destructive / danger actions
- `green-*` — success states

### Common primitives
`Button`, `Input`, `Textarea`, `Modal`, `Badge`, `StatusBadge`, `Alert`, `Tabs`, `Tab`,
`Checkbox`, `DateTimePicker`, `TagAutocomplete`, `Pagination`, `Spinner`, `Section`, `Guard`

---

## Coding Standards

### General
- **Wrap all reusable common components with `memo`** to avoid unnecessary re-renders.
- Keep services **stateless** — no React state, no hooks. Services call `api.js` and return promises.
- One component per file. File name = component name.
- Prefer named exports for hooks and utilities; default exports for components and services.

### State management
- Local component state (`useState`) for UI-only state.
- Custom hooks for shared or complex state logic.
- No global state library — context is used only for auth.

### Styling
- Tailwind CSS utility classes only.
- Never hardcode colors or spacing — use design tokens from `theme.js` or Tailwind config.
- Avoid inline `style={}` unless absolutely required (e.g., dynamic calculated values).

### Routing & access control
- All protected routes are wrapped in `<Guard roles={[…]}>`.
- `useAbility()` is the single source of truth for role-based permissions.
- Update `useAbility.js` to change what a role can do — never scatter role checks across components.

### Error handling
- Services let errors propagate — callers (hooks/components) handle them.
- `useApi` catches errors and exposes them as `error` string.
- Show user-facing errors with the `<Alert variant="error">` component.

---

## Hooks Reference

| Hook | Returns | Purpose |
|---|---|---|
| `useAbility` | `{ isOrganizer, canCreateEvent, canManageEvent, … }` | Role-based permission checks |
| `useApi(fn, deps)` | `{ data, loading, error, refetch }` | Generic async data fetcher |
| `useAuth` | `{ user, logout }` | Access auth context |
| `useEventPermissions(event)` | `{ isEventOwner, canEditProblem, … }` | Per-event permission flags |
| `useMatchmaking(team)` | skills + suggestions state + handlers | Skill-tag editing + AI member suggestions |
| `useNotifications(user)` | `{ notifications, unreadCount, markAsRead, … }` | STOMP WebSocket notifications with localStorage |
| `useOrganizerDashboard` | `{ events, statsMap, totals, loading }` | Organizer events + aggregated stats |
| `useParticipantDashboard` | `{ events, statusMap, loading }` | Participant events + registration statuses |
| `useSubmissions(eventId, refresh)` | evaluation state + review handlers | AI evaluation + manual team review |
| `useTeamTab(eventId, user)` | teams state + action handlers | Full team lifecycle management |

---

## Services Reference

All services are plain objects of `(params) => Promise` methods. Import and call directly.

| Service | Key methods |
|---|---|
| `authService` | `login`, `register`, `requestOtp`, `upgradeRole`, `resetPassword`, `logout`, `getProfile`, `updateProfile` |
| `eventService` | `getAllEvents`, `getEventById`, `createEvent`, `updateEvent`, `deleteEvent`, `registerForEvent`, `getEventStats`, `advanceEventStatus`, `addProblemStatement`, `getReferences`, `getRules`, … |
| `teamService` | `createTeam`, `requestToJoin`, `respondToInvite`, `leaveTeam`, `submitProject`, `selectProblemStatement`, `transferLeadership`, `updateSkillsNeeded`, `suggestMembers`, … |
| `aiService` | `evaluateEvent(eventId)`, `evaluateTeam(teamId)` |

All requests go through `src/services/api.js` (Axios instance) which:
- Attaches JWT from `localStorage` on every request
- Auto-redirects to `/login` on 401
- Unwraps `response.data` so service methods return the payload directly

---

## Environment

| Variable | Default | Notes |
|---|---|---|
| Vite proxy `/api` | `http://localhost:8000` | API Gateway (dev only) |
| Production | nginx reverse-proxy | See `nginx.conf` |

