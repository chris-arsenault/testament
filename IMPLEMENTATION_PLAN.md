# TESTAMENT — Implementation plan and accountability record

Recorded: 2026-11-02

## Authority and status

This document records the agreed creative direction and implementation plan. The user authorized execution of **all phases without stopping**, then requested this durable reference. Saving this document does not constitute completion of any implementation phase.

At the time of recording, the published game is the earlier desert/seven-seal prototype. The cathedral architecture and systems below are planned, not verified as implemented. Existing graphics, soundtrack, roster, and lore may be reused where they serve this direction.

## Creative contract

Rebuild TESTAMENT as one continuous, evolving cathedral of thought. The Bible supplies its images, contradictions, relationships, and transformations. Walking, looking, waiting, returning, and choosing companions become ways of thinking inside it.

The user's correction governs the design: “everything must do something but that something does not have to be comprehensible” and “no missions, just fluid evolution of thought.”

- No mission assignments, quest markers, collectible quotas, or mission-completion screens.
- Every phenomenon changes space, perception, memory, companionship, or another phenomenon. Cryptic text alone is not a mechanic.
- Causes are precise internally; interpretation remains open to the player.
- The entire Bible informs a simultaneous, transforming world rather than a required sequence of chapters or rooms.
- The cat from the supplied photograph is central to the world's spatial logic.
- All twelve disciples are selectable companions whose altered bodies and presence affect reality.
- Surprise, impossible architecture, intimate absurdity, and esoteric atmosphere must produce consequences rather than cosmetic references.
- Developer instructions, design explanations, test controls, and feature advertising must remain outside player-facing content.
- Reliable movement and recoverable transitions support the mystery. Unresponsive controls and arbitrary obstruction do not.

## Phase 1 — Establish the world's grammar

Write specifications separating:

1. Internal rules: triggers, affected state, persistence, precedence, and recovery.
2. Player experience: visible, audible, spatial, or behavioral evidence.
3. Interpretation: meanings intentionally left open.

The opening contains the cathedral, an impossible staircase, bushes concealing an angel, and the cat. Each phenomenon specification must name its consequence and its interactions with other systems.

Acceptance: the core phenomena have explicit rules and observable consequences without requiring explanatory objectives.

## Phase 2 — Architecture beneath the mystery

Keep Three.js; move the game into TypeScript modules with a reproducible build. Separate simulation from rendering so behavior can be tested without WebGL.

| Module | Responsibility |
| --- | --- |
| World simulation | Stable time, entities, deterministic randomness, commands, events, state changes |
| Spatial topology | Doorway connections, recursive stairs, alternate room arrangements |
| Perception | Attention, visibility, gaze, sound, remembered observations |
| World memory | Persistent behavioral traces, decay, thresholds |
| Companions | Twelve disciples modifying explicit world rules |
| Phenomena | Conditions, transformations, interactions, persistence |
| Presentation | Geometry, animation, audio, interface, player-facing language |
| Persistence | Versioned saves, restoration, invalid-state recovery |

Use authored rules and explicit state machines. Simulation owns state; input and UI issue commands; events drive presentation. Define shared contracts for phenomena and companion effects. Add a private developer inspector that explains transformations; exclude it from the shipped player interface.

Acceptance: deterministic simulation checks, a working browser build, and save restoration work across the module boundaries. Avoid a new monolithic runtime under a different filename.

## Phase 3 — Convincing impossible space

Build the cathedral and staircase first. A circuit returns to its starting point while changing room adjacency, gravity cues, companion position, or the source of footsteps. Doorways may change destinations while preserving convincing transitions.

Start with seamless transformations at occluded thresholds. Add rendered portals only where seeing impossible connections improves the experience.

Acceptance:

- Repeated ascent creates persistent changes.
- Descending, stopping, and returning produce distinct responses.
- Movement remains controllable through transitions.
- No transformation traps the player or corrupts a save.
- Exploration works without objective markers.

