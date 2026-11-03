import type {PuzzleState} from './puzzles.js';
// The borrowed ledger has two identical fixed names in its first row. No assignment can solve it.
// It is a disposable layer; never save it over the player's actual table.
export function borrowedLedger(s:PuzzleState):PuzzleState{const echo=structuredClone(s);echo.board[3]=echo.board[0];echo.solved=false;return echo;}
