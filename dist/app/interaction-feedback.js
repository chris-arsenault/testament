// Events may arrive together, but their captions must remain readable. Physical
// actions acknowledge immediately through the separate, short companion signal.
export class EventCaptions {
    pending = [];
    text = '';
    remaining = 0;
    offer(text) { text = text.trim(); if (!text || text === this.text || this.pending.includes(text))
        return; this.pending.push(text); if (this.pending.length > 4)
        this.pending.shift(); }
    update(dt) { this.remaining = Math.max(0, this.remaining - dt); if (this.remaining === 0) {
        this.text = this.pending.shift() || '';
        if (this.text)
            this.remaining = Math.max(4, Math.min(8, this.text.split(/\s+/).length * .32));
    } return this.text; }
    clear() { this.pending = []; this.text = ''; this.remaining = 0; }
}
export function soundDescription(e) {
    if (e.kind === 'cat' || e.kind === 'cat-link')
        return e.kind === 'cat-link' ? '[a purr in two places]' : '[a purr behind the stone]';
    if (e.kind === 'angel')
        return '[a thousand small lids opening]';
    if (e.kind === 'gaze-cue')
        return '[a low rush of air]';
    if (e.kind === 'chthonic')
        return '[stone resounds below]';
    if (e.kind === 'absence')
        return '[footsteps recede]';
    if (e.kind === 'rejoin')
        return '[a small answering chime]';
    if (e.kind === 'throne-refusal')
        return '[a dull knock in the stone]';
    return e.text ? '[the building answers, far below]' : '';
}
export class InteractionFeedback {
    signal;
    reticle;
    ready = false;
    remaining = 0;
    pulseTime = 0;
    constructor() { this.reticle = document.getElementById('reticle'); this.signal = document.createElement('div'); this.signal.id = 'companionSignal'; this.signal.setAttribute('role', 'status'); this.signal.setAttribute('aria-live', 'polite'); this.signal.setAttribute('aria-atomic', 'true'); document.body.append(this.signal); }
    target(ready) { this.ready = ready; this.reticle.classList.toggle('available', ready); }
    pulse(refused = false) { this.pulseTime = .42; this.reticle.classList.add('answered'); this.reticle.classList.toggle('refused', refused); }
    command(name, state) { this.signal.replaceChildren(); const label = document.createElement('strong'), status = document.createElement('span'); label.textContent = name; status.textContent = { home: 'HOMEWARD', called: 'BESIDE YOU', throne: 'UPON THE THRONE', refused: 'HE REMAINS' }[state]; this.signal.append(label, status); this.signal.classList.add('visible'); this.remaining = 2.8; this.pulse(state === 'refused'); }
    clear() { this.target(false); this.reticle.classList.remove('answered', 'refused'); this.signal.classList.remove('visible'); this.remaining = this.pulseTime = 0; }
    update(dt) { this.remaining = Math.max(0, this.remaining - dt); this.pulseTime = Math.max(0, this.pulseTime - dt); if (!this.remaining)
        this.signal.classList.remove('visible'); if (!this.pulseTime)
        this.reticle.classList.remove('answered', 'refused'); }
}
