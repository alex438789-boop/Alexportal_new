# ALEX Career OS — Achievement Capital Full Water Project

This is a full Next.js + Tailwind project for the Achievement Capital MVP.

## Includes

- Complete Next.js project structure
- Achievement Capital page at `/achievement-capital`
- Home route `/` redirects to `/achievement-capital`
- Sidebar
- Achievement card carousel
- Full-card water-level overlay based on progress
- Animated SVG wave surface
- Translucent glass content panel for readability
- Manual edit modal with field-by-field editing
- AI dropdown placeholder
- Overview / Evidence / Capital Timeline tabs
- Seed cards:
  - Kinmen Dissertation
  - YardenPORTAL Prototype
  - CBAM Investment Research

## Local run

```bash
npm install --no-package-lock --legacy-peer-deps
npm run dev
```

Open:

```bash
http://localhost:3000/achievement-capital
```

## Vercel settings

- Framework Preset: Next.js
- Root Directory: `./` or blank
- Install Command: `npm install --no-package-lock --legacy-peer-deps`
- Build Command: `npm run build`
- Output Directory: leave blank

Do not set Output Directory to `public`.
