import { EncounterUI } from './encounter-ui.js';
import { FramePacer } from './runtime.js';
import { EventCaptions, InteractionFeedback, soundDescription } from './interaction-feedback.js';
import { menuTongue } from './languages.js';
import { witnessEffects } from './witnesses.js';
import { interruptAttention } from './attention.js';
import { PuzzleUI } from './puzzle-ui.js';
import { captureMouse, lookDelta, volumeMix, LookContact } from './look.js';
import { Narrator, roomRecords } from './narrative.js';
import { Cathedral } from './rendering.js';
import { Sound } from './audio.js';
import { initial, restore, tick, walk, separate, touchAngel, updateWaiting, returnToEntrance } from './world.js';
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
const audio = new Sound(), keys = new Set(), contact = new LookContact(), captions = new EventCaptions(), feedback = new InteractionFeedback();
let active = false, started = false, last = performance.now(), saveTime = 0, soundTime = 0, autoWalk = false, lastSpace = w.place, lastTurns = w.turns, lastLetterRead = '';
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)'), pacer = new FramePacer();
let reduced = motionPreference.matches, graphicsLost = false;
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
function capture(mouseGesture = false) { if (active)
    captureMouse(canvas, () => fallbackLook(), mouseGesture); }
function rotate(x, y) { const next = lookDelta(w.yaw, w.pitch, x, y); w.yaw = next.yaw; w.pitch = next.pitch; }
let wasLocked = false, releasePending = false;
function releaseMouse() { if (document.pointerLockElement === canvas) {
    releasePending = true;
    document.exitPointerLock();
} }
document.addEventListener('pointerlockchange', () => { const locked = document.pointerLockElement === canvas; canvas.classList.toggle('captured', locked); if (locked) {
    softLook = false;
    canvas.style.cursor = '';
} if (locked && !active) {
    releaseMouse();
    return;
} const intentional = releasePending && !locked; if (!locked)
    releasePending = false; if (wasLocked && !locked && active && !intentional)
    pause(); wasLocked = locked; $('lookHint').textContent = locked ? 'MOUSE · LOOK / ESC · RELEASE' : 'CLICK TO CAPTURE MOUSE · ARROWS TO LOOK'; });
document.addEventListener('pointerlockerror', fallbackLook);
document.addEventListener('mousemove', e => { if (active && (document.pointerLockElement === canvas || (softLook && e.target === canvas)))
    rotate(e.movementX, e.movementY); });
function suspend(duckEffects = true) { active = false; interruptAttention(w); softLook = false; canvas.style.cursor = ''; keys.clear(); autoWalk = false; contact.cancel(); releaseMouse(); audio.pause(true, duckEffects); feedback.clear(); document.body.classList.add('in-overlay'); document.body.classList.remove('cinematic'); $('roomCard').classList.remove('visible'); $('narrator').classList.remove('speaking'); $('castCard').classList.remove('visible'); $('puzzleUse').classList.add('hidden'); }
function continueWorld(lock) { if (!lock) {
    pause();
    return;
} if (graphicsLost)
    return; active = started; keys.clear(); audio.pause(false); document.body.classList.remove('in-overlay'); clearGraphicsNotice(); pacer.invalidate(); last = performance.now(); if (active)
    canvas.focus({ preventScroll: true }); capture(); }
const puzzles = new PuzzleUI(() => w, audio.effects, () => suspend(false), continueWorld, reduced);
const encounters = new EncounterUI(() => w, save, suspend, continueWorld, id => feedback.command(witnesses.find(p => p.id === id).name, 'called'));
motionPreference.addEventListener('change', e => { reduced = e.matches; document.body.classList.toggle('quiet', reduced); puzzles.setReduced(reduced); pacer.invalidate(); });
addEventListener('resize', () => pacer.invalidate());
function clearGraphicsNotice() { for (const id of ['graphicsStatus', 'entryGraphicsStatus'])
    $(id).textContent = ''; for (const id of ['graphicsReload', 'entryGraphicsReload'])
    $(id).classList.add('hidden'); }
canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); graphicsLost = true; audio.visibility(true); if (puzzles.isOpen)
    puzzles.close(false);
else if (encounters.isOpen)
    encounters.close(false);
else if (started)
    pause(); keys.clear(); autoWalk = false; save(); puzzles.save(); for (const id of ['graphicsStatus', 'entryGraphicsStatus'])
    $(id).textContent = 'The graphics connection was interrupted. Waiting for the image to return.'; for (const id of ['enter', 'resume', 'home', 'new'])
    $(id).disabled = true; for (const id of ['graphicsReload', 'entryGraphicsReload'])
    $(id).classList.remove('hidden'); });
canvas.addEventListener('webglcontextrestored', () => { graphicsLost = false; pacer.invalidate(); last = performance.now(); audio.visibility(document.hidden); for (const id of ['graphicsStatus', 'entryGraphicsStatus'])
    $(id).textContent = 'The image has returned.'; for (const id of ['enter', 'resume', 'home', 'new'])
    $(id).disabled = false; for (const id of ['graphicsReload', 'entryGraphicsReload'])
    $(id).classList.add('hidden'); });
