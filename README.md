# Achievement Card full-cover water patch

Copy these files into your project and overwrite existing files:

- `components/achievement-capital/AchievementCard.tsx`
- `app/globals.css`

This patch changes the water from a thin wave strip into a full-card fill layer:

- The card is filled from bottom to the `progress` percentage.
- The water surface is animated with two SVG wave layers.
- The content block uses a translucent gray-white glass panel for readability.

After replacing files, redeploy to Vercel and hard refresh the page.
