export const glyphs = ['', '𐤀', '𐤁', '𐤂', '𐤃'];
export const sudokuSolution = [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1];
export const sudokuClues = [1, 0, 0, 4, 0, 4, 1, 0, 0, 1, 4, 0, 4, 0, 0, 1];
export const puzzleInfo = {
    nave: { title: 'THE FIFTH DIRECTION', rubric: 'ECCLESIASTICAL ALIGNMENT / NORTH HAS BEEN REASSIGNED', instruction: 'Turn each halo until its cut faces the star above it. All five must face north.', verse: 'Let there be light. Let there be light. Let there be a meter.', political: 'They did not privatize the sun. They privatized the window, and called the darkness a personal choice.' },
    stair: { title: 'THE MISSING STEP', rubric: 'JACOB / DEPARTMENT OF VERTICAL LABOUR', instruction: 'Slide stones into the empty place. Read I through VIII from left to right; leave the last place empty.', verse: 'The angels were ascending and descending. No one had paid them for the descent.', political: 'Every promotion promises a higher floor. Someone still owns the staircase.' },
    garden: { title: 'THE BODY BEFORE THE BODY', rubric: 'EDEN / PROPERTY OF THE FIRST PERSON', instruction: 'Exchange two fragments to restore the engraving. The narrow border belongs around the outside.', verse: 'In the beginning, God created the heavens and the earth. The deed was filed later.', political: 'The first enclosure was a sentence: this is mine. The serpent only taught us how to sign it.' },
    water: { title: 'FOUR NAMES FOR WATER', rubric: 'THE COMMON SEA / DUPLICATION FORBIDDEN', instruction: 'Place each of the four glyphs once in every row, column, and outlined square. Click a blank cell to cycle its name.', verse: 'Let it divide the waters from the waters. Let neither bank remember the river was whole.', political: 'They promised that everything would belong to everyone. Then they kept the key to the storehouse.' },
    crypt: { title: 'THE UNEMPLOYED STARS', rubric: 'EZEKIEL / OFFICE OF RETURNED BODIES', instruction: 'Put every lamp to rest. Touching one changes it and its neighbours above, below, left, and right.', verse: 'Son of man, can these bones live? Only if their return can be entered as growth.', political: 'The ledger counts resurrection as productivity. It has no column for the life that wanted to remain unmeasured.' }
};
export function toggleCross(board, index) { const row = Math.floor(index / 3), col = index % 3; for (const [r, c] of [[row, col], [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]])
    if (r >= 0 && r < 3 && c >= 0 && c < 3)
        board[r * 3 + c] = 1 - board[r * 3 + c]; }
export function freshPuzzle(place) {
    let board;
    if (place === 'nave')
        board = [1, 3, 2, 1, 3];
    else if (place === 'stair') {
        board = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        let empty = 8, previous = -1;
        for (let i = 0; i < 34; i++) {
            const neighbours = [empty - 3, empty + 3, ...(empty % 3 ? [empty - 1] : []), ...(empty % 3 < 2 ? [empty + 1] : [])].filter(x => x >= 0 && x < 9 && x !== previous);
            const next = neighbours[(i * 7 + 3) % neighbours.length];
            [board[empty], board[next]] = [board[next], board[empty]];
            previous = empty;
            empty = next;
        }
    }
    else if (place === 'garden')
        board = [4, 0, 7, 2, 8, 1, 5, 3, 6];
    else if (place === 'water')
        board = [...sudokuClues];
    else {
        board = Array(9).fill(0);
        for (const i of [0, 1, 4, 6, 8])
            toggleCross(board, i);
    }
    return { board, elapsed: 0, solved: false, selected: null, whispers: 0 };
}
export function isSolved(place, b) {
    if (place === 'nave' || place === 'crypt')
        return b.every(v => v === 0);
    if (place === 'stair')
        return b.every((v, i) => v === (i + 1) % 9);
    if (place === 'garden')
        return b.every((v, i) => v === i);
    const unique = (a) => a.every(v => v >= 1 && v <= 4) && new Set(a).size === 4;
    for (let r = 0; r < 4; r++)
        if (!unique(b.slice(r * 4, r * 4 + 4)))
            return false;
    for (let c = 0; c < 4; c++)
        if (!unique([b[c], b[c + 4], b[c + 8], b[c + 12]]))
            return false;
    for (const start of [0, 2, 8, 10])
        if (!unique([b[start], b[start + 1], b[start + 4], b[start + 5]]))
            return false;
    return true;
}
export function act(place, s, index) {
    if (s.solved || index < 0 || index >= s.board.length)
        return false;
    let changed = true;
    if (place === 'nave')
        s.board[index] = (s.board[index] + 1) % 4;
    else if (place === 'stair') {
        const empty = s.board.indexOf(0);
        if (Math.abs(Math.floor(empty / 3) - Math.floor(index / 3)) + Math.abs(empty % 3 - index % 3) !== 1)
            return false;
        [s.board[empty], s.board[index]] = [s.board[index], s.board[empty]];
    }
    else if (place === 'garden') {
        if (s.selected === null) {
            s.selected = index;
            return false;
        }
        if (s.selected === index) {
            s.selected = null;
            return false;
        }
        [s.board[s.selected], s.board[index]] = [s.board[index], s.board[s.selected]];
        s.selected = null;
    }
    else if (place === 'water') {
        if (sudokuClues[index])
            return false;
        s.board[index] = (s.board[index] + 1) % 5;
    }
    else
        toggleCross(s.board, index);
    s.solved = isSolved(place, s.board);
    return changed;
}
export function whisperInterval(elapsed) { return Math.max(3, 18 * Math.exp(-Math.max(0, elapsed) / 85)); }
export function restorePuzzle(place, value) {
    const fresh = freshPuzzle(place), s = value;
    if (!s || !Array.isArray(s.board) || s.board.length !== fresh.board.length)
        return fresh;
    const max = place === 'nave' ? 3 : place === 'water' ? 4 : place === 'crypt' ? 1 : 8;
    if (!s.board.every(n => Number.isInteger(n) && n >= 0 && n <= max))
        return fresh;
    if ((place === 'garden' || place === 'stair') && new Set(s.board).size !== 9)
        return fresh;
    if (place === 'water' && sudokuClues.some((n, i) => n !== 0 && s.board[i] !== n))
        return fresh;
    if (place === 'stair') {
        const vals = s.board.filter(n => n !== 0);
        let inversions = 0;
        for (let i = 0; i < vals.length; i++)
            for (let j = i + 1; j < vals.length; j++)
                if (vals[i] > vals[j])
                    inversions++;
        if (inversions % 2)
            return fresh;
    }
    return { board: [...s.board], elapsed: typeof s.elapsed === 'number' && Number.isFinite(s.elapsed) ? Math.max(0, s.elapsed) : 0, solved: isSolved(place, s.board), selected: null, whispers: typeof s.whispers === 'number' && Number.isFinite(s.whispers) ? Math.max(0, Math.floor(s.whispers)) : 0 };
}
