# Smart Campus Grievance and Resolution System — Project Context

This document is the single source of truth for the project. Use it to scaffold the repository, generate the data layer, and implement features consistently.

## 1. Overview

A web platform where students and faculty (unified as `User`) report campus issues anonymously, with an optional description and photo evidence. The community upvotes/downvotes complaints, which drives a computed severity level. Complaints auto-route to a department and an Assistant with a severity-based SLA deadline. Assistants work the complaint through to completion; only the original raiser can confirm it's actually resolved. Missed SLAs trigger penalties against the Assistant and escalate to Admin. Notifications go out over email and WhatsApp at every stage.

**Course context:** College SEML/UML assignment — favor a clean, realistic scope over an overengineered one.

## 2. Tech Stack

| Layer                  | Choice                                                   |
| ---------------------- | -------------------------------------------------------- |
| Frontend               | Next.js, React, Tailwind CSS, Shadcn UI                  |
| Backend                | Node.js, TypeScript                                      |
| Auth & Database        | Supabase (Postgres + Auth)                               |
| File/Image storage     | Supabase Storage                                         |
| Email notifications    | SMTP provider (SendGrid or Resend)                       |
| WhatsApp notifications | WhatsApp Business (Meta) API or Twilio                   |
| Hosting/Ops            | Docker, GitHub Actions (CI/CD), AWS EC2, SSL certificate |

## 3. User Roles & Permissions

There is **no separate Student/Faculty class and no SuperAdmin** — this was deliberately simplified. A single `User` class carries a `role` field (`"Student"` / `"Faculty"`), since both perform identical operations. `Admin` is the only administrative role (no separate Super Admin tier).

| Role                             | Can do                                                                                                                                                                                                           |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User** (Student/Faculty) | Register/login, raise a complaint (anonymously), view the complaint feed, view complaint details, track status, upvote/downvote, confirm resolution, reopen a rejected fix, view notifications                   |
| **Assistant**              | View complaints assigned to their department, update complaint status, upload proof-of-work images, add resolution remarks, close a complaint (moves it to raiser confirmation — cannot mark Resolved directly) |
| **Admin**                  | Monitor all complaints, reassign a complaint to a different Assistant, approve/reject complaints flagged by heavy downvoting, view reports, view the SLA dashboard                                               |
| **Department**             | Not a user role — an organizational entity that complaints and Assistants belong to                                                                                                                             |

**Anonymity rule (hard constraint):** the raiser's identity must never be exposed to other users, Assistants, or Admins in any UI, export, or API response — only used internally for the confirm/reopen action and audit trail.

## 4. Data Model (Entities)

### User

```
- userId: int
- name: String
- email: String
- password: String
- role: String        // "Student" | "Faculty"
- department: String  // e.g. CSE, AIML, IT
- contactNumber: String
```

Operations: `login()`, `logout()`, `raiseComplaint()`, `viewComplaintFeed()`, `viewComplaintDetails()`, `trackComplaintStatus()`, `upvoteComplaint()`, `downvoteComplaint()`, `confirmResolution()`, `reopenComplaint()`, `viewNotifications()`

### Complaint

```
- complaintId: int
- title: String
- description: String
- category: String     // Electrical, Plumbing/Water, Wi-Fi/IT, Hostel, Classroom/Lab,
                        // Sanitation, Canteen, Library, Safety, Other
- status: String        // see §6 lifecycle
- severity: String       // Low | Medium | High | Critical
- priority: String
- createdDate: Date
- resolvedDate: Date
```

Operations: `createComplaint()`, `updateStatus()`, `closeComplaint()`, `reopenComplaint()`

### Assistant

```
- assistantId: int
- name: String
- department: String
```

Operations: `viewAssignedComplaints()`, `updateComplaintStatus()`, `uploadProofImage()`, `closeComplaint()`, `addResolutionRemarks()`

### Admin

```
- adminId: int
- name: String
```

Operations: `monitorComplaints()`, `reassignComplaint()`, `rejectComplaint()`, `viewReports()`, `viewSLADashboard()`

### Department

```
- departmentId: int
- departmentName: String
```

Operations: `assignComplaint()`, `updateDepartmentDetails()`

### Vote

```
- voteId: int
- voteType: String   // "Upvote" | "Downvote"
- voteDate: Date
```

Operations: `castVote()`, `removeVote()`

### Attachment

```
- attachmentId: int
- fileName: String
- fileType: String
- uploadDate: Date
```

Operations: `uploadFile()`, `deleteFile()`

### Notification

```
- notificationId: int
- message: String
- timestamp: Date
- isRead: Boolean
```

Operations: `sendNotification()`, `markAsRead()`

## 5. Entity Relationships

```
User        1 ---- 0..* Complaint       (raiser, kept anonymous downstream)
Complaint   1 ---- 0..* Attachment
Complaint   1 ---- 0..* Vote
User        1 ---- 0..* Vote
Assistant   1 ---- 0..* Complaint       (assigned complaints)
Department  1 ---- 0..* Complaint
Department  1 ---- 0..* Assistant
User        1 ---- 0..* Notification
```

## 6. Complaint Lifecycle (State Machine)

Status values: `Submitted`, `Under Review`, `Assigned`, `In Progress`, `Pending Confirmation`, `Resolved`, `Reopened`, `Closed`, `Removed`.

