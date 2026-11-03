import test from 'node:test';import assert from 'node:assert/strict';
import {initial,select,separate,tick,walk,cross,destination,touchAngel,restore} from '../dist/app/world.js';
import {manifestation,witnessVisual,witnessEffects,catCopies,witnessBodyHeight} from '../dist/app/witnesses.js';
import {obstructed,groundAt,support} from '../dist/app/space.js';
import {witnesses} from '../dist/app/content.js';import {composeWitnessCue} from '../dist/app/witness-audio.js';
import {borrowedLedger} from '../dist/app/puzzle-phenomena.js';import {freshPuzzle,sudokuSolution,isSolved,act} from '../dist/app/puzzles.js';import {menuTongue} from '../dist/app/languages.js';
const run=(w,seconds,target='none',moving=false,id=w.place+':'+target)=>{for(let t=0;t<seconds-.001;t+=.05)tick(w,.05,{target,targetId:id,moving});};
function setup(id){const w=initial();select(w,[id]);w.z=3;
 if(['peter','philip'].includes(id)){w.x=10;w.z=0;}
 if(['andrew','matthew'].includes(id)){w.place='water';w.z=3;}
 if(id==='john'){w.place='garden';w.z=0;w.angel=1;}
 if(id==='jude')w.absence=1;if(id==='simon')w.place='crypt';if(id==='judas')separate(w,0);
 return w;
}
function observation(id,time){const moving=['andrew','bartholomew','alphaeus'].includes(id)&&time>5.4;
 const target=['peter','philip'].includes(id)&&time<3?'threshold':['thomas','bartholomew'].includes(id)&&time<5?'stone':id==='john'&&time<3?'angel':'none';
 return {target,targetId:'test:'+target,moving};
}
function awaken(id,preexisting=false){const w=setup(id);if(preexisting)Object.assign(w,{bridge:true,skin:true,stable:true,ceiling:true,passage:true,roots:true});
 const times={sound:null,visual:null,world:null};for(let i=0;i<200;i++){const before=w.events.length;tick(w,.05,observation(id,i*.05));const m=w.manifestations[id];if(times.sound===null&&w.events.slice(before).some(e=>e.kind==='witness'&&e.witness===id))times.sound=w.time;if(times.visual===null&&witnessVisual(w,id))times.visual=w.time;if(times.world===null&&manifestation(w,id))times.world=w.time;}
 return {w,times};
}
test('every disciple reaches sound, visual and world channels even after all common flags are set',()=>{
 for(const {id} of witnesses){const {w,times}=awaken(id,true);assert.ok(Object.values(times).every(t=>t!==null),id+JSON.stringify(times));assert.ok(new Set(Object.values(times).map(t=>Math.round(t*20))).size>=2,id+' should not fire every channel together');assert.equal(w.manifestations[id].count,1,id);}
});
test('channel order varies: John shows before sounding; Simon acts before the gong; Matthew acts before lifting the water',()=>{
 for(const id of ['john','simon','matthew']){const {times:t}=awaken(id);if(id==='john')assert.ok(t.visual<t.world&&t.world<t.sound);else assert.ok(t.world<t.visual);if(id==='simon')assert.ok(t.visual<t.sound);}
 const {times:p}=awaken('peter');assert.ok(p.sound<p.visual&&p.visual<p.world);
});
test('looking away and walking are real second triggers, not just delayed animation',()=>{
 const p=setup('philip');run(p,8,'threshold');assert.ok(witnessVisual(p,'philip'));assert.equal(manifestation(p,'philip'),undefined);run(p,.2);assert.ok(manifestation(p,'philip'));
 const b=setup('bartholomew');run(b,8,'stone');assert.equal(manifestation(b,'bartholomew'),undefined);run(b,.1,'none',true);assert.ok(manifestation(b,'bartholomew'));
});
test('Peter freezes crypt exits even when Thomas has already stabilized the nave',()=>{const w=setup('peter');w.stable=true;w.place='crypt';w.x=0;w.z=-10;run(w,4.5,'threshold');assert.ok(manifestation(w,'peter'));w.throne=false;assert.equal(destination(w,'front'),'nave');w.manifestations.peter.remaining=0;assert.equal(destination(w,'front'),'garden');});
test('Andrew carries the player and cat copies connect actual positions',()=>{const {w}=awaken('andrew',true);w.x=0;w.z=1;run(w,.5);assert.ok(w.z<.7);w.x=0;w.z=3;run(w,3.1,'cat',false,'water:cat-copy-0');const dest=catCopies(w)[3];assert.ok(Math.abs(w.x-dest.x)<.01);assert.ok(Math.abs(w.z-dest.z)<.01);assert.ok(w.events.some(e=>e.kind==='cat-link'));});
test('James lifts the body and eventually returns it to the supporting floor',()=>{const {w}=awaken('james',true);assert.ok(w.y>2);run(w,14);assert.equal(w.y,0);assert.equal(w.vy,0);});
test('John delays bodily angel contact; the angel can claim the player after protection ends',()=>{const {w}=awaken('john',true);w.z=-4.5;assert.equal(touchAngel(w),false);w.z=0;run(w,9);w.z=-4.5;assert.equal(touchAngel(w),true);});
test('Philip changes both routes and the remembered language of menu items',()=>{const {w}=awaken('philip',true);assert.equal(w.tongue,1);assert.equal(menuTongue(w.tongue).resume,'REVENIR');assert.equal(destination(w,'front'),'garden');const saved=restore(JSON.stringify(w));assert.equal(saved.tongue,1);assert.deepEqual(saved.manifestations,{});});
test('Bartholomew phases real columns and safely expels a body when stone returns',()=>{const {w}=awaken('bartholomew',true);assert.equal(obstructed(w,7,0),false);w.x=7;w.z=0;run(w,11);assert.equal(obstructed(w,7,0),true);assert.ok(Math.hypot(w.x-7,w.z)>=1.15);});
test('Matthew changes walking distance and lends a provably impossible, disposable ledger',()=>{const {w}=awaken('matthew',true);w.x=0;w.z=8;walk(w,1,0);assert.equal(w.x,.48);const real=freshPuzzle('water'),before=structuredClone(real),ghost=borrowedLedger(real);for(let i=0;i<16;i++)if(![0,3,5,6,9,10,12,15].includes(i))ghost.board[i]=sudokuSolution[i];assert.equal(ghost.board[0],ghost.board[3]);assert.equal(isSolved('water',ghost.board),false);for(let i=0;i<300;i++)act('water',ghost,i%16);assert.equal(ghost.board[3],ghost.board[0]);assert.deepEqual(real,before);});
test('Thomas makes a supporting ledge, including over the side of the staircase',()=>{const w=setup('thomas');w.place='stair';w.z=-5;w.y=support('stair',0,w.z);run(w,3,'threshold');run(w,2);const m=manifestation(w,'thomas');assert.ok(m);assert.ok(groundAt(w,1.9,m.z)>3);w.x=1.9;w.z=m.z;w.y=m.y;walk(w,.05,0);run(w,.2);assert.equal(w.y,m.y);});
test('Alphaeus changes clearance, and stays small until there is space to grow',()=>{const {w}=awaken('alphaeus',true);assert.equal(witnessBodyHeight(w),.68);w.place='stair';w.manifestations.alphaeus.place='stair';w.x=0;w.z=4.5;w.y=0;const m=w.manifestations.alphaeus;m.remaining=.05;run(w,.2);assert.equal(witnessBodyHeight(w),.68);walk(w,3,0);run(w,.3);assert.equal(witnessBodyHeight(w),1.7);});
test('Jude grows an actual obstacle with an open way around it',()=>{const {w}=awaken('jude',true);const m=manifestation(w,'jude');assert.ok(obstructed(w,m.x,m.z-2.5));assert.equal(obstructed(w,m.x,m.z+2.5),false);});
test('Simon reconnects doors to a room containing someone left behind',()=>{const w=setup('simon');select(w,['simon','peter']);w.place='water';separate(w,1);w.place='crypt';run(w,4);assert.equal(destination(w,'front'),'water');assert.equal(destination(w,'left'),'water');});
test('Judas makes the next exit reach his abandoned position and then releases it',()=>{const w=setup('judas');const spot=structuredClone(w.waitSpots.judas);run(w,5);assert.equal(destination(w,'front'),spot.place);w.cooldown=0;cross(w,'front');assert.equal(w.place,spot.place);assert.equal(w.x,spot.x);assert.equal(w.z,spot.z+2);assert.equal(w.yaw,Math.PI);assert.equal(w.manifestations.judas.remaining,0);});
test('pending responses cancel on leaving; a new episode can recur, but sustained gaze cannot spam cues',()=>{const w=setup('philip');run(w,3,'threshold');w.place='crypt';run(w,2);assert.equal(w.tongue,0);assert.equal(w.manifestations.philip.pending,false);const p=setup('peter');run(p,35,'threshold');assert.equal(p.events.filter(e=>e.kind==='witness').length,1);run(p,.5);run(p,5,'threshold');assert.equal(p.manifestations.peter.count,2);});
test('Judas can answer absence after a quick departure, instead of losing his pending response forever',()=>{const w=setup('judas');run(w,.3);w.place='garden';run(w,5);assert.ok(manifestation(w,'judas'));assert.equal(destination(w,'front'),'nave');});
test('reloading during altered clearance restores a safe supported body without corrupting the save',()=>{const b=setup('bartholomew');b.x=7;b.z=0;const rb=restore(JSON.stringify(b));assert.equal(obstructed(rb,rb.x,rb.z),false);const a=setup('alphaeus');a.place='stair';a.x=0;a.z=4.5;a.y=0;const ra=restore(JSON.stringify(a));assert.equal(ra.y,0);assert.equal(obstructed(ra,ra.x,ra.z),false);assert.deepEqual(ra.manifestations,{});});
test('all twelve original cues have distinct finite stereo signals with bounded peaks and no hard tail',()=>{const signatures=[];for(const {id} of witnesses){const a=composeWitnessCue(id,8000),b=composeWitnessCue(id,8000);let peak=0,energy=0;for(let i=0;i<a.left.length;i++){assert.ok(Number.isFinite(a.left[i])&&Number.isFinite(a.right[i]),id);peak=Math.max(peak,Math.abs(a.left[i]),Math.abs(a.right[i]));energy+=a.left[i]**2;}assert.ok(energy>1&&peak<.9,id);assert.ok(Math.abs(a.left.at(-1))<.002,id);assert.deepEqual(a,b,id);signatures.push(energy);}assert.equal(new Set(signatures).size,12);});
