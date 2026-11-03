# TESTAMENT — Defect list

Recorded: 2026-11-02

This is the durable record of the requested defect batch. D-001 through D-007 are implemented and locally verified; publication confirmation is recorded in the release log. Original observations and acceptance criteria remain below for accountability.

## Design direction for this batch

Adopt the user's Myst-inspired principle of zero instructional text. Players infer interactions and rules through composition, symbols, physical response, sound, and environmental clues. Mystery must remain legible through the object itself, without captions explaining the mechanic or its purpose.

Keep meaningful accessible names and state descriptions. They should identify the object and its current state, without adding rule explanations or solution guidance.

## D-001 — Returning garden appears as giant spikes

Status: Closed — published in version 8

Observed: the returning-garden effect fills the floor with straight, tapered green shapes. They look like scattered stakes or weapons rather than roots emerging through architecture.

Relevant implementation: `src/rendering.ts`, root geometry and growth presentation.

Required change:

- Replace straight tapered cylinders with curved, branching roots.
- Anchor roots visibly in cracks, seams, column bases, and stone surfaces.
- Make their growth read as organic intrusion into the cathedral.
- Keep them visually distinct from hazards; the current roots do not damage or block the player.

Acceptance:

- No field of disconnected, straight spears or floating root ends.
- Roots visibly emerge from and follow the architecture at both walking distance and close range.
- Growth and renewal states still control the effect, with acceptable rendering cost.

## D-002 — Tables explain their puzzles and over-explain departure

Status: Closed — published in version 8

Observed: the table interface tells players the rules, gives explicit action directions, and says they may leave. Extra headings and marginal notes also compete with the puzzle itself.

Relevant implementation: `public/index.html`, `public/cathedral.css`, `src/puzzle-ui.ts`, and `src/puzzles.ts`.

Required change:

- The unsolved table shows only the puzzle's name, the puzzle, and one centered departure button.
- Remove rule paragraphs, action instructions, rubric subtitles, explanatory marginalia, and the sentence "You may leave the table."
- Replace "STEP AWAY" with **"GO IN PEACE"** and center the button beneath the puzzle.
- Remove extra table controls such as the replay button so the departure button is the sole visible control outside the puzzle pieces.
- Let visual affordances and feedback communicate turning, sliding, exchanging, toggling, and glyph placement.
- Preserve the previously requested reward transmissions and disciple whispers as narrative events. They must not explain how to solve the puzzle or announce the absence of a practical reward.
- Keep keyboard, touch, focus, and Escape behavior functional. Accessible object/state labels remain, with instructional suffixes removed.

Acceptance:

- Each of the five unsolved tables contains its name, puzzle pieces, and a single centered "GO IN PEACE" button; no helper prose or secondary interface headings.
- Completion still presents its distorted scripture/political transmission, with the single departure button and no explanatory chrome.
- None of the tables tells the player the goal, the input sequence, the rule set, or that leaving is permitted.
- Interaction is discoverable through the object and its response. No new tutorial text is introduced to compensate for the removed instructions.
- All puzzles remain solvable and can be exited without losing saved progress.

## D-003 — Angel contact needs a chthonic response

Status: Closed — published in version 8

User direction: interacting with the angel or walking through it should feel **chthonic**. Interpret this as contact with something ancient, subterranean, and buried beneath creation.

Relevant implementation: angel perception/contact rules in `src/world.ts`, angel and spatial presentation in `src/rendering.ts`, and world audio.

Required change:

- Give close interaction and passage through the angel a distinct, tangible response beyond the existing distant gaze effect.
- Make crossing its body feel like entering a depth inside the cathedral: space may fold downward, its interior may briefly become an underworld threshold, or buried architecture may become perceptible.
- Coordinate the sensation through low resonances, stone/earth textures, displaced or muffled sound, and the behavior of the eyes.
- Leave a persistent trace in the world or its memory after contact. Define the exact consequence when implementing the batch.
- Communicate the encounter through sensation and spatial response, consistent with the zero-instruction design direction.

Acceptance:

- Deliberately interacting with the angel and walking through its occupied volume both produce an observable response.
- The response conveys subterranean depth, antiquity, and dread; the player can perceive that contact mattered.
- Repeated contact is controlled rather than retriggering every frame.
- The player retains a recoverable route and a valid saved location. Reduced-motion presentation remains functional.
- No tutorial paragraph, objective marker, or explanatory encounter text is introduced.

## D-004 — A waiting disciple claims the throne

Status: Closed — published in version 8

User direction: asking a disciple to wait in the throne room causes them to stand on the throne and refuse to leave until they have been alone too long.

Relevant implementation: companion separation/recall and saved waiting state in `src/world.ts`; companion positioning and throne geometry in `src/rendering.ts`.

Required change:

- In the throne room, the wait command sends the selected disciple onto the throne, standing visibly on it rather than at the generic waiting position.
- While enthroned, that disciple refuses recall and remains in the room when the player leaves.
- Track genuine solitude: time alone in the throne room, rather than time since the wait button was pressed. Define how other present companions affect solitude during implementation.
- After a sufficiently long solitary interval, the disciple becomes willing to leave the throne and rejoin. Tune the duration during the batch; returning too soon must not release them.
- Convey the change through behavior, pose, sound, or restrained character dialogue. Do not expose a countdown or explain the rule.
- Save the enthroned state and solitude progress. Preserve ordinary waiting behavior in other rooms.

Acceptance:

- Any selected disciple can exhibit the behavior when asked to wait in the throne room.
- Their standing position aligns with the throne surface, without hovering or sinking into its geometry.
- Early recall does not teleport them off the throne or resume following.
- Staying beside them does not count as leaving them alone.
- Leaving them alone long enough allows a later recall to succeed; the behavior cannot permanently strand a party member.
- Pause/resume and save/reload preserve the state consistently. Handle changes to the throne's visibility without leaving a character floating over an absent seat.
- The player discovers the behavior without instructional text or a visible timer.

## D-005 — Waiting positions should follow the player's gaze

Status: Closed — published in version 8

User direction: outside the throne room, disciples should wait where the player is looking, rather than at predetermined positions.

Relevant implementation: wait-command input and gaze targeting, companion waiting state in `src/world.ts`, and companion movement/placement in `src/rendering.ts`.

Required change:

- Resolve the player's viewing direction to a valid standing location when the wait command is issued.
- Send the selected disciple to that location and keep them there. Store a room-specific position for each waiting disciple instead of using fixed formation coordinates.
- The target is fixed at command time; moving the camera afterward does not move the waiting disciple.
- Respect terrain, staircase height, obstacles, and reachable supporting surfaces. If the gaze points into empty sky or an invalid surface, use a safe nearby standing location in that direction rather than the old predetermined spot.
- Preserve those positions across room changes and save/reload.
- Keep D-004 as the explicit throne-room exception: a disciple asked to wait there claims the throne.

Acceptance:

- Looking at two different valid locations produces two corresponding wait destinations.
- Waiting disciples remain at the chosen positions when the player moves, turns, leaves, and returns.
- Placement does not put feet through the floor, inside solid geometry, or over unsupported space.
- Multiple disciples can be placed independently; closely overlapping targets receive only the small spacing adjustment needed to avoid intersecting bodies.
- Ordinary recall still works outside the throne-room exception.
- No placement tutorial or explanatory text is introduced.

## D-006 — Attention should arise from lingering gaze

Status: Closed — published in version 8

User direction: remove the explicit Attend action and trigger attention when the player's gaze lingers.

Relevant implementation: observation targeting in `src/rendering.ts`, attention rules in `src/world.ts`, input/UI wiring in `src/main.ts`, and controls in `public/index.html`.

Required change:

- Sustained gaze at a valid object automatically builds attention. No held key, toggle, or separate Attend action is required.
- Remove the F binding, the touch Attend button, its toggle state, and all visible references to that control.
- Track dwell on the same physical target. Looking away or switching to a different object interrupts its buildup; attention accumulated on one object cannot be transferred to another.
- Allow small natural camera movements within the target without constantly restarting dwell.
- Preserve the authored consequences for the angel, uncertain architecture, thresholds, and crypt. Existing companion and proximity conditions still apply.
- Suspend/interrupt gaze buildup during menus, puzzles, and other interruptions to exploration.
- Signal the start of lingering attention with a low **whoomp and a downward low-pass filter sweep**, before the full gaze response activates. Target approximately **20% of the required dwell duration**, tunable within the user's suggested **10–25%** range. Give it a soft low-frequency body and a brief filtered tail.
- Play the cue once per continuous dwell episode. Continuing to look must not loop it or produce a second whoomp at full activation. Looking away can cancel the eventual response after the early cue has sounded.
- Rearm only after a genuine break in gaze; avoid rapid retriggering from minor aim jitter. Coordinate with the angel's chthonic contact sound so overlapping triggers do not stack into repeated bursts.
- Route the cue through the existing overall volume control, including full mute; add no separate audio setting.
- Keep the single overall volume slider as the only configurable setting. Add no gaze toggle, progress meter, or explanatory tutorial.

Acceptance:

- Remaining focused on a valid target causes its attention response without pressing F or tapping a button.
- A brief glance does not trigger the sustained-attention response.
- Switching between targets cannot carry a nearly completed dwell into an immediate activation.
- Looking away interrupts buildup, while minor movement over the same target remains usable.
- Mouse, touch, and keyboard camera movement all feed the same gaze behavior.
- The whoomp sounds at roughly 10–25% of the target's full dwell duration, rather than waiting for completion. It confirms that attention is beginning, without guaranteeing that the eventual response has occurred.
- Sustained gaze produces only one early cue per episode; target jitter and the final activation do not spam or duplicate it.
- No F/Attend control or instruction remains in the shipped interface.
- Timing and consequences remain consistent with D-003's new angel contact behavior and D-005's gaze-directed wait placement.