## Phase 4 — Attention, memory, and the cat

Implement looking, looking away, proximity, lingering, repetition, and following as world inputs. The cat navigates an alternate connection graph and enters passages currently concealed from the player. Following her can reconcile the two geometries temporarily.

Her animation and sound communicate hesitation, fixation, retreat, waiting, and confidence. Include ordinary resting and cat behavior so every movement does not become an instruction.

First authored interaction chain: the cat watches beneath a stair; direct inspection reveals nothing; moving away allows her to disappear beneath it; returning reveals a passage whose distant footsteps belong to the player.

Acceptance: this chain changes traversable space and leaves memory that affects later encounters. Cat behavior is functional rather than a decorative following model.

## Phase 5 — Angel as an event in perception

Place an angel among ordinary bushes without a boss introduction or health bar. Its appearance follows authored world conditions with controlled variation. Its many eyes expose different arrangements of nearby space; attention makes an arrangement tangible. Looking away need not reverse the choice.

Coordinate eye groups instead of rendering a thousand independent cameras. Use instancing, animation, and selective rendering for density.

Acceptance:

- The angel changes traversable space.
- Players can encounter, avoid, leave, and revisit it.
- Its effects interact with staircase and cat state.
- Its presence changes sound before or after discovery.
- Browser performance is measured and acceptable on the tested environment; limitations are recorded.

## Phase 6 — Disciples alter reality

Implement three deeply first, then extend the same contracts to all twelve. Retain the roster, but never present unfinished powers as functional.

- Thomas: repeated scrutiny stabilizes uncertain geometry, potentially closing other possibilities.
- Peter: remaining beside a threshold anchors its destination; departing releases it.
- Judas: separation creates connections that cannot exist while the party is together.

Design the remaining nine through the same rule contract. Each disciple needs a perceptible signature, a spatial or behavioral consequence, and interactions with at least two existing phenomena. Combinations change the experience without making a particular selection mandatory.

Acceptance: all twelve are selectable and functional, their consequences are verified, and combination checks cover conflicts and recovery. Temporary numerical buffs alone do not satisfy this phase.

## Phase 7 — The entire Bible permeates the space

Create an internal thematic coverage map spanning the biblical books and major movements. Record the canon used and any coverage gaps. Translate material into interacting phenomena rather than chapter progression.

Creation, covenant, exile, wisdom, lament, incarnation, death, resurrection, witness, and revelation recur as transformations grounded in specific texts and images.

Examples to develop:

- Water overhead remembers an earlier act of abandonment.
- A genealogy changes which figures cast the player's shadow.
- A letter changes its addressee according to who has been absent.
- A garden grows through architecture the player previously made permanent.

Acceptance: the coverage map links source themes to implemented phenomena and consequences. A book-name list or archive of summaries alone does not establish experiential coverage. The map is developer documentation, not a player checklist.

## Phase 8 — Sound, language, and accessibility

Evolve the original soundtrack into world-state-driven layers: architectural resonance, breath, distant voices, metallic harmonics, displaced footsteps, and authored silence. Sound can reveal a relationship before geometry does.

Player-facing writing is sparse and specific. Dialogue responds to events and relationships. Keep content in dedicated files, separate from implementation notes. Remove development language and explanations of intended symbolism.

Include independent volume controls, subtitles or equivalent cues for meaningful audio, reduced-motion options, and alternatives to precise sustained-gaze interactions.

Acceptance: sound responds to actual world changes; language audit finds no leaked instructions; accessible alternatives preserve functional interactions. Record which audio checks were automated and which were actually listened to.

## Phase 9 — Coherence, verification, and publication

Automated checks cover topology, transformation ordering, companion interactions, save restoration, and recovery. Browser playthroughs assess noticeable consequences, reliable movement, and curiosity without instructions.

A review build must let a player:

