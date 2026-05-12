# Nightwalker RPG Web

Mobile-first AI horror text RPG.

## Core Direction

This project is a mobile web RPG, not a normal linear novel.

- Story is played through choices and free actions
- Every scene starts with RPG status UI
- Every choice has cost and risk
- Long-term world memory is stored outside the prompt
- Google Sheet is used as an admin/data panel
- Poe API can be used by the backend for AI-generated free actions

## Tech Stack

- Next.js
- React
- TypeScript
- Mobile-first CSS
- API routes for game engine and future Poe integration

## Development

```bash
npm install
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Environment Variables

Create `.env.local` when backend AI/sync is ready:

```bash
POE_API_KEY=
GOOGLE_SHEET_ID=1GrOhffjSQ-PH_I86UIlSrAunqY8EFrLUUJUeTS_41x8
GOOGLE_SERVICE_ACCOUNT_JSON=
```

Do not commit secrets.