## D-007 — Stair height extends across invisible walking surfaces

Status: Closed — published in version 8

Observed: the player can step sideways off the visible staircase yet keep walking at stair height. The elevation behaves like a slope spanning the room instead of matching the visible steps.

Relevant implementation: stair geometry and camera/companion elevation in `src/rendering.ts`; player movement and support-surface rules in `src/world.ts`.

Required change:

- Restrict elevated walking support to the actual footprints of visible steps and landings.
- When the player walks off a stair edge, resolve their position down to a real supporting surface, with a controlled, nonlethal descent rather than invisible airborne walking.
- Make floor-level space beside and beneath the staircase genuinely traversable at floor height.
- Use consistent surface information for the player, companions, and D-005's gaze-directed waiting positions.
- Require the intended stair landing/elevation for recursive stair transitions, so passing below the landing does not trigger an upstairs connection.
- Preserve the impossible spatial loop while making local footing coherent with the visible architecture.

Acceptance:

- Ascending on the steps and stepping off to either side produce different, physically supported elevations.
- The player cannot walk across empty air at the elevation of an adjacent stair tread.
- Returning to the steps reconnects to their actual surface without an abrupt jump to an unrelated height.
- The player can pass beneath raised sections at floor level where the visible clearance allows it.
- Companion feet and chosen wait positions use the same real support surfaces.
- Stair loops, saved locations, and reduced-motion traversal remain recoverable and consistent.

## Batch log

- 2026-11-02: D-001 and D-002 recorded at the user's request. No application code changed; no new deployment made.
- 2026-11-02: D-003 added for chthonic angel interaction and passage. Interpretation and acceptance criteria recorded; implementation remains queued.
- 2026-11-02: D-004 added for enthroned disciples who refuse recall until prolonged solitude changes their behavior. Implementation remains queued.
- 2026-11-02: D-005 added for gaze-directed waiting positions outside the throne room. Implementation remains queued.
- 2026-11-02: D-006 added to replace explicit Attend input with automatic lingering-gaze attention. Implementation remains queued.
- 2026-11-02: D-006 extended with a low whoomp and downward low-pass sweep as the attention-response cue. Implementation remains queued.
- 2026-11-02: D-006 cue timing revised to the beginning of lingering gaze, around 20% of full dwell (10–25% tuning range), replacing the earlier completion-time cue.
- 2026-11-02: D-007 added for invisible stair support extending across the room. Implementation remains queued.

## Batch implementation evidence

- D-001: 30 curved, tapered root branches emerge from six column bases and disappear into floor seams. Geometry bounds and finite vertices checked; browser appearance inspected.
- D-002: table markup reduced to title, board/reward, and one centered GO IN PEACE button. Instructions removed from content and accessible action suffixes. Desktop and 390x844 layouts inspected.
- D-003: crossing or close interaction causes a nine-second descent into buried arches with muffled music, low resonance and inverted eyes. A persistent floor scar and garden-to-crypt connection remain. Contact cooldown and save recovery checked.
- D-004: saved throne claims refuse early recall. Forty-five seconds of active absence makes a sole claimant ready; other waiting occupants slow that accumulation by their count. Returning before readiness resets it. Multiple claimants remain recoverable. The seat persists under claimants even if other world rules remove the throne. Browser refusal and release checked; the latter used the private fixture’s time-advance control.
- D-005: gaze is projected onto reachable physical surfaces, with safe fallback and independent saved wait spots. Two-direction placement, obstacle handling and persistence checked.
- D-006: no F binding or touch Attend control. Per-object gaze dwell triggers one low-pass whoomp at 20%, followed by the authored consequence at full dwell. Target switching, interrupted dwell and synthesis routing checked.
- D-007: shared step dimensions drive rendering and support queries; the player falls off edges, can pass underneath where clearance allows, and needs the upper landing to loop. Automated ascent/edge/underpass checks and browser support inspection passed.

Verification: strict TypeScript build; 39 automated tests passed; no runtime console errors observed in the reviewed scenes. Physical touch hardware and subjective headphone listening remain unverified. Private inspectors are not published.

## Publication confirmation

Version 8 published successfully on November 2, 2026 (America/Phoenix). Source: `75d076f237313b94dafea9e58a53a484f05a6dff`. Deployment: `appgdep_6ae96d8d7e2c8191b312d0c482982c90`. The live entry page and instruction-free nave table were verified after publication. This receipt was updated after publication and does not alter application files.