for (const id of ['graphicsReload', 'entryGraphicsReload'])
    $(id).onclick = () => { save(); puzzles.save(); location.reload(); };
function interact(point) { if (!active)
    return false; const target = renderer.interaction(w, point); if (!target)
    return false; if (target.kind === 'witness') {
    audio.response('examine');
    encounters.open(target.id);
}
else if (target.kind === 'puzzle') {
    audio.response('examine');
    puzzles.open();
}
else {
    const answered = touchAngel(w);
    feedback.pulse(!answered);
    if (!answered)
        audio.response('refused');
} return true; }
function command(index) { if (!active)
    return; const id = w.party[index]; if (!id)
    return; const returning = w.left.includes(id), accepted = separate(w, index); feedback.command(witnesses.find(p => p.id === id).name, !accepted ? 'refused' : returning ? 'called' : w.waitSpots[id]?.enthroned ? 'throne' : 'home'); if (!accepted)
    audio.response('refused'); save(); }
$('puzzleUse').onclick = () => interact();
function enterRoom() { captions.clear(); soundTime = 0; lastLetterRead = ''; $('caption').textContent = ''; $('soundCaption').textContent = ''; const r = roomRecords[w.place]; $('roomTitle').textContent = r.title; $('roomDetail').textContent = r.detail; $('roomRecord').textContent = 'LOCATION RECORD / ' + r.record; $('roomKicker').textContent = w.place === 'stair' ? 'TAKE ' + String(w.turns + 1).padStart(2, '0') + ' / THE FIRST ASCENT' : 'FIELD RECORD / ' + String(w.returns + 1).padStart(2, '0') + ' / ARRIVAL NOT CONFIRMED'; roomTime = 5.2; castTime = 0; narrator.enter(w); }
function detectArrival() { if (w.place === lastSpace && w.turns === lastTurns)
    return; $('blink').classList.add('closed'); setTimeout(() => $('blink').classList.remove('closed'), 60); lastSpace = w.place; lastTurns = w.turns; feedback.target(false); $('puzzleUse').classList.add('hidden'); hoverTime = 0; if (started)
    enterRoom(); }
function cast(role, name, detail) { $('castRole').textContent = role; $('castName').textContent = name; $('castDetail').textContent = detail; castTime = 7; }
function save() { try {
    localStorage.setItem('testament-cathedral-v2', JSON.stringify({ ...w, events: [] }));
}
catch {
    storage = false;
} $('storageNote').textContent = storage ? '' : 'This browser cannot keep your place after closing.'; }
function language() { const t = menuTongue(w.tongue); $('menuHeading').textContent = t.heading; $('resume').textContent = t.resume; $('home').textContent = t.home; $('new').textContent = resetArmed ? t.confirm : t.forget; document.getElementById('menuHeading').lang = ['en', 'fr', 'pt'][w.tongue]; }
function pause() { if (menu.open || puzzles.isOpen || encounters.isOpen)
    return; suspend(); language(); menu.showModal(); menu.tabIndex = -1; menu.focus(); menu.scrollTop = 0; save(); }
function resume() { if (graphicsLost)
    return; menu.close(); resetArmed = false; continueWorld(true); }
$('enter').onclick = () => { if (graphicsLost)
    return; started = true; active = true; canvas.focus({ preventScroll: true }); capture(); $('veil').classList.add('hidden'); document.body.classList.remove('in-overlay'); clearGraphicsNotice(); pacer.invalidate(); audio.start(); applyVolume(); enterRoom(); };
$('menuButton').onclick = pause;
$('resume').onclick = () => resume();
menu.addEventListener('cancel', e => e.preventDefault());
$('home').onclick = () => { if (graphicsLost)
    return; returnToEntrance(w); save(); resume(); };
let resetArmed = false;
$('new').onclick = () => { if (!resetArmed) {
    resetArmed = true;
    $('new').textContent = menuTongue(w.tongue).confirm;
    return;
} w = initial(); puzzles.reset(); captions.clear(); lastLetterRead = ''; resetArmed = false; $('new').textContent = menuTongue(w.tongue).forget; save(); language(); resume(); };
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
    command(Number(e.code.slice(-1)) - 1); });
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => { if (active)
    pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) {
    if (active)
        pause();
    save();
    puzzles.save();
} audio.visibility(document.hidden || graphicsLost); last = performance.now(); pacer.invalidate(); });
canvas.onpointerleave = () => { if (softLook) {
    softLook = false;
    canvas.style.cursor = '';
    $('lookHint').textContent = 'CLICK TO LOOK · ARROWS TO LOOK';
} };
canvas.onpointerdown = e => { if (!active || e.button !== 0)
    return; if (e.pointerType === 'mouse') {
    if (document.pointerLockElement !== canvas && !softLook) {
        capture(true);
        return;
    }
    if (!interact())
        capture(true);
    return;
} if (contact.begin(e.pointerId, e.clientX, e.clientY))
    canvas.setPointerCapture(e.pointerId); };
