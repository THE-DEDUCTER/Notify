# Notify - Smart Campus Grievance and Resolution System

A web platform where students and faculty report campus issues anonymously, with an optional description and photo evidence. The community upvotes/downvotes complaints, which drives a computed severity level. Complaints auto-route to a department and an Assistant with a severity-based SLA deadline.

## Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS, Shadcn UI
- **Backend:** Node.js, TypeScript
- **Auth & Database:** Supabase (Postgres + Auth)
- **File/Image storage:** Supabase Storage
- **Notifications:** SMTP provider (SendGrid/Resend), WhatsApp Business API / Twilio
- **Hosting/Ops:** Docker, GitHub Actions (CI/CD), AWS EC2

## Project Structure
This repository uses a monorepo-style structure:
- `apps/web/`: The Next.js frontend application.
- `packages/shared/`: Shared TypeScript types and Zod schemas.
- `supabase/migrations/`: Database schema and migrations.
- `docs/`: Project documentation, including the main `PROJECT_CONTEXT.md`.

For a full overview of the data model, workflow, and requirements, please see [PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md).

## Getting Started
(To be added)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
