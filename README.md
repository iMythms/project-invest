# project invest

Professional B2B investment operations portal with multi-user authentication, role-based access control, opportunity creation and review workflows, investment request routing, and comprehensive audit logging.

**Source of truth:** Repository inspection and validated runtime state.

---

## Part I: Architecture & Governance

### Architecture Diagram

Source of truth: API routes in `app/api/*/route.ts`, Prisma schema in `prisma/schema.prisma`, page components in `app/*/page.tsx`.

```mermaid
flowchart TB
   subgraph public[Public Layer]
      landing[app/page.tsx]
      login[app/login/page.tsx]
   end

   subgraph authenticated[Authenticated Shell]
      sidebar[components/ui/sidebar.tsx]
      dashboard[app/dashboard/page.tsx]
      opportunities[app/opportunities/page.tsx]
      investments[app/investments/page.tsx]
      approve[app/approve/page.tsx]
      audit[app/audit/page.tsx]
      dialogs[shadcn Dialog workflows]
   end

   subgraph api[API Layer]
      authRoute[api/auth/route.ts]
      oppRoute[api/opportunities/route.ts]
      invRoute[api/investments/route.ts]
      auditRoute[api/audit-logs/route.ts]
   end

   subgraph auth[Auth Layer]
      jwt[lib/auth.ts]
      apiGuard[lib/api-auth.ts]
   end

   subgraph data[Data Layer]
      prismaClient[lib/db.ts]
      postgres[(PostgreSQL 15)]
   end

   landing --> login
   login --> authRoute
   authRoute --> jwt
   jwt --> prismaClient

   sidebar --> dashboard
   dashboard --> oppRoute
    opportunities --> oppRoute
    investments --> invRoute
   approve --> invRoute
   audit --> auditRoute

   oppRoute --> apiGuard
   invRoute --> apiGuard
   auditRoute --> apiGuard

   apiGuard --> prismaClient
   prismaClient --> postgres
```

### Authentication & Authorization

Source of truth: `lib/auth.ts`, `lib/api-auth.ts`, `prisma/schema.prisma`.

**Authentication:**
- JWT tokens with 7-day expiration
- Password hashing with bcrypt (10 rounds)
- Token verification on every protected API route

**Authorization Matrix:**

| Endpoint | Viewer | Investor | Investment Manager | Approver |
|----------|:------:|:--------:|:------------------:|:--------:|
| GET /api/opportunities | ✓ | ✓ | ✓ | ✓ |
| POST /api/opportunities | ✗ | ✗ | ✓ | ✗ |
| GET /api/opportunities/:id | ✓ | ✓ | ✓ | ✓ |
| POST /api/investments | ✗ | ✓ | ✗ | ✓ |
| GET /api/investments (own) | ✓ | ✓ | ✗ | ✓ |
| GET /api/investments (all) | ✗ | ✗ | ✗ | ✓ |
| PATCH /api/investments/:id/approve | ✗ | ✗ | ✗ | ✓ |
| PATCH /api/investments/:id/reject | ✗ | ✗ | ✗ | ✓ |
| GET /api/audit-logs | ✗ | ✗ | ✗ | ✓ |

**Role Capabilities:**

| Role | View Opportunities | Create Opportunities | View Own Investments | View All Investments | Submit Investment | Approve/Reject | View Audit Logs |
|------|:------------------:|:--------------------:|:--------------------:|:--------------------:|:-----------------:|:--------------:|:---------------:|
| Viewer | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Investor | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Investment Manager | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Approver | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |

### Database Schema

Source of truth: `prisma/schema.prisma`.

| Model | Fields | Relations |
|-------|--------|-----------|
| FamilyOffice | id, name, createdAt, updatedAt | users[] |
| User | id, email, password_hash, name, role, family_office_id | familyOffice, investmentRequests[], reviewedRequests[], auditLogs[] |
| InvestmentOpportunity | id, name, description, minimum_investment, status | investmentRequests[] |
| InvestmentRequest | id, user_id, opportunity_id, amount, status, submitted_at, reviewed_at, reviewed_by, notes | user, opportunity, reviewer |
| AuditLog | id, user_id, action, entity_type, entity_id, details, ip_address, timestamp | user? |

**Enums:**
- UserRole: viewer, investor, investment_manager, approver
- OpportunityStatus: open, closed
- RequestStatus: pending, approved, rejected

### Security Controls

Source of truth: `lib/auth.ts`, `lib/api-auth.ts`.

| Control | Implementation |
|---------|----------------|
| Password storage | bcrypt hash with 10 rounds |
| Token format | JWT signed with server secret |
| Token expiration | 7 days |
| Route protection | `requireAuth()` and `requireRole()` middleware |
| Authorization enforcement | Backend validates role on every request |
| Secrets management | Environment variables required |

### Audit Logging

