# CrossGuild

A modern e-commerce platform for gaming gear and accessories.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL via [Prisma 6](https://www.prisma.io/) |
| Auth | [NextAuth v5](https://authjs.dev/) (GitHub, Google, Credentials) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) + shadcn/ui |
| Forms | React Hook Form + Zod |
| Data fetching | TanStack React Query |
| Email | Resend |
| Media | Cloudinary |
| Package manager | [pnpm](https://pnpm.io/) |

## Project Structure

```
src/
├── app/          # Next.js routes — thin pages only
├── features/     # Domain logic (auth, cart, products, …)
├── shared/       # UI components, hooks, lib, types
├── config/       # App constants
└── middleware.ts # Route protection
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for conventions and patterns.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL database

### Setup

1. Clone the repository:

```bash
git clone [repository-url]
cd CrossGuild
```

2. Install dependencies:

```bash
pnpm install
```

3. Copy environment variables and fill in your values:

```bash
cp .env.exemple .env
```

Required variables: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, and provider keys (GitHub/Google) if using OAuth.

4. Run database migrations:

```bash
pnpm exec prisma migrate dev
```

5. Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Architecture

CrossGuild uses a **feature-based architecture** 

- **Thin pages** — `src/app/` routes delegate to feature views
- **Feature modules** — business logic colocated under `src/features/`
- **Shared layer** — reusable UI and infrastructure in `src/shared/`

The codebase is being refactored incrementally. See [docs/REFACTOR_PROMPTS.md](docs/REFACTOR_PROMPTS.md) for the migration plan.

## License

