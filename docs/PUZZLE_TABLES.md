# The five tables

Added at the user's explicit request for familiar minigames made biblically esoteric. This extends the original cathedral plan: table completion is intentionally independent of world progression. The interface does not disclose that absence of a practical reward.

| Space | Table | Mechanic | Completion |
| --- | --- | --- | --- |
| Nave | The Fifth Direction | Five independently rotating broken halos | Every cut faces north |
| Stair | The Missing Step | Legal-move-scrambled 3×3 sliding stones | I–VIII in reading order, vacancy last |
| Garden | The Body Before the Body | Nine fragments of Dürer's Adam and Eve, exchanged in pairs | Original image restored |
| Water | Four Names for Water | Four glyphs in a 4×4 sudoku with fixed clues | Unique glyphs per row, column and 2×2 box |
| Crypt | The Unemployed Stars | 3×3 cross-toggle lamps | Every lamp dark |

## Access and state

Each configuration contains a lit table near its arrival point. Approach and press E or click/tap the examine prompt. Opening releases mouse capture and freezes ordinary traversal while the table dialog is open. Esc or Step Away returns to the world. Keyboard focus stays in the dialog, each piece has a semantic label, and touch uses the same buttons.

`puzzles.ts` owns board rules, validation, completion, and whisper cadence. `puzzle-ui.ts` owns dialog and input presentation. `puzzle-audio.ts` synthesizes rustles and the detuned completion canticle through the existing master-controlled effects channel. `whispers.ts` holds authored disciple lines. The core world model is not imported for mutation.

Local key `testament-tables-v1` stores each board, completed state, active attempt time, and whisper count. Restore rejects malformed boards, changed fixed clues, duplicate image tiles, and impossible sliding parity. New-operation reset clears the table records. Closing or reloading does not erase an attempt.

## Time and whispers

There is no countdown, time limit, failure state, score, or attempt penalty. Active table time only controls whisper spacing: 18 seconds initially, shortening exponentially toward a three-second minimum. Closing or hiding the page stops that clock. Reopening retains accumulated time.

Whispers cycle through the selected disciples, with low band-passed noise rustles panned left/right and text descending independently across the screen. At most four streams remain visible; each expires. They never block clicks. The live region provides a nonmoving text equivalent, and the system reduced-motion preference replaces falling motion with a stationary fade. Completion stops rustles and removes active streams.

## Rewards

Each table answers with a deliberately distorted scripture paraphrase and an original political aphorism concerning property, labour, enclosure, state ownership, or the accounting of life. These are fictional transmissions, not quotations attributed to any game creator or historical political author. Six descending/ascending synthesizer tones use detuned pairs to make a deliberately unsteady canticle; no speech recording or spoken-word synthesis is claimed.

Completion unlocks no door, item, ability, world flag, or ending. It changes only the table's presentation and recorded transmission. No completion checklist is shown to players.

## Verification

- Strict TypeScript build and 26 tests pass.
- All five puzzles were solved through visible browser controls. Crypt access and completion were tested through normal traversal; the remaining four also used the local-only scene fixture at `/__puzzles`.
- The crypt reward survived a reload and reopened correctly in the actual game. Esc exited the table without opening the pause menu.
- Flowing whisper text was observed during attempts. The 390×844 glyph layout was inspected, including real glyph rendering.
- No runtime console errors were observed during these checks. Physical touch hardware and subjective headphone listening remain unverified.

`node scripts/puzzle-preview.mjs` generates the local-only fixture from shipped markup. The server exposes it only on localhost. Tests, fixture files and inspector controls are absent from the publication archive.
