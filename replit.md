# AgriGuard - Smart Agricultural Estate Management System

## Overview

AgriGuard is a comprehensive agricultural management platform featuring:
- **Drone-based crop analysis** with AI-powered disease detection
- **Smart irrigation monitoring** with threshold-based controls
- **Wildlife deterrent systems** with distance-based auto-activation
- **Farm scheduling** for task management
- **Inventory tracking** for seeds, fertilizers, pesticides, and equipment
- **Financial management** for income and expense tracking
- **Activity logging** for system transparency

The system follows a monorepo architecture with a React frontend, Express backend, and PostgreSQL database. It supports 11 Indian languages (English, Hindi, Telugu, Kannada, Tamil, Marathi, Bengali, Gujarati, Punjabi, Malayalam, Odia) through a custom i18n system. The app is fully mobile responsive with QR code functionality for easy mobile access.

## User Preferences

Preferred communication style: Simple, everyday language.
Design philosophy: Soul Forest aesthetic - minimalist, earthy tones, sharp corners, high-contrast typography.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom agricultural-themed color palette (deep greens, earthy browns, alert orange)
- **Animations**: Framer Motion for page transitions and UI animations
- **Data Visualization**: Recharts for sensor reading charts
- **File Uploads**: react-dropzone for drag-and-drop image uploads

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth (OIDC) with session management
- **AI Integration**: OpenAI API (via Replit AI Integrations) for image analysis
- **API Design**: RESTful endpoints with Zod schema validation
- **Build System**: Vite for frontend, esbuild for backend bundling

### Authentication System
- **Provider**: Replit Auth (OIDC) supporting Google, GitHub, X, Apple, and email/password
- **Session Storage**: PostgreSQL via connect-pg-simple
- **Protected Routes**: All /api/* routes require authentication (except auth routes). For local dev, `DEV_DISABLE_AUTH=1` (dev-only) bypasses auth checks.
- **User Profile**: Displayed in sidebar with avatar, name, email, and logout button
- **Landing Page**: Professional landing page shown to unauthenticated users
- **Key Endpoints**: `/api/login` (OIDC login), `/api/logout` (logout), `/api/auth/user` (current user), `/api/callback` (OIDC callback)
- **Local Dev Note**: Session cookies are `secure` in production; in non-production they are not forced secure to allow http dev. If you are not running an HTTPS domain locally that can receive `/api/callback`, use `DEV_DISABLE_AUTH=1`.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Tables**:
  - `reports`: Drone images and AI-generated disease analysis (JSON)
  - `sensorReadings`: Irrigation sensor data (soil moisture, humidity, advice)
  - `audioLogs`: Wildlife deterrent calculations (distance, volume)
  - `farmTasks`: Farm scheduling with priority and status tracking
  - `inventoryItems`: Resource tracking (seeds, fertilizers, pesticides, equipment)
  - `transactions`: Financial records (income/expense)
  - `activityLogs`: System action logging for transparency
  - `animalDetections`: Wildlife detection records with auto-deterrent trigger
  - `deterrentSettings`: Audio deterrent configuration (volume, sound type, activation distance)
  - `irrigationSettings`: Irrigation controls (threshold, manual override)
  - `farmFields`: Farm field boundaries (polygon coordinates), crop info, yield data
  - `fieldCaptures`: Drone timeline captures with images and health diagnostics per field

### Code Organization
```
├── client/           # React frontend application
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route page components
│       ├── hooks/        # Custom React hooks
│       └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API endpoint definitions
│   ├── storage.ts    # Database access layer
│   └── replit_integrations/  # AI service integrations
├── shared/           # Shared types and schemas
│   ├── schema.ts     # Drizzle database schema
│   └── routes.ts     # API route definitions with Zod
└── migrations/       # Database migrations
```

### Key Design Patterns
- **Shared Schema**: Database schemas and API types defined once in `shared/` and used by both frontend and backend
- **Type-safe API**: Zod schemas validate request/response data on both ends
- **Storage Abstraction**: `IStorage` interface allows swapping database implementations
- **Modular Integrations**: AI features organized in `replit_integrations/` for batch processing, chat, and image generation
- **Custom i18n**: Zustand-based language store with persistent storage (`client/src/lib/i18n.ts`)
- **Activity Logging**: All CRUD operations log to `activityLogs` table for auditability

### Internationalization (i18n)
- Languages: English (en), Hindi (hi), Telugu (te), Kannada (kn), Tamil (ta), Marathi (mr), Bengali (bn), Gujarati (gu), Punjabi (pa), Malayalam (ml), Odia (or) - 11 total
- Implementation: Custom Zustand store with `persist` middleware
- Usage: `const { t, setLanguage, language, formatDate, formatTime, formatNumber, formatCurrency, getLocale } = useLanguage()`
- Storage key: `agriguard-language` in localStorage
- All UI content fully translates when language is changed
- Locale-aware formatting:
  - `formatDate(date, options?)`: Formats dates using the selected language's locale (e.g., "18 जनवरी 2026" in Hindi)
  - `formatTime(date, options?)`: Formats times using the selected language's locale
  - `formatNumber(num)`: Formats numbers with locale-specific separators
  - `formatCurrency(num)`: Formats currency in INR with locale-specific formatting
  - `getLocale()`: Returns the BCP 47 locale code for the current language (e.g., 'hi-IN' for Hindi)
- Translation keys include:
  - Severity levels: `severity.safe`, `severity.none`, `severity.low`, `severity.medium`, `severity.high`, `severity.critical`
  - Status values: `status.pending`, `status.complete`, `status.failed`, `status.processing`
  - Common terms: `common.entry`, `common.success`, `common.error`, etc.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, configured via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations with `npm run db:push`

### AI Services (Replit AI Integrations)
- **OpenAI API**: Used for disease detection in drone images
  - Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
  - Model: GPT for image analysis, gpt-image-1 for image generation

### Frontend Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, forms)
- **TanStack Query**: Server state caching and synchronization
- **Recharts**: Data visualization charts
- **Framer Motion**: Animation library

### Development Tools
- **Vite**: Frontend dev server with HMR
- **TSX**: TypeScript execution for development
- **esbuild**: Production bundling for server code

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer`: Development tooling
- `connect-pg-simple`: PostgreSQL session storage support
