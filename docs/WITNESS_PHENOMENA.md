# Witness phenomena — implementation record

This is an internal design and verification record. None of these rules, timings, or explanations are displayed to players. The witnesses need consequences, not useful powers, progress gates, or an ability tutorial.

## Accepted requirements

- [x] Each of the twelve has original audio, a visible response, and a change to actual interaction or world behavior.
- [x] The three channels have separate clocks. Most start at different times; sustained responses can overlap.
- [x] Some world responses wait for a second action after the first sensation: move, stop, look away, or put distance between bodies.
- [x] Shared flags do not exhaust the new responses. Verification starts with every common opening/growth flag already true.
- [x] Changes can reach the interface, a puzzle's logic, and the identity of the cat.
- [x] Preserve absence, throne claims, automatic attention, optional puzzles, saved progress, and a single volume control.
- [x] Expiring changes must not strand a body inside returning stone or beneath a low tread.
- [x] No new player-facing explanations, timers, objectives, or ability buttons.

## Authored encounters

Times are offsets from the encounter beginning, after its initial qualification. A world gate can defer the action much longer. The sound, visual, and physical behavior need not identify themselves as one event.

| Witness / initial qualification | Sound | Visual | World / interaction |
| --- | --- | --- | --- |
| Peter / linger at a nearby threshold | Stone bell at 0s | Outlined door halos at 0.7s | At 1.7s, once still, capture this room's door destinations for 18s. This can preserve a crypt exit against later throne changes, even after Thomas has stabilized the nave. |
| Andrew / remain in the water chamber for 0.4s | Backward bowed current at 1.6s | Seven cat copies and pale water rings at 0.2s | After 3s, when moving, a current carries the body. Lingering on a copy transfers the player to another copy's position. The copies are attention targets, not just props. |
| James, Zebedee / six seconds without walking | Thunder immediately | Hanging light filaments and a violet cast at 1.2s | At 2.4s, while still, an impulse lifts the body and gravity weakens for 10s. Already-open ceilings do not suppress this. |
| John / approach the garden watcher | Closed-mouth choir at 3.2s | Eyes and pupils close together immediately; the image edges darken | After 1.4s, looking away lends 12s during which bodily contact cannot take the player below. When it ends, the watcher can claim a body still inside it. |
| Philip / linger at a threshold | Three disagreeing glass notes at 0.15s | Split prism outlines and a color interference at 0.8s | After 1.8s, look away: the main exits cycle and remembered menu headings/actions shift English → French → Portuguese → English. The language change persists in the save; the route permutation lasts 14s. |
| Bartholomew / linger on stone or a threshold | Dry separation of paper and stone immediately | Columns become ghost wireframes at 0.6s | After 2.3s, move: columns lose collision for 12s. A returning column gently expels a body still inside it. |
| Matthew / 0.6s in the water chamber | Small, uneven coin strikes at 0.4s | Water is transferred to the ceiling and a gold balance appears at 1.7s | The body owes weight immediately: walking covers 48% of its ordinary distance. Opening the unsolved water table borrows a ledger with two identical immutable names in a row. It cannot be solved until this temporary layer expires. Canonical puzzle progress is untouched. |
| Thomas / linger on stone, or on a stair threshold | Two knocks immediately | An outlined blue stone appears at 1.3s | At 0.7s, while still, a real 4×4 supporting ledge forms ahead of the body. It can hold someone over a stair edge. It lasts 18s. |
| James, Alphaeus / 0.7s in the nave, or looking down | Descending pipe at 2.8s | The field of view and low arch widen at 0.8s | After 1.6s, move: the body becomes 0.68m tall with narrower clearance. It can pass beneath lower stairs. Growth waits until there is physical room. |
| Jude / 0.7s beside a witness after an absence | Wet friction at 0.1s | A green root half-circle grows at 1.4s | After 3s, while still, that half-circle obstructs actual walking. Its rear remains open. A body caught in its delayed growth can move outward. |
| Simon / three seconds still in the crypt | Centerless gong at 4s | Thirteen brass fragments orbit the absent seat at 2.2s | Immediately, doors lead to the most recently abandoned companion in another room, or the garden when none exists. The connection lasts 16s. Throne claimants retain their seats. |
| Judas / leave him behind | Ascending silver falls at 0.4s | Silver footprints and a divided image at 1.8s | After 4s, once more than 4m away (or in another room), the next exit leads to his actual waiting position, facing back the way the player came. Crossing consumes that response. |

The older permanent world memories still exist. Ordinary contemplation can still divide water or open passages. No witness or puzzle is mandatory.

## Architecture and precedence

`witnesses.ts` owns encounter qualification, independent phase clocks, action gates, finite lifetimes, and world changes. A nearby witness waiting in the same room can participate; a distant waiting witness cannot exert ordinary local presence. Judas's absence is intentionally different. No DOM or Web Audio objects live in the simulation.

`witness-audio.ts` produces deterministic stereo PCM and routes it through the existing effects master gain. `witness-visuals.ts` reads visual clocks independently of physical clocks, using geometry and a restrained gradient/interference shader. `space.ts` resolves actual clearance, supporting ledges, returning stone, and delayed growth. `main.ts` applies the remembered menu language when the menu opens. `puzzle-phenomena.ts` creates disposable puzzle layers; `PuzzleUI` never saves the contradictory board over the original.

Threshold precedence is Peter's captured addresses → Judas's bodily return → Simon's absent company → Philip's permutation → ordinary room topology. This makes overlapping witnesses deterministic. It does not promise that every selected witness wins every simultaneous conflict.

An episode latches until its qualifying condition stops, with an additional cooldown. Continuous staring cannot spam sounds. Pending local phases cancel on departure or loss of their local source; already-realized responses have finite lifetimes in their source room. Transient clocks and borrowed tables are cleared on reload. Persistent world memories, waiting locations, puzzle progress, and the remembered menu language survive. Restore recovers safe bodily clearance.

## Verification receipt

- Strict TypeScript compilation passes.
- 57 automated checks currently pass, including one perceptible behavior assertion per witness, channel order, second-action gates, all shared flags already set, finite stereo synthesis, clearance on expiry and reload, ordinary room behavior, saved-state recovery, and all 220 three-person selections through looking, moving, and looking away.
- Local browser inspector loads the production renderer, simulation, sound, and puzzle UI. All twelve presets render without script or WebGL errors. The inspector is excluded from `dist` and the deployment archive.
- Browser observations: seven cat copies around water; refracted door outlines; the French menu actions; the water table's first row with two fixed ALEPH cells; the instruction-free departure control. The contradiction then clears back to the canonical DALETH clue.
- Automated audio checks establish finite, distinct, bounded signals and deterministic synthesis. They do not substitute for subjective headphone listening or physical mobile-device testing.
- Published as version 9 from source `0800796c8e8b11290853180eb74a8d7645fef308`; saved version `appgprj_6ae8ef5a5b408191a788e3fc3596804b~appgver_f1351000f9b08191b38c6828a80c4cac`; deployment `appgdep_6ae97653367c8191ab9c8da913390858` succeeded. The public entry was loaded with no console errors. This receipt was added after publication and changes documentation only.
