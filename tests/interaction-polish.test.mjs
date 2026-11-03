import test from 'node:test';
import assert from 'node:assert/strict';
import {LookContact,captureMouse} from '../dist/app/look.js';
import {EventCaptions,soundDescription} from '../dist/app/interaction-feedback.js';
import {EncounterUI} from '../dist/app/encounter-ui.js';
import {Sound} from '../dist/app/audio.js';
import {initial,separate} from '../dist/app/world.js';

test('touch look uses client deltas, ignores a second finger, and cannot turn a drag into an interaction',()=>{
 const contact=new LookContact();assert.equal(contact.begin(41,100,120),true);
 assert.equal(contact.begin(42,900,800),false);assert.equal(contact.move(42,901,803),null);
 assert.deepEqual(contact.move(41,112,116),{x:12,y:-4});assert.equal(contact.end(42),null);
 assert.deepEqual(contact.end(41),{tap:false});assert.equal(contact.move(41,120,116),null);
 assert.ok(contact.begin(43,100,120));contact.move(43,102,121);assert.deepEqual(contact.end(43),{tap:true});
 contact.begin(44,1,1);contact.cancel();assert.equal(contact.end(44),null);assert.ok(contact.begin(45,1,1));
});

test('a real mouse gesture on a touch-primary hybrid can still capture the mouse',()=>{
 const original=globalThis.matchMedia;globalThis.matchMedia=()=>({matches:false});let requested=0;
 try{const canvas={requestPointerLock(){requested++;}};captureMouse(canvas,()=>{});assert.equal(requested,0);captureMouse(canvas,()=>{},true);assert.equal(requested,1);}
 finally{globalThis.matchMedia=original;}
});

test('captions from a burst remain readable, deduplicate, and never grow without a bound',()=>{
 const captions=new EventCaptions();captions.offer('One set of footsteps stays behind.');assert.equal(captions.update(.016),'One set of footsteps stays behind.');
 captions.offer('One set of footsteps stays behind.');captions.offer('The room is larger without you.');captions.offer('The room is larger without you.');
 for(let i=0;i<180;i++)assert.equal(captions.update(1/60),'One set of footsteps stays behind.');
 assert.equal(captions.pending.length,1);assert.equal(captions.update(1.1),'The room is larger without you.');
 for(let i=0;i<20;i++)captions.offer('Echo '+i);assert.equal(captions.pending.length,4);
 captions.clear();assert.equal(captions.update(.1),'');assert.equal(captions.pending.length,0);
});

test('nonverbal gaze and angel events still have durable sound descriptions',()=>{
 assert.equal(soundDescription({kind:'gaze-cue',text:''}),'[a low rush of air]');
 assert.equal(soundDescription({kind:'chthonic',text:''}),'[stone resounds below]');
 assert.notEqual(soundDescription({kind:'absence',text:''}),soundDescription({kind:'rejoin',text:''}));
});

test('physical interaction responses differ, preserve the shared gain channel, and suppress rapid duplicates',()=>{
 const sound=new Sound(),tones=[],cues=[];sound.effects={ctx:{currentTime:10},tone:(...args)=>tones.push(args),cue:name=>cues.push(name)};
 const profiles=[];for(const kind of ['examine','home','called','refused']){sound.effects.ctx.currentTime++;const before=tones.length;sound.response(kind);profiles.push(JSON.stringify(tones.slice(before)));}
 assert.equal(new Set(profiles).size,4);const before=tones.length;sound.response('refused');assert.equal(tones.length,before);
 sound.effects.ctx.currentTime++;sound.event({kind:'rejoin',text:''});assert.equal(tones.length,before+2);
 sound.effects.ctx.currentTime++;sound.event({kind:'return',text:'A room'});sound.event({kind:'roots',text:'A root'});assert.deepEqual(cues,['seal']);
});

test('puzzle overlays may duck music while their effects retain the selected master volume',()=>{
 const sound=new Sound(),paused=[];sound.music={setPaused:value=>paused.push(['music',value])};sound.effects={setPaused:value=>paused.push(['effects',value])};
 sound.pause(true,false);assert.deepEqual(paused,[['music',true],['effects',false]]);
 paused.length=0;sound.pause(true);assert.deepEqual(paused,[['music',true],['effects',true]]);
});

class Element {
 children=[];listeners={};open=false;disabled=false;textContent='';focused=false;
 replaceChildren(){this.children=[];}
 append(...children){this.children.push(...children);}
 addEventListener(name,fn){this.listeners[name]=fn;}
 showModal(){this.open=true;}
 close(){this.open=false;}
 focus(){this.focused=true;}
}
test('recruitment respects throne claims, updates the party, and emits feedback only after the modal resumes',()=>{
 const ids=['encounter','encounterLeave','encounterName','encounterBody','encounterLine','encounterChoices'],elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
 const original=globalThis.document;globalThis.document={getElementById:id=>elements[id],createElement:()=>new Element()};
 try{
  const w=initial();w.place='crypt';separate(w,1);const calls=[];
  const encounter=new EncounterUI(()=>w,()=>calls.push('saved'),()=>calls.push('suspended'),capture=>calls.push(capture?'resumed':'paused'),id=>calls.push('feedback:'+id));
  encounter.open('john');assert.ok(encounter.isOpen);assert.ok(elements.encounterName.focused);
  const choices=elements.encounterChoices.children;assert.equal(choices.length,3);assert.equal(choices[1].disabled,true);assert.match(choices[1].textContent,/throne/);
  choices[0].onclick();assert.deepEqual(w.party,['john','peter','judas']);assert.equal(encounter.isOpen,false);
  assert.deepEqual(calls,['suspended','saved','resumed','feedback:john']);encounter.close(true);assert.equal(calls.length,4);
  encounter.open('andrew');let prevented=false;elements.encounter.listeners.cancel({preventDefault(){prevented=true;}});assert.ok(prevented);assert.equal(calls.at(-1),'paused');assert.equal(encounter.isOpen,false);
 }finally{globalThis.document=original;}
});
