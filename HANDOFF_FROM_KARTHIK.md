# AgriGuard - Smart Agricultural Estate Management

AI-powered crop analysis, automated wildlife protection, and intelligent irrigation for Indian farmers.

## Setup

### 1. Pull the latest code

```bash
git pull origin main
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Set these in Replit Secrets (Tools > Secrets) or in a `.env` file:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Replit provides this automatically if you add a Postgres database) |
| `SESSION_SECRET` | Yes | Express session secret (required for auth + sessions) |
| `REPL_ID` | Replit only | Replit OIDC client id (required for Replit Auth login flow) |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Yes | OpenAI API key — needed for crop image analysis AND the AI assistant chat |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | No | Only needed if using a proxy. For direct OpenAI, set to `https://api.openai.com/v1` or leave unset |
| `DEV_DISABLE_AUTH` | No | Local dev bypass. Set to `1` to disable auth checks when `NODE_ENV != production` |
| `VITE_GOOGLE_MAPS_API_KEY` | No | Enables Google Maps field polygon view (Field Summary page). App shows a friendly fallback if unset. |

### 4. Database setup

```bash
npm run db:push
```

### 5. Start the app

```bash
npm run dev
```

The app runs on port 5000 by default.

Local dev (skip auth):

```bash
DEV_DISABLE_AUTH=1 npm run dev
```

## Features

- **Drone Analysis** — upload or capture crop images, AI analyzes for diseases, pests, and wildlife. Export reports as PDF or text.
- **Irrigation** — manual readings or hardware sensor reads, threshold-based alerts, settings (active toggle, moisture slider, manual override).
- **Audio Deterrent** — enable the system, simulate camera detections, auto-deterrent triggers based on distance, optional browser sound output via Web Audio.
- **AI Assistant** — chat with an agricultural AI in any of the 11 supported languages.
- **Hardware** — discover/add sensor devices, test connections, read sensors (feeds into irrigation), capture images (feeds into analysis).
- **Farm Management** — task scheduling, inventory tracking, financial records.
- **Activity Logs** — all system actions are logged and filterable by category.

## Supported Languages

English, Hindi, Telugu, Kannada, Tamil, Marathi, Bengali, Gujarati, Punjabi, Malayalam, Odia — switch via the language selector in the sidebar.

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| AI Assistant shows "AI request failed" | Missing or invalid OpenAI API key | Set `AI_INTEGRATIONS_OPENAI_API_KEY` in secrets. The key needs access to `gpt-4o`. |
| Image analysis fails | Same API key issue | See above. Large images are auto-compressed client-side to stay under the 50MB server limit. |
| Auth issues running locally | Replit OIDC callback uses HTTPS + sessions | Easiest: set `DEV_DISABLE_AUTH=1` and run `npm run dev`. For real auth locally, you need an HTTPS domain that can receive `/api/callback` (e.g. via a tunnel) and proper Replit OIDC config. |

## Architecture

```
├── client/               # React frontend (Vite)
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route page components
│       ├── hooks/        # Custom React hooks (use-agri.ts)
│       └── lib/          # Utilities, i18n, query client
├── server/               # Express backend
│   ├── routes.ts         # API endpoint definitions
│   ├── storage.ts        # Database access layer (Drizzle ORM)
│   └── replit_integrations/  # Auth and batch processing
├── shared/               # Shared types and schemas
│   ├── schema.ts         # Drizzle database schema + Zod validators
│   └── routes.ts         # API route definitions
└── migrations/           # Database migrations
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- **Backend**: Express.js, Drizzle ORM, PostgreSQL, Zod validation
- **AI**: OpenAI GPT-4o for image analysis and chat
- **Auth**: Replit Auth (OIDC)
- **Build**: Vite (frontend), esbuild (backend)
