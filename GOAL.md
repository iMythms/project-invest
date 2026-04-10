# Objective

Build a family office investment portal that supports:

- Multi-user authentication with role-based access control
- Investment opportunity browsing and portfolio viewing
- Investment request workflows (submit → pending → approved/rejected)
- Audit logging to track all user actions
- Professional B2B user interface with responsive design

---

## Tech Stack Requirements

### Required

- **Frontend:** Next.js (App Router or Pages Router), TypeScript strongly preferred
- **Database:** PostgreSQL
- **Authentication:** JWT-based authentication

### Flexible

- **Backend:** Node.js with any framework (Express, Fastify, etc.), TypeScript preferred, or JVM-based (Java/Kotlin)
- **ORM:** Optional (Prisma, Sequelize, TypeORM, etc.)

---

## Core Tasks & Grading Criteria

### 1. API & Database Design (25%)

#### Requirements

Design and implement a database schema to support:

**Users Table:**

| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `email` | User email (unique) |
| `password_hash` | Hashed password |
| `name` | Full name |
| `role` | User role (enum: viewer, investor, approver) |
| `family_office_id` | Reference to family office (for multi-tenancy) |
| `created_at`, `updated_at` | Timestamps |

**Investment Opportunities Table:**

| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `name` | Opportunity name (e.g., "Tanami Growth Fund") |
| `description` | Detailed description |
| `minimum_investment` | Minimum investment amount |
| `status` | Enum (open, closed) |
| `created_at`, `updated_at` | Timestamps |

**Investment Requests Table:**

| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `user_id` | Reference to user who submitted |
| `opportunity_id` | Reference to investment opportunity |
| `amount` | Requested investment amount |
| `status` | Enum (pending, approved, rejected) |
| `submitted_at` | Timestamp of submission |
| `reviewed_at` | Timestamp of approval/rejection (nullable) |
| `reviewed_by` | Reference to user who approved/rejected (nullable) |
| `notes` | Optional notes/comments |

**Audit Log Table:**

| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `user_id` | Reference to user who performed action |
| `action` | Type of action (e.g., login, submit_investment, approve_investment, reject_investment) |
| `entity_type` | Type of entity affected (e.g., investment_request, user) |
| `entity_id` | ID of affected entity |
| `details` | JSON field with additional context |
| `ip_address` | User's IP address (optional) |
| `timestamp` | When action occurred |

#### REST Endpoints

**Authentication:**

- `POST /auth/login` - Returns JWT token
- `POST /auth/register` - Create new user (for testing purposes)

**Investment Opportunities:**

- `GET /opportunities` - List all open opportunities
- `GET /opportunities/:id` - Get single opportunity details

**Investment Requests:**

- `POST /investments` - Submit new investment request (requires investor or approver role)
- `GET /investments` - List investment requests (filtered by user role and permissions)
- `GET /investments/:id` - Get single investment request details
- `PATCH /investments/:id/approve` - Approve investment request (approver only)
- `PATCH /investments/:id/reject` - Reject investment request (approver only)

**Audit Logs:**

- `GET /audit-logs` - Get audit logs (approver only)

---

### 2. Authentication & Authorization (25%)

#### Requirements

**Authentication:**

- Implement JWT-based authentication
- `/auth/login` endpoint that validates credentials and returns JWT
- JWT should include: `user_id`, `email`, `role`, `family_office_id`
- Proper password hashing (bcrypt or similar)

**Authorization (Role-Based Access Control):**

Define three roles with different permissions:

| Role | View Opportunities | View Own Investments | View All Investments | Submit Investment | Approve/Reject Investment | View Audit Logs |
|------|:------------------:|:--------------------:|:--------------------:|:-----------------:|:-------------------------:|:---------------:|
| **Viewer** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Investor** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Approver** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Implementation Requirements:**

- Middleware/guards to protect routes based on role
- Backend must enforce permissions (frontend checks are not sufficient)
- Proper 401 (Unauthorized) and 403 (Forbidden) responses
- JWT token validation on protected routes

---

### 3. Frontend Implementation (25%)

#### Requirements

Build a responsive Next.js application with the following pages/features:

**Authentication Pages:**

- Login page with email/password form
- Display appropriate errors for failed login

**Dashboard/Home Page:**

- Welcome message with user's name and role
- Summary cards showing:
  - Number of available investment opportunities
  - User's total pending investments (if investor/approver)
  - User's total approved investments (if investor/approver)

**Investment Opportunities Page:**

- List of all open investment opportunities
- Display: name, description, minimum investment, status
- "Invest" button (visible only to investor/approver roles)

**My Investments Page:**

- Table showing user's investment requests
- Columns: Opportunity name, Amount, Status, Submitted date, Reviewed date
- Filter by status (All, Pending, Approved, Rejected)
- For approvers: show ALL investment requests with approve/reject actions

**Approve Investments Page (Approver only):**

- List of all pending investment requests
- Show: User name, Opportunity, Amount, Submitted date
- Approve/Reject buttons for each request
- Optional: Add notes when approving/rejecting
- **Bonus:** Bulk select and approve/reject multiple requests at once

**Audit Log Page (Approver only):**

- Table of audit log entries
- Columns: User, Action, Timestamp, Details
- Filter by action type
- Pagination or infinite scroll

#### UI/UX Requirements

- Responsive design (works on desktop and tablet)
- Professional B2B aesthetic (clean, functional, not consumer-flashy)
- Loading states for async operations
- Error messages for failed operations
- Success confirmations for completed actions
- Conditional rendering based on user role (hide/disable features user can't access)

---

### 4. Business Logic & Workflows (15%)

#### Requirements

**Investment Request Workflow:**

1. Investor submits investment request
2. Request is created with pending status
3. Approver can view pending requests
4. Approver can approve (status → approved) or reject (status → rejected)
5. Once approved/rejected, request cannot be modified

**Validation Rules:**

- Investment amount must meet opportunity's minimum investment requirement
- User cannot submit investment to closed opportunities
- Only pending requests can be approved/rejected
- User must be authenticated to perform actions
- User must have appropriate role for each action

**Audit Logging:**

- Log ALL user actions with context:
  - Login attempts (successful and failed)
  - Investment request submissions
  - Investment approvals/rejections
  - Any data modifications
- Include: user_id, action type, timestamp, entity affected, additional details (as JSON)

---

### 5. Code Quality & Documentation (10%)

#### Requirements

**Code Quality:**

- Clean, well-structured, and idiomatic code
- Consistent naming conventions
- Proper separation of concerns (routes, controllers, services, models)
- TypeScript usage (if applicable)
- No hardcoded secrets or credentials
- Environment variables for configuration

**Documentation:**

- `README.md` with:
  - Project overview
  - Tech stack used
  - Setup instructions (dependencies, database setup, environment variables)
  - How to run the application (backend and frontend)
  - How to run tests (if included)
  - Seed data instructions (how to create test users and opportunities)
  - Any assumptions or design decisions
  - Documentation of AI tool usage (where and how AI assistants were used)
- Code comments for complex logic
- API documentation (optional but encouraged)
