# Change: Rotate Rotom detail into landscape three-pane layout

## Why
- Current Pokémon detail overlay is portrait and diverges from the Rotom-phone shell shown on the home/results screens.
- UX asks for a landscape Rotom frame with three blocks (description/vitals/abilities; main portrait/name; stats) to keep the experience cohesive.

## What Changes
- Redesign the Pokémon detail view to render within the Rotom landscape bezel, maintaining the glowing frame aesthetic from the main shell.
- Layout splits into three panels: left (description + vitals + abilities), middle (name, types, artwork), right (stats).
- Ensure responsive behavior preserves the Rotom look on laptop widths while remaining usable on smaller screens.

## Impact
- Affected specs: deliver-web-experience
- Affected code: `frontend/src/components/PokemonDetail.tsx`, related layout styles/assets.
