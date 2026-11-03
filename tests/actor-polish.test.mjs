import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,select,walk,separate,updateWaiting,THRONE_SOLITUDE} from '../dist/app/world.js';
import {formationPoint,newActor,advanceActor,stationaryWitnesses,witnessBlocksPlayer} from '../dist/app/actor-motion.js';
import {obstructed,groundAt,support} from '../dist/app/space.js';
import {rooms,homes} from '../dist/app/rooms.js';

function travel(w,state,target,seconds=18,radius=.38,height=1.9){
 const positions=[];for(let i=0;i<seconds*20;i++){advanceActor(w,state,target,.05,2.8,radius,height);assert.equal(obstructed(w,state.x,state.z,state.y,radius,height),false);assert.ok([state.x,state.y,state.z,state.yaw].every(Number.isFinite));positions.push({...state});}
 return positions;
}

test('followers detour around the center of columns and tables without entering their geometry',()=>{
 const w=initial();select(w,[]);
 for(const [from,target] of [[{x:7,y:0,z:3},{x:7,y:0,z:-3}],[{x:-3.7,y:0,z:10},{x:-3.7,y:0,z:6}]]){
  const actor=newActor(w,from.x,from.z,0),path=travel(w,actor,target);assert.ok(Math.hypot(actor.x-target.x,actor.z-target.z)<.15);assert.ok(path.some(p=>Math.abs(p.x-from.x)>1.2));
 }
});

test('followers and cats climb the real staircase and descend without sinking into its treads',()=>{
 const w=initial();select(w,[]);w.place='stair';w.z=9;
 for(const [radius,height] of [[.38,1.9],[.3,.95]]){
  const actor=newActor(w,0,9,0,.34,radius,height),goal={x:0,y:support('stair',0,-14),z:-14};
  travel(w,actor,goal,16,radius,height);assert.ok(Math.abs(actor.z+14)<.15);assert.ok(Math.abs(actor.y-goal.y)<1e-6);
  const descent=travel(w,actor,{x:0,y:0,z:9},16,radius,height);assert.ok(descent.every(p=>p.y>=groundAt(w,p.x,p.z,p.y+.01)-.0001));assert.ok(actor.z>8.9);assert.equal(actor.y,0);
 }
});

test('turning the head leaves the formation fixed while movement heading rotates it',()=>{
 const w=initial(),heading=.4,before=[0,1,2].map(i=>formationPoint(w,i,heading));
 for(const yaw of [-3,-1,0,1,3]){w.yaw=yaw;assert.deepEqual([0,1,2].map(i=>formationPoint(w,i,heading)),before);}
 assert.notDeepEqual(formationPoint(w,0,heading+Math.PI/2),before[0]);
});

test('resident disciples block forward walking, allow departure, and disappear from residents after joining',()=>{
 const w=initial();select(w,[]);const p=homes.peter;w.x=p.x;w.z=p.z+2;walk(w,0,-4);assert.ok(w.z-p.z>=.62&&w.z-p.z<.75);const before=w.z;walk(w,0,1);assert.ok(w.z>before+.9);
 w.x=p.x;w.z=p.z;assert.equal(witnessBlocksPlayer(w,w.x+.1,w.z),false);walk(w,.5,0);assert.ok(w.x>p.x+.4);
 assert.ok(stationaryWitnesses(w).some(p=>p.id==='peter'));select(w,['peter']);assert.equal(stationaryWitnesses(w).some(p=>p.id==='peter'),false);
});

test('recalling a middle throne occupant releases that seat without overlapping the others',()=>{
 const w=initial();w.place='crypt';for(let i=0;i<3;i++)separate(w,i);const released=w.waitSpots.peter.x,remaining={thomas:w.waitSpots.thomas.x,judas:w.waitSpots.judas.x};
 w.place='nave';updateWaiting(w,THRONE_SOLITUDE*3+1);assert.ok(separate(w,1));w.place='crypt';assert.ok(separate(w,1));assert.equal(w.waitSpots.peter.x,released);assert.equal(w.waitSpots.thomas.x,remaining.thomas);assert.equal(w.waitSpots.judas.x,remaining.judas);assert.equal(new Set(Object.values(w.waitSpots).map(p=>p.x)).size,3);
});

test('large movement inputs stop at tables instead of tunneling through them',()=>{
 const w=initial();select(w,[]);const p=rooms.nave.table;w.x=p.x;w.z=p.z+4;walk(w,0,-8);assert.ok(w.z>p.z+1.05);assert.ok(w.z<p.z+1.18);assert.equal(obstructed(w,w.x,w.z),false);
});

test('an actor detours around a resident instead of walking through their body',()=>{
 const w=initial();select(w,[]);w.place='choir';const resident={x:0,y:0,z:0},actor=newActor(w,0,3,0),goal={x:0,y:0,z:-3};
 for(let i=0;i<300;i++){advanceActor(w,actor,goal,.05,2.8,.38,1.9,[resident]);assert.ok(Math.hypot(actor.x,actor.z)>=.62-1e-8);}
 assert.ok(Math.hypot(actor.x,actor.z+3)<.15);
});

test('two approaching disciples pass each other without overlapping or becoming locked together',()=>{
 const w=initial();select(w,[]);w.place='choir';const a=newActor(w,-2,0,0),b=newActor(w,2,0,0),aGoal={x:2,y:0,z:0},bGoal={x:-2,y:0,z:0};
 for(let i=0;i<400;i++){advanceActor(w,a,aGoal,.05,2.8,.38,1.9,[b]);advanceActor(w,b,bGoal,.05,2.8,.38,1.9,[a]);assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>=.62-1e-8);}
 assert.ok(Math.hypot(a.x-aGoal.x,a.z-aGoal.z)<.15);assert.ok(Math.hypot(b.x-bGoal.x,b.z-bGoal.z)<.15);
});

test('existing overlap can escape, an occupied goal stops short, and vertical separation allows passage',()=>{
 const w=initial();select(w,[]);w.place='choir';const resident={x:0,y:0,z:0},actor=newActor(w,0,0,0);
 for(let i=0;i<60;i++)advanceActor(w,actor,{x:2,y:0,z:0},.05,2.8,.38,1.9,[resident]);assert.ok(actor.x>1.9);
 for(let i=0;i<60;i++)advanceActor(w,actor,resident,.05,2.8,.38,1.9,[resident]);assert.ok(Math.hypot(actor.x,actor.z)>=.62);assert.ok(Math.hypot(actor.x,actor.z)<.8);
 const cat=newActor(w,-2,0,0,.34,.3,.95);for(let i=0;i<80;i++)advanceActor(w,cat,{x:2,y:0,z:0},.05,2.8,.3,.95,[{x:0,y:2,z:0}]);assert.ok(cat.x>1.9);
});
