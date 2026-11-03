import { EncounterUI } from './encounter-ui.js';
import { menuTongue } from './languages.js';
import { witnessEffects } from './witnesses.js';
import { interruptAttention } from './attention.js';
import { PuzzleUI } from './puzzle-ui.js';
import { captureMouse, lookDelta, volumeMix } from './look.js';
import { Narrator, roomRecords } from './narrative.js';
import { Cathedral } from './rendering.js';
import { Sound } from './audio.js';
import { initial, restore, tick, walk, separate, touchAngel, updateWaiting } from './world.js';
import { witnesses } from './content.js';
const $ = (id) => document.getElementById(id);
const canvas = $('world'), menu = $('menu');
let w = initial(), storage = true;
try {
    w = restore(localStorage.getItem('testament-cathedral-v2'));
}
catch {
    storage = false;
}
let renderer;
try {
    renderer = new Cathedral(canvas);
}
catch (e) {
    $('veil').innerHTML = '<h1>TESTAMENT</h1><p>This cathedral needs WebGL. Enable hardware acceleration and reopen this page.</p>';
    throw e;
}
const narrator = new Narrator();
let roomTime = 0, castTime = 0;
const audio = new Sound(), keys = new Set();
let active = false, started = false, last = performance.now(), saveTime = 0, captionTime = 0, drag = false, eventCount = 0, autoWalk = false, lastSpace = w.place, lastTurns = w.turns;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let volume = 65;
try {
    const stored = localStorage.getItem('testament-volume');
    if (stored !== null && Number.isFinite(Number(stored)))
        volume = Math.max(0, Math.min(100, Number(stored)));
}
catch { }
const volumeSlider = $('volume');
volumeSlider.value = String(volume);
function applyVolume() { const mix = volumeMix(volume); audio.music.setVolume(mix.music); audio.effects.setVolume(mix.effects); }
volumeSlider.oninput = () => { volume = Number(volumeSlider.value); applyVolume(); try {
    localStorage.setItem('testament-volume', String(volume));
}
catch { } };
document.body.classList.toggle('quiet', reduced);
let softLook = false;
function fallbackLook() { if (!active)
    return; softLook = true; canvas.style.cursor = 'none'; $('lookHint').textContent = 'MOUSE · LOOK WITHIN VIEW / ESC · RELEASE'; }
function capture() { if (active)
    captureMouse(canvas, () => fallbackLook()); }
function rotate(x, y) { const next = lookDelta(w.yaw, w.pitch, x, y); w.yaw = next.yaw; w.pitch = next.pitch; }
let wasLocked = false;
document.addEventListener('pointerlockchange', () => { const locked = document.pointerLockElement === canvas; canvas.classList.toggle('captured', locked); if (locked) {
    softLook = false;
    canvas.style.cursor = '';
} if (locked && !active) {
    document.exitPointerLock();
    return;
} if (wasLocked && !locked && active)
    pause(); wasLocked = locked; if (locked)
    $('lookHint').textContent = 'MOUSE · LOOK / ESC · RELEASE'; });
document.addEventListener('pointerlockerror', fallbackLook);
document.addEventListener('mousemove', e => { if (active && (document.pointerLockElement === canvas || (softLook && e.target === canvas)))
    rotate(e.movementX, e.movementY); });
function suspend() { active = false; interruptAttention(w); softLook = false; canvas.style.cursor = ''; keys.clear(); autoWalk = false; drag = false; if (document.pointerLockElement === canvas)
    document.exitPointerLock(); audio.pause(true); document.body.classList.remove('cinematic'); $('roomCard').classList.remove('visible'); $('narrator').classList.remove('speaking'); $('puzzleUse').classList.add('hidden'); }
function continueWorld(lock) { active = started; keys.clear(); audio.pause(false); last = performance.now(); if (lock)
    capture(); }
const puzzles = new PuzzleUI(() => w, audio.effects, suspend, continueWorld, reduced);
const encounters = new EncounterUI(() => w, save, suspend, continueWorld);
function interact(point) { if (!active)
    return false; const target = renderer.interaction(w, point); if (!target)
    return false; if (target.kind === 'witness')
    encounters.open(target.id);
else if (target.kind === 'puzzle')
    puzzles.open();
else
    touchAngel(w); return true; }
