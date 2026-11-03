import {witnesses,type Witness} from './content.js';
import type {World,Place} from './world.js';
import {homes,rooms,roomPoint} from './rooms.js';
export type Door='front'|'left'|'right'|'low';
export type Manifestation={place:Place;x:number;y:number;z:number;remaining:number;visual:number;cooldown:number;charge:number;latched:boolean;count:number;age:number;pending:boolean;sounded:boolean;shown:boolean;acted:boolean;ended?:boolean;doors?:Record<Door,Place>};
// Internal contracts, never rendered as instructions. Channels have separate clocks and action gates.
export const witnessEffects={
 peter:{duration:18,cooldown:22,delay:0,color:'#d8bd76',sound:'a stone bell held open'},
 andrew:{duration:12,cooldown:18,delay:.4,color:'#6ac7c4',sound:'a bowed current, running backward'},
 james:{duration:10,cooldown:20,delay:0,color:'#b9b7ec',sound:'thunder inside a brass chest'},
 john:{duration:12,cooldown:18,delay:.3,color:'#94b5d6',sound:'a choir breathing through a closed mouth'},
 philip:{duration:14,cooldown:20,delay:0,color:'#c9a3d9',sound:'three glass notes disagreeing'},
 bartholomew:{duration:12,cooldown:18,delay:0,color:'#e1b59b',sound:'paper separating from stone'},
 matthew:{duration:12,cooldown:18,delay:.6,color:'#c8a267',sound:'a balance struck with small coins'},
 thomas:{duration:18,cooldown:22,delay:0,color:'#b6d4e1',sound:'two knocks becoming one'},
 alphaeus:{duration:12,cooldown:18,delay:.7,color:'#b7c98b',sound:'a small pipe descending below hearing'},
 jude:{duration:16,cooldown:22,delay:.7,color:'#73a982',sound:'wet roots rubbing together'},
 simon:{duration:16,cooldown:22,delay:0,color:'#d48c75',sound:'a gong losing its center'},
 judas:{duration:20,cooldown:22,delay:.1,color:'#b8c4d6',sound:'silver falling up an empty stair'}
} as const satisfies Record<Witness,{duration:number;cooldown:number;delay:number;color:string;sound:string}>;
export type WitnessGate='still'|'moving'|'away'|'distance'|'none';
export const witnessTiming:Record<Witness,{sound:number;visual:number;world:number;gate:WitnessGate}>={
 peter:{sound:0,visual:.7,world:1.7,gate:'still'},
 andrew:{sound:1.6,visual:.2,world:3,gate:'moving'},
 james:{sound:0,visual:1.2,world:2.4,gate:'still'},
 john:{sound:3.2,visual:0,world:1.4,gate:'away'},
 philip:{sound:.15,visual:.8,world:1.8,gate:'away'},
 bartholomew:{sound:0,visual:.6,world:2.3,gate:'moving'},
 matthew:{sound:.4,visual:1.7,world:0,gate:'none'},
 thomas:{sound:0,visual:1.3,world:.7,gate:'still'},
 alphaeus:{sound:2.8,visual:.8,world:1.6,gate:'moving'},
 jude:{sound:.1,visual:1.4,world:3,gate:'still'},
 simon:{sound:4,visual:2.2,world:0,gate:'none'},
 judas:{sound:.4,visual:1.8,world:4,gate:'distance'}
};
export function manifestation(w:World,id:Witness){const m=w.manifestations[id];return m&&m.remaining>0&&m.place===w.place?m:undefined;}
export function witnessVisual(w:World,id:Witness){const m=w.manifestations[id];return m&&m.visual>0&&m.place===w.place?m:undefined;}
export function nearbyWitness(w:World,id:Witness){if(w.party.includes(id)&&!w.left.includes(id))return true;const s=w.party.includes(id)?w.waitSpots[id]:homes[id];return !!s&&s.place===w.place&&Math.hypot(w.x-s.x,w.z-s.z)<7;}
export function witnessBodyHeight(w:World){return manifestation(w,'alphaeus')?.remaining? .68:1.7;}
function condition(w:World,id:Witness){
 if(id==='judas')return w.party.includes(id)&&w.left.includes(id);
 if(!nearbyWitness(w,id))return false;
 const threshold=w.gazeKind==='threshold'&&w.gazeFired&&w.gazeLost===0;
 switch(id){
  case 'peter':return threshold&&Object.values(rooms[w.place].doors).some(p=>Math.hypot(w.x-p.x,w.z-p.z)<9);
  case 'andrew':case 'matthew':return w.place==='water';
  case 'james':return w.still>6;
  case 'john':return w.place==='garden'&&Math.hypot(w.x,w.z+7)<11;
  case 'philip':return threshold;
  case 'bartholomew':return w.gazeFired&&w.gazeLost===0&&(w.gazeKind==='stone'||w.gazeKind==='threshold');
  case 'thomas':return w.gazeFired&&w.gazeLost===0&&(w.gazeKind==='stone'||w.place==='stair'&&threshold);
  case 'alphaeus':return w.place==='nave'||w.pitch<-.6;
  case 'jude':return w.absence>0;
  case 'simon':return w.place==='crypt'&&w.still>3;
 }
}
function gateOpen(w:World,id:Witness,gate:WitnessGate){
 if(gate==='still')return w.still>.5;if(gate==='moving')return w.still===0;
 if(gate==='away')return w.gazeKind==='none'||w.gazeLost>0;
 if(gate==='distance'){const s=w.waitSpots[id];return !!s&&(s.place!==w.place||Math.hypot(w.x-s.x,w.z-s.z)>4);}
 return true;
}
export function tickWitnesses(w:World,dt:number,route:(door:Door)=>Place){
 for(const {id} of witnesses){
  const m=w.manifestations[id]??={place:w.place,x:w.x,y:w.y,z:w.z,remaining:0,visual:0,cooldown:0,charge:0,latched:false,count:0,age:0,pending:false,sounded:false,shown:false,acted:false};
  m.ended=m.remaining>0&&m.remaining<=dt;m.remaining=Math.max(0,m.remaining-dt);m.visual=Math.max(0,m.visual-dt);m.cooldown=Math.max(0,m.cooldown-dt);
  const source=id==='judas'?w.party.includes(id)&&w.left.includes(id):nearbyWitness(w,id);
  if(m.pending&&(m.place!==w.place||!source)){m.pending=false;if(id==='judas'&&source){m.latched=false;m.cooldown=0;}}
  const spec=witnessEffects[id],timing=witnessTiming[id],met=condition(w,id);
  if(!met){m.charge=0;m.latched=false;}else if(!m.latched&&!m.pending&&m.remaining===0&&m.visual===0&&m.cooldown===0){
   m.charge+=dt;if(m.charge>=spec.delay)Object.assign(m,{place:w.place,x:w.x,y:w.y,z:w.z,age:0,pending:true,sounded:false,shown:false,acted:false,cooldown:spec.cooldown,charge:0,latched:true,count:m.count+1,doors:undefined});
  }
  if(!m.pending)continue;m.age+=dt;
  if(!m.sounded&&m.age>=timing.sound){w.events.push({kind:'witness',witness:id,text:''});m.sounded=true;}
  if(!m.shown&&m.age>=timing.visual){m.visual=spec.duration;m.shown=true;}
  if(!m.acted&&m.age>=timing.world&&gateOpen(w,id,timing.gate)){
   // Capture before changing topology. Peter holds any room's exits, even after Thomas.
   if(id==='peter')m.doors={front:route('front'),left:route('left'),right:route('right'),low:route('low')};
   m.remaining=spec.duration;m.acted=true;
   switch(id){
   case 'peter':w.anchored=true;break;
   case 'andrew':case 'matthew':w.bridge=true;break;
   case 'james':w.ceiling=true;w.angel=Math.min(1,w.angel+.25);w.vy=5;break;
   case 'john':w.bridge=true;w.roots=true;break;
   case 'philip':w.passage=true;w.reality=2;w.tongue=(w.tongue+1)%3;break;
   case 'bartholomew':w.skin=true;w.passage=true;break;
   case 'thomas':{w.stable=true;const p=roomPoint(w.place,w.x-Math.sin(w.yaw)*2.5,w.z-Math.cos(w.yaw)*2.5,2.2);m.x=p.x;m.z=p.z;m.y=w.y+.23;break;}
   case 'alphaeus':w.passage=true;break;
   case 'jude':w.roots=true;w.passage=true;break;
   case 'simon':w.throne=false;break;
   case 'judas':w.passage=true;break;
   }
  }
  if(m.sounded&&m.shown&&m.acted)m.pending=false;
 }
}
export function redirectThreshold(w:World,door:Door,fallback:(door:Door)=>Place):Place{
 const peter=manifestation(w,'peter');if(peter?.doors)return peter.doors[door];
 if(manifestation(w,'judas')&&w.waitSpots.judas)return w.waitSpots.judas.place;
 if(manifestation(w,'simon')){const last=[...w.left].reverse().map(id=>w.waitSpots[id]).find(s=>s&&s.place!==w.place);return last?.place??'garden';}
 if(manifestation(w,'philip')&&door!=='low')return fallback(({front:'left',left:'right',right:'front'} as const)[door]);
 return fallback(door);
}
export function witnessStride(w:World){return manifestation(w,'matthew')? .48:1;}
export function witnessCurrent(w:World,dt:number){return manifestation(w,'andrew')&&w.place==='water'&&Math.abs(w.x)<3.9&&w.z>-6&&w.z<2?-.85*dt:0;}
export function witnessGravity(w:World){return manifestation(w,'james')?2.6:14;}
export function rootObstructs(w:World,x:number,z:number,y:number){const m=manifestation(w,'jude');if(!m||y>m.y+.65)return false;const r=Math.hypot(x-m.x,z-m.z),old=Math.hypot(w.x-m.x,w.z-m.z);if(old>2.18&&old<2.82&&Math.abs(r-2.5)>Math.abs(old-2.5))return false;return z<m.z&&r>2.18&&r<2.82;}
export function catCopies(w:World){return Array.from({length:7},(_,i)=>{const a=i*Math.PI*2/7;return {x:Math.cos(a)*5,z:-2+Math.sin(a)*5};});}
