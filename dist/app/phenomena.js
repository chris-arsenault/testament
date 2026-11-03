// Thematic families are simultaneous, not progression stages. Sources are an internal coverage map.
export const phenomena = [
    { id: 'division', books: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'], theme: 'Creation, separation, covenant, wandering', condition: (w) => w.place === 'water' && w.still > 7, effect: (w) => { w.bridge = true; w.memory++; }, line: 'The waters remember being asked to separate.' },
    { id: 'exile', books: ['Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther'], theme: 'Belonging, power, genealogy, exile, return', condition: (w) => w.returns >= 3 && w.absence > 0, effect: (w) => { w.letter = (w.letter + w.absence) % 12; w.passage = true; }, line: 'The house has made a door for someone who is missing.' },
    { id: 'lament', books: ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Songs'], theme: 'Suffering, attention, song, uncertainty, love', condition: (w) => w.still > 14, effect: (w) => { w.ceiling = true; w.reality = (w.reality + 1) % 3; }, line: 'The unanswered question has become a window.' },
    { id: 'bones', books: ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'], theme: 'Judgment, displaced presence, restoration, resistance', condition: (w) => w.place === 'crypt' && w.attention > 4, effect: (w) => { w.throne = false; w.roots = true; }, line: 'The bones decline the throne. They want their feet back.' },
    { id: 'table', books: ['Matthew', 'Mark', 'Luke', 'John'], theme: 'Embodiment, hospitality, vulnerability, resurrection', condition: (w) => w.place === 'garden' && w.angel > .6 && w.left.length === 0 && w.party.length > 0 && w.still > 5, effect: (w) => { w.roots = true; w.bridge = true; }, line: 'There is a place at the table for the thing in the bushes.' },
    { id: 'letters', books: ['Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude'], theme: 'Witness, community, reconciliation, endurance, hospitality', condition: (w) => w.absence >= 2 && w.left.length === 0, effect: (w) => { w.stable = true; w.letter = (w.letter + 3) % 12; }, line: 'The letter arrives inside the person who carried it.' },
    { id: 'renewal', books: ['Revelation'], theme: 'Open gates, river, living tree, renewal', condition: (w) => w.roots && w.memory >= 3, effect: (w) => { w.throne = false; w.passage = true; w.bridge = true; }, line: 'The gates have forgotten the purpose of a lock.' }
];
export function evolve(w) { for (const p of phenomena)
    if (!w.seen.includes(p.id) && p.condition(w)) {
        p.effect(w);
        w.seen.push(p.id);
        w.events.push({ kind: p.id, text: p.line });
    } }
