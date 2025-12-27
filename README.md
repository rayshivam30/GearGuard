# GearGuard - Enterprise Maintenance Tracking System

A comprehensive full-stack application for managing equipment maintenance, teams, work centers, and maintenance requests. Built with Next.js, TypeScript, Prisma, PostgreSQL, and Redis caching.

## Features

- **Equipment Management** - Track equipment inventory with health metrics, status, and maintenance history
- **Maintenance Requests** - Kanban board workflow (New → In Progress → Completed/Cancelled)
- **Team Management** - Organize maintenance teams and manage team members
- **Work Centers** - Define production work centers with cost tracking and OEE targets
- **Manager Dashboard** - Real-time analytics, critical equipment alerts, and completion metrics
- **Authentication** - Secure sign-up/sign-in with bcrypt password hashing and HTTP-only cookies
- **Caching** - Redis integration for performance optimization and data freshness
- **Responsive Design** - Dark theme industrial aesthetic, mobile-friendly interface

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS 4** - Utility-first styling
- **Lucide React** - Icon library
- **Date-fns** - Date manipulation

### Backend
- **Next.js API Routes** - RESTful endpoints
- **Prisma** - ORM for database operations
- **PostgreSQL (Neon)** - Relational database
- **Redis (Upstash)** - Caching layer
- **bcryptjs** - Password hashing

### DevOps
- **GitHub Actions** - CI/CD pipeline
- **Vercel** - Deployment platform
- **TypeScript** - Build-time type checking

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Redis instance (optional for caching)
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd gearguard
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file:
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/gearguard

# Redis (optional)
KV_REST_API_URL=your-redis-url
KV_REST_API_TOKEN=your-redis-token

# Node Environment
NODE_ENV=development
```

4. Generate Prisma Client
```bash
npx prisma generate
```

5. Run database migrations
```bash
npx prisma migrate dev
```

6. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to `/sign-up` to create an account.

## Project Structure

```
gearguard/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── equipment/         # Equipment CRUD
│   │   ├── teams/             # Team management
│   │   ├── requests/          # Maintenance requests
│   │   └── dashboard/         # Analytics
│   ├── layout.tsx             # Root layout with navigation
│   ├── globals.css            # Global styles
│   ├── sign-in/               # Sign-in page
│   ├── sign-up/               # Sign-up page
│   ├── dashboard/             # Manager dashboard
│   ├── equipment/             # Equipment list
│   ├── teams/                 # Teams list
│   ├── requests/              # Requests Kanban
├── components/
│   ├── navigation.tsx         # Main navigation
│   ├── equipment/             # Equipment components
│   ├── teams/                 # Team components
│   ├── requests/              # Request components
│   └── dashboard/             # Dashboard components
├── lib/
│   ├── prisma.ts             # Prisma singleton
│   ├── auth.ts               # Password hashing utilities
│   ├── auth-context.ts       # Auth state management
│   ├── redis.ts              # Redis caching
│   ├── db-operations.ts      # Cached DB queries
│   ├── env.ts                # Environment validation
│   └── utils.ts              # Utility functions
├── prisma/
│   └── schema.prisma         # Database schema
├── middleware.ts             # Route protection
└── proxy.ts                  # Request proxy (Next.js 16)
```

## Database Schema

### Core Entities
- **Users** - System users with roles (Admin, Manager, Technician, Employee)
- **Companies** - Multi-tenant organization support
- **Equipment** - Inventory with health tracking and status
- **MaintenanceRequests** - Service requests with priority and workflow status
- **Teams** - Maintenance teams with member assignments

### Relationships
- Equipment → Company (belongs to)
- Equipment → MaintenanceRequests (one-to-many)
- MaintenanceRequests → User (requested by)
- MaintenanceRequests → Team (assigned to)
- Teams → Users (many-to-many through TeamMembers)

## API Endpoints

### Authentication
- `POST /api/auth/sign-up` - Create account
- `POST /api/auth/sign-in` - Log in
- `POST /api/auth/sign-out` - Log out

### Equipment
- `GET /api/equipment` - List equipment
- `POST /api/equipment` - Create equipment
- `PATCH /api/equipment/[id]` - Update equipment
- `DELETE /api/equipment/[id]` - Delete equipment

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `PATCH /api/teams/[id]` - Update team
- `DELETE /api/teams/[id]` - Delete team
- `POST /api/teams/[id]/members` - Add member
- `DELETE /api/teams/[id]/members` - Remove member

### Requests
- `GET /api/requests` - List requests
- `POST /api/requests` - Create request
- `PATCH /api/requests/[id]` - Update request
- `DELETE /api/requests/[id]` - Delete request

### Dashboard
- `GET /api/dashboard/stats` - Get analytics and statistics

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

4. Deploy automatically on push to `main` branch

### Environment Variables

```env
# Required for production
DATABASE_URL=postgresql://...
NODE_ENV=production

# Optional for caching
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Vercel (CI/CD)
VERCEL_TOKEN=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID=
```

## Development Workflow

### Local Development
```bash
# Start dev server
npm run dev

# Generate Prisma updates
npx prisma generate

# Run migrations
npx prisma migrate dev --name <migration-name>

# View database
npx prisma studio
```

### Code Quality
```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## CI/CD Pipeline

### GitHub Actions Workflows

**test.yml** - Runs on every PR and push to develop/main
- Install dependencies
- Generate Prisma Client
- Run linter
- Build project
- Database tests with PostgreSQL service

**deploy.yml** - Runs on push to main
- Build application
- Generate Prisma Client
- Deploy to Vercel

## Security Considerations

- Passwords hashed with bcryptjs (10 salt rounds)
- HTTP-only cookies for session management
- Protected routes via middleware/proxy
- SQL injection prevention through Prisma parameterized queries
- CORS and secure headers configured
- Environment variables for sensitive data

## Performance Optimizations

- Redis caching for frequently accessed data (equipment, teams, requests)
- 5-minute cache for dashboard stats
- 30-minute cache for equipment and team data
- Automatic cache invalidation on mutations
- Server-side rendering where appropriate
- Code splitting and lazy loading

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Contact the development team
- Check documentation at `/docs`

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting and analytics
- [ ] Predictive maintenance using ML
- [ ] Integration with IoT sensors
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] Audit logging
- [ ] Advanced role-based access control (RBAC)
