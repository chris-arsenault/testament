# Playability polish — November 3, 2026

The review preserves the cathedral's unexplained consequences while repairing accidental failures. Three parallel reviews covered spatial geometry, input/feedback, and puzzle mechanisms. The parent integration owns shared movement, rendering, browser verification, and publication.

## Findings and implemented corrections

| Finding | Correction | Evidence |
| --- | --- | --- |
| The pool became invisible pavement when its bridge appeared. | Only the visible two-metre bridge supports traversal, at its actual .325-metre deck height. Planks meet without gaps. | Bridge physics checks and browser traversal. |
| Tables, throne parts and ruin piers lacked physical bodies. | Shared dimensions drive collision, supported tops and line-of-sight obstruction. Old saves inside solids recover nearby. | Geometry tests across all seven rooms. |
| Door surrounds exposed sky slits against polygon walls. | Arch spandrels and boundary-matched masonry returns close the seams. | Ray tests and archive doorway browser inspection. |
| Companions orbited when the player turned their head and passed through props. | Formation follows travel heading. Shared supported movement, gravity and bounded detours guide companions and the cat around solids. | Actor movement tests and rendered review. |
| Reusing the throne could assign two disciples the same place. | Seat allocation searches for an unoccupied position. | Recall/reclaim regression. |
| Touch dragging, capture and modal exits could leave input in the wrong state. | Single-pointer ownership, client-coordinate deltas, gesture-safe capture and explicit modal/pause transitions. | Input tests; browser Escape → pause → RETURN. |
| Orders and puzzle actions felt unacknowledged. | Short named companion responses, reticle changes, distinct sounds, moving/illuminated puzzle pieces and undo. | Audio routing/lifecycle checks and browser actions. |
| Caption bursts overwrote each other or leaked into another room. | Bounded readable queue, durable sound captions, and arrival-time clearing before new events. | Queue checks and browser room transitions. |
| First-time room music generation blocked rendering. | A module worker synthesizes PCM; the previous score continues until the current room's buffer is ready. Stale replies are cached. | Separate-thread synthesis, ordering/failure tests, packaged worker check. |
| Most tables were independent clicks with little inference. | Replaced all seven boards with larger or coupled mechanisms described below. | Independent solvers, migration tests and browser review. |

## The seven tables

| Room | Mechanism | Verified property |
| --- | --- | --- |
| Nave | Sixteen rotating conduits; light travels through joined channels. | Legal solution; broken connections visibly interrupt light. |
| Stair | Fifteen sliding stones and one vacancy. | Thirty-move shortest solution from the initial arrangement. |
| Garden | Sixteen engraving fragments exchanged with adjacent pieces. | Legal solution; distant fragments cannot be swapped directly. |
| Water | Six-by-six glyph sudoku with two-by-three boxes. | Eleven fixed clues; exactly one ordinary completion. |
| Crypt | Sixteen lamps with coupled cross toggles. | Seven-press minimum solution. |
| Archive | Rows and columns move a shared glyph lattice over faint imprints. | Reachable solution requiring both axes. |
| Choir | Eight chimes; each strike alters three offsets. | All arrangements remain recoverable through the coupled mechanism. |

Instructions remain absent from the tables. Clues are embedded in the pieces, borders, light, imprints and sound. Puzzles still have no progression requirement or timer. Matthew's temporary contradictory ledger remains intentional and cannot corrupt the real board. Revision 2 carries elapsed/whisper history forward and preserves genuinely completed older boards.

## Architecture

- `rooms.ts` owns physical layout dimensions; `space.ts` owns support, obstruction and sightlines.
- `actor-motion.ts` owns travel-based formation and bounded actor navigation. Rendering consumes these rules without adding new world progression.
- `puzzles.ts` owns pure board rules and migration; `puzzle-ui.ts` owns presentation/history; `puzzle-audio.ts` owns bounded transient voices.
- `look.ts` owns pointer gestures. `interaction-feedback.ts` separates immediate acknowledgments from queued narrative captions.
- `score-worker.js` transfers generated stereo buffers to `Score`; audio context creation remains behind the entry gesture and all sound uses the existing volume control.

## Verification boundaries

All seven table layouts and representative legal, blocked and undo actions were reviewed in the browser. The crypt and archive were completed through their visible controls. Water, garden, archive and choir were also reviewed at 390×844. Geometry review covered the archive side doorway, visible water deck and room table approaches. Automated solvers cover every full puzzle completion; this is not a claim that every puzzle was manually solved in the browser.

Physical touch hardware and subjective headphone listening are not verified. Narrow-screen inspection establishes layout, not low-end phone performance. Navigation is bounded local pathfinding, not an unrestricted navigation mesh. Procedural geometry, authored impossible thresholds and deliberately unexplained supernatural behavior remain artistic constraints.

Final compilation, test totals and publication identifiers are recorded in `RELEASE.md`.
