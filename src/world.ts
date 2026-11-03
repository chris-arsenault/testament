import {witnesses,whispers,type Witness} from './content.js';
import {evolve} from './phenomena.js';
export type Place='nave'|'stair'|'garden'|'water'|'crypt';
export type Event={kind:string;text:string};
export type World={version:2;time:number;place:Place;x:number;z:number;yaw:number;pitch:number;party:Witness[];left:Witness[];waiting:Partial<Record<Witness,Place>>;turns:number;returns:number;memory:number;absence:number;still:number;attention:number;angel:number;reality:number;catPhase:number;catTimer:number;passage:boolean;anchored:boolean;stable:boolean;bridge:boolean;ceiling:boolean;skin:boolean;roots:boolean;throne:boolean;letter:number;seed:number;events:Event[];seen:string[];cooldown:number;distance:number};
export const places:Place[]=['nave','stair','garden','water','crypt'];
export const initial=():World=>({version:2,time:0,place:'nave',x:0,z:12,yaw:0,pitch:0,party:['thomas','peter','judas'],left:[],waiting:{},turns:0,returns:0,memory:0,absence:0,still:0,attention:0,angel:0,reality:0,catPhase:0,catTimer:0,passage:false,anchored:false,stable:false,bridge:false,ceiling:false,skin:false,roots:false,throne:true,letter:0,seed:1977,events:[],seen:[],cooldown:0,distance:0});
export function present(w:World,id:Witness){return w.party.includes(id)&&!w.left.includes(id);}
export function emit(w:World,kind:string,text:string){w.events.push({kind,text});if(w.events.length>12)w.events.shift();}
function once(w:World,key:string,text:string){if(!w.seen.includes(key)){w.seen.push(key);emit(w,key,text);}}
export function select(w:World,ids:Witness[]){w.party=[...new Set(ids)].filter(id=>witnesses.some(x=>x.id===id)).slice(0,3);w.left=[];w.waiting={};}
export function separate(w:World,index:number){const id=w.party[index];if(!id)return;if(w.left.includes(id)){w.left=w.left.filter(x=>x!==id);delete w.waiting[id];emit(w,'rejoin',witnesses.find(x=>x.id===id)!.line);}else{w.left.push(id);w.waiting[id]=w.place;w.absence++;emit(w,'absence','One set of footsteps stays behind.');}w.letter=(w.letter+1)%12;}
export function random(w:World){w.seed=(Math.imul(w.seed,1664525)+1013904223)>>>0;return w.seed/4294967296;}
export type Observation={moving:boolean;target:'cat'|'angel'|'threshold'|'stone'|'none';focus:boolean};
export function tick(w:World,dt:number,o:Observation){
 dt=Math.max(0,Math.min(.1,dt));w.time+=dt;w.cooldown=Math.max(0,w.cooldown-dt);w.still=o.moving?0:w.still+dt;
 w.attention=o.focus&&o.target!=='none'?Math.min(20,w.attention+dt):Math.max(0,w.attention-dt*2);
 const threshold=o.target==='threshold'&&w.attention>2;
 if(present(w,'peter')&&threshold)w.anchored=true;
 if(!present(w,'peter')||Math.min(Math.hypot(w.x,w.z+16),Math.hypot(w.x-12,w.z),Math.hypot(w.x+12,w.z))>9)w.anchored=false;
 if(present(w,'thomas')&&w.attention>3&&o.target==='stone'){w.stable=true;once(w,'stable',witnesses[7].line);}
 if(w.place==='water'&&(present(w,'andrew')||present(w,'matthew'))){w.bridge=true;once(w,'bridge',present(w,'andrew')?witnesses[1].line:witnesses[6].line);}
 if(present(w,'james')&&w.still>6){w.ceiling=true;w.angel=Math.min(1,w.angel+dt*.1);once(w,'ceiling',witnesses[2].line);}
 if(present(w,'bartholomew')&&w.attention>2){w.skin=true;w.passage=true;once(w,'skin',witnesses[5].line);}
 if(present(w,'alphaeus')&&w.place==='nave'){w.passage=true;once(w,'small',witnesses[8].line);}
 if(present(w,'jude')&&w.absence>0){w.roots=true;w.passage=true;once(w,'roots',witnesses[9].line);}
 if(present(w,'simon')&&w.place==='crypt'&&w.still>3){w.throne=false;once(w,'throne',witnesses[10].line);}
 if(present(w,'philip')&&threshold){w.passage=true;w.reality=2;once(w,'reflection',witnesses[4].line);}
 if(w.left.includes('judas')){w.passage=true;once(w,'silver',witnesses[11].line);}
 if(w.place==='stair'&&w.still>8){once(w,'rest',whispers.rest);w.passage=true;}
 if(w.place==='nave'){
  if(w.catPhase===0&&Math.hypot(w.x-5,w.z+5)<8){w.catPhase=1;w.catTimer=0;}
  if(w.catPhase===1&&o.target!=='cat'){w.catTimer+=dt;if(w.catTimer>4){w.catPhase=2;w.catTimer=0;emit(w,'cat',whispers.cat);}}
  if(w.catPhase===2){w.catTimer+=dt;if(w.catTimer>3){w.catPhase=3;w.passage=true;}}
 }
 if(w.place==='garden'){
  const near=Math.hypot(w.x,w.z+7)<11;
  if(near){w.angel=Math.min(1,w.angel+dt*.11);if(w.angel>.2)once(w,'angel',whispers.angel);}
  if(w.angel>.6&&o.target==='angel'&&w.attention>3&&w.cooldown===0){w.reality=(w.reality+1)%3;w.memory++;w.cooldown=8;w.attention=0;emit(w,'reality',whispers.choice);}
  if(present(w,'john')&&near){w.bridge=true;w.roots=true;once(w,'mercy',witnesses[3].line);}
 }
 if(w.turns>=2&&w.absence>0){w.roots=true;once(w,'garden',whispers.garden);}
 evolve(w);
}
export function destination(w:World,door:'front'|'left'|'right'|'low'):Place{
 if(door==='low')return w.left.includes('judas')?'water':'crypt';
 if(w.place==='stair')return door==='front'?'stair':door==='left'?'nave':'garden';
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
 const from=w.place,to=destination(w,door);
 if(from==='stair'&&door==='front'){w.turns++;w.memory++;if(!w.anchored)w.reality=w.turns%3;emit(w,'ascent',whispers.ascent[(w.turns-1)%3]);}
 else if(from==='stair'&&door==='left'){w.memory=Math.max(0,w.memory-1);emit(w,'descent',whispers.descent);}
 else {w.returns++;if(w.returns>1)emit(w,'return',whispers.return);}
 w.place=to;w.x=0;w.z=12;w.yaw=0;w.still=0;w.attention=0;w.cooldown=1.3;w.letter=(w.letter+1+w.left.length)%12;return true;
}
export function walk(w:World,dx:number,dz:number){
 const oldX=w.x,oldZ=w.z;let nx=w.x+dx,nz=w.z+dz;
 // Pillars are solid. An uncertain transverse screen has two side routes.
 const solid=(x:number,z:number)=>{for(const px of [-7,7])for(const pz of [-10,0,10])if(Math.hypot(x-px,z-pz)<1.15)return true;
 if(w.place==='water'&&!w.bridge&&Math.abs(x)<4&&z<2&&z>-6)return true;
 if(w.place==='nave'&&!w.skin&&!w.stable&&Math.abs(x)<3&&Math.abs(z+2)<.55)return true;return false;};
 if(!solid(nx,w.z))w.x=Math.max(-12,Math.min(12,nx));if(!solid(w.x,nz))w.z=Math.max(-16.5,Math.min(16,nz));
 w.distance+=Math.hypot(w.x-oldX,w.z-oldZ);
 if(w.z<-15.7&&Math.abs(w.x)<3)cross(w,'front');
 else if(w.x<-11.5&&Math.abs(w.z)<3)cross(w,'left');
 else if(w.x>11.5&&Math.abs(w.z)<3)cross(w,'right');
 else if(w.passage&&w.z<-9&&w.z>-13&&w.x>9)cross(w,'low');
}
export function restore(raw:string|null):World{
 const base=initial();try{const s=JSON.parse(raw||'null');if(s?.version!==2||!places.includes(s.place))return base;
 for(const key of Object.keys(base) as (keyof World)[]){if(['events','party','left','seen','waiting'].includes(key))continue;const v=s[key],b=base[key];if(typeof v===typeof b&&(typeof v!=='number'||Number.isFinite(v)))(base as any)[key]=v;}
 base.x=Math.max(-10,Math.min(10,base.x));base.z=Math.max(-14,Math.min(14,base.z));base.pitch=Math.max(-1.2,Math.min(1.2,base.pitch));base.angel=Math.max(0,Math.min(1,base.angel));base.reality=((Math.trunc(base.reality)%3)+3)%3;select(base,Array.isArray(s.party)?s.party:initial().party);base.left=Array.isArray(s.left)?s.left.filter((x:Witness)=>base.party.includes(x)):[];base.seen=Array.isArray(s.seen)?s.seen.filter((x:unknown)=>typeof x==='string').slice(0,200):[];base.waiting={};for(const id of base.left)base.waiting[id]=places.includes(s.waiting?.[id])?s.waiting[id]:base.place;base.cooldown=1;return base;
 }catch{return base;}
}
