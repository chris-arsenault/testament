import { WitnessAudio } from './witness-audio.js';
import { whoomp } from './resonance.js';
import { Score } from '../score.js';
export class Sound {
    witnesses = new WitnessAudio();
    music = new Score();
    effects = new Score();
    lastStep = 0;
    lastAmbient = 0;
    lastAnswer = -10;
    lastSeal = -10;
    start() { this.music.start(); this.effects.start(); this.music.setVolume(.45); this.effects.setVolume(.65); }
    update(w) { if (this.music.filter)
        this.music.filter.frequency.setTargetAtTime(w.underworld > 0 ? 260 : 20000, this.music.ctx.currentTime, .3); const stage = w.place === 'garden' ? (w.angel > .3 ? 3 : 6) : w.place === 'crypt' ? 4 : w.place === 'scriptorium' ? 5 : w.place === 'choir' ? 6 : w.place === 'water' ? 1 : w.place === 'stair' ? w.turns % 3 : 2; this.music.movement(stage); if (w.distance < this.lastStep)
        this.lastStep = w.distance; if (w.time < this.lastAmbient)
        this.lastAmbient = w.time; if (w.distance - this.lastStep > .95) {
        this.lastStep = w.distance;
        this.effects.cue('step');
    } if (w.time - this.lastAmbient > 11) {
        this.lastAmbient = w.time;
        if (w.place === 'garden')
            this.effects.tone(46 + w.angel * 50, 4, .05);
        else if (w.place === 'stair')
            this.effects.tone(92 / (1 + w.turns % 3), 3, .06);
    } }
    response(kind) {
        const now = this.effects.ctx?.currentTime ?? 0;
        if (now - this.lastAnswer < .12)
            return;
        this.lastAnswer = now;
        if (kind === 'examine') {
            this.effects.tone(127.4, .12, .035, 'triangle');
            this.effects.tone(293.1, .22, .015);
        }
        else if (kind === 'home') {
            this.effects.tone(82.4, .38, .045, 'triangle');
            this.effects.tone(61.7, .65, .025);
        }
        else if (kind === 'called') {
            this.effects.tone(247.2, .65, .045);
            this.effects.tone(371.7, .82, .022);
        }
        else {
            this.effects.tone(49, .22, .06, 'triangle');
            this.effects.tone(73.1, .32, .025);
        }
    }
    event(e) { if (e.kind === 'witness' && e.witness)
        this.witnesses.play(this.effects, e.witness);
    else if (e.kind === 'cat-link' || e.kind === 'cat')
        this.effects.cue('purr');
    else if (e.kind === 'gaze-cue')
        whoomp(this.effects);
    else if (e.kind === 'chthonic')
        whoomp(this.effects, true);
    else if (e.kind === 'absence')
        this.response('home');
    else if (e.kind === 'rejoin')
        this.response('called');
    else if (e.kind === 'throne-refusal')
        this.response('refused');
    else {
        const now = this.effects.ctx?.currentTime ?? 0;
        if (now - this.lastSeal > .6) {
            this.lastSeal = now;
            this.effects.cue('seal');
        }
    } }
    pause(v, duckEffects = v) { this.music.setPaused(v); this.effects.setPaused(duckEffects); if (!v) {
        this.music.ctx?.resume()?.catch(() => { });
        this.effects.ctx?.resume()?.catch(() => { });
    } }
}