canvas.onpointerup = e => { contact.move(e.pointerId, e.clientX, e.clientY); const result = contact.end(e.pointerId); if (result?.tap && active) {
    const rect = canvas.getBoundingClientRect();
    interact({ x: (e.clientX - rect.left) / rect.width * 2 - 1, y: 1 - (e.clientY - rect.top) / rect.height * 2 });
} if (canvas.hasPointerCapture(e.pointerId))
    canvas.releasePointerCapture(e.pointerId); };
canvas.onpointercancel = e => { contact.end(e.pointerId); };
canvas.onlostpointercapture = e => { contact.end(e.pointerId); };
canvas.onpointermove = e => { if (e.pointerType !== 'mouse' && active) {
    const delta = contact.move(e.pointerId, e.clientX, e.clientY);
    if (delta)
        rotate(delta.x, delta.y);
} };
document.querySelectorAll('[data-key]').forEach(b => { b.onpointerdown = e => { e.preventDefault(); if (!active)
    return; keys.add(b.dataset.key); b.setPointerCapture(e.pointerId); }; b.onpointerup = b.onpointercancel = b.onlostpointercapture = () => keys.delete(b.dataset.key); });
document.querySelectorAll('[data-companion]').forEach(b => b.onclick = () => command(Number(b.dataset.companion)));
let hoverTime = 0;
function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden || graphicsLost) {
        last = now;
        return;
    }
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    puzzles.update(dt);
    feedback.update(dt);
    if ((puzzles.isOpen || encounters.isOpen) && !document.hidden)
        updateWaiting(w, dt);
    if (active) {
        let forward = (keys.has('KeyW') || autoWalk ? 1 : 0) - (keys.has('KeyS') ? 1 : 0), side = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
        const length = Math.hypot(forward, side) || 1;
        forward /= length;
        side /= length;
        w.yaw += ((keys.has('ArrowLeft') ? 1 : 0) - (keys.has('ArrowRight') ? 1 : 0)) * dt * 1.5;
        w.pitch = Math.max(-1.2, Math.min(1.2, w.pitch + ((keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0)) * dt));
        walk(w, (-Math.sin(w.yaw) * forward + Math.cos(w.yaw) * side) * dt * 3.5, (-Math.cos(w.yaw) * forward - Math.sin(w.yaw) * side) * dt * 3.5);
        tick(w, dt, { moving: !!(forward || side), ...renderer.target(w) });
        detectArrival();
        audio.update(w);
        for (const e of w.events.splice(0)) {
            audio.event(e);
            if (e.text) {
                narrator.event(e);
                captions.offer(e.text);
                if (e.kind === 'cat')
                    cast('STARRING', 'EVE', 'AS HERSELF / BEFORE HERSELF');
                if (e.kind === 'angel')
                    cast('SPECIAL APPEARANCE', 'THE MANY-EYED', 'NO RECORD OF ARRIVAL');
            }
            const description = e.kind === 'witness' && e.witness ? '[' + witnessEffects[e.witness].sound + ']' : soundDescription(e);
            if (description) {
                $('soundCaption').textContent = description;
                soundTime = 3.5;
            }
        }
        $('caption').textContent = captions.update(dt);
        soundTime = Math.max(0, soundTime - dt);
        if (soundTime === 0)
            $('soundCaption').textContent = '';
        if (w.place === 'crypt' && Math.hypot(w.x + 4, w.z + 6) < 2) {
            const letter = String(w.letter);
            if (lastLetterRead !== letter) {
                captions.offer(`To ${witnesses[w.letter].name}: I have kept your place at the table.`);
                lastLetterRead = letter;
            }
        }
        else
            lastLetterRead = '';
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
    detectArrival();
    $('location').textContent = roomRecords[w.place].title;
    renderer.table.material.emissiveIntensity = puzzles.states[w.place].solved ? .05 : .6;
    if (pacer.draw(now, active, document.hidden, graphicsLost))
        renderer.draw(w, active ? dt : 0, reduced);
    // Hit testing follows movement and the rendered camera, never the previous frame.
    hoverTime -= dt;
    if (hoverTime <= 0) {
        hoverTime = .1;
        const target = active ? renderer.interaction(w) : null;
        feedback.target(!!target);
        $('puzzleUse').classList.toggle('hidden', !target);
        if (target)
            $('puzzleUse').textContent = target.kind === 'witness' ? witnesses.find(p => p.id === target.id).name : target.kind === 'puzzle' ? 'THE TABLE' : 'THE MANY-EYED';
        document.querySelectorAll('[data-companion]').forEach(b => { const id = w.party[Number(b.dataset.companion)], person = witnesses.find(p => p.id === id); b.disabled = !id; b.setAttribute('aria-pressed', String(!!id && w.left.includes(id))); b.setAttribute('aria-label', person ? person.name : 'No companion'); });
    }
}
requestAnimationFrame(frame);
addEventListener('pagehide', () => { save(); puzzles.save(); });
