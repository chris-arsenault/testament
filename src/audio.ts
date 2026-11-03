import {WitnessAudio} from './witness-audio.js';
import {whoomp} from './resonance.js';
import {Score} from '../score.js';
import type {World,Event} from './world.js';
export class Sound {
 witnesses=new WitnessAudio();music=new Score();effects=new Score();lastStep=0;lastAmbient=0;
 start(){this.music.start();this.effects.start();this.music.setVolume(.45);this.effects.setVolume(.65);}
 update(w:World){if(this.music.filter)this.music.filter.frequency.setTargetAtTime(w.underworld>0?260:20000,this.music.ctx.currentTime,.3);const stage=w.place==='garden'?(w.angel>.3?3:6):w.place==='crypt'?4:w.place==='scriptorium'?5:w.place==='choir'?6:w.place==='water'?1:w.place==='stair'?w.turns%3:2;this.music.movement(stage);if(w.distance-this.lastStep>.95){this.lastStep=w.distance;this.effects.cue('step');}if(w.time-this.lastAmbient>11){this.lastAmbient=w.time;if(w.place==='garden')this.effects.tone(46+w.angel*50,4,.05);else if(w.place==='stair')this.effects.tone(92/(1+w.turns%3),3,.06);}}
 event(e:Event){if(e.kind==='witness'&&e.witness)this.witnesses.play(this.effects,e.witness);else if(e.kind==='cat-link')this.effects.cue('purr');else if(e.kind==='gaze-cue')whoomp(this.effects);else if(e.kind==='chthonic')whoomp(this.effects,true);else this.effects.cue(e.kind==='cat'?'purr':'seal');}
 pause(v:boolean){this.music.setPaused(v);this.effects.setPaused(v);}
}
