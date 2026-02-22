# Ambiguity Analysis - EHub Application

This report identifies areas of functional, architectural, and UX ambiguity within the EHub application that could lead to bugs, developer confusion, or inconsistent user experiences.

## 1. Event Status Management Ambiguity
The `Event` entity (`event-service/src/main/java/com/ehub/event/entity/Event.java`) implements two competing ways to determine an event's status.

- **The Field:** `private EventStatus status;` (stored in the database).
- **The Method:** `public EventStatus calculateCurrentStatus()` (derived from timestamps).
- **The Conflict:** `EventService.java` often calls `calculateCurrentStatus()` but then saves the result to the `status` field. If timestamps are updated without recalculating the field, or if the field is set manually, the API response (which uses `event.getStatus() != null ? event.getStatus() : event.calculateCurrentStatus()`) may return stale or inconsistent data.
- **Ambiguity:** It is unclear whether the "Source of Truth" is the stored field or the derived logic.

## 2. Team Scoring Hierarchy Ambiguity
The `Team` entity (`event-service/src/main/java/com/ehub/event/entity/Team.java`) contains two score-related fields without a defined resolution logic in the backend.

- **Fields:** `Double score` (AI-generated) and `Double manualScore` (Organizer-set).
- **Ambiguity:** While the frontend (`SubmissionsTab.jsx`) implements logic to prefer `manualScore` (`const finalScore = manualScore ?? aiScore;`), the backend `TeamService` does not have a unified `getFinalScore()` method. This makes it ambiguous for other services (like `ai-service` or future reporting tools) which score to use.

## 3. Service Boundary Ambiguity (Event vs. Team)
There is significant overlap in responsibilities between `event-service` and `team-service`.

- **Scoring:** `teamService.js` handles `updateManualReview` and `finalizeResults`, even though these are arguably event-lifecycle concerns.
- **Evaluation:** `ai-service` calls `event-service` to get "evaluation context" for teams, but teams are managed via `teamService`.
- **Ambiguity:** The lack of strict domain separation makes it harder to maintain and scale the microservices independently.

## 4. Requirement Ambiguities

### 4.1 "Judging" Toggle
The `Event` entity has a `Boolean judging = true` field. In `calculateCurrentStatus`, if `judging` is manually set to `false`, the event transitions to `RESULTS_ANNOUNCED` or `COMPLETED`. 
- **Ambiguity:** There is no explicit "Start Judging" action that clearly transitions the event; it's a mix of time-based triggers and a boolean flag that isn't clearly exposed in the UI for all phases.

### 4.2 Membership Limits
The `event.teamSize` field is used to restrict team membership.
- **Ambiguity:** What happens if an organizer changes the `teamSize` *after* teams have already formed? The current logic does not handle retroactive validation, leaving existing teams in an ambiguous state (e.g., a team of 4 in an event now limited to 2).

## 5. Suggested Refactorings
1.  **Status Source of Truth:** Move to a purely derived status or use a state machine pattern where transitions are explicitly triggered and validated.
2.  **Unified Scoring:** Add a `getFinalScore()` method to the `Team` entity and DTO to centralize the `manual ?? ai` logic.
3.  **Domain Cleanup:** Move all team-specific logic (including scoring) to `team-service` and keep `event-service` focused on the high-level hackathon shell and registrations.
