import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/three.module.js';
import {initial,select,walk,restore} from '../dist/app/world.js';
import {places,rooms,floorHeight,gardenPiers,portalScale,bridgeDeck} from '../dist/app/rooms.js';
import {obstructed,groundAt,actorPlacement,traceActor,occludesSegment} from '../dist/app/space.js';
import {portalSurround} from '../dist/app/models.js';
import {portalWallDepth} from '../dist/app/room-scenery.js';

const world=place=>{const w=initial();select(w,[]);w.place=place;Object.assign(w,rooms[place].spawn);w.y=floorHeight(place,w.x,w.z);return w;};

test('the visible bridge supports feet and does not turn the rest of the pool into invisible pavement',()=>{
 const w=world('water');w.bridge=true;w.z=3;
 walk(w,0,-1.25);assert.equal(w.y,bridgeDeck.top);assert.ok(w.z<2);
 for(const z of [-5.9,-2,1.9]){assert.equal(groundAt(w,0,z),bridgeDeck.top);assert.equal(obstructed(w,0,z,bridgeDeck.top),false);assert.equal(obstructed(w,1.4,z,bridgeDeck.top),true);}
 const before=w.x;walk(w,1.4,0);assert.ok(w.x<bridgeDeck.halfWidth);assert.ok(w.x>=before);
 w.bridge=false;assert.equal(obstructed(w,0,-2,0),true);assert.equal(groundAt(w,0,-2),0);
});

test('tables and a present throne block bodies, but their tops are supported if reached from above',()=>{
 for(const place of places){const w=world(place),p=rooms[place].table,y=floorHeight(place,p.x,p.z);assert.equal(obstructed(w,p.x,p.z,y),true,place);assert.ok(groundAt(w,p.x,p.z)>y+.9);const safe=actorPlacement(w,p.x,p.z,y+.34);assert.equal(obstructed(w,safe.x,safe.z,safe.y,.38),false,place);}
 const w=world('crypt');w.throne=true;assert.ok(obstructed(w,0,-9));assert.equal(groundAt(w,0,-8.8),1.4);assert.equal(obstructed(w,0,-8.8,1.4),false);assert.ok(obstructed(w,1.43,-8.8,1.4));w.throne=false;assert.equal(obstructed(w,0,-9),false);
});

test('a stale save inside newly solid furniture is moved to a safe nearby position',()=>{
 for(const place of places){const w=world(place);Object.assign(w,rooms[place].table);w.y=floorHeight(place,w.x,w.z);const safe=restore(JSON.stringify(w));assert.equal(obstructed(safe,safe.x,safe.z),false,place);}
 const w=world('crypt');Object.assign(w,{throne:true,x:0,z:-9});const safe=restore(JSON.stringify(w));assert.equal(obstructed(safe,safe.x,safe.z),false);
});

test('actor paths respect pillars, stair risers and the bridge instead of cutting through them',()=>{
 const w=world('nave');const blocked=traceActor(w,{x:7,y:0,z:3},{x:7,y:0,z:-3});assert.ok(blocked.z>1.3);assert.equal(obstructed(w,blocked.x,blocked.z,blocked.y,.38),false);
 w.place='stair';const climbed=traceActor(w,{x:0,y:0,z:9},{x:0,y:8,z:-16});assert.ok(climbed.y>7.5);assert.ok(climbed.z<-15.9);
 const under=traceActor(w,{x:3,y:0,z:0},{x:0,y:0,z:0},.34,.3,.9);assert.equal(under.y,0);assert.ok(under.x<.2);
 w.place='water';w.bridge=true;const crossing=traceActor(w,{x:0,y:0,z:3},{x:0,y:bridgeDeck.top,z:-5});assert.equal(crossing.y,bridgeDeck.top);assert.ok(crossing.z<-4.9);
});

test('interaction sightlines are blocked by modeled treads, table slabs and throne backs',()=>{
 const stair=world('stair');assert.ok(occludesSegment(stair,{x:0,y:1.7,z:0},{x:0,y:5,z:0}));
 const nave=world('nave'),p=rooms.nave.table;assert.ok(occludesSegment(nave,{x:p.x,y:2,z:p.z},{x:p.x,y:.5,z:p.z}));assert.equal(occludesSegment(nave,{x:p.x,y:2,z:p.z},{x:p.x,y:.5,z:p.z},'table'),false);
 const crypt=world('crypt');crypt.throne=true;assert.ok(occludesSegment(crypt,{x:0,y:2,z:-12},{x:0,y:2,z:-8.8}));assert.equal(occludesSegment(crypt,{x:0,y:2,z:-7},{x:0,y:2,z:-8.8}),false);
});

test('portal masonry closes the accidental sky slit while preserving the pointed opening',()=>{
 const stone=new T.MeshStandardMaterial();
 for(const place of places.filter(p=>p!=='garden')){const scale=portalScale(place),m=portalSurround(stone,rooms[place].height,scale);m.updateMatrixWorld();const cast=(x,y)=>new T.Raycaster(new T.Vector3(x,y,2),new T.Vector3(0,0,-1)).intersectObject(m);assert.equal(cast(0,2*scale).length,0,place);assert.ok(cast(0,9*scale).length,place);assert.ok(cast(3.2,2*scale).length,place);}
});

test('portal side returns meet polygon walls even at the archive vertices',()=>{
 assert.ok(portalWallDepth('scriptorium','left',3.25)<-1);
 for(const place of places)for(const door of ['front','left','right'])for(const offset of [-3.25,3.25]){
  const d=rooms[place].doors[door],a=door==='left'?Math.PI/2:door==='right'?-Math.PI/2:0,depth=portalWallDepth(place,door,offset),x=d.x+Math.cos(a)*offset-Math.sin(a)*depth,z=d.z-Math.sin(a)*offset-Math.cos(a)*depth;
  let nearest=Infinity;for(let i=0;i<rooms[place].shape.length;i++){const [px,pz]=rooms[place].shape[i],[qx,qz]=rooms[place].shape[(i+1)%rooms[place].shape.length],dx=qx-px,dz=qz-pz,t=Math.max(0,Math.min(1,((x-px)*dx+(z-pz)*dz)/(dx*dx+dz*dz)));nearest=Math.min(nearest,Math.hypot(x-px-t*dx,z-pz-t*dz));}
  assert.ok(nearest<1e-8,place+' '+door);
 }
});

test('garden ruin piers begin at the hills and have physical bodies',()=>{
 const w=world('garden');for(const p of gardenPiers){const y=floorHeight('garden',p.x,p.z);assert.ok(p.top-y>2);assert.ok(obstructed(w,p.x,p.z,y));assert.equal(obstructed(w,p.x+.8,p.z,y),false);assert.ok(occludesSegment(w,{x:p.x-1,y:y+1,z:p.z},{x:p.x+1,y:y+1,z:p.z}));}
});