- Explore without an assignment.
- Cause several different transformations.
- Infer at least one relationship through experience.
- Revisit a place and discover a consequence.
- Leave encounters without a dead end.

Mystery is not itself a failure. Invisible consequences, repetitive triggers, broken controls, and arbitrary obstruction are failures.

Publish the verified result to the existing public site. Preserve recoverable source history. Verify the deployed build and report actual validation and remaining limitations; do not equate unit tests or teleported progression with a complete manual playthrough.

## Execution milestones

These are sequencing checkpoints, not permission gates. The user's authorization covers all phases; continue through the full plan unless a concrete blocker requires input.

| Milestone | Deliverable | Status |
| --- | --- | --- |
| M1 | Grammar, simulation architecture, private inspector | Implemented and checked locally |
| M2 | Cathedral traversal and recursive staircase | Implemented and checked locally |
| M3 | Attention, memory, functional cat | Implemented and checked locally |
| M4 | Angel and three interacting disciple rules | Implemented and checked locally |
| M5 | Integrated sound, language, accessibility, tested core build | Implemented and checked locally |
| M6 | All twelve disciples and biblical transformation coverage | Implemented and checked locally |
| M7 | Full regression, browser review, public deployment verification | Published v4; live page verified |

The first integrated checkpoint is a playable, persistent cathedral with impossible stairs, alternate cat access, a perception-altering angel, three interacting disciples, and evolving sound. It is not the end of the authorized scope. Expand to all twelve and biblical coverage, then complete verification and publication.

## Accountability protocol

- Update this record after each milestone with changed files, verified behavior, checks performed, limitations, and next work.
- Mark work complete only when its acceptance criteria have supporting evidence.
- Record design deviations with their reason and effect on the creative contract.
- Distinguish implemented, tested, published, and merely proposed behavior.
- Do not silently drop phases or substitute cosmetic effects for system interactions.
- Keep this document outside the public static output directory.

## Progress ledger

### 2026-11-02 — Plan recorded

- Saved the agreed direction, all nine phases, architecture, acceptance criteria, milestones, and accountability protocol.
- Implementation status: no cathedral phases completed or verified by this documentation step.
- Next implementation work: inspect current source and repository instructions, establish baseline, then execute M1.

## Deployment reference

- Public site: https://testament-exodus-protocol-carse.pilednacre1.chatgpt.site/
- Existing project ID: appgprj_6ae8ef5a5b408191a788e3fc3596804b
- Baseline published commit recorded from prior work: 6638a4d1872d9800b5f5a16198415d353f9a3496
- Recheck repository and deployment state before modifying or publishing.

### 2026-11-02 — Cathedral implementation and local verification

- M1: strict TypeScript modules, content separation, commands/state/events, versioned persistence, and private CLI/browser inspectors. See docs/ARCHITECTURE.md.
- M2: five configurations of one cathedral; recursive stair circuits; mutable side/front/low connections; descent and stillness have distinct consequences; threshold blinks conceal topology swaps.
- M3: approach/look-away cat sequence opens a physical passage. Attention, absence, return, and sustained stillness feed persistent world state.
- M4: 1,000 instanced eyes, six radial wings, rotating rings, nearby bushes, attention-driven reality changes, and all initial companion rules.
- M5: seven original synthesized musical states follow world configuration, with separate effect volume, meaningful sound captions, reduced motion, automatic attention, continuous walking, touch controls, and revised language.
- M6: all twelve selectable companions change state/topology; waiting companions remain associated with the space where they were left. Seven simultaneous biblical phenomenon families cover 66 books; see docs/BIBLICAL_COVERAGE.md.
- M7 local evidence: strict compilation passed; 11 automated tests passed, including all 220 three-member parties, collision, save validation, cat sequencing, angel topology, waiting route, determinism, coverage, and seven finite unclipped musical states. Browser controls reached and repeatedly traversed the staircase; inspected angel/water/crypt; roster selection worked; 390x844 menu layout checked; no console errors observed. Local inspector measured approximately 17–18 ms average frame intervals in sampled scenes (not a cross-device benchmark).

