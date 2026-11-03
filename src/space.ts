import {manifestation,witnessGravity,witnessBodyHeight,rootObstructs} from './witnesses.js';
import type {Place,World} from './world.js';
import {rooms,floorHeight,insideRoom,roomPoint,columnHeight,pool,bridgeDeck,tableBounds,gardenPiers} from './rooms.js';
export type Point={x:number;y:number;z:number};
export const stairs=Array.from({length:36},(_,i)=>({x:0,z:8-i*.7,y:i*.23,width:4,depth:.72}));
export function surfaces(place:Place,x:number,z:number):number[]{
 const heights=[floorHeight(place,x,z)];if(place==='stair')for(const step of stairs)if(Math.abs(x-step.x)<=step.width/2&&Math.abs(z-step.z)<=step.depth/2)heights.push(step.y);
 return heights.sort((a,b)=>a-b);
}
export function support(place:Place,x:number,z:number,maximum=Infinity){return Math.max(floorHeight(place,x,z),...surfaces(place,x,z).filter(y=>y<=maximum+.001));}
const thronePresent=(w:World)=>w.place==='crypt'&&(w.throne||Object.values(w.waitSpots).some(s=>s?.place==='crypt'&&s.enthroned));
const onBridge=(x:number,z:number,radius=0)=>Math.abs(x)<=bridgeDeck.halfWidth-radius&&z>=bridgeDeck.back&&z<=bridgeDeck.front;
export function groundAt(w:World,x:number,z:number,maximum=Infinity){
 const m=manifestation(w,'thomas'),table=rooms[w.place].table,tableY=floorHeight(w.place,table.x,table.z)+tableBounds.top;let floor=support(w.place,x,z,maximum);
 if(w.place==='water'&&w.bridge&&onBridge(x,z)&&bridgeDeck.top<=maximum+.001)floor=Math.max(floor,bridgeDeck.top);
 if(Math.abs(x-table.x)<=tableBounds.halfWidth&&Math.abs(z-table.z)<=tableBounds.halfWidth&&tableY<=maximum+.001)floor=Math.max(floor,tableY);
 if(thronePresent(w)&&Math.abs(x)<=1.35&&z>=-9.8&&z<=-8.05&&1.4<=maximum+.001)floor=Math.max(floor,1.4);
 return m&&Math.abs(x-m.x)<=2&&Math.abs(z-m.z)<=2&&m.y<=maximum+.001?Math.max(floor,m.y):floor;
}
export function obstructed(w:World,x:number,z:number,y=w.y,radius=.16,bodyHeight=witnessBodyHeight(w)){
 if(rootObstructs(w,x,z,y))return true;
 if(!manifestation(w,'bartholomew'))for(const {x:px,z:pz} of rooms[w.place].columns)if(y<columnHeight(w.place)&&Math.hypot(x-px,z-pz)<.99+radius)return true;
 if(w.place==='garden')for(const p of gardenPiers)if(y<p.top&&Math.hypot(x-p.x,z-p.z)<p.radius+radius)return true;
 if(w.place==='water'&&x>pool.left&&x<pool.right&&z>pool.back&&z<pool.front&&!(w.bridge&&onBridge(x,z,radius)))return true;
 const table=rooms[w.place].table,tableY=floorHeight(w.place,table.x,table.z)+tableBounds.top;
 if(y<tableY-.02&&Math.abs(x-table.x)<tableBounds.halfWidth+radius&&Math.abs(z-table.z)<tableBounds.halfWidth+radius)return true;
 if(thronePresent(w)){
  if(y<1.4-.02&&Math.abs(x)<1.58+radius&&z>-10.1-radius&&z<-7.9+radius)return true;
  if(y<5.85&&Math.abs(x)<1.68+radius&&z>-10.25-radius&&z<-9.65+radius)return true;
  if(y<2.53&&Math.abs(Math.abs(x)-1.43)<.23+radius&&z>-10.15-radius&&z<-8+radius)return true;
 }
 if(w.place==='nave'&&!w.skin&&!w.stable&&Math.abs(x)<3&&Math.abs(z+2)<.55&&y<4)return true;
 if(w.place==='stair')for(const step of stairs)if(Math.abs(x-step.x)<=step.width/2+radius&&Math.abs(z-step.z)<=step.depth/2+radius&&step.y>y+.34&&step.y-.3<y+bodyHeight-.05)return true;
 return false;
}
// Actors share the player's solid geometry. Search near the intended formation point,
// then trace there in small steps, so a gaze turn cannot pull a body through a pier.
export function actorPlacement(w:World,x:number,z:number,maximum=w.y+.34,radius=.38,bodyHeight=1.9):Point{
 const desired=roomPoint(w.place,x,z,radius+.1);
 const candidate=(px:number,pz:number)=>{if(!insideRoom(w.place,px,pz,radius+.1))return;const y=groundAt(w,px,pz,maximum);if(!obstructed(w,px,pz,y,radius,bodyHeight))return {x:px,y,z:pz};};
 const direct=candidate(desired.x,desired.z);if(direct)return direct;
 for(let ring=1;ring<=14;ring++)for(let i=0;i<24;i++){const a=i*Math.PI/12,p=candidate(desired.x+Math.sin(a)*ring*.25,desired.z+Math.cos(a)*ring*.25);if(p)return p;}
 // A restored body can be farther from safe ground than the local search radius
 // (the middle of the unbridged pool, for example). Do not return it still stuck.
 const spawn=rooms[w.place].spawn;return candidate(w.x,w.z)??candidate(spawn.x,spawn.z)??{x:w.x,y:w.y,z:w.z};
}
export function traceActor(w:World,from:Point,to:Point,maxStep=.34,radius=.38,bodyHeight=1.9):Point{
 const count=Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.z-from.z)/.12)),dx=(to.x-from.x)/count,dz=(to.z-from.z)/count,actor={...w,...from};let p={...from};
 const move=(x:number,z:number)=>{Object.assign(actor,p);if(!insideRoom(w.place,x,z,radius+.1)||obstructed(actor,x,z,p.y,radius,bodyHeight))return;const y=groundAt(w,x,z,p.y+maxStep);p={x,y,z};};
 for(let i=0;i<count;i++){move(p.x+dx,p.z);move(p.x,p.z+dz);}return p;
}
export function occludesSegment(w:World,from:Point,to:Point,ignore?:'table'){
 const distance=Math.hypot(to.x-from.x,to.y-from.y,to.z-from.z),count=Math.ceil(distance/.12);
 for(let i=1;i<count;i++){const t=i/count;if(distance*(1-t)<.08)break;const x=from.x+(to.x-from.x)*t,y=from.y+(to.y-from.y)*t,z=from.z+(to.z-from.z)*t;
  if(!insideRoom(w.place,x,z)||y<floorHeight(w.place,x,z)-.01)return true;
  if(!manifestation(w,'bartholomew')&&rooms[w.place].columns.some(p=>y<columnHeight(w.place)&&Math.hypot(x-p.x,z-p.z)<.7))return true;
  if(w.place==='garden'&&gardenPiers.some(p=>y<p.top&&Math.hypot(x-p.x,z-p.z)<p.radius))return true;
  if(w.place==='stair'&&stairs.some(s=>Math.abs(x-s.x)<s.width/2&&Math.abs(z-s.z)<s.depth/2&&y>s.y-.3&&y<s.y+.015))return true;
  if(w.place==='nave'&&!w.skin&&!w.stable&&y<4&&Math.abs(x)<3&&Math.abs(z+2)<.12)return true;
  const table=rooms[w.place].table,tableY=floorHeight(w.place,table.x,table.z)+tableBounds.top;
  if(ignore!=='table'&&y<tableY&&y>tableY-.18&&Math.abs(x-table.x)<tableBounds.halfWidth&&Math.abs(z-table.z)<tableBounds.halfWidth)return true;
  if(thronePresent(w)){
   if(y<4.95&&Math.abs(x)<1.35&&z>-10.2&&z<-9.65)return true;
   if(y<2.53&&y>1.8&&Math.abs(Math.abs(x)-1.43)<.23&&z>-10.15&&z<-8)return true;
   if(y<1.4&&y>.2&&Math.abs(x)<1.5&&z>-10&&z<-8)return true;
  }
 }return false;
}
export function overheadAt(w:World,x:number,z:number,head:number,radius=.16){
 const undersides:number[]=[];
 if(w.place==='stair')for(const s of stairs)if(Math.abs(x-s.x)<=s.width/2+radius&&Math.abs(z-s.z)<=s.depth/2+radius)undersides.push(s.y-.3);
 const ledge=manifestation(w,'thomas');if(ledge&&Math.abs(x-ledge.x)<=2+radius&&Math.abs(z-ledge.z)<=2+radius)undersides.push(ledge.y-.23);
 const table=rooms[w.place].table;if(Math.abs(x-table.x)<=tableBounds.halfWidth+radius&&Math.abs(z-table.z)<=tableBounds.halfWidth+radius)undersides.push(floorHeight(w.place,table.x,table.z)+.87);
 if(!w.ceiling&&(w.place==='water'||w.place==='crypt'||w.place==='choir'&&Math.hypot(x,z)>3.8))undersides.push(rooms[w.place].height);
 return Math.min(Infinity,...undersides.filter(y=>y>=head-.025));
}
export function stepSupport(w:World,dt:number){
 const ground=groundAt(w,w.x,w.z,w.y+.02);if(w.y<=ground+.025&&w.vy<=0){w.y=ground;w.vy=0;return;}
 const height=witnessBodyHeight(w),ceiling=overheadAt(w,w.x,w.z,w.y+height);w.vy-=witnessGravity(w)*dt;let next=w.y+w.vy*dt;
 if(w.vy>0&&next+height>ceiling-.015){next=Math.max(w.y,ceiling-height-.015);w.vy=0;}
 if(next<=ground){w.y=ground;w.vy=0;}else w.y=next;
}
export function settleWitnessBody(w:World,restoring=false){
 const phase=w.manifestations.bartholomew;if((restoring||phase?.ended&&phase.place===w.place)&&w.y<columnHeight(w.place))for(const {x:px,z:pz} of rooms[w.place].columns){const r=Math.hypot(w.x-px,w.z-pz);if(r<1.16){const dx=r?(w.x-px)/r:1,dz=r?(w.z-pz)/r:0;w.x=px+dx*1.22;w.z=pz+dz*1.22;}}
 const small=w.manifestations.alphaeus;if(small?.ended&&small.place===w.place&&obstructed(w,w.x,w.z)){small.remaining=.1;small.visual=Math.max(small.visual,.1);}
 if(restoring&&obstructed(w,w.x,w.z)){const safe=actorPlacement(w,w.x,w.z,w.y+.34,.16,witnessBodyHeight(w));w.x=safe.x;w.y=safe.y;w.z=safe.z;}
}
// Project gaze onto real horizontal surfaces, then trace a reachable path to the chosen point.
export function gazeLanding(w:World,direction:Point,eyeHeight=1.7):Point{
 const origin={x:w.x,y:w.y+eyeHeight,z:w.z};let desired:Point|undefined;
 if(direction.y<-.025){const ledge=manifestation(w,'thomas');const candidates=[...(ledge?[{x:ledge.x,y:ledge.y,z:ledge.z,width:4,depth:4}]:[]),{y:0,x:0,z:0,width:24,depth:33},...(w.place==='stair'?stairs:[])];let nearest=14;
  for(const s of candidates){const t=(s.y-origin.y)/direction.y;if(t<.65||t>nearest)continue;const x=origin.x+direction.x*t,z=origin.z+direction.z*t;if(Math.abs(x-s.x)<=s.width/2&&Math.abs(z-s.z)<=s.depth/2){desired={x,y:s.y,z};nearest=t;}}
 }
 if(!desired){const horizontal=Math.hypot(direction.x,direction.z)||1;desired={x:w.x+direction.x/horizontal*5,y:w.y,z:w.z+direction.z/horizontal*5};}
 desired=roomPoint(w.place,desired.x,desired.z,.7);
 let point={x:w.x,y:w.y,z:w.z};const count=Math.ceil(Math.hypot(desired.x-w.x,desired.z-w.z)/.15)||1;
 for(let i=1;i<=count;i++){const x=w.x+(desired.x-w.x)*i/count,z=w.z+(desired.z-w.z)*i/count;if(!insideRoom(w.place,x,z,.4)||obstructed(w,x,z,point.y))break;point={x,y:groundAt(w,x,z,point.y+.32),z};}
 return point;
}
