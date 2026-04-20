# NexHire

AI-powered recruitment platform with React + Vite frontend and Express + PostgreSQL (Neon) backend.

## Project Structure

```
.
├── api/
│   └── index.js              # Vercel serverless entry point (Express app)
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── apiConfig.js      # API base URL (auto-detects dev vs prod)
│   │   ├── pages/
│   │   └── components/
│   └── vite.config.js
├── server/                   # Express backend (used in local dev)
│   ├── db.js                 # Neon connection pool + query helper
│   ├── routes/               # 12 route files (auth, jobs, candidates, etc.)
│   ├── middleware/
│   └── index.js              # Local dev entry point
├── ProjectResources/         # SQL scripts, schema dumps, dev docs
├── DevelopmentGuide/         # Architecture and feature documentation
├── vercel.json               # Vercel build + routing config
└── package.json              # Root deps for Vercel serverless function
```

## Local Development

```bash
# Install dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Set up environment
cp .env.example server/.env
# Edit server/.env with your Neon connection string

# Run both frontend and backend concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5001

## Database

The project uses **Neon PostgreSQL** (serverless Postgres). The schema lives in:

- `ProjectResources/Database_Components_Seperated/NexHire_Tables.sql` — table definitions
- `ProjectResources/Database_Components_Seperated/NexHire_Views.sql` — 29 views
- `ProjectResources/Database_Components_Seperated/NexHire_StoredProcedures/` — 50+ procedures
- `ProjectResources/Database_Components_Seperated/NexHire_Triggers.sql` — 17 triggers

## Deployment

This project is configured for **Vercel** deployment. See the
[Deployment Guide](#deployment-1) below for detailed instructions.

### Quick Deploy

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import the repo
3. Add environment variables (see below)
4. Deploy

### Required Environment Variables (in Vercel dashboard)

| Name | Value |
|------|-------|
| `DB_CONNECTION_STRING` | `postgresql://USER:PASSWORD@ep-HOST-pooler.REGION.aws.neon.tech/DBNAME?sslmode=require` |
| `CORS_ORIGIN` | `https://your-app.vercel.app` (your Vercel URL after first deploy) |

See [Connecting Vercel to Neon](#connecting-vercel-to-neon) below for step-by-step.

## Tech Stack

- **Frontend:** React 19, Vite 7, TailwindCSS 4, Recharts, Lucide icons
- **Backend:** Express 5, pg 8 (PostgreSQL client), Multer (file uploads)
- **Database:** Neon PostgreSQL 17 (serverless Postgres)
- **Deployment:** Vercel (serverless functions + static hosting)


## Demo Accounts

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Admin | admin1 | (leave blank) | Full system access |
| Recruiter | recruiter1 | (leave blank) | Job management, candidates, analytics |
| Candidate | candidate1 | (leave blank) | Job discovery, applications, career tools |

## Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, Recharts, Lucide Icons
- **Backend:** Node.js, Express.js, PostgreSQL (Neon)
- **Deployment:** Vercel (serverless functions)
- **Database:** 70 tables, 28 views, 33 stored procedures, 7 triggers