#### Deliberate implementation choices and limits

- Impossible space uses authored topology changes and a brief visual blink, not recursive portal rendering. The inspector is local-only and excluded from dist.
- The Bible is a grouped thematic adaptation of the existing 66-book Protestant canon, not a literal rendering of every event; deuterocanonical material is not represented.
- All twelve rules are functional. Combination enumeration verifies finite state and valid exits, not exhaustive artistic quality or balance.
- Browser scene-inspector checks are distinguished from normal-control traversal. The entire emergent experience has not received an independent human playtest. Physical touch devices and subjective headphone listening remain unverified.
- Geometry remains procedural and deliberately stylized. No external AI-generated imagery or voices were introduced.
- The initial review checkpoint did not stop work: the remaining nine companions and biblical families were implemented in the same authorized run.

Publication status will be recorded in docs/RELEASE.md after the hosting service confirms deployment.

### 2026-11-02 — Publication confirmed

Version 4 deployed successfully from commit `8af1f04f5b5042817580c0c607424f4f85633e9b`. The public page was reloaded and verified to show the new cathedral title and opening. All planned implementation phases have a working realization; limitations and verification boundaries remain explicit above and in docs/RELEASE.md. This post-publication ledger update changes documentation only.

### 2026-11-02 — Engravings and unlocated narrator

- Added two verified public-domain Dürer images from The Met and National Gallery of Art, bundled locally with source credits. They supply visible wall textures and linear bump maps on tablets, floor, a column, and stonework. Relief responds to attention and memory; the third reality exchanges the wall record.
- Added a subtitle-only scripture narrator with verified World English Bible quotations and accurate references. Room entry and events choose context-specific passages; queued lines are paced, deduplicated, and cleared on room changes. Narration can be disabled independently.
- Added cinematic arrival cards with intentionally displaced location references, impossible chronology, loop-dependent take numbers, letterboxing, and cast cards for the cat and angel. No movement is locked. Reduced motion removes transitions.
- Validation: strict TypeScript build and 16 tests passed; desktop room/narrator and 390x844 arrival-card layouts inspected; independent narration toggle verified; no browser console errors observed. See docs/ART_AND_NARRATION.md for provenance and implementation detail.
- Publication: version 5 succeeded; source commit `0a85d8fa3a7a66f23aeac4e86c2e406dafc24b3a`. The live entry sequence was verified after reloading. This receipt was updated after publication.

### 2026-11-02 — Mouse capture and a single volume control

- Desktop entry/resume/scene clicks request Pointer Lock; relative mouse motion drives the camera. Esc releases look and pauses; menus also release capture. Touch retains drag-to-look.
- The Codex in-app browser rejected Pointer Lock with WrongDocumentError during verification. In this host, an automatic click-to-look fallback accepts mouse motion without holding a button, bounded by the view. True unrestricted capture requires a host supporting Pointer Lock; it was not verified in an external browser.
- Removed all configurable toggles and separate audio sliders. One persisted Volume slider scales music and effects together, with zero muting both. Narration and sound captions remain enabled; system reduced-motion preference is automatic. Party and recovery actions remain available.
- Fixed Escape default behavior closing the dialog on the same keypress that opened it. Browser verified no-hold look, Escape pause, and a single settings slider. Strict build and 19 tests passed (including volume mute, pitch clamp, and denied/unsupported pointer lock).

### 2026-11-02 — Five esoteric table puzzles

