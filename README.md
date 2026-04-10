# Family Office Investment Portal

A professional B2B investment portal for family offices with multi-user authentication, role-based access control, investment opportunity browsing, request workflows, and comprehensive audit logging.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (serverless functions)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT with bcrypt password hashing

## Features

### Core Functionality
- Multi-user authentication with JWT tokens
- Role-based access control (viewer, investor, approver)
- Investment opportunity browsing
- Investment request submission and tracking
- Approval workflow for investment requests
- Comprehensive audit logging

### User Roles
| Role | View Opportunities | View Own Investments | View All Investments | Submit Investment | Approve/Reject | View Audit Logs |
|------|:------------------:|:--------------------:|:--------------------:|:-----------------:|:--------------:|:---------------:|
| Viewer | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Investor | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Approver | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

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
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/project_invest?schema=public"
   JWT_SECRET="your-secret-key-change-in-production"
   ```

4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. Seed the database with test data:
   ```bash
   npm run db:seed
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Commands

- `npm run db:migrate` - Create and run migrations
- `npm run db:push` - Push schema changes to database (no migrations)
- `npm run db:seed` - Seed database with test data
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Test Accounts

After seeding, you can login with these accounts (password: `password123`):

- **Viewer:** viewer@test.com
- **Investor:** investor@test.com  
- **Approver:** approver@test.com

## Project Structure

```
project-invest/
├── app/
│   ├── api/           # API routes
│   │   ├── auth/      # Authentication endpoints
│   │   ├── opportunities/
│   │   ├── investments/
│   │   └── audit-logs/
│   ├── login/         # Login page
│   ├── dashboard/     # Dashboard page
│   ├── opportunities/ # Opportunities list
│   ├── investments/   # Investment requests
│   ├── approve/       # Approval page (approver only)
│   └── audit/         # Audit logs (approver only)
├── components/        # Shared components
├── lib/               # Utilities and helpers
│   ├── db.ts          # Prisma client
│   ├── auth.ts        # Authentication helpers
│   ├── api-auth.ts    # API route authentication
│   └── auth-context.tsx # Frontend auth context
├── prisma/
│   ├── schema.prisma  # Database schema
│   └── seed.ts        # Seed data
└── knowledge/         # Project knowledge base (for AI agent)
```

## API Endpoints

### Authentication
- `POST /api/auth` - Login (returns JWT)
- `PUT /api/auth` - Register user

### Investment Opportunities
- `GET /api/opportunities` - List open opportunities
- `GET /api/opportunities/:id` - Get opportunity details

### Investment Requests
- `POST /api/investments` - Submit investment request
- `GET /api/investments` - List investments (filtered by role)
- `GET /api/investments/:id` - Get investment details
- `PATCH /api/investments/:id/approve` - Approve request
- `PATCH /api/investments/:id/reject` - Reject request

### Audit Logs
- `GET /api/audit-logs` - Get audit logs (approver only)

## Development Notes

### Design Decisions
- **Monorepo approach:** Single repository for frontend and backend using Next.js API routes
- **Prisma:** Type-safe database access with auto-generated TypeScript types
- **App Router:** Modern Next.js patterns with server/client components
- **Tailwind CSS:** Rapid prototyping with professional B2B aesthetic

### Security Considerations
- JWT tokens expire after 7 days
- Passwords hashed with bcrypt (10 rounds)
- Role-based authorization enforced on API routes
- Audit logging for all critical actions
- No hardcoded secrets (environment variables required)

### Future Improvements
- Bulk approve/reject functionality
- Email notifications for approvals/rejections
- Real-time updates with WebSocket or polling
- Export audit logs to CSV/PDF
- Dashboard analytics and charts
- Two-factor authentication

## AI Tool Usage

This project was built using AI assistance (Ember, an AI coding agent):
- Project scaffolding and architecture decisions
- Database schema design and Prisma setup
- API route implementation
- Frontend components and pages
- Authentication system
- Test data seeding

All AI-generated code was reviewed and tested to ensure correctness and security.

## License

ISC