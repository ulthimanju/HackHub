# EHub — UML Diagrams

> All diagrams are written in PlantUML.
> Render at: https://www.plantuml.com/plantuml/uml or use a PlantUML-compatible IDE plugin.

---

## Table of Contents

1. [Class Diagrams](#class-diagrams)
   - [Auth Service](#class-diagram-1--auth-service)
   - [Event Domain (Core Entities)](#class-diagram-2--event-domain-core-entities)
   - [Team Domain](#class-diagram-3--team-domain)
   - [AI Service](#class-diagram-4--ai-service)
   - [Notification Service](#class-diagram-5--notification-service)
   - [Cross-Service Communication](#class-diagram-6--cross-service-communication)
2. [Use Case Diagrams](#use-case-diagrams)
   - [Authentication & Account Management](#use-case-diagram-1--authentication--account-management)
   - [Event Management](#use-case-diagram-2--event-management)
   - [Registration & Team Management](#use-case-diagram-3--registration--team-management)
   - [Project Submission & Scoring](#use-case-diagram-4--project-submission--scoring)
   - [AI Evaluation Pipeline](#use-case-diagram-5--ai-evaluation-pipeline)
   - [Notifications](#use-case-diagram-6--notifications)
   - [Complete System Use Case](#use-case-diagram-7--complete-system)
3. [Object Diagrams](#object-diagrams)
   - [User Instances](#object-diagram-1--user-instances)
   - [Event with Problem Statements](#object-diagram-2--event-with-problem-statements)
   - [Team with Members](#object-diagram-3--team-with-members)
   - [Registrations Snapshot](#object-diagram-4--registrations-snapshot)
   - [AI Evaluation Job Snapshot](#object-diagram-5--ai-evaluation-job-snapshot)
   - [Notification & OTP Snapshot](#object-diagram-6--notification--otp-snapshot)
4. [Activity Diagrams](#activity-diagrams)
   - [User Registration & Login](#activity-diagram-1--user-registration--login)
   - [Password Reset](#activity-diagram-2--password-reset)
   - [Event Creation & Phase Lifecycle](#activity-diagram-3--event-creation--phase-lifecycle)
   - [Team Formation & Project Submission](#activity-diagram-4--team-formation--project-submission)
   - [AI Evaluation Pipeline](#activity-diagram-5--ai-evaluation-pipeline)
   - [Teammate Matchmaking](#activity-diagram-6--teammate-matchmaking)
   - [Manual Scoring & Leaderboard](#activity-diagram-7--manual-scoring--leaderboard)
5. [Component Diagrams](#component-diagrams)
   - [Overall System Architecture](#component-diagram-1--overall-system-architecture)
   - [Auth Service Internal](#component-diagram-2--auth-service-internal)
   - [Event Service Internal](#component-diagram-3--event-service-internal)
   - [AI Service Internal](#component-diagram-4--ai-service-internal)
   - [Notification Service Internal](#component-diagram-5--notification-service-internal)
   - [API Gateway & Security](#component-diagram-6--api-gateway--security)
6. [State Machine Diagram](#state-machine-diagram)
7. [Deployment Diagram](#deployment-diagram)

---

## Class Diagrams

### Class Diagram 1 — Auth Service

```plantuml
@startuml Auth_Service

skinparam classAttributeIconSize 0
skinparam classFontStyle Bold
skinparam backgroundColor #FAFAFA
skinparam class {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

enum UserRole {
  PARTICIPANT
  ORGANIZER
}

enum ExperienceLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

class User implements UserDetails {
  - id : String
  - username : String
  - email : String
  - password : String
  - displayName : String
  - bio : String
  - githubUrl : String
  - linkedinUrl : String
  - portfolioUrl : String
  - skills : List<String>
  - role : UserRole
  - experienceLevel : ExperienceLevel
  - openToInvites : boolean
  - enabled : boolean
}

class JwtService {
  + generateToken(user) : String
  + validateToken(token) : boolean
  + extractUsername(token) : String
}

class TokenBlacklistService {
  - redisTemplate : StringRedisTemplate
  + blacklist(token : String) : void
  + isBlacklisted(token : String) : boolean
}

class AuthService {
  - userRepository : UserRepository
  - passwordEncoder : PasswordEncoder
  - jwtService : JwtService
  - notificationClient : NotificationClient
  - tokenBlacklistService : TokenBlacklistService
  + register(request) : AuthResponse
  + login(request) : AuthResponse
  + logout(token : String) : void
  + resetPassword(request) : void
  + getProfile(username : String) : User
  + updateProfile(username, request) : UserResponse
  + upgradeToOrganizer(username, otp) : AuthResponse
  + getUsersBySkills(skills) : List<User>
}

class AuthController {
  - authService : AuthService
  + register(request) : ResponseEntity
  + login(request) : ResponseEntity
  + logout() : ResponseEntity
  + getProfile() : ResponseEntity
  + updateProfile(request) : ResponseEntity
  + resetPassword(request) : ResponseEntity
  + upgradeRole(request) : ResponseEntity
  + validateToken(token) : ResponseEntity
}

User --> UserRole
User --> ExperienceLevel
AuthService --> JwtService
AuthService --> TokenBlacklistService
AuthService --> User
AuthController --> AuthService

@enduml
```

---

### Class Diagram 2 — Event Domain (Core Entities)

```plantuml
@startuml Event_Entities

skinparam classAttributeIconSize 0
skinparam classFontStyle Bold
skinparam backgroundColor #FAFAFA
skinparam class {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

enum EventStatus {
  DRAFT
  REGISTRATION_OPEN
  IN_PROGRESS
  JUDGING
  COMPLETED
}

enum RegistrationStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

class Event {
  - id : String
  - shortCode : String
  - name : String
  - theme : String
  - description : String
  - organizerId : String
  - startDate : LocalDateTime
  - endDate : LocalDateTime
  - registrationStartDate : LocalDateTime
  - registrationEndDate : LocalDateTime
  - maxParticipants : Integer
  - teamSize : Integer
  - isVirtual : boolean
  - venue : String
  - location : String
  - contactEmail : String
  - prizes : List<String>
  - status : EventStatus
}

class ProblemStatement {
  - id : String
  - statementId : String
  - name : String
  - statement : String
  - requirements : String
  - event : Event
}

class Registration {
  - id : String
  - userId : String
  - username : String
  - userEmail : String
  - status : RegistrationStatus
  - registrationTime : LocalDateTime
  - event : Event
}

class EventRule {
  - eventId : String
  - contentMd : String
}

class EventReference {
  - eventId : String
  - contentMd : String
}

Event "1" *-- "0..*" ProblemStatement : contains >
Event "1" *-- "0..*" Registration : has >
Event --> EventStatus
Registration --> RegistrationStatus
Event "1" -- "0..1" EventRule : has >
Event "1" -- "0..1" EventReference : has >

@enduml
```

---

### Class Diagram 3 — Team Domain

```plantuml
@startuml Team_Domain

skinparam classAttributeIconSize 0
skinparam classFontStyle Bold
skinparam backgroundColor #FAFAFA
skinparam class {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

enum TeamRole {
  LEADER
  MEMBER
}

enum TeamMemberStatus {
  INVITED
  REQUESTED
  ACTIVE
}

class Team {
  - id : String
  - shortCode : String
  - name : String
  - eventId : String
  - leaderId : String
  - problemStatementId : String
  - skillsNeeded : List<String>
  -- Submission --
  - repoUrl : String
  - demoUrl : String
  - submissionTime : LocalDateTime
  -- Scoring --
  - score : Double
  - aiSummary : String
  - manualScore : Double
  - organizerNotes : String
}

class TeamMember {
  - id : String
  - userId : String
  - username : String
  - userEmail : String
  - role : TeamRole
  - status : TeamMemberStatus
}

class TeamService {
  - teamRepository : TeamRepository
  - teamMemberRepository : TeamMemberRepository
  - eventRepository : EventRepository
  - notificationClient : NotificationClient
  + createTeam(eventId, request, userId) : void
  + joinTeam(shortCode, request) : void
  + leaveTeam(teamId, userId) : void
  + submitProject(teamId, userId, request) : void
  + updateScore(teamId, score, summary, requesterId) : void
  + updateManualReview(teamId, score, notes, requesterId) : void
  + dismantleTeam(teamId, leaderId) : void
  + transferLeadership(teamId, currentLeaderId, newLeaderId) : void
}

class TeamController {
  - teamService : TeamService
  + createTeam(eventId, request) : ResponseEntity
  + getTeamsByEvent(eventId) : Page<TeamResponse>
  + joinByCode(shortCode, request) : ResponseEntity
  + leaveTeam(teamId) : ResponseEntity
  + submitProject(teamId, request) : ResponseEntity
  + updateManualReview(teamId, request) : ResponseEntity
  + updateScore(teamId, request) : ResponseEntity
}

Team "1" *-- "1..*" TeamMember : members >
TeamMember --> TeamRole
TeamMember --> TeamMemberStatus
TeamController --> TeamService
TeamService --> Team

@enduml
```

---

### Class Diagram 4 — AI Service

```plantuml
@startuml AI_Service

skinparam classAttributeIconSize 0
skinparam classFontStyle Bold
skinparam backgroundColor #FAFAFA
skinparam class {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

enum JobStatus {
  QUEUED
  CLONING
  ANALYZING
  COMPLETED
  FAILED
}

class EvaluationContext <<record>> {
  + teamId : String
  + teamName : String
  + repoUrl : String
  + eventTheme : String
  + problemStatement : String
  + requirements : String
}

class EvaluationJob <<record>> {
  + teamId : String
  + context : EvaluationContext
  + status : JobStatus
  + retryCount : int
  + errorMessage : String
  + enqueuedAt : long
}

class GeminiResult <<record>> {
  + score : double
  + summary : String
}

class WorkspaceManager {
  - workspaceBasePath : String
  + clone(repoUrl, teamId) : Path
  + verify(teamId) : boolean
  + cleanup(teamId) : void
}

class GeminiCliWrapper {
  - promptTemplate : String
  + analyze(context : EvaluationContext, workspacePath : Path) : GeminiResult
  - buildPrompt(context, path) : String
  - parseOutput(raw : String) : GeminiResult
}

class EventServiceClient {
  - restTemplate : RestTemplate
  - eventServiceUrl : String
  - internalSecret : String
  + getEvaluationContext(eventId : String) : List<Map>
  + postScore(teamId, score, summary) : void
}

class EvaluationWorker {
  - redisTemplate : RedisTemplate
  - workspaceManager : WorkspaceManager
  - geminiCliWrapper : GeminiCliWrapper
  - eventServiceClient : EventServiceClient
  - maxRetries : int
  + queueEvent(eventId : String) : int
  + queueTeam(teamId : String) : void
  + getJobStatus(teamId : String) : Map
  - runWorkerLoop() : void
  - processJob(job : EvaluationJob) : void
  - updateJobStatus(teamId, status, error) : void
}

class AiController {
  - evaluationWorker : EvaluationWorker
  + evaluateEvent(eventId) : ResponseEntity
  + evaluateTeam(teamId) : ResponseEntity
  + getJobStatus(teamId) : ResponseEntity
}

EvaluationJob --> EvaluationContext
EvaluationJob --> JobStatus
EvaluationWorker --> WorkspaceManager
EvaluationWorker --> GeminiCliWrapper
EvaluationWorker --> EventServiceClient
EvaluationWorker --> EvaluationJob
GeminiCliWrapper --> GeminiResult
AiController --> EvaluationWorker

@enduml
```

---

### Class Diagram 5 — Notification Service

```plantuml
@startuml Notification_Service

skinparam classAttributeIconSize 0
skinparam classFontStyle Bold
skinparam backgroundColor #FAFAFA
skinparam class {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

enum OtpPurpose {
  REGISTRATION
  PASSWORD_RESET
  ROLE_UPGRADE
}

class EmailService {
  - mailSender : JavaMailSender
  - templateEngine : TemplateEngine
  + sendHtmlEmail(to, subject, template, vars) : void
}

class OtpService {
  - redisTemplate : StringRedisTemplate
  - otpTtlMinutes : int
  - rateLimitSeconds : int
  + generateOtp(email, purpose : OtpPurpose) : String
  + validateOtp(email, otp, purpose : OtpPurpose) : boolean
}

class NotificationController {
  - emailService : EmailService
  - otpService : OtpService
  + sendAlert(request) : ResponseEntity
  + generateOtp(email, purpose) : ResponseEntity
  + validateOtp(email, otp, purpose) : ResponseEntity
  + sendPasswordResetOtp(email) : ResponseEntity
  + sendRegistrationOtp(email) : ResponseEntity
  + sendRoleUpgradeOtp(email) : ResponseEntity
}

NotificationController --> EmailService
NotificationController --> OtpService
OtpService --> OtpPurpose

@enduml
```

---

### Class Diagram 6 — Cross-Service Communication

```plantuml
@startuml Cross_Service

skinparam classAttributeIconSize 0
skinparam classFontStyle Bold
skinparam backgroundColor #FAFAFA
skinparam class {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

class Browser <<client>> {
  + JWT Bearer token
  + JSON requests
}

class ApiGateway <<Spring Cloud Gateway>> {
  - port : 8000
  - internalSecret : String
  + routeToAuthService()
  + routeToEventService()
  + routeToAiService()
}

class AuthService <<Spring Boot : 8081>> {
  - authDb : PostgreSQL
  - redis : Redis
}

class EventService <<Spring Boot : 8084>> {
  - eventDb : PostgreSQL
  - redis : Redis
}

class AiService <<Spring Boot : 8085>> {
  - redis : Redis
  - geminiCli : ProcessBuilder
}

class NotificationService <<Spring Boot : 8082>> {
  - smtp : Gmail
  - redis : Redis
}

class Redis <<Infrastructure>> {
  - sessionCache
  - jobQueue : List
  - jobStatus : Hash
  - pubSubChannel
}

class AuthDB <<PostgreSQL 15>> {
  - users
  - credentials
}

class EventDB <<PostgreSQL 15>> {
  - events
  - teams
  - registrations
  - submissions
}

class GmailSMTP <<External>> {
  - port : 587
  - STARTTLS
}

class GeminiCLI <<External Process>> {
  - auth : /root/.gemini
  - flags : --yolo --output-format=text
}

Browser --> ApiGateway : HTTPS / JWT
ApiGateway --> AuthService : X-Internal-Secret
ApiGateway --> EventService : X-Internal-Secret
ApiGateway --> AiService : X-Internal-Secret

AuthService --> AuthDB : JPA
AuthService --> Redis : session cache
AuthService --> NotificationService : HTTP (OTP)

EventService --> EventDB : JPA
EventService --> Redis : pub/sub publish
EventService --> NotificationService : HTTP (alerts)

AiService --> Redis : job queue / status
AiService --> EventService : HTTP score write-back
AiService --> GeminiCLI : ProcessBuilder

NotificationService --> Redis : pub/sub subscribe
NotificationService --> GmailSMTP : SMTP

@enduml
```

---

## Use Case Diagrams

### Use Case Diagram 1 — Authentication & Account Management

```plantuml
@startuml UC1_Authentication

left to right direction
skinparam actorStyle awesome
skinparam backgroundColor #FAFAFA
skinparam usecase {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

actor Visitor
actor Participant
actor Organizer

Participant --|> Visitor
Organizer --|> Participant

rectangle "Authentication & Account Management" {
  usecase "Register Account" as UC_Register
  usecase "Verify OTP (Email)" as UC_OTP
  usecase "Login" as UC_Login
  usecase "Logout" as UC_Logout
  usecase "Reset Password" as UC_Reset
  usecase "View Profile" as UC_ViewProfile
  usecase "Update Profile" as UC_UpdateProfile
  usecase "Update Skills" as UC_Skills
  usecase "Upgrade to Organizer" as UC_Upgrade
  usecase "Validate Token" as UC_Validate
}

Visitor --> UC_Register
Visitor --> UC_Login
Visitor --> UC_Reset

UC_Register ..> UC_OTP : <<include>>
UC_Reset ..> UC_OTP : <<include>>
UC_Upgrade ..> UC_OTP : <<include>>

Participant --> UC_Logout
Participant --> UC_ViewProfile
Participant --> UC_UpdateProfile
Participant --> UC_Skills
Participant --> UC_Upgrade
Participant --> UC_Validate

@enduml
```

---

### Use Case Diagram 2 — Event Management

```plantuml
@startuml UC2_EventManagement

left to right direction
skinparam actorStyle awesome
skinparam backgroundColor #FAFAFA
skinparam usecase {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

actor Organizer
actor Participant

rectangle "Event Management" {
  usecase "Create Event" as UC_Create
  usecase "Edit Event" as UC_Edit
  usecase "Delete Event" as UC_Delete
  usecase "Advance Event Phase" as UC_Advance
  usecase "Toggle Judging Mode" as UC_Judge
  usecase "Add Problem Statements" as UC_Problems
  usecase "Edit Problem Statement" as UC_EditPS
  usecase "Delete Problem Statement" as UC_DeletePS
  usecase "View Event Details" as UC_View
  usecase "Browse All Events" as UC_Browse
  usecase "View Event Stats" as UC_Stats
  usecase "Manage Event Rules" as UC_Rules
  usecase "Manage Event References" as UC_Refs
  usecase "Confirm Phase Change" as UC_Confirm
}

Organizer --> UC_Create
Organizer --> UC_Edit
Organizer --> UC_Delete
Organizer --> UC_Advance
Organizer --> UC_Judge
Organizer --> UC_Problems
Organizer --> UC_EditPS
Organizer --> UC_DeletePS
Organizer --> UC_View
Organizer --> UC_Stats
Organizer --> UC_Rules
Organizer --> UC_Refs

Participant --> UC_Browse
Participant --> UC_View

UC_Advance ..> UC_Confirm : <<include>>
UC_Delete ..> UC_Confirm : <<include>>
UC_Problems ..> UC_Create : <<extend>>

@enduml
```

---

### Use Case Diagram 3 — Registration & Team Management

```plantuml
@startuml UC3_TeamRegistration

left to right direction
skinparam actorStyle awesome
skinparam backgroundColor #FAFAFA
skinparam usecase {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

actor Participant
actor "Team Leader" as Leader
Leader --|> Participant

rectangle "Event Registration" {
  usecase "Register for Event" as UC_Reg
  usecase "Cancel Registration" as UC_CancelReg
  usecase "View My Registrations" as UC_MyReg
}

rectangle "Team Management" {
  usecase "Create Team" as UC_CreateTeam
  usecase "Join Team via Code" as UC_JoinCode
  usecase "Request to Join Team" as UC_ReqJoin
  usecase "Leave Team" as UC_Leave
  usecase "Find Teammates" as UC_Match
  usecase "View Team Details" as UC_ViewTeam
  usecase "Invite Member" as UC_Invite
  usecase "Respond to Invite" as UC_Respond
  usecase "Respond to Join Request" as UC_RespondReq
  usecase "Transfer Leadership" as UC_Transfer
  usecase "Dismantle Team" as UC_Dismantle
  usecase "Select Problem Statement" as UC_SelectPS
  usecase "Update Skills Needed" as UC_SkillsNeeded
}

Participant --> UC_Reg
Participant --> UC_CancelReg
Participant --> UC_MyReg
Participant --> UC_CreateTeam
Participant --> UC_JoinCode
Participant --> UC_ReqJoin
Participant --> UC_Leave
Participant --> UC_Match
Participant --> UC_ViewTeam
Participant --> UC_Respond

Leader --> UC_Invite
Leader --> UC_RespondReq
Leader --> UC_Transfer
Leader --> UC_Dismantle
Leader --> UC_SelectPS
Leader --> UC_SkillsNeeded

UC_Reg ..> UC_CreateTeam : <<extend>>

@enduml
```

---

### Use Case Diagram 4 — Project Submission & Scoring

```plantuml
@startuml UC4_SubmissionScoring

left to right direction
skinparam actorStyle awesome
skinparam backgroundColor #FAFAFA
skinparam usecase {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

actor "Team Leader" as Leader
actor Organizer

rectangle "Project Submission" {
  usecase "Submit Project" as UC_Submit
  usecase "Update Submission" as UC_UpdateSub
  usecase "View Submission Details" as UC_ViewSub
}

rectangle "Scoring & Review" {
  usecase "View All Submissions" as UC_AllSubs
  usecase "Assign Manual Score" as UC_ManualScore
  usecase "Add Organizer Notes" as UC_Notes
  usecase "Trigger AI Evaluation" as UC_TriggerAI
  usecase "View AI Score & Summary" as UC_AIScore
  usecase "View Leaderboard" as UC_Leaderboard
  usecase "Poll Evaluation Status" as UC_PollStatus
}

Leader --> UC_Submit
Leader --> UC_UpdateSub
Leader --> UC_ViewSub
Leader --> UC_AIScore
Leader --> UC_Leaderboard

Organizer --> UC_AllSubs
Organizer --> UC_ManualScore
Organizer --> UC_Notes
Organizer --> UC_TriggerAI
Organizer --> UC_AIScore
Organizer --> UC_Leaderboard
Organizer --> UC_PollStatus

UC_ManualScore ..> UC_Notes : <<include>>
UC_TriggerAI ..> UC_PollStatus : <<extend>>

@enduml
```

---

### Use Case Diagram 5 — AI Evaluation Pipeline

```plantuml
@startuml UC5_AIEvaluation

left to right direction
skinparam actorStyle awesome
skinparam backgroundColor #FAFAFA
skinparam usecase {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

actor Organizer
actor "AI Worker\n(System)" as AIWorker
actor "Gemini CLI\n(External)" as Gemini
actor "Event Service\n(Internal API)" as EventSvc

rectangle "AI Evaluation Pipeline" {
  usecase "Trigger Evaluation for Event" as UC_Trigger
  usecase "Enqueue Team Jobs (Redis)" as UC_Enqueue
  usecase "Dequeue Job" as UC_Dequeue
  usecase "Clone Repository" as UC_Clone
  usecase "Verify Workspace" as UC_Verify
  usecase "Build Evaluation Prompt" as UC_Prompt
  usecase "Invoke Gemini CLI" as UC_Gemini
  usecase "Parse Gemini Output" as UC_Parse
  usecase "Write Score to Event Service" as UC_WriteScore
  usecase "Update Job Status (Redis)" as UC_Status
  usecase "Cleanup Workspace" as UC_Cleanup
  usecase "Retry on Transient Failure" as UC_Retry
  usecase "Mark Job as FAILED" as UC_Fail
}

Organizer --> UC_Trigger
UC_Trigger ..> UC_Enqueue : <<include>>

AIWorker --> UC_Dequeue
UC_Dequeue ..> UC_Clone : <<include>>
UC_Clone ..> UC_Verify : <<include>>
UC_Verify ..> UC_Prompt : <<include>>
UC_Prompt ..> UC_Gemini : <<include>>
UC_Gemini ..> UC_Parse : <<include>>
UC_Parse ..> UC_WriteScore : <<include>>
UC_WriteScore ..> UC_Cleanup : <<include>>
UC_WriteScore ..> UC_Status : <<include>>

UC_Clone ..> UC_Retry : <<extend>>
UC_Gemini ..> UC_Retry : <<extend>>
UC_Retry ..> UC_Fail : <<extend>>

AIWorker --> UC_Status
Gemini --> UC_Gemini : executes
EventSvc --> UC_WriteScore : receives

@enduml
```

---

### Use Case Diagram 6 — Notifications

```plantuml
@startuml UC6_Notifications

left to right direction
skinparam actorStyle awesome
skinparam backgroundColor #FAFAFA
skinparam usecase {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

actor Participant
actor Organizer
actor "Notification\nService (System)" as NotifSvc
actor "Gmail SMTP\n(External)" as SMTP

rectangle "Notification Triggers" {
  usecase "Receive Event Registration" as UC_RegNotif
  usecase "Receive Team Join Alert" as UC_TeamNotif
  usecase "Receive Phase Change Alert" as UC_PhaseNotif
  usecase "Receive OTP (Registration)" as UC_OTPReg
  usecase "Receive OTP (Password Reset)" as UC_OTPReset
  usecase "Receive OTP (Role Upgrade)" as UC_OTPRole
}

rectangle "Notification Delivery" {
  usecase "Consume Redis Pub/Sub Event" as UC_Consume
  usecase "Render HTML Email Template" as UC_Render
  usecase "Send Email via SMTP" as UC_Send
  usecase "Generate OTP" as UC_GenOTP
  usecase "Validate OTP" as UC_ValOTP
  usecase "Log Delivery Outcome" as UC_Log
}

Participant --> UC_RegNotif
Participant --> UC_TeamNotif
Participant --> UC_PhaseNotif
Participant --> UC_OTPReg
Participant --> UC_OTPReset
Participant --> UC_OTPRole

NotifSvc --> UC_Consume
NotifSvc --> UC_GenOTP
NotifSvc --> UC_ValOTP

UC_Consume ..> UC_Render : <<include>>
UC_Render ..> UC_Send : <<include>>
UC_Send ..> UC_Log : <<include>>

UC_RegNotif ..> UC_Consume : <<include>>
UC_TeamNotif ..> UC_Consume : <<include>>
UC_PhaseNotif ..> UC_Consume : <<include>>
UC_OTPReg ..> UC_GenOTP : <<include>>
UC_OTPReset ..> UC_GenOTP : <<include>>
UC_OTPRole ..> UC_GenOTP : <<include>>

SMTP --> UC_Send : delivers via

@enduml
```

---

### Use Case Diagram 7 — Complete System

```plantuml
@startuml EHub_Complete_UseCase

left to right direction
skinparam actorStyle awesome
skinparam backgroundColor #FAFAFA
skinparam usecase {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}
skinparam actor {
  BorderColor #555555
  BackgroundColor #FFFFFF
}
skinparam packageStyle rectangle

actor Visitor
actor Participant
actor "Team Leader" as Leader
actor Organizer
actor "AI Worker\n(System)" as AIWorker
actor "Notification\nService (System)" as NotifSvc
actor "Gemini CLI\n(External)" as Gemini
actor "Gmail SMTP\n(External)" as SMTP

Participant --|> Visitor
Leader     --|> Participant
Organizer  --|> Participant

package "Authentication" {
  usecase "Register Account" as UC_Register
  usecase "Verify OTP" as UC_OTP
  usecase "Login" as UC_Login
  usecase "Logout" as UC_Logout
  usecase "Reset Password" as UC_Reset
  usecase "Upgrade to Organizer" as UC_Upgrade
  usecase "Update Profile & Skills" as UC_Profile
}

package "Event Management" {
  usecase "Create Event" as UC_CreateEvent
  usecase "Edit Event" as UC_EditEvent
  usecase "Delete Event" as UC_DeleteEvent
  usecase "Advance Phase" as UC_Advance
  usecase "Toggle Judging" as UC_Judging
  usecase "Manage Problem Statements" as UC_Problems
  usecase "Manage Rules & References" as UC_Rules
  usecase "Browse & Search Events" as UC_Browse
  usecase "View Event Details" as UC_ViewEvent
  usecase "View Event Stats" as UC_Stats
}

package "Registration & Teams" {
  usecase "Register for Event" as UC_Register2
  usecase "Cancel Registration" as UC_CancelReg
  usecase "Create Team" as UC_CreateTeam
  usecase "Join Team via Code" as UC_JoinTeam
  usecase "Request to Join Team" as UC_RequestJoin
  usecase "Invite Member" as UC_Invite
  usecase "Respond to Invite/Request" as UC_Respond
  usecase "Leave Team" as UC_LeaveTeam
  usecase "Transfer Leadership" as UC_Transfer
  usecase "Dismantle Team" as UC_Dismantle
  usecase "Select Problem Statement" as UC_SelectPS
  usecase "Find Teammates" as UC_Matchmaking
}

package "Submission & Scoring" {
  usecase "Submit Project" as UC_Submit
  usecase "Update Submission" as UC_UpdateSub
  usecase "View Submissions" as UC_ViewSubs
  usecase "Assign Manual Score" as UC_ManualScore
  usecase "Add Organizer Notes" as UC_Notes
  usecase "View Leaderboard" as UC_Leaderboard
}

package "AI Evaluation" {
  usecase "Trigger AI Evaluation" as UC_TriggerAI
  usecase "Enqueue Jobs (Redis)" as UC_Enqueue
  usecase "Clone Repository" as UC_Clone
  usecase "Invoke Gemini CLI" as UC_InvokeGemini
  usecase "Parse & Store Score" as UC_ParseScore
  usecase "Poll Job Status" as UC_PollStatus
  usecase "Retry on Failure" as UC_Retry
  usecase "Cleanup Workspace" as UC_Cleanup
}

package "Notifications" {
  usecase "Send Registration Alert" as UC_NotifReg
  usecase "Send Team Join Alert" as UC_NotifTeam
  usecase "Send Phase Change Alert" as UC_NotifPhase
  usecase "Deliver OTP Email" as UC_NotifOTP
  usecase "Render & Send Email" as UC_SendEmail
}

Visitor     --> UC_Register
Visitor     --> UC_Login
Visitor     --> UC_Reset
Visitor     --> UC_Browse

Participant --> UC_Logout
Participant --> UC_Profile
Participant --> UC_Upgrade
Participant --> UC_ViewEvent
Participant --> UC_Register2
Participant --> UC_CancelReg
Participant --> UC_CreateTeam
Participant --> UC_JoinTeam
Participant --> UC_RequestJoin
Participant --> UC_Respond
Participant --> UC_LeaveTeam
Participant --> UC_Matchmaking
Participant --> UC_Submit
Participant --> UC_UpdateSub
Participant --> UC_Leaderboard

Leader      --> UC_Invite
Leader      --> UC_Transfer
Leader      --> UC_Dismantle
Leader      --> UC_SelectPS
Leader      --> UC_UpdateSub

Organizer   --> UC_CreateEvent
Organizer   --> UC_EditEvent
Organizer   --> UC_DeleteEvent
Organizer   --> UC_Advance
Organizer   --> UC_Judging
Organizer   --> UC_Problems
Organizer   --> UC_Rules
Organizer   --> UC_Stats
Organizer   --> UC_ViewSubs
Organizer   --> UC_ManualScore
Organizer   --> UC_Notes
Organizer   --> UC_TriggerAI
Organizer   --> UC_PollStatus

AIWorker    --> UC_Enqueue
AIWorker    --> UC_Clone
AIWorker    --> UC_InvokeGemini
AIWorker    --> UC_ParseScore
AIWorker    --> UC_Cleanup

Gemini      --> UC_InvokeGemini
SMTP        --> UC_SendEmail
NotifSvc    --> UC_SendEmail

UC_Register  ..> UC_OTP         : <<include>>
UC_Reset     ..> UC_OTP         : <<include>>
UC_Upgrade   ..> UC_OTP         : <<include>>
UC_OTP       ..> UC_NotifOTP    : <<include>>

UC_TriggerAI ..> UC_Enqueue     : <<include>>
UC_Enqueue   ..> UC_Clone       : <<include>>
UC_Clone     ..> UC_InvokeGemini: <<include>>
UC_InvokeGemini ..> UC_ParseScore : <<include>>
UC_ParseScore ..> UC_Cleanup    : <<include>>
UC_Clone     ..> UC_Retry       : <<extend>>
UC_InvokeGemini ..> UC_Retry    : <<extend>>

UC_Register2 ..> UC_NotifReg    : <<include>>
UC_JoinTeam  ..> UC_NotifTeam   : <<include>>
UC_RequestJoin ..> UC_NotifTeam : <<include>>
UC_Advance   ..> UC_NotifPhase  : <<include>>

UC_NotifReg  ..> UC_SendEmail   : <<include>>
UC_NotifTeam ..> UC_SendEmail   : <<include>>
UC_NotifPhase ..> UC_SendEmail  : <<include>>
UC_NotifOTP  ..> UC_SendEmail   : <<include>>

UC_ManualScore ..> UC_Notes     : <<include>>
UC_Submit    ..> UC_UpdateSub   : <<extend>>

@enduml
```

---

## Object Diagrams

### Object Diagram 1 — User Instances

```plantuml
@startuml OD1_Users

skinparam objectAttributeIconSize 0
skinparam backgroundColor #FAFAFA
skinparam object {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

object "alice : User" as alice {
  id = "usr-001"
  username = "alice_dev"
  displayName = "Alice Johnson"
  email = "alice@example.com"
  password = "$2a$10$hashedpassword..."
  role = PARTICIPANT
  experienceLevel = INTERMEDIATE
  skills = ["Java", "Spring Boot", "React"]
  bio = "Full-stack developer, open to hackathons"
  githubUrl = "github.com/alice-dev"
  linkedinUrl = "linkedin.com/in/alice"
  openToInvites = true
  enabled = true
}

object "bob : User" as bob {
  id = "usr-002"
  username = "bob_ml"
  displayName = "Bob Smith"
  email = "bob@example.com"
  password = "$2a$10$hashedpassword..."
  role = PARTICIPANT
  experienceLevel = ADVANCED
  skills = ["Python", "TensorFlow", "FastAPI"]
  bio = "ML engineer specializing in NLP"
  githubUrl = "github.com/bob-ml"
  openToInvites = true
  enabled = true
}

object "carol : User" as carol {
  id = "usr-003"
  username = "carol_org"
  displayName = "Carol Williams"
  email = "carol@techcorp.com"
  password = "$2a$10$hashedpassword..."
  role = ORGANIZER
  experienceLevel = ADVANCED
  skills = ["Project Management", "Java", "Docker"]
  bio = "Senior engineer and hackathon organizer"
  githubUrl = "github.com/carol-org"
  openToInvites = false
  enabled = true
}

@enduml
```

---

### Object Diagram 2 — Event with Problem Statements

```plantuml
@startuml OD2_Event

skinparam objectAttributeIconSize 0
skinparam backgroundColor #FAFAFA
skinparam object {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

object "aiHack2025 : Event" as event {
  id = "93597295-8d51-48d3-924e-52c6ae84e3ae"
  shortCode = "AIHACK25"
  name = "AI Innovation Hackathon 2025"
  theme = "Artificial Intelligence & Machine Learning"
  organizerId = "usr-003"
  startDate = 2025-03-01T09:00
  endDate = 2025-03-03T18:00
  maxParticipants = 100
  teamSize = 4
  isVirtual = true
  status = IN_PROGRESS
  prizes = ["$5000", "$2500", "$1000"]
}

object "ps1 : ProblemStatement" as ps1 {
  id = "ps-001"
  name = "Smart Healthcare Assistant"
  statement = "Build an AI assistant for patient triage"
  requirements = "Must use NLP, REST API, real-time response"
}

object "ps2 : ProblemStatement" as ps2 {
  id = "ps-002"
  name = "Predictive Traffic Management"
  statement = "Use ML to reduce urban traffic congestion"
  requirements = "Must use time-series data, visualization dashboard"
}

object "ps3 : ProblemStatement" as ps3 {
  id = "ps-003"
  name = "AI-Powered Code Reviewer"
  statement = "Build an automated code quality analysis tool"
  requirements = "Must integrate with GitHub, provide scored feedback"
}

object "rules : EventRule" as rules {
  eventId = "93597295-8d51-48d3-924e-52c6ae84e3ae"
  contentMd = "# Rules\n- Teams of 2-4\n- No pre-built projects\n- Open source only"
}

event *-- ps1 : problemStatements
event *-- ps2 : problemStatements
event *-- ps3 : problemStatements
event -- rules : has

@enduml
```

---

### Object Diagram 3 — Team with Members

```plantuml
@startuml OD3_Team

skinparam objectAttributeIconSize 0
skinparam backgroundColor #FAFAFA
skinparam object {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

object "alphaTeam : Team" as team {
  id = "f9301616-dfc6-4376-980e-7581ccf3ded2"
  shortCode = "ALPHA7"
  name = "Team Alpha"
  eventId = "93597295-8d51-48d3-924e-52c6ae84e3ae"
  leaderId = "usr-001"
  problemStatementId = "ps-003"
  skillsNeeded = ["DevOps", "UI/UX"]
  repoUrl = "https://github.com/alice-dev/ai-code-reviewer"
  demoUrl = "https://demo.aireviewer.dev"
  submissionTime = 2025-03-02T14:30
  score = 82.0
  aiSummary = "Strong implementation with solid architecture..."
  manualScore = null
  organizerNotes = null
}

object "m1 : TeamMember" as m1 {
  id = "tm-001"
  userId = "usr-001"
  username = "alice_dev"
  role = LEADER
  status = ACTIVE
}

object "m2 : TeamMember" as m2 {
  id = "tm-002"
  userId = "usr-002"
  username = "bob_ml"
  role = MEMBER
  status = ACTIVE
}

object "m3 : TeamMember" as m3 {
  id = "tm-003"
  userId = "usr-004"
  username = "dave_ui"
  role = MEMBER
  status = ACTIVE
}

object "m4 : TeamMember" as m4 {
  id = "tm-004"
  userId = "usr-005"
  username = "eve_ops"
  role = MEMBER
  status = INVITED
}

team *-- m1 : members
team *-- m2 : members
team *-- m3 : members
team *-- m4 : members

@enduml
```

---

### Object Diagram 4 — Registrations Snapshot

```plantuml
@startuml OD4_Registrations

skinparam objectAttributeIconSize 0
skinparam backgroundColor #FAFAFA
skinparam object {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

object "aiHack2025 : Event" as event {
  id = "93597295-8d51-48d3-924e-52c6ae84e3ae"
  name = "AI Innovation Hackathon 2025"
  status = IN_PROGRESS
  maxParticipants = 100
}

object "reg1 : Registration" as reg1 {
  id = "reg-001"
  userId = "usr-001"
  username = "alice_dev"
  status = APPROVED
  registrationTime = 2025-02-16T10:22
}

object "reg2 : Registration" as reg2 {
  id = "reg-002"
  userId = "usr-002"
  username = "bob_ml"
  status = APPROVED
  registrationTime = 2025-02-17T09:15
}

object "reg3 : Registration" as reg3 {
  id = "reg-003"
  userId = "usr-006"
  username = "frank_dev"
  status = PENDING
  registrationTime = 2025-02-27T18:45
}

object "reg4 : Registration" as reg4 {
  id = "reg-004"
  userId = "usr-007"
  username = "grace_ui"
  status = CANCELLED
  registrationTime = 2025-02-18T11:00
}

event *-- reg1 : registrations
event *-- reg2 : registrations
event *-- reg3 : registrations
event *-- reg4 : registrations

@enduml
```

---

### Object Diagram 5 — AI Evaluation Job Snapshot

```plantuml
@startuml OD5_AIEvaluation

skinparam objectAttributeIconSize 0
skinparam backgroundColor #FAFAFA
skinparam object {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

object "job1 : EvaluationJob" as job1 {
  teamId = "f9301616-dfc6-4376-980e-7581ccf3ded2"
  status = COMPLETED
  retryCount = 0
  errorMessage = null
  enqueuedAt = 1709000000000
}

object "ctx1 : EvaluationContext" as ctx1 {
  teamId = "f9301616-dfc6-4376-980e-7581ccf3ded2"
  teamName = "Team Alpha"
  repoUrl = "https://github.com/alice-dev/ai-code-reviewer"
  eventTheme = "Artificial Intelligence & Machine Learning"
  problemStatement = "Build an automated code quality analysis tool"
  requirements = "Must integrate with GitHub, provide scored feedback"
}

object "result1 : GeminiResult" as result1 {
  score = 82.0
  summary = "Strong implementation with solid architecture."
}

object "job2 : EvaluationJob" as job2 {
  teamId = "ab123456-0000-0000-0000-000000000001"
  status = FAILED
  retryCount = 4
  errorMessage = "REPO_NOT_FOUND: Repository returned 404"
  enqueuedAt = 1709000100000
}

object "ctx2 : EvaluationContext" as ctx2 {
  teamId = "ab123456-0000-0000-0000-000000000001"
  teamName = "Team Beta"
  repoUrl = "https://github.com/deleted-user/missing-repo"
  eventTheme = "Artificial Intelligence & Machine Learning"
  problemStatement = "Smart Healthcare Assistant"
}

object "job3 : EvaluationJob" as job3 {
  teamId = "cd789012-0000-0000-0000-000000000002"
  status = ANALYZING
  retryCount = 0
  errorMessage = null
  enqueuedAt = 1709000200000
}

object "ctx3 : EvaluationContext" as ctx3 {
  teamId = "cd789012-0000-0000-0000-000000000002"
  teamName = "Team Gamma"
  repoUrl = "https://github.com/gamma-team/traffic-ml"
  eventTheme = "Artificial Intelligence & Machine Learning"
  problemStatement = "Predictive Traffic Management"
}

job1 *-- ctx1 : context
job1 --> result1 : produces
job2 *-- ctx2 : context
job3 *-- ctx3 : context

@enduml
```

---

### Object Diagram 6 — Notification & OTP Snapshot

```plantuml
@startuml OD6_Notifications

skinparam objectAttributeIconSize 0
skinparam backgroundColor #FAFAFA
skinparam object {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}

object "otpEntry1 : OtpEntry (Redis)" as otp1 {
  key = "otp:REGISTRATION:alice@example.com"
  value = "847291"
  ttl = 300 seconds
  purpose = REGISTRATION
  generatedAt = 2025-02-27T10:00:00
}

object "otpEntry2 : OtpEntry (Redis)" as otp2 {
  key = "otp:PASSWORD_RESET:bob@example.com"
  value = "193847"
  ttl = 180 seconds
  purpose = PASSWORD_RESET
  generatedAt = 2025-02-27T10:05:00
}

object "alert1 : EmailAlert" as alert1 {
  to = "alice@example.com"
  subject = "You have successfully registered for AI Innovation Hackathon 2025"
  template = "event-registration"
  status = DELIVERED
}

object "alert2 : EmailAlert" as alert2 {
  to = "bob@example.com"
  subject = "You have joined Team Alpha"
  template = "team-join"
  status = DELIVERED
}

object "alert3 : EmailAlert" as alert3 {
  to = "alice@example.com"
  subject = "AI Innovation Hackathon 2025 is now IN PROGRESS"
  template = "phase-change"
  newPhase = "IN_PROGRESS"
  status = DELIVERED
}

object "alert4 : EmailAlert" as alert4 {
  to = "frank@example.com"
  subject = "Your EHub registration OTP"
  template = "otp-email"
  otp = "847291"
  expiresInMinutes = 5
  status = DELIVERED
}

otp1 --> alert4 : triggers
alert1 -[hidden]- alert2
alert2 -[hidden]- alert3

@enduml
```

---

## Activity Diagrams

### Activity Diagram 1 — User Registration & Login

```plantuml
@startuml AD1_Auth

skinparam backgroundColor #FAFAFA
skinparam activity {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
  StartColor #333333
  EndColor #333333
  DiamondBackgroundColor #FFF8E1
  DiamondBorderColor #CCCCCC
}

title User Registration & Login

|Visitor|
start
:Open EHub App;
fork
  :Click Register;
  :Enter name, email, password, role;
  :Request Registration OTP;
  |Notification Service|
  :Generate OTP;
  :Send OTP Email;
  |Visitor|
  :Enter OTP;
  if (OTP valid?) then (yes)
    |Auth Service|
    :Hash password (BCrypt);
    :Create User record;
    :Issue JWT token;
    :Cache session in Redis;
    |Visitor|
    :Redirect to Dashboard;
  else (no)
    :Show "Invalid OTP" error;
    stop
  endif
fork again
  :Click Login;
  :Enter email & password;
  |Auth Service|
  :Load user by email;
  if (User exists?) then (yes)
    if (Password matches?) then (yes)
      if (Account enabled?) then (yes)
        :Issue JWT token;
        :Cache session in Redis;
        |Visitor|
        :Redirect to Dashboard;
      else (no)
        :Show "Account disabled" error;
        stop
      endif
    else (no)
      :Show "Invalid credentials" error;
      stop
    endif
  else (no)
    :Show "User not found" error;
    stop
  endif
end fork
stop

@enduml
```

---

### Activity Diagram 2 — Password Reset

```plantuml
@startuml AD2_PasswordReset

skinparam backgroundColor #FAFAFA
skinparam activity {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
  DiamondBackgroundColor #FFF8E1
  DiamondBorderColor #CCCCCC
}

title Password Reset Flow

|User|
start
:Click "Forgot Password";
:Enter registered email;
|Auth Service|
if (Email exists?) then (yes)
  :Request OTP from Notification Service;
  |Notification Service|
  :Generate time-limited OTP (5 min TTL);
  :Send password reset email;
  |User|
  :Enter OTP from email;
  |Auth Service|
  if (OTP valid & not expired?) then (yes)
    |User|
    :Enter new password;
    |Auth Service|
    :Hash new password (BCrypt);
    :Update user record;
    :Invalidate all active sessions (Redis);
    |User|
    :Show "Password reset successful";
    :Redirect to Login;
  else (no)
    :Show "OTP expired or invalid";
    if (Retry?) then (yes)
      :Re-enter OTP;
    else (no)
      stop
    endif
  endif
else (no)
  :Show "Email not found";
  stop
endif
stop

@enduml
```

---

### Activity Diagram 3 — Event Creation & Phase Lifecycle

```plantuml
@startuml AD3_EventLifecycle

skinparam backgroundColor #FAFAFA
skinparam activity {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
  DiamondBackgroundColor #FFF8E1
  DiamondBorderColor #CCCCCC
}

title Event Creation & Phase Lifecycle

|Organizer|
start
:Fill in event details\n(name, theme, dates, limits);
:Submit Create Event form;
|Event Service|
:Validate input fields;
if (Valid?) then (yes)
  :Create Event (status = DRAFT);
  |Organizer|
  :Add Problem Statements;
  :Add Rules & References;
  :Confirm — Advance to REGISTRATION_OPEN;
  |Event Service|
  :Update status → REGISTRATION_OPEN;
  |Notification Service|
  :Broadcast phase change email;
  |Organizer|
  :Wait for registrations;
  :Advance to IN_PROGRESS;
  |Event Service|
  :Update status → IN_PROGRESS;
  :Lock registrations;
  |Notification Service|
  :Notify registered participants;
  |Organizer|
  :Monitor submissions;
  :Advance to JUDGING;
  |Event Service|
  :Update status → JUDGING;
  :Lock submissions;
  |Organizer|
  fork
    :Trigger AI Evaluation;
  fork again
    :Assign Manual Scores;
  end fork
  :Advance to COMPLETED;
  |Event Service|
  :Update status → COMPLETED;
  :Finalize leaderboard;
  |Notification Service|
  :Notify participants of results;
  |Organizer|
  :View final leaderboard;
else (no)
  :Show validation errors;
  :Return to form;
endif
stop

@enduml
```

---

### Activity Diagram 4 — Team Formation & Project Submission

```plantuml
@startuml AD4_TeamSubmission

skinparam backgroundColor #FAFAFA
skinparam activity {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
  DiamondBackgroundColor #FFF8E1
  DiamondBorderColor #CCCCCC
}

title Team Formation & Project Submission

|Participant|
start
:Register for Event;
|Event Service|
:Validate registration;
if (Event open & capacity available?) then (yes)
  :Create Registration (APPROVED);
  |Notification Service|
  :Send registration confirmation email;
  |Participant|
  fork
    :Create a new team;
    |Event Service|
    :Generate unique short code;
    :Assign participant as Leader;
    |Participant|
    :Share short code with others;
    :Invite members / accept join requests;
    |Event Service|
    :Add members (status = ACTIVE);
    |Notification Service|
    :Notify members via email;
  fork again
    :Enter existing team short code;
    |Event Service|
    if (Team has capacity?) then (yes)
      :Add participant as MEMBER (ACTIVE);
      |Notification Service|
      :Notify team members;
    else (no)
      :Return "Team is full" error;
      stop
    endif
  end fork
  |Participant (Leader)|
  :Select Problem Statement;
  :Update skills needed;
  |Event Service|
  :Link problem statement to team;
  |Participant (Leader)|
  :Submit repository URL & demo URL;
  |Event Service|
  :Validate URLs (HTTPS format);
  if (URLs valid?) then (yes)
    :Save submission;
    :Record submission timestamp;
    |Participant (Leader)|
    :Submission confirmed;
  else (no)
    :Show URL validation error;
    :Return to submit form;
  endif
else (no)
  :Return "Event closed or full" error;
  stop
endif
stop

@enduml
```

---

### Activity Diagram 5 — AI Evaluation Pipeline

```plantuml
@startuml AD5_AIEvaluation

skinparam backgroundColor #FAFAFA
skinparam activity {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
  DiamondBackgroundColor #FFF8E1
  DiamondBorderColor #CCCCCC
}

title AI Evaluation Pipeline

|Organizer|
start
:Click "Trigger AI Evaluation"\nfor event;
|AI Service|
:Fetch all submitted teams\nfrom Event Service;
if (Teams with submissions found?) then (yes)
  :Build EvaluationJob per team;
  :Push all jobs to Redis queue;
  :Return "N jobs enqueued" response;
  |Organizer|
  :Poll job status;
  |AI Worker (Background Thread)|
  :Dequeue next EvaluationJob;
  :Set job status → CLONING;
  :git clone repository\nto /app/workspaces/{teamId};
  if (Clone successful?) then (yes)
    :Verify workspace not empty;
    if (Workspace valid?) then (yes)
      :Set job status → ANALYZING;
      :Load judge_prompt.md template;
      :Inject theme, problem,\nrequirements, @workspace path;
      :Execute: gemini -p "{prompt}"\n--yolo --output-format=text;
      if (Gemini returns output?) then (yes)
        :Parse JSON block\n{score, summary} via regex;
        if (Valid JSON extracted?) then (yes)
          :URL-decode summary string;
          :POST score & summary\nto Event Service;
          :Set job status → COMPLETED;
          :Cleanup workspace directory;
        else (no)
          :Log parse failure;
          :Increment retry count;
          if (retryCount < 4?) then (yes)
            :Re-enqueue job;
          else (no)
            :Set job status → FAILED;
            :Cleanup workspace;
          endif
        endif
      else (no)
        :Log Gemini timeout/error;
        :Increment retry count;
        if (retryCount < 4?) then (yes)
          :Re-enqueue job;
        else (no)
          :Set job status → FAILED;
          :Cleanup workspace;
        endif
      endif
    else (no)
      :Set job status → FAILED\n(EMPTY_REPO);
      :Cleanup workspace;
    endif
  else (no)
    if (Fatal error?) then (yes)
      :Set job status → FAILED\n(no retry);
    else (no)
      :Increment retry count;
      if (retryCount < 4?) then (yes)
        :Re-enqueue job;
      else (no)
        :Set job status → FAILED;
      endif
    endif
  endif
  :Process next job in queue;
else (no)
  :Return "No submitted teams found";
  stop
endif
stop

@enduml
```

---

### Activity Diagram 6 — Teammate Matchmaking

```plantuml
@startuml AD6_Matchmaking

skinparam backgroundColor #FAFAFA
skinparam activity {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
  DiamondBackgroundColor #FFF8E1
  DiamondBorderColor #CCCCCC
}

title Teammate Matchmaking Flow

|Participant|
start
:Open event page;
:Click "Find Teammates";
|Event Service|
:Fetch all registrations\nfor this event;
:Filter out participants\nalready on a full team;
:Exclude requesting user;
|Auth Service|
:Fetch skill profiles\nfor filtered participants;
|Event Service|
:Compare requester skills\nvs candidate skills;
:Rank by complementarity score;
:Return ranked suggestion list;
|Participant|
if (Suggestions available?) then (yes)
  :Browse suggested teammates\n(name, skills, bio, links);
  fork
    :Copy team short code;
    :Share code with chosen teammate;
    |Participant (Teammate)|
    :Join team via short code;
    |Event Service|
    :Add to team (ACTIVE);
    |Notification Service|
    :Notify team members;
  fork again
    :Send external message\n(via GitHub / LinkedIn link);
  end fork
else (no)
  :Show "No available teammates found";
  stop
endif
stop

@enduml
```

---

### Activity Diagram 7 — Manual Scoring & Leaderboard

```plantuml
@startuml AD7_Scoring

skinparam backgroundColor #FAFAFA
skinparam activity {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
  DiamondBackgroundColor #FFF8E1
  DiamondBorderColor #CCCCCC
}

title Manual Scoring & Leaderboard Resolution

|Organizer|
start
:Open Submissions tab;
:View list of submitted teams\n(AI scores already populated);
:Select a team to review;
:Review AI score & summary;
:Review repository link;
fork
  :Enter manual score (0-100);
  :Add organizer notes;
  :Submit manual review;
  |Event Service|
  :Persist manualScore & organizerNotes;
  :Compute finalScore\n(manualScore ?? aiScore);
  |Organizer|
  :See updated score badge;
fork again
  :Accept AI score as-is;
  |Event Service|
  :finalScore = aiScore;
end fork
|Organizer|
:Move to next team;
:Repeat for all teams;
:Open Leaderboard tab;
|Event Service|
:Fetch all teams for event;
:Sort by finalScore DESC;
:Return ranked leaderboard;
|Organizer|
:View ranked leaderboard;
if (Advance to COMPLETED?) then (yes)
  |Event Service|
  :Update event status → COMPLETED;
  |Notification Service|
  :Notify all participants of final results;
else (no)
  :Continue reviewing;
endif
stop

@enduml
```

---

## Component Diagrams

### Component Diagram 1 — Overall System Architecture

```plantuml
@startuml CD1_System

skinparam backgroundColor #FAFAFA
skinparam component {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
  FontStyle Bold
}
skinparam database {
  BorderColor #CCCCCC
  BackgroundColor #EEF4FF
}
skinparam node {
  BorderColor #CCCCCC
  BackgroundColor #F9F9F9
}

title EHub — Overall System Architecture

actor "Browser\n(React SPA)" as Browser

node "Docker Network: ehub-network" {

  component "API Gateway\n:8000" as Gateway <<Spring Cloud Gateway>> {
    port "HTTP In" as GW_IN
    port "Route Out" as GW_OUT
  }

  component "Client Service\n:3000" as Client <<Nginx + React>> {
    port "Static Files" as CS_OUT
  }

  component "Auth Service\n:8081" as AuthSvc <<Spring Boot>> {
    port "REST API" as AUTH_API
    port "Notification Client" as AUTH_NOTIF
  }

  component "Event Service\n:8084" as EventSvc <<Spring Boot>> {
    port "REST API" as EVENT_API
    port "Redis Publisher" as EVENT_REDIS
    port "Notification Client" as EVENT_NOTIF
  }

  component "AI Service\n:8085" as AISvc <<Spring Boot>> {
    port "REST API" as AI_API
    port "Redis Consumer" as AI_REDIS
    port "Event Client" as AI_EVENT
  }

  component "Notification Service\n:8082" as NotifSvc <<Spring Boot>> {
    port "REST API" as NOTIF_API
    port "Redis Subscriber" as NOTIF_REDIS
    port "SMTP Client" as NOTIF_SMTP
  }

  database "auth-db\nPostgreSQL:15" as AuthDB
  database "event-db\nPostgreSQL:15" as EventDB
  database "ehub-redis\nRedis:7" as Redis
}

cloud "External Services" {
  component "Gmail SMTP\nsmtp.gmail.com:587" as SMTP
  component "Gemini CLI\n@google/gemini-cli" as GeminiCLI
  component "GitHub\n(Repo Hosting)" as GitHub
}

Browser --> CS_OUT : HTTP
Browser --> GW_IN : HTTPS / JWT
GW_OUT --> AUTH_API : X-Internal-Secret
GW_OUT --> EVENT_API : X-Internal-Secret
GW_OUT --> AI_API : X-Internal-Secret

AuthSvc --> AuthDB : JPA/SQL
AuthSvc --> Redis : Session Cache
AUTH_NOTIF --> NOTIF_API : HTTP

EventSvc --> EventDB : JPA/SQL
EVENT_REDIS --> Redis : Pub/Sub Publish
EVENT_NOTIF --> NOTIF_API : HTTP

AI_REDIS --> Redis : Job Queue R/W
AI_EVENT --> EVENT_API : Score Write-back
AISvc --> GeminiCLI : ProcessBuilder
GeminiCLI --> GitHub : git clone

NOTIF_REDIS --> Redis : Pub/Sub Subscribe
NOTIF_SMTP --> SMTP : STARTTLS

@enduml
```

---

### Component Diagram 2 — Auth Service Internal

```plantuml
@startuml CD2_AuthService

skinparam backgroundColor #FAFAFA
skinparam component {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
  FontStyle Bold
}
skinparam database {
  BorderColor #CCCCCC
  BackgroundColor #EEF4FF
}

title Auth Service — Internal Components

component "Auth Service" as AuthSvc {

  component "AuthController" as AC <<REST Controller>> {
    port "/auth/**" as AUTH_ROUTES
  }

  component "AuthService" as AS <<Service>> {
    port "register()" as AS_REG
    port "login()" as AS_LOGIN
    port "logout()" as AS_LOGOUT
    port "resetPassword()" as AS_RESET
    port "updateProfile()" as AS_PROFILE
    port "upgradeToOrganizer()" as AS_UPGRADE
  }

  component "JwtService" as JWT <<Service>> {
    port "generateToken()" as JWT_GEN
    port "validateToken()" as JWT_VAL
    port "extractUsername()" as JWT_EXT
  }

  component "TokenBlacklistService" as TBS <<Service>> {
    port "blacklist()" as TBS_BL
    port "isBlacklisted()" as TBS_CHK
  }

  component "HeaderAuthFilter" as HAF <<Security Filter>> {
    port "doFilter()" as HAF_F
  }

  component "NotificationClient" as NC <<HTTP Client>> {
    port "sendOtp()" as NC_OTP
    port "validateOtp()" as NC_VAL
    port "sendAlert()" as NC_ALERT
  }

  component "UserRepository" as UR <<Spring Data JPA>>
}

database "auth-db\nPostgreSQL:15" as AuthDB
database "Redis\n(Session Cache)" as Redis
component "Notification Service\n:8082" as NotifSvc <<External>>

AUTH_ROUTES --> AS_REG
AUTH_ROUTES --> AS_LOGIN
AUTH_ROUTES --> AS_LOGOUT
AUTH_ROUTES --> AS_RESET
AUTH_ROUTES --> AS_PROFILE
AUTH_ROUTES --> AS_UPGRADE

AS --> JWT
AS --> TBS
AS --> UR
AS --> NC

JWT_GEN --> Redis : store session
TBS_BL --> Redis : blacklist token
TBS_CHK --> Redis : check token
HAF_F --> JWT_VAL : validate on every request
UR --> AuthDB : CRUD

NC_OTP --> NotifSvc : POST /notifications/otp/generate
NC_VAL --> NotifSvc : POST /notifications/otp/validate
NC_ALERT --> NotifSvc : POST /notifications/send-alert

@enduml
```

---

### Component Diagram 3 — Event Service Internal

```plantuml
@startuml CD3_EventService

skinparam backgroundColor #FAFAFA
skinparam component {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
  FontStyle Bold
}
skinparam database {
  BorderColor #CCCCCC
  BackgroundColor #EEF4FF
}

title Event Service — Internal Components

component "Event Service" as EventSvc {

  component "EventController" as EC <<REST Controller>> {
    port "/events/**" as EVENT_ROUTES
  }

  component "TeamController" as TC <<REST Controller>> {
    port "/events/teams/**" as TEAM_ROUTES
  }

  component "RuleController" as RC <<REST Controller>> {
    port "/events/{id}/rules" as RULE_ROUTES
  }

  component "ReferenceController" as RFC <<REST Controller>> {
    port "/events/{id}/references" as REF_ROUTES
  }

  component "EventService" as ES <<Service>>
  component "TeamService" as TS <<Service>>
  component "RuleService" as RS <<Service>>
  component "ReferenceService" as RFS <<Service>>
  component "LifecycleService" as LS <<Service>>
  component "NotificationClient" as NC <<HTTP Client>>

  component "EventRepository" as ER <<JPA Repository>>
  component "TeamRepository" as TR <<JPA Repository>>
  component "TeamMemberRepository" as TMR <<JPA Repository>>
  component "RegistrationRepository" as RR <<JPA Repository>>
  component "ProblemStatementRepository" as PSR <<JPA Repository>>
  component "EventRuleRepository" as ERR <<JPA Repository>>
  component "EventReferenceRepository" as EREFR <<JPA Repository>>

  component "RedisTemplate" as RT <<Redis>>
}

database "event-db\nPostgreSQL:15" as EventDB
database "Redis\n(Pub/Sub)" as Redis
component "Notification Service\n:8082" as NotifSvc <<External>>

EVENT_ROUTES --> ES
TEAM_ROUTES --> TS
RULE_ROUTES --> RS
REF_ROUTES --> RFS

ES --> ER
ES --> RR
ES --> PSR
ES --> LS
ES --> NC
ES --> RT

TS --> TR
TS --> TMR
TS --> RR
TS --> ER
TS --> PSR
TS --> NC

RS --> ERR
RFS --> EREFR

ER --> EventDB
TR --> EventDB
TMR --> EventDB
RR --> EventDB
PSR --> EventDB
ERR --> EventDB
EREFR --> EventDB

RT --> Redis : publish domain events
NC --> NotifSvc : HTTP alerts

@enduml
```

---

### Component Diagram 4 — AI Service Internal

```plantuml
@startuml CD4_AIService

skinparam backgroundColor #FAFAFA
skinparam component {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
  FontStyle Bold
}
skinparam database {
  BorderColor #CCCCCC
  BackgroundColor #EEF4FF
}

title AI Service — Internal Components

component "AI Service" as AISvc {

  component "AiController" as AICTL <<REST Controller>> {
    port "POST /ai/evaluate-event/{id}" as AI_EVT
    port "POST /ai/evaluate-team/{id}" as AI_TEAM
    port "GET  /ai/job/{id}/status" as AI_STATUS
  }

  component "EvaluationWorker" as EW <<Service + Background Thread>> {
    port "queueEvent()" as EW_QEVT
    port "queueTeam()" as EW_QTEAM
    port "getJobStatus()" as EW_STATUS
    port "runWorkerLoop()" as EW_LOOP
    port "processJob()" as EW_PROC
  }

  component "WorkspaceManager" as WM <<Service>> {
    port "clone(repoUrl, teamId)" as WM_CLONE
    port "verify(teamId)" as WM_VERIFY
    port "cleanup(teamId)" as WM_CLEAN
  }

  component "GeminiCliWrapper" as GCW <<Service>> {
    port "analyze(context, path)" as GCW_ANALYZE
    port "buildPrompt()" as GCW_PROMPT
    port "parseOutput()" as GCW_PARSE
  }

  component "EventServiceClient" as ESC <<HTTP Client>> {
    port "getEvaluationContext(eventId)" as ESC_GET
    port "postScore(teamId, score, summary)" as ESC_POST
  }

  component "judge_prompt.md" as PROMPT <<Template File>>
  component "RedisTemplate" as RT <<Redis>>
  component "ObjectMapper" as OM <<Jackson>>
}

database "Redis\n(Job Queue + Status)" as Redis
component "Event Service\n:8084" as EventSvc <<External>>
component "Gemini CLI\n(OS Process)" as GeminiCLI <<External>>
component "GitHub\n(Repository)" as GitHub <<External>>

AI_EVT --> EW_QEVT
AI_TEAM --> EW_QTEAM
AI_STATUS --> EW_STATUS

EW_LOOP --> EW_PROC
EW_PROC --> WM_CLONE
EW_PROC --> GCW_ANALYZE
EW_PROC --> ESC_POST
EW_PROC --> RT

EW_QEVT --> ESC_GET
EW_QEVT --> RT : push to queue
EW_LOOP --> RT : pop from queue

WM_CLONE --> GitHub : git clone
GCW_ANALYZE --> GCW_PROMPT
GCW_PROMPT --> PROMPT : load template
GCW_ANALYZE --> GeminiCLI : ProcessBuilder
GCW_ANALYZE --> GCW_PARSE
GCW_PARSE --> OM : JSON extraction

ESC_GET --> EventSvc : GET evaluation context
ESC_POST --> EventSvc : PATCH score

RT --> Redis : LPUSH / BRPOP / HSET

@enduml
```

---

### Component Diagram 5 — Notification Service Internal

```plantuml
@startuml CD5_NotificationService

skinparam backgroundColor #FAFAFA
skinparam component {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
  FontStyle Bold
}
skinparam database {
  BorderColor #CCCCCC
  BackgroundColor #EEF4FF
}

title Notification Service — Internal Components

component "Notification Service" as NotifSvc {

  component "NotificationController" as NC <<REST Controller>> {
    port "POST /notifications/send-alert" as NC_ALERT
    port "POST /notifications/otp/generate" as NC_GEN
    port "POST /notifications/otp/validate" as NC_VAL
    port "POST /notifications/password-reset/otp" as NC_RESET
    port "POST /notifications/registration/otp" as NC_REG
    port "POST /notifications/role-upgrade/otp" as NC_ROLE
  }

  component "EmailService" as ES <<Service>> {
    port "sendHtmlEmail(to, subject, template, vars)" as ES_SEND
  }

  component "OtpService" as OS <<Service>> {
    port "generateOtp(email, purpose)" as OS_GEN
    port "validateOtp(email, otp, purpose)" as OS_VAL
  }

  component "TemplateEngine\n(Thymeleaf)" as TE <<Template Engine>>
  component "JavaMailSender" as JMS <<Spring Mail>>
  component "StringRedisTemplate" as SRT <<Redis>>

  folder "Email Templates" as TMPL {
    component "event-registration.html" as T1
    component "team-join.html" as T2
    component "phase-change.html" as T3
    component "otp-email.html" as T4
    component "send-alert.html" as T5
  }
}

database "Redis\n(OTP Store)" as Redis
component "Gmail SMTP\nsmtp.gmail.com:587" as SMTP

NC_ALERT --> ES_SEND
NC_GEN --> OS_GEN
NC_VAL --> OS_VAL
NC_RESET --> OS_GEN
NC_REG --> OS_GEN
NC_ROLE --> OS_GEN

ES_SEND --> TE : render template
TE --> TMPL : load HTML
ES_SEND --> JMS : send email
JMS --> SMTP : STARTTLS / port 587

OS_GEN --> SRT : SET otp TTL
OS_VAL --> SRT : GET + DEL otp key
SRT --> Redis : R/W OTP entries

@enduml
```

---

### Component Diagram 6 — API Gateway & Security

```plantuml
@startuml CD6_Gateway

skinparam backgroundColor #FAFAFA
skinparam component {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
  FontStyle Bold
}

title API Gateway & Security Layer

actor "Browser\n(React SPA)" as Browser

component "API Gateway\n:8000" as GW <<Spring Cloud Gateway>> {

  component "RouteLocator\n(application.yml)" as RL <<Route Config>> {
    port "/api/auth/**    → auth-service:8081" as R1
    port "/api/events/**  → event-service:8084" as R2
    port "/api/ai/**      → ai-service:8085" as R3
  }

  component "AuthFilter" as AF <<Global Gateway Filter>> {
    port "validate JWT via auth-service" as AF_JWT
    port "attach X-Internal-Secret" as AF_SEC
    port "forward userId + role as headers" as AF_HDR
  }

  component "CorsConfig" as CORS <<Configuration>> {
    port "Allow: localhost:3000 / localhost:8000" as CORS_ALLOW
  }
}

component "Auth Service\n:8081" as AuthSvc <<Downstream>>
component "Event Service\n:8084" as EventSvc <<Downstream>>
component "AI Service\n:8085" as AISvc <<Downstream>>

component "HeaderAuthFilter" as HAF <<Per-Service Filter>> {
  port "read X-Internal-Secret" as HAF_SEC
  port "assign ROLE_SYSTEM if secret-only" as HAF_SYS
  port "assign JWT user role if full auth" as HAF_USR
}

Browser --> GW : HTTP + Bearer JWT
GW --> AF : every request
AF_JWT --> AuthSvc : GET /auth/validate-token
AF_SEC --> R1
AF_SEC --> R2
AF_SEC --> R3

R1 --> AuthSvc : proxied + X-Internal-Secret
R2 --> EventSvc : proxied + X-Internal-Secret
R3 --> AISvc : proxied + X-Internal-Secret

AuthSvc --> HAF : filter on arrival
EventSvc --> HAF : filter on arrival
AISvc --> HAF : filter on arrival

HAF_SEC --> HAF_SYS : secret match → ROLE_SYSTEM
HAF_SEC --> HAF_USR : JWT present → user role

@enduml
```

---

## State Machine Diagram

```plantuml
@startuml StateMachine_EHub

skinparam backgroundColor #FAFAFA
skinparam state {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
  FontStyle Bold
  StartColor #333333
  EndColor #333333
}

title EHub — Complete System State Machine

state "User Account" as UserSM {
  [*] --> Unregistered
  Unregistered --> OTPPending       : requestRegistrationOTP()
  OTPPending   --> Registered       : validateOTP() ✓
  OTPPending   --> Unregistered     : OTP expired / invalid
  Registered   --> LoggedIn         : login(email, password) ✓
  LoggedIn     --> LoggedOut        : logout()
  LoggedOut    --> LoggedIn         : login() ✓
  LoggedIn     --> ResetPending     : requestPasswordReset()
  ResetPending --> LoggedOut        : resetPassword() ✓
  ResetPending --> LoggedIn         : OTP expired
  LoggedIn     --> UpgradePending   : requestRoleUpgrade()
  UpgradePending --> LoggedIn       : validateOTP() ✓ [role = ORGANIZER]
  UpgradePending --> LoggedIn       : OTP expired / cancelled
}

state "Event Lifecycle" as EventSM {
  [*] --> Draft
  Draft              --> RegistrationOpen : advancePhase() [organizer confirms]
  Draft              --> [*]              : deleteEvent() [only in DRAFT]
  RegistrationOpen   --> InProgress       : advancePhase() [registration closed]
  InProgress         --> Judging          : advancePhase() [submissions locked]
  Judging            --> Completed        : advancePhase() [scores finalized]
  Completed          --> [*]

  state RegistrationOpen {
    state "Accepting Registrations" as AR
    state "Registrations Locked" as RL
    AR --> RL : maxParticipants reached
  }

  state Judging {
    state "AI Evaluation Running" as AIR
    state "Manual Scoring In Progress" as MSI
    state "Scoring Complete" as SC
    AIR --> SC  : all jobs COMPLETED/FAILED
    MSI --> SC  : organizer finalizes
    AIR --> MSI : organizer overrides
  }
}

state "Registration" as RegSM {
  [*]       --> Pending   : registerForEvent()
  Pending   --> Approved  : updateStatus(APPROVED)
  Pending   --> Rejected  : updateStatus(REJECTED)
  Approved  --> Cancelled : cancelRegistration()
  Rejected  --> [*]
  Cancelled --> [*]
}

state "Team" as TeamSM {
  [*]        --> Forming   : createTeam()
  Forming    --> Forming   : inviteMember() / respondToInvite()
  Forming    --> Submitted : submitProject() [repoUrl valid]
  Forming    --> [*]       : dismantleTeam()
  Submitted  --> Submitted : updateSubmission() [IN_PROGRESS]
  Submitted  --> Scored    : updateScore() [AI or manual]
  Scored     --> Scored    : updateManualReview() [organizer]
  Scored     --> [*]       : event COMPLETED
}

state "Team Member" as MemberSM {
  [*]      --> Invited   : inviteMember()
  [*]      --> Requested : requestToJoin()
  Invited  --> Active    : respondToInvite(accept=true)
  Invited  --> [*]       : respondToInvite(accept=false)
  Requested --> Active   : respondToRequest(accept=true)
  Requested --> [*]      : respondToRequest(accept=false)
  Active   --> [*]       : leaveTeam() / dismantleTeam()
}

state "AI Evaluation Job" as JobSM {
  [*]       --> Queued    : enqueueJob()
  Queued    --> Cloning   : worker dequeues
  Cloning   --> Analyzing : git clone ✓ workspace verified
  Cloning   --> Queued    : transient error [retryCount < 4]
  Cloning   --> Failed    : fatal error OR retryCount = 4
  Analyzing --> Completed : score parsed & written
  Analyzing --> Queued    : parse error [retryCount < 4]
  Analyzing --> Failed    : retryCount = 4
  Completed --> [*]       : workspace cleaned up
  Failed    --> [*]       : workspace cleaned up

  state Cloning {
    state "git clone running" as GC
    state "workspace verified" as WV
    GC --> WV : clone success
  }

  state Analyzing {
    state "Gemini CLI running" as GR
    state "output parsed" as OP
    state "score posted" as SP
    GR --> OP : output received
    OP --> SP : JSON extracted & URL-decoded
  }
}

@enduml
```

---

## Deployment Diagram

```plantuml
@startuml Deployment_EHub

skinparam backgroundColor #FAFAFA
skinparam node {
  BorderColor #AAAAAA
  BackgroundColor #F5F5F5
  FontStyle Bold
}
skinparam component {
  BorderColor #CCCCCC
  BackgroundColor #FFFFFF
  ArrowColor #555555
}
skinparam database {
  BorderColor #AAAAAA
  BackgroundColor #EEF4FF
}
skinparam artifact {
  BorderColor #CCCCCC
  BackgroundColor #FFFDE7
}
skinparam cloud {
  BorderColor #AAAAAA
  BackgroundColor #F0F7FF
}

title EHub — Deployment Diagram

node "Client Machine" as ClientMachine <<User Device>> {
  node "Web Browser\n(Chrome / Firefox / Edge / Safari)" as Browser <<Browser>> {
    artifact "React SPA\n(index.html + JS bundles)" as SPA
  }
}

node "Host Machine\n(Linux x86-64 / Windows + WSL2)" as HostMachine <<Server>> {

  node "Docker Engine 24+\nDocker Compose v2" as DockerEngine <<Container Runtime>> {

    node "ehub-network\n(Docker Bridge)" as Network <<Virtual Network>> {

      node "client-service\n(Container)" as ClientContainer <<nginx:stable-alpine>> {
        artifact "Nginx Web Server\n:3000" as Nginx
        artifact "React Build\n/usr/share/nginx/html" as ReactBuild
        artifact "nginx.conf\n(proxy /api → :8000)" as NginxConf
      }

      node "api-gateway\n(Container)" as GWContainer <<eclipse-temurin:17-jre>> {
        artifact "api-gateway.jar\n:8000" as GWJar
        component "AuthFilter\n(JWT validation)" as GWFilter
        component "RouteLocator\n(/api/auth, /api/events, /api/ai)" as GWRoutes
      }

      node "auth-service\n(Container)" as AuthContainer <<eclipse-temurin:17-jre>> {
        artifact "auth-service.jar\n:8081" as AuthJar
        component "HeaderAuthFilter" as AuthFilter
        component "JwtService + BCrypt + Redis" as AuthJWT
      }

      node "event-service\n(Container)" as EventContainer <<eclipse-temurin:17-jre>> {
        artifact "event-service.jar\n:8084" as EventJar
        component "HeaderAuthFilter" as EventFilter
        component "RedisTemplate (Pub/Sub)" as EventRedis
      }

      node "ai-service\n(Container)" as AIContainer <<eclipse-temurin:17-jre + Node.js 20>> {
        artifact "ai-service.jar\n:8085" as AIJar
        artifact "judge_prompt.md" as PromptFile
        component "EvaluationWorker\n(Background Thread)" as AIWorker
        component "GeminiCliWrapper\n(ProcessBuilder)" as AIGemini
        component "WorkspaceManager\n/app/workspaces/{teamId}" as AIWorkspace
      }

      node "notification-service\n(Container)" as NotifContainer <<eclipse-temurin:17-jre>> {
        artifact "notification-service.jar\n:8082" as NotifJar
        component "OtpService (Redis TTL)" as NotifOTP
        component "EmailService (JavaMailSender)" as NotifEmail
      }

      node "auth-db\n(Container)" as AuthDB <<postgres:15-alpine>> {
        database "auth_database\n(users, credentials)" as AuthData
      }

      node "event-db\n(Container)" as EventDB <<postgres:15-alpine>> {
        database "event_database\n(events, teams,\nregistrations, submissions)" as EventData
      }

      node "ehub-redis\n(Container)" as RedisNode <<redis:7-alpine>> {
        database "Redis Store\n- session cache\n- OTP keys\n- job queue\n- job status\n- pub/sub" as RedisData
      }
    }
  }

  node "Host Filesystem" as HostFS <<Volume Mounts>> {
    artifact "C:/Users/umanj/.gemini\n→ /root/.gemini:ro" as GeminiCreds
    artifact ".secrets/\n(db passwords, jwt key,\ninternal secret, smtp creds)" as Secrets
    artifact "Docker Volumes\n(postgres data)" as DBVolumes
  }
}

cloud "Google Cloud" as GoogleCloud {
  node "Gemini API" as GeminiAPI <<External Service>> {
    component "Gemini 2.5 Pro (LLM)" as GeminiLLM
  }
  node "Google OAuth 2.0" as GoogleOAuth <<External Service>>
}

cloud "GitHub" as GitHub {
  node "GitHub.com\n(Repository Hosting)" as GHRepo <<External Service>>
}

cloud "Gmail" as GmailCloud {
  node "Gmail SMTP\nsmtp.gmail.com:587" as GmailSMTP <<External Service>>
}

Browser --> Nginx           : HTTP :3000
Browser --> GWJar           : HTTP :8000
GWJar --> AuthJar           : HTTP :8081 X-Internal-Secret
GWJar --> EventJar          : HTTP :8084 X-Internal-Secret
GWJar --> AIJar             : HTTP :8085 X-Internal-Secret

AuthJar --> AuthData        : JPA / JDBC
AuthJar --> RedisData       : session cache
AuthJar --> NotifJar        : HTTP OTP + alerts

EventJar --> EventData      : JPA / JDBC
EventJar --> RedisData      : pub/sub publish
EventJar --> NotifJar       : HTTP alerts

AIJar --> RedisData         : job queue / status
AIJar --> EventJar          : score write-back
AIGemini --> GeminiCreds    : read OAuth credentials
AIGemini --> GeminiAPI      : gemini ProcessBuilder
AIWorkspace --> GHRepo      : git clone

NotifJar --> RedisData      : OTP TTL + pub/sub
NotifEmail --> GmailSMTP    : STARTTLS port 587

GeminiCreds --> GoogleOAuth : OAuth token validation

Secrets --> AuthContainer   : /run/secrets/
Secrets --> EventContainer  : /run/secrets/
Secrets --> AIContainer     : /run/secrets/
Secrets --> NotifContainer  : /run/secrets/

@enduml
```
