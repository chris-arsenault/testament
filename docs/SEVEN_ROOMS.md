# Seven rooms and resident witnesses

Implemented November 2, 2026 (America/Phoenix). This is an evolution of the continuous cathedral, with no mission list or required room order.

## Room inventory

| Space | Footprint and architecture | Floor | Resident homes | Thematic family |
|---|---|---|---|---|
| Nave | 26 × 36 m long hall, clustered piers, lancets, pointed vault ribs | Large stone checks | Peter | Exile / historical books |
| Stair | Narrow clipped shaft, 26 m high, climbing and suspended stairs | Herringbone inlay and real treads | James, son of Alphaeus | Lament / wisdom books |
| Garden | 32 m circular ruined enclosure, broken walls and open sky | Continuous grassy hills with physical support | John, Jude | Table / Gospels |
| Cistern | 36 m wide octagon, low coffered ceiling and banded teal walls | Small patterned tiles, water and crossing | Andrew, Matthew | Division / Torah |
| Burial hall | Compact clipped hall, low ribs, recesses and throne | Purple diamond inlay | Judas, Simon | Bones / prophets |
| Scriptorium | Hexagon, stacked shelves, suspended gallery rails | Brass rings and radial inlay | Philip, Bartholomew | Letters / Acts and epistles |
| Choir | 22 m circular chamber, high fluted walls and suspended organ pipes | Pale radial paving | James, son of Zebedee; Thomas | Renewal / Revelation |

The existing internal thematic map still covers all 66 books once. Room themes reference those families; they do not turn them into sequential chapters. The new rooms have their own arrival cards, narrator selections and score states. The scriptorium adds rotating glyph lines; the choir adds coupled rings. Each has an authored distorted verse/political reward and the existing escalating rustling whispers.

## Behavior contracts

- Every witness has one home, marked by a floor seal and small lamp. Unselected witnesses appear there. Selected witnesses who are sent away return there; recalling them restores following. Swapping releases the previous companion to their home.
- Ordering a companion away in the burial hall retains the established throne claim. A throne occupant cannot be swapped out, including after the solitude threshold, until recalled. Refusal and genuine-absence timing remain intact.
- Clicking a nearby witness opens identity, augmentation and an authored line, with eligible replacement choices. The chosen party slot is retained. Throne choices are visibly disabled. There is no menu roster.
- Left mouse click examines a targeted table, witness or angel. Touch taps use the tapped ray; dragging still looks. Number keys 1–3 remain companion orders. E has no action. Gaze phenomena remain automatic.
- The pause menu retains one volume slider, return, entrance recovery, reset and credits.
- Existing version-2 world saves migrate ordinary wait positions to homes while retaining valid throne claims. New rooms and party changes persist. Existing table saves load independently; new tables begin unsolved.

## Architecture

`rooms.ts` owns polygons, floor functions, doorway positions, spawn points, tables, palettes and homes. Movement, support, scenery, gaze targets and table proximity consume the same layout. `room-scenery.ts` lazily builds and caches each room and hides the previous room. Mesh batching and shared witness geometry limit draw calls. Garden vertices and body support use the same analytic height field. Column collision heights match their scaled models.

`world.ts` owns recruitment, party membership, protected throne claims, routes and save migration. `EncounterUI` renders those rules without duplicating them in the menu. `Cathedral.interaction` checks the camera/touch ray, distance and relevant occlusion. UI and pointer-lock suspension share one path so a modal cannot leave movement running.

## Verification

- Strict TypeScript compilation and 76 automated checks pass.
- Tests cover all seven reachable rooms, every doorway and spawn, twelve valid home positions, terrain/mesh agreement, home orders and migration, protected swaps and slot preservation, new puzzle solvability and corrupt-save rejection, cached finite geometry, E removal and the absence of menu recruitment. Existing 220 party-combination and twelve phenomenon checks also pass.
- Local browser inspection covered all seven room renderers, actual left-click opening of Philip, disabled throne replacement, successful replacement, pause menu removal of the roster, and complete solutions of both new puzzles through visible controls.
- The encounter fits a 390 × 844 viewport without clipping. Normal viewport was restored. Browser logs showed no runtime errors during review.
- Visual review corrected overlapping burial-hall diamonds and moved the stair table away from a pier. Ordinary home orders supersede the earlier gaze-placement requirement D-005.

The local `/__rooms` review fixture uses production input, UI and renderer code with private room-position buttons and separate save keys. It is excluded from the static publication. Exhaustive human traversal of every dynamic route/phenomenon combination was not performed; the route and combination checks above are automated. Device-specific GPU performance is not certified.
