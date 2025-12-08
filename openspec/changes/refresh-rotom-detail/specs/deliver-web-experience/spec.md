## MODIFIED Requirements
### Requirement: Pokémon detail drawer
Selecting a match SHALL render the detail view inside the Rotom landscape frame and lay out content in three regions: left column (description, vitals, abilities), center (name, type chips, primary artwork), and right column (base stats). The view MUST remain dismissible and retain inline error handling for failed detail fetches, and it MUST stay usable on narrower screens by stacking while keeping the Rotom visual theme.

#### Scenario: Detail view uses Rotom landscape layout
- **WHEN** a user opens a match detail from results
- **THEN** the detail renders within the Rotom bezel in landscape orientation with left/center/right regions as specified and remains dismissible

#### Scenario: Narrow viewport remains usable
- **WHEN** the viewport shrinks below desktop width
- **THEN** the layout stacks or reflows while preserving the Rotom theme and keeping description, portrait, and stats accessible
