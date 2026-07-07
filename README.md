# Achievement Card Water Overlay Patch

Copy these files into your existing Next.js project:

- `components/achievement-capital/AchievementCard.tsx` replaces your current component.
- Copy the contents of `app/globals-additions.css` into the bottom of your existing `app/globals.css`.

This patch changes the water effect from a thin wave strip to a full-card submerged water fill. The fill height follows `card.progress`, while the content sits on a translucent gray-white glass panel for readability.
