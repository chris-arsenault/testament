import {attend,interruptAttention,type AttentionKind} from './attention.js';
import {gazeLanding,obstructed,stepSupport,support,groundAt,settleWitnessBody,type Point} from './space.js';
import {witnesses,whispers,type Witness} from './content.js';
import {evolve} from './phenomena.js';
import {tickWitnesses,manifestation,redirectThreshold,witnessStride,witnessCurrent,catCopies,type Manifestation} from './witnesses.js';
export type Place='nave'|'stair'|'garden'|'water'|'crypt';
export type Event={kind:string;text:string;witness?:Witness};
export const THRONE_SOLITUDE=45;
export type WaitSpot=Point&{place:Place;enthroned:boolean;alone:number;refusalAt:number};
export type World={version:2;tongue:number;manifestations:Partial<Record<Witness,Manifestation>>;time:number;place:Place;x:number;y:number;vy:number;z:number;yaw:number;pitch:number;party:Witness[];left:Witness[];waiting:Partial<Record<Witness,Place>>;waitSpots:Partial<Record<Witness,WaitSpot>>;gazeId:string;gazeKind:AttentionKind;gazeCue:boolean;gazeFired:boolean;gazeApplied:boolean;gazeLost:number;underworld:number;buried:boolean;angelCooldown:number;angelInside:boolean;turns:number;returns:number;memory:number;absence:number;still:number;attention:number;angel:number;reality:number;catPhase:number;catTimer:number;passage:boolean;anchored:boolean;stable:boolean;bridge:boolean;ceiling:boolean;skin:boolean;roots:boolean;throne:boolean;letter:number;seed:number;events:Event[];seen:string[];cooldown:number;distance:number};
export const places:Place[]=['nave','stair','garden','water','crypt'];
export const initial=():World=>({version:2,tongue:0,manifestations:{},time:0,place:'nave',x:0,y:0,vy:0,z:12,yaw:0,pitch:0,party:['thomas','peter','judas'],left:[],waiting:{},waitSpots:{},gazeId:'',gazeKind:'none',gazeCue:false,gazeFired:false,gazeApplied:false,gazeLost:0,underworld:0,buried:false,angelCooldown:0,angelInside:false,turns:0,returns:0,memory:0,absence:0,still:0,attention:0,angel:0,reality:0,catPhase:0,catTimer:0,passage:false,anchored:false,stable:false,bridge:false,ceiling:false,skin:false,roots:false,throne:true,letter:0,seed:1977,events:[],seen:[],cooldown:0,distance:0});
export function present(w:World,id:Witness){return w.party.includes(id)&&!w.left.includes(id);}
export function emit(w:World,kind:string,text:string){w.events.push({kind,text});if(w.events.length>12)w.events.shift();}
function once(w:World,key:string,text:string){if(!w.seen.includes(key)){w.seen.push(key);emit(w,key,text);}}
export function select(w:World,ids:Witness[]){w.party=[...new Set(ids)].filter(id=>witnesses.some(x=>x.id===id)).slice(0,3);w.left=w.left.filter(id=>w.party.includes(id));for(const id of Object.keys(w.waiting) as Witness[])if(!w.left.includes(id)){delete w.waiting[id];delete w.waitSpots[id];}}
export function throneVisible(w:World){return w.throne||Object.values(w.waitSpots).some(s=>s?.place==='crypt'&&s.enthroned);}
export function separate(w:World,index:number,target?:Point){const id=w.party[index];if(!id)return false;
 if(w.left.includes(id)){const spot=w.waitSpots[id];if(spot?.enthroned&&spot.alone<THRONE_SOLITUDE){if(w.time-spot.refusalAt>3){emit(w,'throne-refusal','I have only just arrived.');spot.refusalAt=w.time;}return false;}
  w.left=w.left.filter(x=>x!==id);delete w.waiting[id];delete w.waitSpots[id];emit(w,'rejoin',witnesses.find(x=>x.id===id)!.line);
 }else{let point=target||gazeLanding(w,{x:-Math.sin(w.yaw)*Math.cos(w.pitch),y:Math.sin(w.pitch),z:-Math.cos(w.yaw)*Math.cos(w.pitch)});
  if(w.place==='crypt'){const occupied=Object.values(w.waitSpots).filter(s=>s?.place==='crypt'&&s.enthroned).length;point={x:[0,-.85,.85][occupied%3],y:1.4,z:-8.8};}
  else{for(let attempt=0;attempt<12;attempt++){if(!Object.values(w.waitSpots).some(s=>s?.place===w.place&&Math.hypot(s.x-point.x,s.z-point.z)<.6))break;const a=attempt*2.4,x=point.x+Math.cos(a)*.7,z=point.z+Math.sin(a)*.7;if(!obstructed(w,x,z,point.y))point={x,y:groundAt(w,x,z,point.y+.32),z};}}
  w.left.push(id);w.waiting[id]=w.place;w.waitSpots[id]={...point,place:w.place,enthroned:w.place==='crypt',alone:0,refusalAt:-10};w.absence++;emit(w,'absence','One set of footsteps stays behind.');
 }w.letter=(w.letter+1)%12;return true;
}
export function updateWaiting(w:World,dt:number){const occupants=Object.values(w.waitSpots).filter(s=>s?.place==='crypt').length;for(const spot of Object.values(w.waitSpots)){if(!spot?.enthroned)continue;if(w.place==='crypt'){if(spot.alone<THRONE_SOLITUDE)spot.alone=0;continue;}const before=spot.alone;spot.alone+=dt/Math.max(1,occupants);if(before<THRONE_SOLITUDE&&spot.alone>=THRONE_SOLITUDE)emit(w,'throne-weariness','The room is larger without you.');}}
export function touchAngel(w:World){if(w.place!=='garden'||!!manifestation(w,'john')||w.angel<.25||w.angelCooldown>0||Math.hypot(w.x,w.z+8)>4)return false;w.underworld=9;w.buried=true;w.angelCooldown=14;w.memory++;w.reality=2;w.roots=true;emit(w,'chthonic','');return true;}
export function random(w:World){w.seed=(Math.imul(w.seed,1664525)+1013904223)>>>0;return w.seed/4294967296;}
export type Observation={moving:boolean;target:AttentionKind;targetId?:string;focus?:boolean};
export function tick(w:World,dt:number,o:Observation){
 dt=Math.max(0,Math.min(.1,dt));w.time+=dt;w.cooldown=Math.max(0,w.cooldown-dt);w.still=o.moving?0:w.still+dt;
 stepSupport(w,dt);updateWaiting(w,dt);w.underworld=Math.max(0,w.underworld-dt);w.angelCooldown=Math.max(0,w.angelCooldown-dt);attend(w,dt,o.target,o.targetId||w.place+':'+o.target);
 tickWitnesses(w,dt,door=>destination(w,door));settleWitnessBody(w);w.anchored=!!manifestation(w,'peter');
 if(w.place==='stair'&&w.still>8){once(w,'rest',whispers.rest);w.passage=true;}
 if(w.place==='nave'){
  if(w.catPhase===0&&Math.hypot(w.x-5,w.z+5)<8){w.catPhase=1;w.catTimer=0;}
  if(w.catPhase===1&&o.target!=='cat'){w.catTimer+=dt;if(w.catTimer>4){w.catPhase=2;w.catTimer=0;emit(w,'cat',whispers.cat);}}
  if(w.catPhase===2){w.catTimer+=dt;if(w.catTimer>3){w.catPhase=3;w.passage=true;}}
 }
 if(w.place==='garden'){
  const near=Math.hypot(w.x,w.z+7)<11;
  if(near){w.angel=Math.min(1,w.angel+dt*.11);if(w.angel>.2)once(w,'angel',whispers.angel);}
  const inside=!manifestation(w,'john')&&w.angel>.25&&Math.hypot(w.x,w.z+8)<2.35;if(inside&&!w.angelInside)touchAngel(w);w.angelInside=inside;
  if(!manifestation(w,'john')&&w.angel>.6&&o.target==='angel'&&w.gazeFired&&!w.gazeApplied&&w.cooldown===0){w.gazeApplied=true;if(!touchAngel(w)){w.reality=(w.reality+1)%3;w.memory++;w.cooldown=8;emit(w,'reality',whispers.choice);}}
 }
 if(w.turns>=2&&w.absence>0){w.roots=true;once(w,'garden',whispers.garden);}
 const current=witnessCurrent(w,dt);if(current)walk(w,0,current,true);
 if(w.gazeFired&&!w.gazeApplied&&w.gazeId.includes(':cat-copy-')&&manifestation(w,'andrew')){const copies=catCopies(w),i=Number(w.gazeId.split('-').at(-1)),point=copies[(i+3)%copies.length];if(point){w.x=point.x;w.z=point.z;w.y=groundAt(w,w.x,w.z);w.vy=0;w.gazeApplied=true;emit(w,'cat-link','');}}
 evolve(w);
}
export function destination(w:World,door:'front'|'left'|'right'|'low'):Place{return redirectThreshold(w,door,d=>baseDestination(w,d));}
function baseDestination(w:World,door:'front'|'left'|'right'|'low'):Place{
 if(door==='low')return w.left.includes('judas')?'water':'crypt';
 if(w.place==='stair')return door==='front'?'stair':door==='left'?'nave':'garden';
 if(w.place==='garden'&&w.buried&&door==='left')return 'crypt';
 if(w.place==='garden')return door==='front'?(present(w,'simon')&&!w.throne?'stair':present(w,'john')?'water':w.reality===1?'water':w.reality===2?'crypt':'nave'):'nave';
 if(w.place==='water')return door==='front'?'crypt':'nave';
 if(w.place==='crypt')return door==='front'?(w.throne?'nave':'garden'):(present(w,'alphaeus')?'stair':'nave');
 if(door==='front')return 'stair';
 if(present(w,'andrew')&&w.bridge&&door==='right')return 'garden';
 if(present(w,'matthew')&&w.bridge&&door==='left')return 'crypt';
 if(w.anchored||w.stable)return door==='left'?'garden':'water';
 return door==='left'?(w.turns%2?'water':'garden'):(w.turns%2?'garden':'water');
}
export function cross(w:World,door:'front'|'left'|'right'|'low'){
 if(w.cooldown>0)return false;if(door==='low'&&!w.passage)return false;
 const from=w.place,to=destination(w,door),judas=!manifestation(w,'peter')&&manifestation(w,'judas')&&w.waitSpots.judas;
 if(from==='stair'&&door==='front'){w.turns++;w.memory++;if(!w.anchored)w.reality=w.turns%3;emit(w,'ascent',whispers.ascent[(w.turns-1)%3]);}
 else if(from==='stair'&&door==='left'){w.memory=Math.max(0,w.memory-1);emit(w,'descent',whispers.descent);}
 else {w.returns++;if(w.returns>1)emit(w,'return',whispers.return);}
 w.place=to;w.x=judas?Math.max(-10,Math.min(10,judas.x)):0;w.z=judas?Math.max(-14,Math.min(14,judas.z+2)):12;w.y=groundAt(w,w.x,w.z,judas?judas.y+.32:0);w.vy=0;w.yaw=judas?Math.PI:0;if(judas)w.manifestations.judas!.remaining=0;w.still=0;interruptAttention(w);w.cooldown=1.3;w.letter=(w.letter+1+w.left.length)%12;return true;
}
export function walk(w:World,dx:number,dz:number,carried=false){
 const stride=carried?1:witnessStride(w);dx*=stride;dz*=stride;
 const oldX=w.x,oldZ=w.z;let nx=w.x+dx,nz=w.z+dz;
 if(!obstructed(w,nx,w.z))w.x=Math.max(-12,Math.min(12,nx));if(!obstructed(w,w.x,nz))w.z=Math.max(-16.5,Math.min(16,nz));
 const height=groundAt(w,w.x,w.z,w.y+.32);if(height>w.y&&w.vy<=0){w.y=height;w.vy=0;}
 w.distance+=Math.hypot(w.x-oldX,w.z-oldZ);
 if(w.z<-15.7&&Math.abs(w.x)<2&&(w.place!=='stair'||w.y>=7.8))cross(w,'front');
 else if(w.x<-11.5&&Math.abs(w.z)<3)cross(w,'left');
 else if(w.x>11.5&&Math.abs(w.z)<3)cross(w,'right');
 else if(w.passage&&w.z<-9&&w.z>-13&&w.x>9)cross(w,'low');
}
export function restore(raw:string|null):World{
 const base=initial();try{const s=JSON.parse(raw||'null');if(s?.version!==2||!places.includes(s.place))return base;
 for(const key of Object.keys(base) as (keyof World)[]){if(['events','party','left','seen','waiting','waitSpots','manifestations'].includes(key))continue;const v=s[key],b=base[key];if(typeof v===typeof b&&(typeof v!=='number'||Number.isFinite(v)))(base as any)[key]=v;}
 base.x=Math.max(-10,Math.min(10,base.x));base.z=Math.max(-14,Math.min(14,base.z));base.tongue=((Math.trunc(base.tongue)%3)+3)%3;base.pitch=Math.max(-1.2,Math.min(1.2,base.pitch));base.angel=Math.max(0,Math.min(1,base.angel));base.reality=((Math.trunc(base.reality)%3)+3)%3;select(base,Array.isArray(s.party)?s.party:initial().party);base.left=Array.isArray(s.left)?s.left.filter((x:Witness)=>base.party.includes(x)):[];base.seen=Array.isArray(s.seen)?s.seen.filter((x:unknown)=>typeof x==='string').slice(0,200):[];base.waiting={};for(const id of base.left)base.waiting[id]=places.includes(s.waiting?.[id])?s.waiting[id]:base.place;base.waitSpots={};for(const [i,id] of base.left.entries()){const saved=s.waitSpots?.[id],place=base.waiting[id]!;const valid=saved&&['x','y','z','alone'].every(k=>Number.isFinite(saved[k]));const enthroned=valid&&place==='crypt'&&!!saved.enthroned;const x=valid?Math.max(-10.8,Math.min(10.8,saved.x)):-4+i*2.5,z=valid?Math.max(-14.5,Math.min(14.5,saved.z)):10;base.waitSpots[id]={place,x:enthroned?Math.max(-.9,Math.min(.9,x)):x,z:enthroned?-8.8:z,y:enthroned?1.4:support(place,x,z,valid?saved.y+.05:Infinity),enthroned,alone:valid?Math.max(0,Math.min(1000,saved.alone)):0,refusalAt:-10};}
 base.y=support(base.place,base.x,base.z,Number.isFinite(s.y)?Math.max(0,Math.min(8.1,s.y))+.05:Infinity);base.vy=0;interruptAttention(base);base.underworld=0;base.angelInside=false;base.angelCooldown=0;base.cooldown=1;settleWitnessBody(base,true);return base;
 }catch{return base;}
}
