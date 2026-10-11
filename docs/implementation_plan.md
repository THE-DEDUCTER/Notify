# Notify Frontend Implementation Plan

## 1. Design System & Aesthetics
**Mood:** Calm, trustworthy, civic. Confident and modern.
**Typography:** 
- UI/Headings: `Geist` (or Inter as fallback) for clean readability.
- Monospace/Numbers (SLAs, IDs): `JetBrains Mono` with tabular nums for layout stability during countdowns.

**Color Palette (Semantic & Accessible):**
- **Canvas/Background:** Off-white `#FAF9F6` for light mode, deep slate `#0F172A` for dark mode.
- **Primary:** Deep ink/teal-navy (`#0F2942` light / `#38BDF8` dark).
- **Accent/CTA:** Warm amber/coral for primary actions.
- **Severity Scale:** 
  - Low: Slate Blue (`bg-slate-100 text-slate-700`)
  - Medium: Amber (`bg-amber-100 text-amber-800`)
  - High: Orange-Red (`bg-orange-100 text-orange-800`)
  - Critical: Deep Red with subtle pulse (`bg-red-100 text-red-900 animate-pulse-slow`)

**Layout & Spacing:**
- 8px grid system. Generous whitespace.
- 12-16px radii on cards, 6px on buttons.
- Elevation: Subtle borders (1px solid slate-200) with heavy, diffused drop shadows on hover or modals.

---

## 2. Route Map (Next.js App Router)

```text
app/
├── (auth)/
│   └── login/page.tsx                  # Role switcher demo login
├── (user)/
│   ├── layout.tsx                      # User Navbar/Sidebar
│   ├── feed/page.tsx                   # Public complaint feed (sortable)
│   ├── raise/page.tsx                  # 3-step wizard to submit complaint
│   ├── my-complaints/page.tsx          # Personal complaints summary
│   └── complaint/[id]/page.tsx         # Thread view, stepper, resolution controls
├── (assistant)/
│   ├── layout.tsx                      # Assistant Navbar/Sidebar
│   └── dashboard/page.tsx              # Queue, SLA timers, work pane
├── (admin)/
│   ├── layout.tsx                      # Admin Navbar/Sidebar
│   ├── dashboard/page.tsx              # KPIs, flagged review queue
│   └── complaints/page.tsx             # Table with filters/search
└── (superadmin)/
    ├── layout.tsx                      # Super Admin Navbar/Sidebar
    ├── analytics/page.tsx              # Recharts heatmap & volume charts
    ├── rules/page.tsx                  # Edit SLA/severity thresholds
    └── management/page.tsx             # Departments & Users CRUD
```

---

## 3. Component Inventory

**Shared UI (shadcn/ui customized):**
- `Button` (with loading states), `Card`, `Badge` (severity/status variations), `Input`, `Textarea`, `Select`, `Dialog`/`Sheet` (modals/drawers), `Toast`, `Skeleton` (loaders), `Command` (Ctrl+K search).

**Domain Components:**
- `ComplaintCard`: Used in feeds. Shows severity, category, SLA, votes, and title.
- `VoteController`: Animated counter with optimistic updates (ArrowBigUp/Down).
- `SLACountdown`: Animated ring/bar or mono-text component. Shifts color at 80% (Warning) and 100% (Breach).
- `StatusStepper`: Horizontal timeline visualizing the complaint lifecycle.
- `ImageGallery`: Lightbox for viewing up to 3 evidence photos.

---

## 4. Mock Data Model (TypeScript Interfaces)

```typescript
type Role = 'Student' | 'Faculty' | 'Assistant' | 'Admin' | 'SuperAdmin';
type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
type Status = 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Pending Confirmation' | 'Resolved' | 'Reopened' | 'Closed' | 'Removed';

interface User {
  id: string;
  name: string;
  role: Role;
  departmentId?: string; 
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: Severity;
  status: Status;
  isAnonymous: boolean; // Always true in MVP context, enforces identity masking
  raiserId: string;
  assignedAssistantId?: string;
  departmentId: string;
  upvotes: number;
  downvotes: number;
  createdAt: string; // ISO DateTime
  slaDeadline?: string; // ISO DateTime
  resolvedAt?: string;
  images: string[]; // URLs
  history: { status: Status; timestamp: string; note?: string }[];
}
```

---

## 5. Build Order (Verified Milestones)

- **Milestone 1: Foundation & Mock Engine.** 
  - Setup Tailwind CSS variables, typography, and shadcn components. 
  - Create `lib/mock` with the 40+ seeded complaints. 
  - Write pure functions in `lib/rules` for SLA and severity calculations.
- **Milestone 2: App Shell & Auth Demo.** 
  - Global layout, responsive Navbar (collapsing to drawer on mobile). 
  - Login role-switcher page.
- **Milestone 3: User Experience.** 
  - Public Feed with animated voting and sorting. 
  - Raise Complaint 3-step wizard with form validation.
  - Complaint Detail page with Status Stepper.
- **Milestone 4: Assistant Workflow.** 
  - Assigned queue with live SLA countdowns. 
  - Action panels (Upload proof, update status to Pending Confirmation).
- **Milestone 5: Admin & Super Admin.** 
  - KPI Overview. 
  - Flagged review queue. 
  - Institution Analytics (Recharts heatmap) and Rules editor form.