- Added one optional minigame to every room: rotating halos, sliding stones, Eden mosaic, glyph sudoku, and cross-toggle lamps. Each is reachable through a physical table and the E/examine control.
- Completion produces a distorted scripture/political transmission with a detuned canticle. It has no effect on doors, abilities, or progression, and that lack of utility is not announced in play.
- Attempt time has no limit. It gradually increases rustling disciple whispers and falling text, bounded at one whisper every three seconds and four visible streams. System reduced motion provides stationary fades.
- Board states, completions, time and whisper count persist. Pointer capture releases for the dialog, and Esc returns cleanly. One overall volume slider remains the only configurable setting.
- Verification: strict build and 26 tests passed; all five puzzle rewards reached through browser controls; saved crypt completion and Esc exit checked in the actual game; phone-width glyph layout and falling whisper text inspected. See docs/PUZZLE_TABLES.md.

### 2026-11-02 — Puzzle publication confirmed

Version 7 deployed successfully from source `c273f020199d17d385c7c5c58edf44efb4bc66a9`. The live nave table was approached and opened through normal controls, showing the five-halo puzzle without console errors. This post-publication receipt changes documentation only.

### 2026-11-02 — Next defect batch recorded

The user requested a durable batch queue before further fixes. See `docs/DEFECTS.md`: D-001 replaces spike-like roots with curved growth emerging from the stone; D-002 strips the tables to their name, puzzle, and one centered "GO IN PEACE" button. The governing direction is Myst-inspired discovery with zero instructional prose. These items are open; this documentation step does not change or deploy the application.

D-003 subsequently adds a chthonic response to interacting with or walking through the angel: subterranean spatial and sonic consequences, with a lingering world trace and no explanatory instructions. This remains part of the queued batch.

D-004 adds throne-room waiting behavior: a disciple stands on the throne, refuses early recall, and becomes willing to leave after prolonged genuine solitude. Save persistence, visible positioning, and an undisclosed solitude threshold are part of its acceptance criteria. This remains queued.

D-005 replaces predetermined waiting positions in other rooms with valid standing locations chosen from the player's gaze at command time. Each disciple's chosen location persists across departures and saves. D-004 remains the throne-room exception. This remains queued.

D-006 removes the F/Attend action and touch toggle. Attention will build automatically from lingering gaze on the same physical target, interrupted by looking away or changing targets, without an additional setting, meter, or tutorial. This remains queued.

Lingering attention will have a low whoomp with a downward low-pass filter sweep, emitted once near 20% of the target's full dwell duration (tunable within 10–25%), rather than at completion. It is controlled by the overall volume slider. This revised audio requirement is attached to D-006 and remains queued.

D-007 fixes the staircase's invisible room-wide walking slope. Elevated support must follow the visible steps and landings, with real floor-level traversal beside and beneath them, consistent companion placement, and landing-aware recursive transitions. This remains queued.

### 2026-11-02 — D-001 through D-007 implemented

The full requested batch is implemented. Curved rooted growth replaces the spikes; tables have no helper prose; angel contact reveals buried architecture and leaves a persistent trace; throne claims and gaze-directed wait spots are saved; attention is automatic with its whoomp at 20% dwell; real stair support replaces the invisible room-wide slope.

Strict compilation and 39 tests passed. Browser checks covered root appearance, stair edges and underpasses, an enthroned disciple refusing recall, solitude release through a private time-advance fixture, the chthonic chamber, and instruction-free desktop/phone-width tables. See docs/DEFECTS.md for per-item evidence and limitations. Publication confirmation follows in docs/RELEASE.md.

### 2026-11-02 — Defect batch published

Version 8 deployed successfully from `75d076f237313b94dafea9e58a53a484f05a6dff`. The public entry and instruction-free table were verified. D-001 through D-007 are closed with evidence in docs/DEFECTS.md. This post-publication receipt changes documentation only.

### 2026-11-02 — Witness behavior revision

All twelve now have distinct audio, visual, and world/interaction consequences. The channels have independent timings and second-action gates, reflecting the user's refinement that they should usually occur at different moments. The revision includes linked cat copies, remembered menu language, a temporarily impossible borrowed glyph ledger, and real changes to gravity, clearance, supporting surfaces, contact, and room connections. No new player-facing ability explanations or settings were added.