$('puzzleUse').onclick = () => interact();
function enterRoom() { const r = roomRecords[w.place]; $('roomTitle').textContent = r.title; $('roomDetail').textContent = r.detail; $('roomRecord').textContent = 'LOCATION RECORD / ' + r.record; $('roomKicker').textContent = w.place === 'stair' ? 'TAKE ' + String(w.turns + 1).padStart(2, '0') + ' / THE FIRST ASCENT' : 'FIELD RECORD / ' + String(w.returns + 1).padStart(2, '0') + ' / ARRIVAL NOT CONFIRMED'; roomTime = 5.2; castTime = 0; narrator.enter(w); }
function cast(role, name, detail) { $('castRole').textContent = role; $('castName').textContent = name; $('castDetail').textContent = detail; castTime = 7; }
function save() { try {
    localStorage.setItem('testament-cathedral-v2', JSON.stringify({ ...w, events: [] }));
}
catch {
    storage = false;
} $('storageNote').textContent = storage ? '' : 'This browser cannot keep your place after closing.'; }
function language() { const t = menuTongue(w.tongue); $('menuHeading').textContent = t.heading; $('resume').textContent = t.resume; $('home').textContent = t.home; $('new').textContent = resetArmed ? t.confirm : t.forget; document.getElementById('menuHeading').lang = ['en', 'fr', 'pt'][w.tongue]; }
function pause() { if (menu.open || puzzles.isOpen || encounters.isOpen)
    return; active = false; interruptAttention(w); softLook = false; canvas.style.cursor = ''; if (document.pointerLockElement === canvas)
    document.exitPointerLock(); autoWalk = false; keys.clear(); drag = false; audio.pause(true); language(); menu.showModal(); menu.tabIndex = -1; menu.focus(); menu.scrollTop = 0; save(); }
function resume(lock = true) { menu.close(); active = started; audio.pause(false); keys.clear(); last = performance.now(); if (lock)
    capture(); }
$('enter').onclick = () => { started = true; active = true; capture(); $('veil').classList.add('hidden'); audio.start(); applyVolume(); enterRoom(); captionTime = 0; $('caption').textContent = ''; };
$('menuButton').onclick = pause;
$('resume').onclick = () => resume();
menu.addEventListener('cancel', e => { e.preventDefault(); resume(false); });
$('home').onclick = () => { w.place = 'nave'; w.x = 0; w.y = 0; w.vy = 0; w.z = 12; w.yaw = 0; interruptAttention(w); w.pitch = 0; w.cooldown = 2; save(); resume(); };
let resetArmed = false;
$('new').onclick = () => { if (!resetArmed) {
    resetArmed = true;
    $('new').textContent = menuTongue(w.tongue).confirm;
    return;
} w = initial(); puzzles.reset(); resetArmed = false; $('new').textContent = menuTongue(w.tongue).forget; save(); language(); resume(); };
addEventListener('keydown', e => { if (puzzles.isOpen || encounters.isOpen)
    return; if ((e.code === 'Escape' || e.key === 'Escape') && !menu.open) {
    e.preventDefault();
    e.stopPropagation();
    pause();
    return;
} if (!active || e.target instanceof HTMLInputElement)
    return; if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
    e.preventDefault();
    keys.add(e.code);
} if (!e.repeat && e.code === 'KeyR')
    autoWalk = !autoWalk; if (!e.repeat && ['Digit1', 'Digit2', 'Digit3'].includes(e.code))
    separate(w, Number(e.code.slice(-1)) - 1); });
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => { if (active)
    pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && active)
    pause(); });
canvas.onpointerleave = () => { if (softLook) {
    softLook = false;
    canvas.style.cursor = '';
    $('lookHint').textContent = 'CLICK TO LOOK · ARROWS TO LOOK';
} };
let touchTravel = 0;
canvas.onpointerdown = e => { if (!active || e.button !== 0)
    return; if (e.pointerType === 'mouse') {
    if (!interact())
        capture();
    return;
} drag = true; touchTravel = 0; canvas.setPointerCapture(e.pointerId); };
canvas.onpointerup = e => { if (drag && active && touchTravel < 9) {
    const rect = canvas.getBoundingClientRect();
    interact({ x: (e.clientX - rect.left) / rect.width * 2 - 1, y: 1 - (e.clientY - rect.top) / rect.height * 2 });
} drag = false; };
canvas.onpointercancel = () => drag = false;
canvas.onpointermove = e => { if (e.pointerType !== 'mouse' && drag && active) {
    touchTravel += Math.hypot(e.movementX, e.movementY);
    rotate(e.movementX, e.movementY);
} };
document.querySelectorAll('[data-key]').forEach(b => { b.onpointerdown = e => { e.preventDefault(); keys.add(b.dataset.key); b.setPointerCapture(e.pointerId); }; b.onpointerup = b.onpointercancel = () => keys.delete(b.dataset.key); });
document.querySelectorAll('[data-companion]').forEach(b => b.onclick = () => { if (active)
    separate(w, Number(b.dataset.companion)); });
