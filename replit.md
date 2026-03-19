# PartyNest

## Overview

PartyNest è una piattaforma digitale italiana per trovare e prenotare location per feste di bambini — come AirBnB per le feste dei bambini. Permette ai genitori di cercare, confrontare e prenotare venue online, e ai fornitori di gestire la loro attività tramite un CRM integrato.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/partynest) — Tailwind, shadcn/ui, react-query, react-hook-form, react-leaflet, framer-motion, recharts
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Passport.js (Local Strategy) + session-based, Google OAuth ready
- **Email**: Resend (lazy init, graceful fallback when API key not set)
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Map**: Leaflet + OpenStreetMap

## Architecture

```text
artifacts/
├── api-server/         # Express API — auth, businesses, bookings, quotes, messages, wishlist, crm
└── partynest/          # React frontend — parent portal + business CRM
lib/
├── api-spec/           # OpenAPI 3.1 spec
├── api-client-react/   # Generated React Query hooks
├── api-zod/            # Generated Zod schemas
└── db/                 # Drizzle ORM schema + DB connection
```

## Portals

### Parent Portal (/)
- Homepage con hero search
- /search — Ricerca con filtri (città, tipo, prezzo, età) + vista mappa
- /venue/:id — Scheda location dettagliata con gallery, pacchetti, calendario disponibilità, prenotazione, preventivo
- /booking/:id — "Il mio evento" — countdown, chat, stato prenotazione
- /wishlist — Location salvate
- /auth/login + /auth/register — Auth con email/pw + Google

### Business CRM (/crm/*)
- /crm/dashboard — Analytics: prenotazioni, views, preventivi, grafico mensile
- /crm/profile — Modifica profilo business
- /crm/packages — Gestione pacchetti/prezzi
- /crm/calendar — Channel manager calendario disponibilità
- /crm/bookings — Gestione prenotazioni (accetta/rifiuta)
- /crm/quotes — Richieste preventivo
- /crm/messages — Chat con i clienti
- /crm/visibility — Punti visibilità (100 punti di partenza)

## Database Schema

- `users` — Utenti (parent, business, admin)
- `businesses` — Location/strutture con coords, servizi, foto
- `packages` — Pacchetti prezzi per ogni business
- `availability` — Slot disponibilità (morning/afternoon/evening per data)
- `bookings` — Prenotazioni (stato: pending/accepted/rejected/cancelled)
- `quotes` — Richieste preventivo
- `messages` — Chat messaggi per prenotazione
- `wishlist` — Location salvate per utente

## Email Notifications

- Prenotazioni → email a fdangelo8@gmail.com (oggetto: "prenotazione")
- Preventivi → email a fdangelo8@gmail.com (oggetto: "preventivo")
- Richiede RESEND_API_KEY come variabile d'ambiente

## Environment Variables Required

- `DATABASE_URL` — Auto-provisioned by Replit
- `SESSION_SECRET` — Auto-provisioned by Replit
- `RESEND_API_KEY` — Richiesto per invio email (Resend.com, piano gratuito)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Opzionale per login Google

## API Endpoints

All routes prefixed with `/api`:
- Auth: POST /auth/register, /auth/login, /auth/logout, GET /auth/me
- Businesses: GET/POST /businesses, GET/PUT /businesses/:id, POST /businesses/:id/track-view
- Packages: GET/POST /businesses/:id/packages, PUT/DELETE /businesses/:id/packages/:packageId
- Availability: GET/POST /availability/:businessId
- Bookings: GET/POST /bookings, GET /bookings/:id, PATCH /bookings/:id
- Quotes: GET/POST /quotes
- Messages: GET/POST /messages?bookingId=...
- Wishlist: GET/POST /wishlist, DELETE /wishlist/:businessId
- CRM: GET /crm/dashboard?businessId=..., POST /crm/visibility

## Sample Data

6 location di esempio pre-caricate: Milano (x2), Roma, Firenze, Torino, Napoli.
10 pacchetti di esempio associati alle prime 5 location.

## Development Commands

```bash
# Run codegen after OpenAPI changes
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes
pnpm --filter @workspace/db run push

# Start all services
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/partynest run dev
```
