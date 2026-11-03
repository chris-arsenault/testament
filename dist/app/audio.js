import { Score } from '../score.js';
export class Sound {
    music = new Score();
    effects = new Score();
    lastStep = 0;
    lastAmbient = 0;
    start() { this.music.start(); this.effects.start(); this.music.setVolume(.45); this.effects.setVolume(.65); }
    update(w) { const stage = w.place === 'garden' ? (w.angel > .3 ? 3 : 6) : w.place === 'crypt' ? 4 : w.place === 'water' ? 1 : w.place === 'stair' ? w.turns % 3 : 2; this.music.movement(stage); if (w.distance - this.lastStep > .95) {
        this.lastStep = w.distance;
        this.effects.cue('step');
    } if (w.time - this.lastAmbient > 11) {
        this.lastAmbient = w.time;
        if (w.place === 'garden')
            this.effects.tone(46 + w.angel * 50, 4, .05);
        else if (w.place === 'stair')
            this.effects.tone(92 / (1 + w.turns % 3), 3, .06);
    } }
    event(e) { this.effects.cue(e.kind === 'cat' ? 'purr' : 'seal'); }
    pause(v) { this.music.setPaused(v); this.effects.setPaused(v); }
}
