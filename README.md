# ALEX Career OS — Achievement Capital MVP

This is a complete Next.js + Tailwind CSS MVP project for the **Achievement Capital** module.

## What it includes

- `/achievement-capital` route
- White-background UI
- Left sidebar
- Central Achievement Card carousel
- Full-card water-level progress background
- Manual field-by-field editing modal
- AI action dropdown placeholder
- Overview / Evidence / Capital Timeline tabs
- Reset placeholder modal
- Seed cards:
  - Kinmen Dissertation
  - YardenPORTAL Prototype
  - CBAM Investment Research

## Local setup

```bash
npm install
npm run dev
```

Open:

```bash
http://localhost:3000/achievement-capital
```

The root route `/` redirects to `/achievement-capital`.

## Vercel deployment

1. Upload/push the full project folder to GitHub.
2. Import the GitHub repo in Vercel.
3. Framework preset should auto-detect as Next.js.
4. Deploy.
5. Open either:
   - `/`
   - `/achievement-capital`

## Notes

This is mock-data only. Supabase and AI generation are not connected yet.

## Vercel note
This clean package intentionally does not include `package-lock.json` because generated lockfiles can contain environment-specific registry URLs. Vercel will install from the public npm registry using `.npmrc`.

If Vercel still fails at `npm install`, set the Vercel project setting **Install Command** to:

```bash
npm install --no-package-lock
```

Then redeploy.
