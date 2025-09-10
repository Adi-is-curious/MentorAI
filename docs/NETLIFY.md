# Netlify Serverless Functions (MentorAI)

This app uses Netlify Functions for all API endpoints.

## Endpoints
- POST /api/ai/analyze → .netlify/functions/analyze
- POST /api/quiz → .netlify/functions/quiz-save
- GET  /api/quiz/latest → .netlify/functions/quiz-latest

## Environment variables
Set in Netlify → Site settings → Environment variables:
- DATABASE_URL → Neon Postgres connection string

## Local development
- Install Netlify CLI: npm i -g netlify-cli
- Run: netlify dev
  - Functions path: netlify/functions
  - SPA served from dist/spa after `npm run build:client` (or rely on Vite dev for local)

## Notes
- Functions are stateless and async; state persists only in Neon DB
- Inputs are validated/sanitized via Zod before processing
- `pg` is marked external in netlify.toml
- Redirects map /api/* routes to dedicated functions; a catch‑all Express function remains for dev
