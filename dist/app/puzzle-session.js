import { act, isSolved, PUZZLE_REVISION, restorePuzzle } from './puzzles.js';
export const JOURNAL_LIMIT = 160;
export const newJournal = () => ({ undo: [], redo: [] });
const equal = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
function validBoard(place, value) {
    if (!Array.isArray(value))
        return false;
    return equal(value, restorePuzzle(place, { revision: PUZZLE_REVISION, board: value }).board);
}
export function legalPuzzleTransition(place, from, to) {
    if (!validBoard(place, from) || !validBoard(place, to) || isSolved(place, from))
        return false;
    if (place === 'garden') {
        const differences = from.flatMap((v, i) => v !== to[i] ? [i] : []);
        if (differences.length !== 2)
            return false;
        const [a, b] = differences;
        return Math.abs(Math.floor(a / 4) - Math.floor(b / 4)) + Math.abs(a % 4 - b % 4) === 1 && from[a] === to[b] && from[b] === to[a];
    }
    for (let i = 0; i < (place === 'scriptorium' ? 6 : from.length); i++) {
        const s = { revision: PUZZLE_REVISION, board: [...from], elapsed: 0, whispers: 0, solved: false, selected: null };
        if (act(place, s, i) && equal(s.board, to))
            return true;
    }
    return false;
}
// Restore only the contiguous, legal branch nearest the saved board. A damaged older
// entry does not erase newer recoverable work, and an old revision never lends undo.
export function restoreJournal(place, state, value, revision = PUZZLE_REVISION) {
    const journal = newJournal(), raw = value;
    if (state.solved || revision !== PUZZLE_REVISION || !raw)
        return journal;
    let cursor = state.board;
    const undo = Array.isArray(raw.undo) ? raw.undo.slice(-JOURNAL_LIMIT) : [];
    for (let i = undo.length - 1; i >= 0; i--) {
        const previous = undo[i];
        if (!Array.isArray(previous) || !legalPuzzleTransition(place, previous, cursor))
            break;
        journal.undo.unshift([...previous]);
        cursor = previous;
    }
    cursor = state.board;
    const redo = Array.isArray(raw.redo) ? raw.redo.slice(-(JOURNAL_LIMIT - journal.undo.length)) : [];
    for (let i = redo.length - 1; i >= 0 && journal.undo.length + journal.redo.length < JOURNAL_LIMIT; i--) {
        const next = redo[i];
        if (!Array.isArray(next) || !legalPuzzleTransition(place, cursor, next) || isSolved(place, next))
            break;
        journal.redo.unshift([...next]);
        cursor = next;
    }
    return journal;
}
export function recordPuzzleMove(journal, before, state) {
    if (state.solved) {
        journal.undo = [];
        journal.redo = [];
        return;
    }
    journal.undo.push([...before]);
    journal.redo = [];
    if (journal.undo.length > JOURNAL_LIMIT)
        journal.undo.shift();
}
export function revisePuzzle(state, journal, direction) {
    if (state.solved)
        return false;
    const from = journal[direction], to = journal[direction === 'undo' ? 'redo' : 'undo'], board = from.pop();
    if (!board)
        return false;
    to.push([...state.board]);
    state.board = [...board];
    state.selected = null;
    return true;
}
export function puzzleControlPosition(place, index) {
    if (place === 'choir') {
        const a = index * Math.PI / 4;
        return [Math.sin(a) * 2, -Math.cos(a) * 2];
    }
    if (place === 'scriptorium')
        return index < 3 ? [0, index + 1] : [index - 2, 0];
    const size = place === 'water' ? 6 : 4;
    return [index % size, Math.floor(index / size)];
}
export function puzzleFocusTarget(place, index, key, enabled) {
    if (!enabled.length)
        return null;
    if (key === 'Home')
        return enabled[0];
    if (key === 'End')
        return enabled.at(-1);
    const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }, d = direction[key];
    if (!d)
        return null;
    const [x, y] = puzzleControlPosition(place, index);
    let best = null, score = Infinity;
    for (const candidate of enabled) {
        if (candidate === index)
            continue;
        const [cx, cy] = puzzleControlPosition(place, candidate), dx = cx - x, dy = cy - y, forward = dx * d[0] + dy * d[1];
        if (forward < .001)
            continue;
        const perpendicular = Math.abs(dx * d[1] - dy * d[0]);
        if (place !== 'choir' && place !== 'scriptorium' && perpendicular > .001)
            continue;
        const cost = perpendicular * 2 + Math.hypot(dx, dy);
        if (cost < score - .001) {
            score = cost;
            best = candidate;
        }
    }
    return best;
}
export function focusAfterPuzzleMove(place, index, before, after) { return place === 'stair' && before[index] !== 0 ? after.indexOf(before[index]) : index; }
