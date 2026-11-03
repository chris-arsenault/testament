# Cathedral architecture

The bounded-delta simulation in `src/world.ts` owns player location, topology, persistent memory, company, and phenomenon state. `main.ts` converts input to walk/tick/separate/select commands. Rendering reads state; it does not decide transitions. Audio follows world state and emitted events. Content is separate from implementation notes.

`phenomena.ts` defines seven simultaneous thematic families. Each has a condition, state mutation, one-time memory key, and a player-facing line. Their source-book lists are internal coverage metadata. The selected canon is the 66-book Protestant collection used by the earlier build. Catholic and Orthodox deuterocanonical material is not yet covered. This is a thematic interpretation, not a literal reproduction of every biblical event.

## Spaces and connections

Five configurations reuse a continuous cathedral volume: nave, stair, garden, water, crypt. Front and transept openings are walk-through thresholds. The stair front returns to itself and advances memory; its left exit unwinds memory. Nave side destinations exchange after ascents unless anchored or stabilized. Garden front follows the angel's selected reality. Crypt front changes when the throne loses authority. A low cat passage links to the crypt or, in Judas's absence, water.

Transforms are staged behind a brief dark threshold blink. This is authored non-Euclidean topology, not recursive portal rendering. The player never needs to complete a sequence. The entrance recovery control preserves memory.

## Rule contracts and precedence

Tick order: time and attention → companion rules → cat → angel → persistent garden → thematic phenomena. Geometry consults the resulting state. A rule's `seen` key limits its initial disclosure; consequences persist. The angel can change reality repeatedly with an eight-second cooldown. Thomas stabilization persists; Peter anchoring is proximity-dependent. Open connections always retain an escape to the nave; water can be crossed around its perimeter or divided through waiting without a companion.

Observation targets are geometrically determined. The broad attention cone and automatic-attention setting avoid requiring precise aim. Controls accept keyboard, pointer dragging, and touch buttons. R toggles continuous walking.

## Saves

Local key `testament-cathedral-v2`, version 2, distinct from the earlier seal checkpoint. Save every four active seconds, on menus, and pagehide. Validate known place, finite numeric fields, legal companions and bounded position on restore. Unsupported or malformed saves begin safely at the entrance. Storage denial retains an in-memory session and displays a notice. No remote accounts or telemetry.

## Build and inspection

Use Node 24 and pnpm 11: `pnpm install`, `pnpm build`, `pnpm test`, `pnpm dev`. TypeScript compilation is strict. Three.js and the original synthesis code are local vendor modules with permissive declarations at those two boundaries.

`node scripts/inspect.mjs [save.json]` prints simulation state and threshold destinations. It is a private CLI inspector, excluded from static publication. No debug controls are exposed in the game.

## Verification boundaries

Simulation tests exercise collision, attention, cat sequencing, angel topology, all twelve rules, all 220 three-member parties, save recovery, deterministic state and thematic coverage. Combination enumeration verifies finite state and valid exits; it does not establish subjective balance or every emergent experience. Browser checks cover rendering, controls, menu, accessible attention, transitions, and errors. Physical touch-device performance and subjective listening require separate human validation.
