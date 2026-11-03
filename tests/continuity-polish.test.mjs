import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,select,tick,walk,cross,separate,restore,returnToEntrance,touchAngel} from '../dist/app/world.js';
import {groundAt,obstructed,overheadAt} from '../dist/app/space.js';
import {witnessBodyHeight} from '../dist/app/witnesses.js';
import {rooms,insideRoom} from '../dist/app/rooms.js';

function manifestation(place,extra={}){return {place,x:0,y:0,z:0,remaining:100,visual:100,cooldown:100,charge:0,latched:true,count:1,age:1,pending:false,sounded:true,shown:true,acted:true,...extra};}

test('Find the entrance clears transient descent and motion while preserving world and companion history',()=>{
 const w=initial();w.place='crypt';separate(w,1);const claims=structuredClone(w.waitSpots),party=[...w.party],left=[...w.left];
 Object.assign(w,{place:'garden',x:0,z:-8,y:4,vy:5,pitch:1,yaw:2,underworld:7,angelInside:true,angelCooldown:12,still:18,catPhase:2,catTimer:2,turns:4,memory:6,buried:true,tongue:2,attention:3,gazeFired:true,anchored:true});w.seen=['division','bones'];w.manifestations.james=manifestation('garden');w.events.push({kind:'chthonic',text:''});
 returnToEntrance(w);assert.equal(w.place,'nave');assert.equal(w.x,rooms.nave.spawn.x);assert.equal(w.z,rooms.nave.spawn.z);assert.equal(w.y,0);assert.equal(w.vy,0);assert.equal(w.underworld,0);assert.equal(w.angelInside,false);assert.equal(w.angelCooldown,0);assert.equal(w.pitch,0);assert.equal(w.yaw,0);assert.equal(w.still,0);assert.equal(w.attention,0);assert.equal(w.gazeFired,false);assert.equal(w.anchored,false);assert.deepEqual(w.manifestations,{});assert.deepEqual(w.events,[]);
 assert.deepEqual(w.waitSpots,claims);assert.deepEqual(w.party,party);assert.deepEqual(w.left,left);assert.equal(w.turns,4);assert.equal(w.memory,6);assert.equal(w.buried,true);assert.equal(w.tongue,2);assert.deepEqual(w.seen,['division','bones']);assert.equal(w.catPhase,0);assert.equal(w.catTimer,0);
 w.catPhase=3;returnToEntrance(w);assert.equal(w.catPhase,3);
});

test('leaving during angel descent arrives above the next floor and keeps the encounter memory',()=>{
 const w=initial();select(w,[]);Object.assign(w,{place:'garden',x:0,z:-8,angel:1});assert.ok(touchAngel(w));const memory=w.memory;w.cooldown=0;assert.ok(cross(w,'right'));
 assert.equal(w.place,'scriptorium');assert.equal(w.underworld,0);assert.equal(w.angelInside,false);assert.equal(w.angelCooldown,0);assert.equal(w.y,groundAt(w,w.x,w.z));assert.equal(obstructed(w,w.x,w.z),false);assert.equal(w.buried,true);assert.equal(w.memory,memory);
});

test('a denied threshold does not interrupt the current encounter',()=>{
 const w=initial();Object.assign(w,{place:'garden',underworld:7,angelInside:true,angelCooldown:9,cooldown:1});assert.equal(cross(w,'left'),false);assert.equal(w.place,'garden');assert.equal(w.underworld,7);assert.equal(w.angelCooldown,9);
});

test('James still lifts the player but cannot push their head through staircase slabs',()=>{
 const w=initial();select(w,['james']);Object.assign(w,{place:'stair',x:0,z:0});let highest=0;
 for(let i=0;i<260;i++){tick(w,.05,{moving:false,target:'none'});highest=Math.max(highest,w.y);assert.equal(obstructed(w,w.x,w.z),false);assert.ok(w.y+witnessBodyHeight(w)<=2.23-.014);}
 assert.ok(highest>.3);assert.equal(w.y,0);assert.equal(w.vy,0);
});

test('overhead collision respects Alphaeus body height and a temporary Thomas slab',()=>{
 const w=initial();select(w,['james','alphaeus']);Object.assign(w,{place:'stair',x:0,z:0});w.manifestations.alphaeus=manifestation('stair');let highest=0;
 for(let i=0;i<220;i++){tick(w,.05,{moving:false,target:'none'});highest=Math.max(highest,w.y);assert.ok(w.y+.68<=2.23-.014);}
 assert.ok(highest>1.2);
 const slab=initial();slab.manifestations.thomas=manifestation('nave',{x:0,z:0,y:3});assert.equal(overheadAt(slab,0,0,1.7),2.77);assert.equal(overheadAt(slab,0,0,4),Infinity);
});

test('a legacy save in the unbridged pool recovers to clear ground and can move again',()=>{
 const w=initial();select(w,[]);Object.assign(w,{place:'water',x:0,z:-2,y:0,bridge:false});const safe=restore(JSON.stringify(w));assert.equal(safe.bridge,false);assert.equal(safe.place,'water');assert.ok(insideRoom(safe.place,safe.x,safe.z,.18));assert.equal(obstructed(safe,safe.x,safe.z),false);const x=safe.x;walk(safe,.6,0);assert.ok(safe.x>x+.5);
});

test('legacy duplicate throne positions normalize to distinct seats without losing claims or solitude',()=>{
 const w=initial();w.place='crypt';for(let i=0;i<3;i++)separate(w,i);Object.values(w.waitSpots).forEach((s,i)=>{s.x=0;s.alone=10+i*10;});const safe=restore(JSON.stringify(w));assert.deepEqual(safe.left,w.left);assert.equal(new Set(Object.values(safe.waitSpots).map(s=>s.x)).size,3);for(const id of w.left){assert.equal(safe.waitSpots[id].enthroned,true);assert.equal(safe.waitSpots[id].alone,w.waitSpots[id].alone);assert.equal(safe.waitSpots[id].y,1.4);}
 const again=restore(JSON.stringify(safe));for(const id of safe.left)assert.equal(again.waitSpots[id].x,safe.waitSpots[id].x);
});