```
[*] → Submitted
Submitted → Assigned                      : autoAssign()  [normal path]
Submitted → Under Review                  : downvotes >= threshold
Under Review → Assigned                   : admin approves
Under Review → Removed [*]                : admin rejects
Assigned → In Progress                    : startProcessing()
In Progress → In Progress (self)          : SLA breach → penalty() + escalate()
In Progress → Pending Confirmation        : workCompleted()
Pending Confirmation → Resolved           : confirmResolution()   [by raiser only]
Pending Confirmation → Resolved           : no raiser response for 5 days → auto-close
Pending Confirmation → Reopened           : reopenComplaint()     [raiser rejects the fix]
Reopened → Assigned                       : reassign()
Resolved → Closed [*]
```

## 7. Core Functional Requirements

### 7.1 Complaint Submission

- Category is mandatory (drives auto-routing + base severity), description min. 20 characters, up to 3 images (≤5MB each, JPEG/PNG, EXIF/location metadata stripped).
- Posted anonymously; raiser identity hidden from feed, Assistants, Admin.

### 7.2 Severity & Voting

- Base severity by category: Safety/Electrical/Water-leakage → High; Wi-Fi/Sanitation/Furniture → Medium; cosmetic/suggestions → Low.
- Net votes ≥ 10 raise severity one level; net votes ≥ 25 force Critical (pinned to top of feed).
- Downvote misuse control: net downvotes ≥ 5 → tagged "Under Review" (still visible); net downvotes ≥ 10 with zero upvotes → hidden pending Admin decision. Never auto-deleted — Admin makes the call.
- Feed sorted by severity, then net votes, descending.
- One vote (up or down) per user per complaint; changeable any time.

### 7.3 Assignment, SLA & Notifications

- Auto-routed on submission to the matching department, and to the Assistant with the fewest open assignments there.
- SLA by severity: **Critical = 12h, High = 24h, Medium = 72h, Low = 7 days**, timer starts at assignment.
- Notifications (email + WhatsApp, per user preference) fire on: assignment (to Assistant), 80%-of-SLA reminder (to Assistant), every status change (to raiser), SLA breach (to Assistant + Admin), unresolved 24h after breach (escalation).
- Failed sends retry 3× with back-off and are logged; escalation notifications must never be silently dropped.

### 7.4 Resolution & Penalty Workflow

- Assistant can only move a complaint to `In Progress` → `Pending Confirmation` — never `Resolved` directly.
- Only the original raiser can confirm `Resolved` or reject it (→ `Reopened`, which reassigns and restarts the SLA).
- `Pending Confirmation` auto-closes as `Resolved` after 5 days of no raiser response.
- Penalty ladder per Assistant: 1st SLA breach on a complaint → recorded warning; 2nd breach in a 30-day window → formal penalty entry visible to Admin; 3rd → escalated for review. All penalties timestamped in the Assistant's history.

### 7.5 Admin Controls

- Reassign any complaint to a different Assistant.
- Approve/reject removal of downvote-flagged complaints.
- View department-level SLA compliance and penalty/report dashboards.

## 8. Non-Functional Requirements

- **Performance:** new complaints/votes reflect in the feed within a few seconds.
- **Privacy:** raiser identity never exposed outside the confirm/reopen + audit path.
- **Security:** role-based access control (User, Assistant, Admin); authenticated sessions only.
- **Reliability:** status/vote/penalty/escalation data stored durably; notification failures retried and logged.
- **Usability:** responsive on desktop and mobile.
- **Scalability:** supports growing users, departments, complaints, and images without material slowdown.

## 9. Constraints

- Every complaint must have a predefined category; auto-assignment is mandatory, not user-editable.
- Assistants can only reach `In Progress` / `Pending Confirmation` — never `Resolved`.
- Only the raiser can mark `Resolved`; only Admin can remove a flagged complaint.
- SLA/severity thresholds and penalty rules should be configurable (seed as constants for MVP; admin-editable is a stretch goal).
- Images capped at 5MB, 3 per complaint, JPEG or PNG only.

## 10. Suggested Repo Structure

```
/
├── apps/
│   └── web/                     # Next.js app (App Router)
│       ├── app/
│       │   ├── (auth)/          # login, register
│       │   ├── (user)/          # feed, raise complaint, my complaints, notifications
│       │   ├── (assistant)/     # assigned queue, SLA countdown view
│       │   ├── (admin)/         # reports, SLA dashboard, reassignment, flagged review
│       │   └── api/             # route handlers (complaints, votes, notifications, cron)
│       ├── components/          # shared UI (shadcn-based)
│       └── lib/                 # supabase client, severity/SLA logic, notification senders
├── packages/
│   └── shared/                  # shared TS types matching §4 entities, zod schemas
├── supabase/
│   └── migrations/              # SQL migrations for the entities/relationships in §4–5
├── docs/
│   └── PROJECT_CONTEXT.md       # this file
└── docker-compose.yml
```

## 11. Environment Variables Needed

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SMTP_HOST= / SMTP_USER= / SMTP_PASS=          (or RESEND_API_KEY / SENDGRID_API_KEY)
WHATSAPP_API_TOKEN= / WHATSAPP_PHONE_ID=       (Meta) — or TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN
```

## 12. Out of Scope for MVP (Future Scope)

- ML/image-similarity duplicate-complaint detection and vote-merging
- Post-resolution star rating of Assistant performance
- Location heatmap / trend analytics
- Holiday/weekend-aware SLA pausing
- Formal penalty appeal workflow
- Native mobile app with push notifications
