import { manifestation } from './witnesses.js';
import { borrowedLedger } from './puzzle-phenomena.js';
import { act, freshPuzzle, glyphs, puzzleInfo, restorePuzzle, sudokuClues, whisperInterval } from './puzzles.js';
import { places } from './world.js';
import { witnesses } from './content.js';
import { discipleWhispers } from './whispers.js';
import { PuzzleAudio } from './puzzle-audio.js';
const $ = (id) => document.getElementById(id);
const numerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
export class PuzzleUI {
    world;
    onOpen;
    onClose;
    reduced;
    storageKey;
    echo = null;
    echoTime = 0;
    states;
    place = 'nave';
    dialog = $('puzzle');
    sound;
    nextWhisper = 0;
    saveClock = 0;
    constructor(world, channel, onOpen, onClose, reduced, storageKey = 'testament-tables-v1') {
        this.world = world;
        this.onOpen = onOpen;
        this.onClose = onClose;
        this.reduced = reduced;
        this.storageKey = storageKey;
        let saved = {};
        try {
            saved = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        }
        catch { }
        this.states = Object.fromEntries(places.map(p => [p, restorePuzzle(p, saved?.[p])]));
        this.sound = new PuzzleAudio(channel);
        $('puzzleLeave').onclick = () => this.close(true);
        this.dialog.addEventListener('cancel', e => { e.preventDefault(); this.close(false); });
    }
    get isOpen() { return this.dialog.open; }
    near() { const w = this.world(); return Math.abs(w.y) < 1.7 && Math.hypot(w.x + 3.7, w.z - 8) < 4.8; }
    open() { if (this.isOpen)
        return; this.place = this.world().place; const debt = manifestation(this.world(), 'matthew'); this.echo = this.place === 'water' && debt && !this.states.water.solved ? borrowedLedger(this.states.water) : null; this.echoTime = this.echo ? debt.remaining : 0; this.onOpen(); this.nextWhisper = whisperInterval(this.states[this.place].elapsed); this.dialog.showModal(); this.dialog.scrollTop = 0; $('puzzleStatus').textContent = ''; this.render(); $('puzzleTitle').focus(); }
    close(capture) { this.mergeEcho(); this.echo = null; this.echoTime = 0; this.save(); this.dialog.close(); this.sound.stop(); $('whisperRain').replaceChildren(); this.onClose(capture); }
    mergeEcho() { if (this.echo) {
        const real = this.states[this.place];
        real.elapsed = Math.max(real.elapsed, this.echo.elapsed);
        real.whispers = Math.max(real.whispers, this.echo.whispers);
    } }
    current() { return this.echo ?? this.states[this.place]; }
    reset() { this.echo = null; this.echoTime = 0; this.states = Object.fromEntries(places.map(p => [p, freshPuzzle(p)])); this.save(); }
    save() { try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.states));
    }
    catch { } }
    render(focusIndex) {
        const s = this.current(), info = puzzleInfo[this.place];
        $('puzzleTitle').textContent = info.title;
        $('puzzleWork').classList.toggle('hidden', s.solved);
        $('puzzleReward').classList.toggle('hidden', !s.solved);
        $('puzzleVerse').textContent = '“' + info.verse + '”';
        $('puzzlePolitics').textContent = '“' + info.political + '”';
        const board = $('puzzleBoard');
        board.className = 'puzzle-board ' + this.place;
        board.replaceChildren();
        if (s.solved) {
            $('puzzleLeave').focus();
            return;
        }
        const symbols = ['ALEPH', 'BETH', 'GIMEL', 'DALETH'];
        s.board.forEach((v, i) => {
            const button = document.createElement('button');
            button.className = 'puzzle-piece';
            button.dataset.index = String(i);
            if (this.place === 'nave') {
                button.innerHTML = '<span class="north-star" aria-hidden="true">✦</span><span class="halo" aria-hidden="true"></span>';
                button.querySelector('.halo').style.transform = `rotate(${v * 90}deg)`;
                button.setAttribute('aria-label', `Halo ${i + 1}, cut facing ${['north', 'east', 'south', 'west'][v]}`);
            }
            else if (this.place === 'stair') {
                button.textContent = v ? numerals[v] : '';
                button.classList.toggle('vacancy', v === 0);
                button.setAttribute('aria-label', v ? `Stone ${numerals[v]}` : 'Empty place');
                button.disabled = v === 0;
            }
            else if (this.place === 'garden') {
                button.style.backgroundImage = 'url(art/adam-and-eve.jpg)';
                button.style.backgroundSize = '300% 300%';
                button.style.backgroundPosition = `${(v % 3) * 50}% ${Math.floor(v / 3) * 50}%`;
                button.classList.toggle('chosen', s.selected === i);
                button.setAttribute('aria-pressed', String(s.selected === i));
                button.setAttribute('aria-label', `Position ${i + 1}, image fragment ${v + 1}`);
            }
            else if (this.place === 'water') {
                button.textContent = glyphs[v] || '·';
                button.disabled = !!sudokuClues[i];
                button.classList.toggle('given', !!sudokuClues[i]);
                button.setAttribute('aria-label', `Row ${Math.floor(i / 4) + 1}, column ${i % 4 + 1}: ${v ? symbols[v - 1] : 'empty'}${sudokuClues[i] ? ', fixed' : ''}`);
            }
            else {
                button.textContent = v ? '✦' : '·';
                button.classList.toggle('lit', v === 1);
                button.setAttribute('aria-label', `Lamp ${i + 1}, ${v ? 'lit' : 'dark'}`);
            }
            button.onclick = () => { const wasSolved = s.solved; act(this.place, s, i); this.render(i); this.save(); if (!wasSolved && s.solved) {
                this.sound.stop();
                this.sound.canticle();
                $('whisperRain').replaceChildren();
                $('puzzleStatus').textContent = 'The table answers.';
            } };
            board.append(button);
        });
        if (focusIndex !== undefined)
            board.querySelector(`[data-index="${focusIndex}"]`)?.focus({ preventScroll: true });
    }
    update(dt) { if (!this.isOpen || document.hidden)
        return; if (this.echo) {
        this.echoTime -= dt;
        const debt = this.world().manifestations.matthew;
        if (debt)
            debt.remaining = Math.min(debt.remaining, Math.max(0, this.echoTime));
        if (this.echoTime <= 0) {
            this.mergeEcho();
            this.echo = null;
            this.render();
        }
    } const s = this.current(); if (s.solved)
        return; s.elapsed += dt; this.nextWhisper -= dt; this.saveClock += dt; if (this.saveClock > 5) {
        this.save();
        this.saveClock = 0;
    } if (this.nextWhisper <= 0) {
        this.whisper();
        this.nextWhisper = whisperInterval(s.elapsed);
    } }
    whisper() { const s = this.current(), w = this.world(); const company = w.party.length ? w.party : ['john']; const id = company[s.whispers % company.length]; const person = witnesses.find(x => x.id === id); const line = discipleWhispers[id][Math.floor(s.whispers / company.length) % 3]; const n = s.whispers++; this.sound.rustle(n % 2 ? .65 : -.65); const stream = document.createElement('div'); stream.className = 'disciple-whisper'; stream.style.left = `${4 + (n * 29) % 55}%`; stream.style.setProperty('--drift', `${n % 2 ? 30 : -30}px`); stream.innerHTML = '<small></small><span></span>'; stream.querySelector('small').textContent = person.name.toUpperCase(); stream.querySelector('span').textContent = line; const rain = $('whisperRain'); rain.append(stream); while (rain.children.length > 4)
        rain.firstElementChild?.remove(); stream.addEventListener('animationend', () => stream.remove()); setTimeout(() => stream.remove(), 14000); if (this.reduced)
        stream.classList.add('still-whisper'); $('puzzleStatus').textContent = person.name + ' whispers: ' + line; }
}
