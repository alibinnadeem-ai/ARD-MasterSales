# ARD City Sales Intelligence System

Dynamic full-stack sales planning platform with exports (DOCX, PDF), KPI tracking, SMART goals, and job descriptions.

## Current Structure

```text
ARD_MasterSales/
├── app/
│   ├── page.jsx
│   └── api/
│       ├── health/
│       ├── ai-review/
│       ├── save/
│       ├── load/[id]/
│       ├── plans/
│       ├── plans/[id]/
│       └── ard-generate/
├── backend/
│   └── generators/
│       └── pdf_generator.py
├── app/components/
│   └── App.jsx
├── docs/
│   └── samples/
├── legacy/
│   └── archive/
├── lib/
│   ├── db.js
│   ├── planRepository.js
│   └── ardGenerate.cjs
├── scripts/
│   └── smoke-check.mjs
├── .env.example
├── .env
├── package.json
└── next.config.mjs
```

Step 7 cleanup complete:

- Legacy root artifacts moved to [legacy/archive](legacy/archive)
	- [legacy/archive/docker-compose.legacy.yml](legacy/archive/docker-compose.legacy.yml)
	- [legacy/archive/ardcity_full_project.tar.gz](legacy/archive/ardcity_full_project.tar.gz)

## Run Locally

### Current Status

The app now runs as a single Next.js application with native API routes.

- UI is rendered from [app/page.jsx](app/page.jsx), reusing [app/components/App.jsx](app/components/App.jsx).
- API routes are native under [app/api](app/api).
- `POST /api/ard-generate?type=docx|pdf` is native via [app/api/ard-generate/route.js](app/api/ard-generate/route.js) and [lib/ardGenerate.cjs](lib/ardGenerate.cjs).
- Persistence is database-backed via Neon/Postgres using [lib/db.js](lib/db.js) and [lib/planRepository.js](lib/planRepository.js).

Runtime requirements for PDF generation:

- `python3`
- `reportlab` (install with `pip3 install reportlab`)

### 1) Prerequisites

- Node.js 18+
- Python 3.10+
- pip package `reportlab`

### 2) Install dependencies

```bash
npm install
pip3 install reportlab
```

### 3) Configure environment

```bash
cp .env.example .env
# Set DATABASE_URL (required)
# optional: set ANTHROPIC_API_KEY in .env
```

### 4) Start dev mode

```bash
npm run dev
```

App URL: http://localhost:3000

## Build For Production (Local)

```bash
npm run build
npm run start
```

## Smoke Check

Run a full API + export smoke check (health, persistence CRUD, DOCX, PDF):

```bash
npm run check:smoke
```

By default this checks `http://localhost:3000`. To target another URL:

```bash
CHECK_BASE_URL=http://localhost:3000 npm run check:smoke
```

## API Endpoints

- GET /api/health
- POST /api/ard-generate?type=docx
- POST /api/ard-generate?type=pdf
- POST /api/save
- GET /api/load/:id
- GET /api/plans
- DELETE /api/plans/:id
- POST /api/ai-review

## Vercel Preparation Notes

The app is now Next.js-first and deployable as a single project.

Tip: `vercel.json` is no longer required for this project and can be omitted so Vercel auto-detects Next.js.

Important runtime limitation for Vercel serverless:

- PDF generation currently shells out to `python3` and requires `reportlab`.
- Vercel serverless environments may not reliably support this Python subprocess workflow.

If needed for production stability, move PDF generation to:

1. A Node-only PDF implementation, or
2. A dedicated PDF microservice/container.

## Deployment Checklist

1. Set environment variables in Vercel project settings:
	- `ANTHROPIC_API_KEY` (optional for AI features)
	- `DATABASE_URL` (required)
2. Ensure runtime supports Python execution for PDF generation.
3. Install Python dependency in deployment environment: `reportlab`.
4. Validate post-deploy endpoints:
	- `GET /api/health`
	- `POST /api/ard-generate?type=docx`
	- `POST /api/ard-generate?type=pdf`
	- `POST /api/save`, `GET /api/plans`
5. If PDF fails in serverless, switch PDF route to a dedicated service while keeping DOCX in-app.

## Environment Variables

Root (`.env`):

- NODE_ENV=development
- DATABASE_URL=postgresql://...
- ANTHROPIC_API_KEY=your_anthropic_api_key_here

Use [.env.example](.env.example) as the template.

## Troubleshooting

1. `POST /api/ard-generate?type=pdf` returns 500 with `No module named 'reportlab'`:
	Install Python dependency: `pip3 install reportlab`.
2. `POST /api/ard-generate?type=pdf` fails in serverless deployment:
	Move PDF generation to a dedicated service or switch to a Node-only PDF library.
3. `npm run check:smoke` fails to connect:
	Start app first with `npm run dev` or `npm run start`.
4. Persistence endpoints fail with database errors:
	Verify `DATABASE_URL` and network access to Neon.