let hoverTime = 0;
function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    puzzles.update(dt);
    if ((puzzles.isOpen || encounters.isOpen) && !document.hidden)
        updateWaiting(w, dt);
    hoverTime -= dt;
    if (hoverTime <= 0) {
        hoverTime = .15;
        const target = active ? renderer.interaction(w) : null;
        $('puzzleUse').classList.toggle('hidden', !target);
        if (target)
            $('puzzleUse').textContent = target.kind === 'witness' ? witnesses.find(p => p.id === target.id).name : target.kind === 'puzzle' ? 'THE TABLE' : 'THE MANY-EYED';
    }
    if (active) {
        let forward = (keys.has('KeyW') || autoWalk ? 1 : 0) - (keys.has('KeyS') ? 1 : 0), side = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
        const length = Math.hypot(forward, side) || 1;
        forward /= length;
        side /= length;
        w.yaw += ((keys.has('ArrowLeft') ? 1 : 0) - (keys.has('ArrowRight') ? 1 : 0)) * dt * 1.5;
        w.pitch = Math.max(-1.2, Math.min(1.2, w.pitch + ((keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0)) * dt));
        walk(w, (-Math.sin(w.yaw) * forward + Math.cos(w.yaw) * side) * dt * 3.5, (-Math.cos(w.yaw) * forward - Math.sin(w.yaw) * side) * dt * 3.5);
        tick(w, dt, { moving: !!(forward || side), ...renderer.target(w) });
        audio.update(w);
        if (w.events.length) {
            const e = w.events.shift();
            audio.event(e);
            if (e.text) {
                narrator.event(e);
                if (e.kind === 'cat')
                    cast('STARRING', 'EVE', 'AS HERSELF / BEFORE HERSELF');
                if (e.kind === 'angel')
                    cast('SPECIAL APPEARANCE', 'THE MANY-EYED', 'NO RECORD OF ARRIVAL');
                $('caption').textContent = e.text;
                captionTime = 8;
                eventCount++;
                $('soundCaption').textContent = e.kind === 'cat' ? '[a purr behind the stone]' : e.kind === 'angel' ? '[a thousand small lids opening]' : '[the building answers, far below]';
            }
            else if (e.kind === 'witness' && e.witness) {
                $('soundCaption').textContent = '[' + witnessEffects[e.witness].sound + ']';
                captionTime = Math.max(captionTime, 4);
            }
            else if (e.kind === 'cat-link') {
                captionTime = Math.max(captionTime, 3);
                $('soundCaption').textContent = '[a purr in two places]';
            }
            else if (e.kind === 'gaze-cue')
                $('soundCaption').textContent = '[a low rush of air]';
            else if (e.kind === 'chthonic')
                $('soundCaption').textContent = '[stone resounds below]';
        }
        captionTime -= dt;
        if (captionTime <= 0) {
            $('caption').textContent = '';
            $('soundCaption').textContent = '';
        }
        if (w.place === 'crypt' && Math.hypot(w.x + 4, w.z + 6) < 2 && captionTime <= 0) {
            $('caption').textContent = `To ${witnesses[w.letter].name}: I have kept your place at the table.`;
            captionTime = 6;
        }
        roomTime = Math.max(0, roomTime - dt);
        castTime = Math.max(0, castTime - dt);
        const verse = narrator.update(dt, true);
        $('narrator').classList.toggle('speaking', !!verse);
        $('narrator').setAttribute('aria-hidden', String(!verse));
        if (verse) {
            $('verseText').textContent = '“' + verse.text + '”';
            $('verseReference').textContent = verse.reference;
        }
        else {
            $('verseText').textContent = '';
            $('verseReference').textContent = '';
        }
        document.body.classList.toggle('cinematic', roomTime > 0);
        $('roomCard').classList.toggle('visible', roomTime > 0);
        $('roomCard').setAttribute('aria-hidden', String(roomTime <= 0));
        $('castCard').classList.toggle('visible', castTime > 0 && roomTime === 0);
        $('castCard').setAttribute('aria-hidden', String(!(castTime > 0 && roomTime === 0)));
        saveTime += dt;
        if (saveTime > 4) {
            save();
            saveTime = 0;
        }
    }
    if (w.place !== lastSpace || w.turns !== lastTurns) {
        $('blink').classList.add('closed');
        setTimeout(() => $('blink').classList.remove('closed'), 60);
        lastSpace = w.place;
        lastTurns = w.turns;
        if (started)
            enterRoom();
    }
    $('location').textContent = roomRecords[w.place].title;
    renderer.draw(w, active ? dt : 0, reduced);
    renderer.table.material.emissiveIntensity = puzzles.states[w.place].solved ? .05 : .6;
}
requestAnimationFrame(frame);
addEventListener('pagehide', () => { save(); puzzles.save(); });