The durable trigger matrix, architecture contracts, acceptance checklist, and verification evidence are in docs/WITNESS_PHENOMENA.md. Strict compilation and 57 automated checks pass. Local browser checks covered every witness renderer, the production entry/menu, cat replication, French actions, and contradictory clues clearing to the canonical puzzle. Publication receipt follows in docs/RELEASE.md.

Version 9 is published from `0800796c8e8b11290853180eb74a8d7645fef308`. Deployment `appgdep_6ae97653367c8191ab9c8da913390858` succeeded; the public entry was verified without console errors. The implementation and verification matrix is closed in docs/WITNESS_PHENOMENA.md.

### 2026-11-02 — Modeling and geometry pass

Completed the requested visual pass across architecture, stairs, furniture, the calico, all twelve disciples, the angel, and shrubs. Procedural mesh builders and material batching now separate asset construction from world presentation. Existing physical footprints and throne/tread support heights are preserved. All 64 checks pass, with close visual inspections of the rooms, figures, and affected phenomena. See docs/GEOMETRY_PASS.md for the asset inventory, measured rendering costs, and acceptance evidence. Publication receipt follows in docs/RELEASE.md.

### 2026-11-02 — Seven rooms and homes

Completed seven distinct spatial designs with shared geometry/collision layout data, two new puzzles, all twelve disciple homes, nearby identity/recruitment encounters, throne-safe swaps, left-click examination and retained 1–3 orders. Removed the pause-menu roster. Old ordinary wait positions now migrate to homes; throne claims persist. This supersedes D-005 gaze-directed waiting under the user's latest request.

Strict compilation and 76 automated checks pass. Local browser review covered seven spaces, click recruitment, protected throne slots, both new puzzle completions, the simplified menu and phone-width encounter layout. See docs/SEVEN_ROOMS.md for the architecture, inventory and limits. Publication receipt follows in docs/RELEASE.md.

Version 11 is published from `38ab4b3e25db645af2cb58131885477f19187728`; deployment `appgdep_6ae983e5be8c8191a1207d136fc1fe54` succeeded. The public entry and simplified menu were verified. All five requirements are complete, with evidence in docs/SEVEN_ROOMS.md.

### 2026-11-03 — Parallel playability polish

Completed three parallel reviews and integrated their fixes: physical architecture and actors, interaction/input/audio feedback, and seven deeper puzzle mechanisms. Shared support and collision now include furniture, bridge and resident bodies; followers detour without orbiting the player's gaze. Tables use connected mechanisms, geometric clues, action feedback and reversible moves. Audio generation moves to a worker; caption and modal transitions are explicit.

Strict compilation and all 111 automated checks pass. Browser review verified every table layout, two complete puzzle solves, small-screen layouts, recruitment/orders, pause recovery, doorway seams and bridge height. The detailed defect/correction ledger, architecture and limits are in docs/POLISH_PASS.md; publication is recorded in docs/RELEASE.md.

### 2026-11-03 — Continuity and scene polish

Completed fresh subagent reviews of puzzle sessions, world continuity and scene geometry. Integrated durable undo/redo, keyboard navigation, fixed clue anchors, replayable canticles, terrain-conforming marks and shadows, local angel-eye closure, slab head clearance, legacy save recovery, and safe transitions out of angel descent. Added background audio suspension, bounded paused rendering, live motion preference handling, graphics recovery and compact landscape layouts.

Strict compilation and all 134 automated checks pass. Browser acceptance covers reloaded puzzle journals, sliding focus/navigation, portrait and landscape glyph boards, complete crypt reward/replay, real context loss/restoration at entry and during play, and ground-level entrance recovery from descent. Detailed evidence and limits are in docs/CONTINUITY_PASS.md. Publication is recorded in docs/RELEASE.md.
