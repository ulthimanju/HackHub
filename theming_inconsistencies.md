# Inconsistent Theming Report - EHub Client Service

This report identifies inconsistencies in the UI/UX implementation of the `client-service` compared to the established design tokens and semantic theme.

## 1. Component Duplication & Fragmented UI
The most significant inconsistency is the existence of two separate `EventCard` components with different designs and logic.

| Component Path | Visual Style | Icons Used |
| :--- | :--- | :--- |
| `src/components/features/dashboard/EventCard/EventCard.jsx` | Bold, large typography, orange accent | `Calendar`, `ChevronRight` |
| `src/components/features/events/EventCard/EventCard.jsx` | Detailed metadata, status variants, blue tags | `CalendarDays`, `Globe`, `Tag`, `ArrowRight` |

**Impact:** Users experience a fragmented interface where the same entity (a Hackathon Event) looks and behaves differently depending on the page.

---

## 2. Bypassing Semantic Tokens (`theme.js`)
While `src/utils/theme.js` provides a centralized token system, many components bypass it in favor of hardcoded Tailwind classes.

### 2.1 Hardcoded Status Colors
`StatusBadge.jsx` defines its own color mapping instead of using `theme.badge` or `theme.alert`.
- **Inconsistency:** `StatusBadge` uses `yellow-700` for PENDING, while `theme.js` uses `amber-700` for its warning/orange variants.

### 2.2 Arbitrary UI Colors
`Input.jsx` and others use hardcoded values like `focus:ring-brand-500/25` and `text-ink-secondary`. While these match the Tailwind config names, they should ideally be accessed via `theme.primary.ring` or similar semantic keys to ensure easy re-theming.

---

## 3. Use of Non-Standard / Arbitrary Values
The use of "magic numbers" in Tailwind classes (`[...]`) leads to subtle visual misalignments.

| File | Non-Standard Value | Potential Fix |
| :--- | :--- | :--- |
| `NotificationBell.jsx` | `w-76` | Use standard `w-72` or `w-80` |
| `UpgradeSection.jsx` | `h-[46px]` | Use standard `h-11` (44px) or `h-12` (48px) |
| Multiple Files | `text-[10px]` | Add `xxs: '10px'` to `tailwind.config.js` |
| `Modal.jsx` | `backdrop-blur-[2px]` | Use standard `backdrop-blur-sm` |
| `SkillTags.jsx` | `min-h-[80px]` | Use standard `min-h-20` |

---

## 4. Typography Inconsistencies
The project uses `Space Grotesk` for display and `DM Sans` for body text. However:
- Some "Display" style components (like `EventCard` titles) don't consistently apply the `font-display` class or use the `theme.text.heading` token.
- Sub-labels use `text-[10px]` in some places and `text-xs` (12px) in others, creating a "busy" and unscaled look in data-heavy views (e.g., `OrganizerDashboard`).

---

## 5. Summary of Audit Findings
| Category | Severity | Recommendation |
| :--- | :--- | :--- |
| **Component Consistency** | High | Consolidate duplicate `EventCard` components into a single shared component in `common/`. |
| **Token Adherence** | Medium | Refactor `StatusBadge` and `Input` to use semantic tokens from `theme.js`. |
| **Scale Adherence** | Low | Remove arbitrary values (`[...]`) and update `tailwind.config.js` with missing scale values. |
| **Visual Hierarchy** | Medium | Review all `text-[10px]` instances; either promote to `text-xs` or formalize as a new scale level. |