Source of truth: `prisma/schema.prisma` AuditLog model, `app/api/audit-logs/route.ts`.

| Field | Purpose |
|-------|---------|
| action | Type of action (login, submit_investment, approve_investment, reject_investment) |
| entity_type | Type of entity affected |
| entity_id | ID of affected entity |
| details | JSON context with additional information |
| ip_address | User IP address (optional) |
| timestamp | When action occurred |

**Logged Actions:**
- Login attempts (successful and failed)
- Opportunity creation
- Investment request submissions
- Investment approvals and rejections

### Backup & Disaster Recovery

Source of truth: repository deployment model and currently available operational evidence.

A formal DR plan is not currently documented for this repository. DR planning is still expected and should be introduced. Estimated implementation difficulty: medium, because application redeployment is straightforward from source and CI/CD (none configured yet), but PostgreSQL database backup and recovery objectives still need explicit definition and tested runbooks.

---

## Part II: Developer Guide

### Tech Stack

Source of truth: `package.json`, `knowledge/stack.md`.

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js | 16.2.3 |
| Frontend | React | 19.2.5 |
| Language | TypeScript | 6.0.2 |
| Styling | Tailwind CSS | 4.2.2 |
| Database | PostgreSQL | 15 |
| ORM | Prisma | 5.22.0 |
| Auth | JWT + bcrypt | 9.0.3 / 6.0.0 |
| UI System | shadcn/ui + Base UI | 4.2.0 / 1.3.0 |
| Charts | Recharts + shadcn chart primitives | 3.8.0 / local wrappers |

**Key Dependencies:**

| Package | Purpose |
|---------|---------|
| shadcn | Registry and generated UI components |
| @hugeicons/react | Icon system |
| @base-ui/react | UI primitives |
| class-variance-authority | Component variants |
| clsx + tailwind-merge | Class utilities |
| recharts | Dashboard and analytical chart rendering |

### Configuration

Source of truth: `.env` requirements from `lib/auth.ts` and `prisma/schema.prisma`.

