# Cathedral architecture

The bounded-delta simulation in `src/world.ts` owns player location, topology, persistent memory, company, and phenomenon state. `main.ts` converts input to walk/tick/separate/select commands. Rendering reads state; it does not decide transitions. Audio follows world state and emitted events. Content is separate from implementation notes.

`phenomena.ts` defines seven simultaneous thematic families. Each has a condition, state mutation, one-time memory key, and a player-facing line. Their source-book lists are internal coverage metadata. The selected canon is the 66-book Protestant collection used by the earlier build. Catholic and Orthodox deuterocanonical material is not yet covered. This is a thematic interpretation, not a literal reproduction of every biblical event.

## Spaces and connections

Five configurations reuse a continuous cathedral volume: nave, stair, garden, water, crypt. Front and transept openings are walk-through thresholds. The stair front returns to itself and advances memory; its left exit unwinds memory. Nave side destinations exchange after ascents unless anchored or stabilized. Garden front follows the angel's selected reality. Crypt front changes when the throne loses authority. A low cat passage links to the crypt or, in Judas's absence, water.

Transforms are staged behind a brief dark threshold blink. This is authored non-Euclidean topology, not recursive portal rendering. The player never needs to complete a sequence. The entrance recovery control preserves memory.

## Rule contracts and precedence

Tick order: time, support and attention → phased witness encounters → clearance recovery → cat and angel → currents and cat links → thematic phenomena. Geometry consults the resulting state. Ordinary thematic disclosures retain their `seen` keys. Witness encounters use independent phase clocks, action gates, episode latches, and cooldowns. Thomas's nave stabilization persists; Peter captures the addresses of a room's doors for a finite interval. Water can be crossed around its perimeter or divided through waiting without a companion.

Observation targets are geometrically determined. The broad attention cone and automatic dwell avoid requiring precise aim. Mouse capture, its automatic in-app fallback, keyboard looking, touch dragging and touch buttons remain supported. R toggles continuous walking.

## Saves

Local key `testament-cathedral-v2`, version 2, distinct from the earlier seal checkpoint. Save every four active seconds, on menus, and pagehide. Validate known place, finite numeric fields, legal companions and bounded position on restore. Unsupported or malformed saves begin safely at the entrance. Storage denial retains an in-memory session and displays a notice. No remote accounts or telemetry.

## Build and inspection

Use Node 24 and pnpm 11: `pnpm install`, `pnpm build`, `pnpm test`, `pnpm dev`. TypeScript compilation is strict. Three.js and the original synthesis code are local vendor modules with permissive declarations at those two boundaries.

`node scripts/inspect.mjs [save.json]` prints simulation state and threshold destinations. It is a private CLI inspector, excluded from static publication. No debug controls are exposed in the game.

## Verification boundaries

Simulation tests exercise collision, attention, cat sequencing, angel topology, all twelve rules, all 220 three-member parties, save recovery, deterministic state and thematic coverage. Combination enumeration verifies finite state and valid exits; it does not establish subjective balance or every emergent experience. Browser checks cover rendering, controls, menu, accessible attention, transitions, and errors. Physical touch-device performance and subjective listening require separate human validation.

## Defect-batch additions

`space.ts` now owns tread dimensions, supporting surfaces, clearance and reachable gaze projection. Simulation owns vertical position/velocity; rendering reads them. `attention.ts` tracks one physical target per dwell episode, with a 20% audio event and explicit interruption. Saved wait spots include room, foot position and optional throne claim/solitude. `roots.ts` builds column-rooted branching curves. `resonance.ts` synthesizes the early cue and deeper contact response. Additive version-2 save validation migrates older records to supported surfaces and safe waiting positions.

A throne claimant needs 45 seconds away from the player, scaled by the number of waiting occupants. Returning before readiness resets solitude. Active puzzle time counts as absence when the player is in another room; the pause menu does not. A claimed seat remains rendered until its occupant is recalled.

Angel contact has a 14-second cooldown, a nine-second presentation phase, a persistent scar and a new left-hand garden connection to the crypt. Physical movement remains recoverable during the visual descent.

## Independent witness channels

`witnesses.ts` owns pure encounter state. Audio, visual and world phases have different start times; some world phases require movement, stillness, looking away, or physical distance. `witness-audio.ts` synthesizes twelve original stereo responses into the existing effects master gain. `witness-visuals.ts` consumes visual clocks independently and builds local geometry plus a low-opacity interference shader. Physical manifestations alter support, gravity, collision, stride, contact and transport, rather than merely duplicating permanent flags.

`languages.ts` holds the remembered menu's English, French and Portuguese variants. The `tongue` index is validated and saved. `puzzle-phenomena.ts` creates a disposable contradictory water ledger: the real board is never overwritten. That layer expires during puzzle interaction; the ordinary table remains solvable. Seven copied cats are actual gaze targets linked to other cat positions.

Route precedence is captured Peter addresses, Judas's abandoned body, Simon's absent company, Philip's permutation, then the ordinary topology. Existing flags retain their thematic meaning but cannot suppress the new encounters. A local waiting companion can participate within seven metres; distant waiting companions do not provide normal local presence. Judas intentionally acts through absence.

Transient manifestations are cleared on restore. Clearance recovery moves a body out of returning stone and preserves small stature until there is enough room to grow. Pending local responses cancel when their room or source is lost. See `WITNESS_PHENOMENA.md` for the authored trigger matrix and verification receipt.
