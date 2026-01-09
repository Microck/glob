# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-08
**Stack:** Vite + React + TypeScript + Express

## OVERVIEW

GLB/gltf 3D model optimizer with React frontend and Express API. Uses @gltf-transform for mesh decimation, Draco compression, and Meshopt optimization. Supports bulk processing and storage quotas for premium users.

## STRUCTURE

```
glob/
├── src/                  # Vite React frontend
│   ├── components/ui/    # shadcn/ui components (50 files)
│   ├── components/       # App-specific components
│   ├── hooks/            # React hooks
│   ├── lib/              # Utilities
│   └── pages/            # Route pages
├── api/                  # Express API
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── services/     # GLTF-Transform logic
│       └── server.ts     # Entry point
└── dist/                 # Build output
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| UI components | `src/components/ui/` |
| React logic | `src/components/`, `src/hooks/` |
| API endpoints | `api/src/controllers/` |
| 3D optimization | `api/src/services/` |
| Frontend routing | `src/pages/`, `src/lib/` |

## CONVENTIONS

- **No strict TypeScript**: `noImplicitAny: false`, `strictNullChecks: false`
- **Path alias**: `@/*` → `./src/*`
- **UI library**: shadcn/ui with Radix UI primitives
- **API PORT**: 3001 (default)

## ANTI-PATTERNS

No explicit anti-patterns documented in codebase.

## COMMANDS

```bash
npm run dev              # Frontend (Vite)
npm run api:dev          # Backend (tsx watch)
npm run build            # Production build
npm run lint             # ESLint
```

## NOTES

- Backend registers Meshopt + Draco extensions with NodeIO in `api/src/services/gltfService.ts`
- `POST /api/optimize` accepts multipart/form-data with GLB/gltf files
- **Bulk**: Queue up to 10 files, sequential processing, ZIP download.
- **Quota**: 1GB total storage for Globber tier.