Required environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/project_invest?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
```

### Project Structure

Source of truth: repository directory inspection.

```
project-invest/
├── app/
│   ├── api/
│   │   ├── auth/route.ts
│   │   ├── opportunities/route.ts, [id]/route.ts
│   │   ├── investments/route.ts, [id]/route.ts, [id]/approve/route.ts, [id]/reject/route.ts
│   │   └── audit-logs/route.ts
│   ├── page.tsx, page-client.tsx (landing)
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── opportunities/page.tsx
│   ├── investments/page.tsx, new/page.tsx
│   ├── approve/page.tsx
│   └── audit/page.tsx
├── components/
│   ├── ui/button.tsx, sidebar.tsx, card.tsx, badge.tsx, table.tsx, input.tsx, select.tsx, textarea.tsx, dialog.tsx, chart.tsx, etc.
│   ├── navbar.tsx, page-header.tsx, status-pill.tsx, dashboard-charts.tsx
├── lib/
│   ├── db.ts (Prisma client)
│   ├── auth.ts (JWT, bcrypt)
│   ├── api-auth.ts (route guards)
│   └── auth-context.tsx (frontend auth state)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── knowledge/
│   ├── stack.md, schema.md, api-endpoints.md
├── .opencode/skills/docs/SKILL.md
├── AGENTS.md, IDENTITY.md, KNOWLEDGE.md, DESIGN.md, GOAL.md
```

### Setup Instructions

Source of truth: `package.json`, `prisma/schema.prisma`, and validated local runtime commands.

**Prerequisites:**
- Node.js 18+
- PostgreSQL 15
- npm or yarn

**Installation:**

1. Clone the repository:
   ```bash
   git clone https://github.com/iMythms/project-invest.git
   cd project-invest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/project_invest?schema=public"
   JWT_SECRET="your-secret-key-change-in-production"
   ```

4. Initialize database (PostgreSQL must be running):
   ```bash
   npm run db:push
   ```

5. Seed test data:
   ```bash
   npm run db:seed
   ```

6. Run development server:
   ```bash
   npm run dev
   ```

7. Open http://localhost:3000

**Database Commands:**

| Command | Purpose |
|---------|---------|
| npm run db:migrate | Create and run migrations |
| npm run db:push | Push schema changes (no migrations) |
| npm run db:seed | Seed test data |
| npm run db:studio | Open Prisma Studio GUI |

### Test Accounts

Source of truth: `prisma/seed.ts`.

After seeding, login with these accounts (password: `password123`):

| Email | Role |
|-------|------|
| viewer@test.com | Viewer |
| investor@test.com | Investor |
| manager@test.com | Investment Manager |
| approver@test.com | Approver |

### API Request Formats

Source of truth: `app/api/*/route.ts` files.

**Authentication:**

```bash
POST /api/auth
Content-Type: application/json

{
  "email": "approver@test.com",
  "password": "password123",
  "action": "login"
}

Response: { "token": "jwt_token", "user": { ... } }
```

**Investment Request:**

```bash
POST /api/investments
Authorization: Bearer <token>
Content-Type: application/json

{
  "opportunityId": "uuid",
  "amount": 100000
}
```

**Opportunity Creation:**

```bash
POST /api/opportunities
Authorization: Bearer <manager_token>
Content-Type: application/json

{
  "name": "Late Stage Credit Fund",
  "description": "Senior secured credit strategy focused on asset-backed downside protection.",
  "minimumInvestment": 100000,
  "status": "open"
}
```

**Approve/Reject:**

```bash
PATCH /api/investments/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Approved for portfolio allocation"
}
```

### Design System

Source of truth: `DESIGN.md`.

**Visual Theme:**
- Light-first, institutional aesthetic
- shadcn sidebar shell for authenticated pages
- `project invest` branding in the authenticated workspace
- fully rounded button treatment across the app
- muted semantic colors for status
- shadcn cards, tables, dialogs, and Recharts-based chart blocks drive product identity

**Color Palette:**

| Token | Hex | Role |
|-------|-----|------|
| trust-700 | #1D4ED8 | Primary action, active nav |
| trust-600 | #2563EB | Primary button background |
| ink-950 | #0F172A | Primary headings |
| slate-700 | #334155 | Default body text |
| cloud-50 | #F8FAFC | App canvas |
| white | #FFFFFF | Cards, panels |

### Deployment Considerations

Source of truth: package.json build configuration.

**Build Command:**
```bash
npm run build  # Runs: prisma generate && next build
```

**Production Start:**
```bash
npm run start  # Runs: next start
```

**Considerations:**
- Requires PostgreSQL instance
- JWT_SECRET must be production-strength random
- No CI/CD configured (manual deployment)
- Stateless app (JWT tokens, no server sessions)

---

## Resources

### Repository Files

- [prisma/schema.prisma](./prisma/schema.prisma) - Database schema definition
- [lib/auth.ts](./lib/auth.ts) - JWT and bcrypt authentication
- [lib/api-auth.ts](./lib/api-auth.ts) - API route guards
- [DESIGN.md](./DESIGN.md) - Design system specification
- [GOAL.md](./GOAL.md) - Project objectives and grading criteria
- [knowledge/api-endpoints.md](./knowledge/api-endpoints.md) - API specification
- [knowledge/stack.md](./knowledge/stack.md) - Technology decisions

### External Documentation

- [Next.js Documentation](https://nextjs.org/docs) - App Router, API routes
- [Prisma Documentation](https://www.pris.ly/d/prisma-schema) - ORM and schema
- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/index.html) - Database
- [JWT Introduction](https://jwt.io/introduction) - Token authentication
- [bcrypt npm](https://www.npmjs.com/package/bcrypt) - Password hashing
- [Tailwind CSS v4](https://tailwindcss.com/docs) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI component registry and patterns
- [Recharts](https://recharts.org/en-US) - Chart rendering library
- [Mermaid Architecture Syntax](https://mermaid.js.org/syntax/architecture) - Diagram format

### Project-Specific

- [AGENTS.md](./AGENTS.md) - Agent directives and memory architecture
- [.opencode/skills/docs/SKILL.md](./.opencode/skills/docs/SKILL.md) - Documentation skill

---

## AI Assistant Usage

OpenCode was used throughout development as a coding agent assistant.

**Areas where OpenCode was used:**

| Area | Usage |
|------|-------|
| Build troubleshooting | Diagnosed Tailwind CSS v4 PostCSS compatibility, resolved `@tailwindcss/postcss` plugin configuration |
| Package imports | Identified `@hugeicons/react` export structure, corrected import syntax for `HugeiconsIcon` and `IconSvgElement` type |
| Authentication redirect | Implemented root page split (server/client) with authenticated user redirect to `/dashboard` |
| Documentation | Created `.opencode/skills/docs/SKILL.md`, refactored README.md with evidence-based approach and Mermaid architecture diagram |
| UI refactor | Installed and applied shadcn sidebar, dialog, table, card, select, textarea, and chart primitives |
| Role expansion | Added `investment_manager` role, API-backed opportunity creation, and dialog-based opportunity workflows |
| Repository setup | Verified package versions, updated knowledge files and seed data with accurate dependency and role state |

**How OpenCode was used:**

- Executed bash commands for package installation, build verification, and git operations
- Read and edited source files directly
- Used grep and glob to search codebase patterns
- Verified changes by running `npm run build` after modifications
- Committed and pushed changes incrementally

**Agent memory system:**

The repository uses an agent memory architecture defined in `AGENTS.md`:
- `knowledge/` directory stores factual system state
- `notes/` directory stores daily development trail
- OpenCode reads these files at session start to restore context

See `AGENTS.md` for the full memory architecture specification.
