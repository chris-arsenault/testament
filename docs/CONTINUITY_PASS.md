# Continuity and scene polish — November 3, 2026

Three fresh subagent reviews covered world continuity, scene geometry and puzzle sessions. The main integration pass covered runtime recovery, audio lifecycle and small screens. This pass preserves the existing seven mechanisms and their optional, unexplained role in the cathedral.

## Findings and corrections

| Reproduced defect | Correction |
| --- | --- |
| Leaving a table or reloading lost its undo branch. Matthew's borrowed ledger could discard canonical history. | Each table saves a validated, bounded undo/redo journal. Temporary ledger history remains separate. |
| A sliding stone left keyboard focus on the disabled vacancy. Moving around a large board required many Tab presses. | Focus follows the stone; arrows, Home and End navigate the mechanism, while Tab exits to the action controls. Undo/redo also support keyboard shortcuts. |
| Archive clue imprints animated with the letters; choir threads omitted the neighboring coupling. | Imprints stay fixed, letters move, and single/double connections now match the chime rules. |
| Interrupted puzzle audio could leave scheduled tails, and a completed canticle could not be replayed. | Hidden/closed tables immediately disconnect their voices and clear whisper timers. The answer offers an icon-only canticle replay. |
| Angel descent carried a buried camera across a threshold or back to the entrance. | Shared arrival recovery clears transient descent, contact, gaze and motion while preserving discoveries, party and throne claims. |
| James's lift could push the player's head through a stair slab. | Upward support resolution checks actual overhead surfaces and the current body height, including Alphaeus and Thomas's temporary support. |
| A legacy save in the unbridged pool could fail its short local recovery search. | Restore falls back to clear supported room ground. |
| Old saves could restore several throne occupants in the same seat. | Seat normalization preserves claims and solitude while allocating distinct seats. |
| Garden home marks and the burial ring sank into hills; actor shadows clipped slopes or shared mutable clone geometry. | Terrain marks and shadow vertices follow their actual support. Deformed geometry and materials are owned per clone. |
| Closing John's angel eyes compressed the whole thousand-eye constellation. | Each eye closes in its local orientation, preserving eye centers, instance transforms and pupil alignment. |
| Hidden tabs could keep audio contexts running; paused screens rendered the full scene continuously. | Existing audio contexts suspend on hiding. Hidden/lost screens do not render, and paused/entry scenes redraw at four frames per second to settle asynchronous assets. |
| A WebGL interruption had no clear recovery path. | Entry and pause surfaces show recovery status and a reload action. Restoration leaves the world paused until the player returns. |
| Short landscape windows and phone safe areas crowded the controls. | Puzzles use a compact side-by-side landscape arrangement; narrow tables retain a reachable departure control. Screen-edge controls respect safe areas. |

## Architecture

`puzzle-session.ts` owns journal validation and navigation; `PuzzleUI` owns focus, lifecycle and presentation. Audio nodes have one bounded budget and idempotent cleanup. `runtime.ts` keeps rendering cadence and context visibility independent of simulation. Shared space helpers resolve overhead clearance, and `returnToEntrance` applies the same continuity contract as room transitions. Terrain deformation leaves reusable source meshes intact.

No missions, progress gates, deadlines, ability explanations or additional settings were introduced. The one master-volume control remains. Motion preferences follow the operating system and now update live.

## Acceptance evidence

- Strict TypeScript compilation and all **134 automated tests pass**. The 23 added regressions cover saved journals, legal history branches, keyboard navigation, audio cleanup/budgets, frame pacing, descent recovery, slab clearance, legacy seat/pool recovery, terrain vertices, clone isolation and all 1,000 eye centers.
- The integrated private room fixture uses the actual compiled application with isolated save keys. Nave moves survived close/reopen and reload, then undid and redid correctly. Stair focus followed the moved stone; arrows moved focus, and Tab reached undo.
- The six-glyph table was inspected at **390×844** and **844×390**. Board, revision controls and departure fit. A conflicting glyph produced visible feedback.
- The crypt mechanism was completed through its buttons; its answer and canticle replay appeared. Closing returned focus to the cathedral.
- Real WebGL context loss/restoration was exercised during play and at entry. The interruption disabled play controls and exposed RELOAD; restoration enabled a deliberate return without losing the room.
- Find the entrance during an active angel descent returned to the nave at ground height, with descent cleared.
- John's garden home seal was visually inspected. Final local browser logs contained no warnings or errors; deliberate context-loss lifecycle messages are expected.

## Limits

The browser checks use a private room-jump fixture to reach targeted conditions; they are not a fresh human playthrough. Automated synthesis checks cover signal validity and cleanup, not subjective headphone mixing. Physical phone touch hardware, OS motion-setting changes and a real GPU crash remain unverified. The live public release is checked separately and recorded in RELEASE.md.
