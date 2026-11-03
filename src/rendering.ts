import {formationPoint,newActor,advanceActor,turnToward,type ActorMotion} from './actor-motion.js';
import {WitnessVisuals} from './witness-visuals.js';
import {columnModel,portalModel,roseModel,windowModel,throneModel,tableModel,catModel,discipleModel,angelModel,gardenModel,setEyeAperture} from './models.js';
import {batch,box as carvedBox,archBand,tube,lathe,groundShadows} from './modeling.js';
import {witnesses,type Witness} from './content.js';
import {rooms,homes,floorHeight,roomPoint,columnHeight} from './rooms.js';
import {RoomScenery,onTerrain} from './room-scenery.js';
import {manifestation,witnessVisual,witnessBodyHeight,catCopies} from './witnesses.js';
import {returningRoots} from './roots.js';
import {stairs,support,groundAt,gazeLanding,actorPlacement,occludesSegment,type Point} from './space.js';
import type {AttentionKind} from './attention.js';
import {Relics} from './relics.js';
import * as T from '../three.module.js';
import {present,throneVisible,type World} from './world.js';
export class Cathedral {
 followHeading=0;lastPlayer={x:0,z:12};catMotion:ActorMotion|null=null;
 figures:Record<string,any>={};residents:Record<string,any>={};centralEye:any;roomScenery!:RoomScenery;tableGroup:any;relicRoot:any;gardenRoots:any;gardenScar:any;
 effects:WitnessVisuals;columnMats:any[]=[];copies:any[]=[];pupils:any;burial:any;scar:any;table:any; relics:Relics; scene:any; camera:any; renderer:any; root:any; cat:any; angel:any; eyes:any; wings:any; water:any; bridge:any; screen:any; roots:any; ceiling:any; throne:any; low:any; companions:any[]=[];letter:any;light:any; rose:any;dust:any; clock=0;lastPlace='';materials:any[]=[];
 constructor(canvas:HTMLCanvasElement){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.setSize(innerWidth,innerHeight);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
  this.scene=new T.Scene();this.scene.background=new T.Color('#171c22');this.scene.fog=new T.FogExp2('#171c22',.019);this.camera=new T.PerspectiveCamera(68,innerWidth/innerHeight,.08,160);this.camera.rotation.order='YXZ';
  this.scene.add(new T.HemisphereLight(0xc8dfeb,0x171519,2.1));this.light=new T.DirectionalLight(0xffd8a0,3);this.light.position.set(-8,18,5);this.scene.add(this.light);const fill=new T.PointLight(0xa8d5df,35,30);fill.position.set(0,6,-8);this.scene.add(fill);
  this.root=new T.Group();this.scene.add(this.root);this.build();this.relicRoot=new T.Group();this.root.add(this.relicRoot);this.relics=new Relics(this.relicRoot);this.effects=new WitnessVisuals(this);for(const material of this.materials){material.bumpMap=this.relics.eden.bumpMap;material.bumpScale=.025;material.needsUpdate=true;}addEventListener('resize',()=>{this.renderer.setSize(innerWidth,innerHeight);this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();});
 }
 mat(color:string,metalness=0,emissive?:string){return new T.MeshStandardMaterial({color,roughness:.77,metalness,emissive:emissive||'#000000',emissiveIntensity:.5});}
 mesh(geo:any,mat:any,x=0,y=0,z=0,parent=this.root){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
 box(x:number,y:number,z:number,sx:number,sy:number,sz:number,mat:any,parent=this.root){return this.mesh(new T.BoxGeometry(sx,sy,sz),mat,x,y,z,parent);}
 ring(radius:number,tube:number,mat:any,x:number,y:number,z:number,parent=this.root){return this.mesh(new T.TorusGeometry(radius,tube,10,64),mat,x,y,z,parent);}
 build(){
  const stone=this.mat('#8a8981'),dark=this.mat('#525954'),gold=this.mat('#9c8052',.65),white=this.mat('#d8d4c2'),black=this.mat('#141f20'),green=this.mat('#374a3b'),glow=this.mat('#d4dbbf',.2,'#b9d7b5');
  this.materials.push(stone);const textureCanvas=document.createElement('canvas');textureCanvas.width=textureCanvas.height=256;const ctx=textureCanvas.getContext('2d')!;ctx.fillStyle='#b9b7ad';ctx.fillRect(0,0,256,256);let seed=42;for(let i=0;i<14000;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed%256;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const y=seed%256;ctx.fillStyle=i%3?'#aaa99f33':'#f2e8ce22';ctx.fillRect(x,y,2,1);}ctx.strokeStyle='#75766e55';ctx.lineWidth=2;for(let y=0;y<256;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();}stone.map=new T.CanvasTexture(textureCanvas);stone.map.wrapS=stone.map.wrapT=T.RepeatWrapping;stone.map.repeat.set(2,4);
  this.screen=this.box(0,2,-2,6,4,.24,this.mat('#8a9f9d',.5));this.screen.material.transparent=true;this.screen.material.opacity=.28;this.screen.material.wireframe=true;
  this.roomScenery=new RoomScenery(this.root,this.columnMats);const door=portalModel(stone,dark,gold);
  const particles=new Float32Array(360*3);for(let i=0;i<360;i++){particles[i*3]=Math.sin(i*13.7)*12;particles[i*3+1]=(i%97)/6;particles[i*3+2]=Math.cos(i*3.3)*17;}const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(particles,3));this.dust=new T.Points(pg,new T.PointsMaterial({color:0xe2d4ae,size:.035,transparent:true,opacity:.6}));this.root.add(this.dust);
  this.low=new T.Group();this.low.position.set(10.5,0,-11);this.root.add(this.low);const smallDoor=door.clone(true);smallDoor.scale.set(.35,.18,.7);this.low.add(smallDoor);
  this.water=this.box(0,.08,-2,8,.12,8,new T.MeshStandardMaterial({color:'#507f89',metalness:.85,roughness:.15,transparent:true,opacity:.85}));this.bridge=new T.Group();this.root.add(this.bridge);for(let z=-6;z<=2;z++)this.box(0,.2,z,2,.25,1.01,white,this.bridge);
  this.roots=returningRoots();this.root.add(this.roots);this.gardenRoots=returningRoots();onTerrain(this.gardenRoots);this.root.add(this.gardenRoots);
  this.burial=new T.Group();this.root.add(this.burial);const earth=this.mat('#332c29');this.box(0,-7.25,0,28,.5,36,earth,this.burial);for(const x of [-7,7])for(const z of [-10,0,10]){this.mesh(new T.CylinderGeometry(.95,.7,7,10),earth,x,-3.5,z,this.burial);this.box(x,-6.8,z,2.2,.4,2.2,gold,this.burial);}for(const z of [-10,0,10])this.mesh(new T.TorusGeometry(7,.25,8,48,Math.PI),earth,0,-7,z,this.burial);const burialLight=new T.PointLight(0x9f7352,50,28);burialLight.position.set(0,-4,-5);this.burial.add(burialLight);for(const z of [-13,-17]){for(const x of [-3.6,3.6])this.mesh(new T.CylinderGeometry(.48,.72,5.7,10),earth,x,-4.15,z,this.burial);this.mesh(new T.TorusGeometry(3.6,.18,8,48,Math.PI),earth,0,-5.2,z,this.burial);}this.box(0,-3.5,-18,14,7,.5,earth,this.burial);const sepulchralLight=new T.PointLight(0xc68b62,55,20);sepulchralLight.position.set(0,-3.4,-12);this.burial.add(sepulchralLight);for(const x of [-2.7,0,2.7]){this.box(x,-4.5,-17.72,1.2,3,.1,this.mat('#0b0908'),this.burial);this.ring(.5,.035,gold,x,-2.8,-17.6,this.burial);}
  this.scar=this.ring(2.5,.045,this.mat('#4f382e',.7),0,.045,-8);this.scar.rotation.x=-Math.PI/2;
  this.gardenScar=this.scar.clone();onTerrain(this.gardenScar);this.root.add(this.gardenScar);
  this.throne=throneModel(stone,gold,dark);this.root.add(this.throne);
  this.cat=catModel();this.root.add(this.cat);
  const angel=angelModel();this.angel=angel.root;this.wings=angel.wings;this.eyes=angel.eyes;this.pupils=angel.pupils;this.centralEye=angel.center;this.angel.position.set(0,3.7,-8);this.root.add(this.angel);
  for(let i=0;i<7;i++){const copy=this.cat.clone(true);copy.visible=false;this.root.add(copy);this.copies.push(copy);}
  const bushes=gardenModel();onTerrain(bushes);bushes.name='bushes';this.root.add(bushes);
  this.tableGroup=new T.Group();this.root.add(this.tableGroup);const tableStone=this.mat('#263936',.3),pedestal=tableModel(tableStone,gold);this.tableGroup.add(pedestal);this.table=carvedBox(this.tableGroup,this.mat('#718b76',.4,'#617b51'),0,.95,0,1.7,.16,1.7,.025);const pieces=new T.Group();this.tableGroup.add(pieces);for(let i=0;i<4;i++)for(let j=0;j<4;j++)carvedBox(pieces,(i+j)%2?gold:dark,-.55+i*.36,1.05,-.55+j*.36,.25,.04,.25,.014);batch(pieces);
  this.letter=this.box(-4,1,-6,.7,.02,1,white);
  for(const w of witnesses){this.figures[w.id]=discipleModel(w.id);const resident=this.figures[w.id].clone(true);resident.userData.witness=w.id;this.residents[w.id]=resident;this.root.add(resident);}for(let i=0;i<3;i++){const g=new T.Group();this.root.add(g);this.companions.push(g);}
 }
 gazeDirection(w:World):Point{this.camera.rotation.set(w.pitch,w.yaw,0);const d=new T.Vector3();this.camera.getWorldDirection(d);return {x:d.x,y:d.y,z:d.z};}
 waitTarget(w:World){return gazeLanding(w,this.gazeDirection(w),Math.max(.85,this.camera.position.y-w.y));}
 interaction(w:World,point?:{x:number;y:number}):{kind:'witness';id:Witness}|{kind:'puzzle'|'angel'}|null{
  if(w.underworld>0)return null;this.camera.position.set(w.x,w.y+(manifestation(w,'alphaeus')?witnessBodyHeight(w):w.place==='nave'&&w.passage&&w.x>8&&w.z<-8?.85:1.7),w.z);this.camera.rotation.set(w.pitch,w.yaw,0);this.camera.updateMatrixWorld(true);const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(point?.x||0,point?.y||0),this.camera);const candidates:{kind:'witness'|'puzzle'|'angel';id?:Witness;object:any;range:number}[]=[];
  for(const {id} of witnesses){const index=w.party.indexOf(id),g=index>=0?this.companions[index]:this.residents[id];if(g?.visible)candidates.push({kind:'witness',id,object:g,range:4.5});}
  candidates.push({kind:'puzzle',object:this.tableGroup,range:4.8});if(this.angel.visible&&w.angel>=.25&&w.angelCooldown===0&&!manifestation(w,'john')&&Math.hypot(w.x,w.z+8)<4)candidates.push({kind:'angel',object:this.angel,range:4});
  let chosen:null|typeof candidates[number]=null,best=Infinity;for(const c of candidates){if(c.object.position.distanceTo(this.camera.position)>c.range+2)continue;const hit=ray.intersectObject(c.object,true).find((h:any)=>!h.object.material.transparent);if(hit&&hit.distance<c.range&&hit.distance<best){const blocked=occludesSegment(w,this.camera.position,hit.point,c.kind==='puzzle'?'table':undefined);if(!blocked){chosen=c;best=hit.distance;}}}
  return chosen?.kind==='witness'?{kind:'witness',id:chosen.id!}:chosen?{kind:chosen.kind}:null;
 }
 target(w:World):{target:AttentionKind;targetId:string}{
  const none={target:'none' as const,targetId:''};if(w.underworld>0)return none;const d=this.gazeDirection(w),dir=new T.Vector3(d.x,d.y,d.z),origin=new T.Vector3(w.x,w.y+(manifestation(w,'alphaeus')?.68:w.place==='nave'&&w.passage&&w.x>8&&w.z<-8?.85:1.7),w.z);
  const targets:[AttentionKind,string,any,number][]=[['cat','cat',this.cat.position.clone().add(new T.Vector3(0,.77,-.12)),6],['angel','angel',this.angel.position,20],['stone','stone',new T.Vector3(0,w.place==='crypt'?2.5:2,w.place==='crypt'?-9:-2),12],...Object.entries(rooms[w.place].doors).map(([id,p])=>['threshold',id,new T.Vector3(p.x,w.place==='stair'&&id==='front'?11:3,p.z),24] as [AttentionKind,string,any,number])];
  if(witnessVisual(w,'andrew'))this.copies.forEach((copy,i)=>targets.push(['cat','cat-copy-'+i,copy.position.clone().add(new T.Vector3(0,.72,0)),18]));
  let chosen=none as {target:AttentionKind;targetId:string},best=.93;
  for(const [kind,id,p,max] of targets){if(kind==='angel'&&(w.place!=='garden'||w.angel<.25))continue;if(kind==='stone'&&(w.place!=='nave'&&w.place!=='crypt'||w.place==='nave'&&(w.stable||w.skin)||w.place==='crypt'&&!throneVisible(w)))continue;if(kind==='cat'&&id==='cat'&&!this.cat.visible)continue;const delta=p.clone().sub(origin),distance=delta.length(),dot=dir.dot(delta.normalize());if(distance>max||dot<best)continue;
   const blocked=occludesSegment(w,origin,p);if(blocked)continue;best=dot;chosen={target:kind,targetId:w.place+':'+id};
  }return chosen;
 }
 actorObstacles(w:World,except?:any):Point[]{return [...Object.entries(this.residents).filter(([id])=>!w.party.includes(id as Witness)&&homes[id as Witness].place===w.place).map(([id])=>{const p=homes[id as Witness];return {x:p.x,y:floorHeight(w.place,p.x,p.z),z:p.z};}),...this.companions.filter(g=>g!==except&&g.visible&&g.userData.motion?.place===w.place).map(g=>({x:g.position.x,y:g.position.y,z:g.position.z}))];}
 draw(w:World,dt:number,reduced:boolean){
  this.relicRoot.visible=w.place==='nave';this.relics.update(w);this.clock+=dt;const t=this.clock;this.roomScenery.show(w,t,reduced);this.root.getObjectByName('bushes').visible=w.place==='garden';const tablePoint=rooms[w.place].table;this.tableGroup.position.set(tablePoint.x,floorHeight(w.place,tablePoint.x,tablePoint.z),tablePoint.z);

  const changedRoom=this.lastPlace!==w.place;const travel=Math.hypot(w.x-this.lastPlayer.x,w.z-this.lastPlayer.z);if(changedRoom)this.followHeading=w.yaw;else if(travel>.006)this.followHeading=turnToward(this.followHeading,Math.atan2(-(w.x-this.lastPlayer.x),-(w.z-this.lastPlayer.z)),Math.min(1,dt*8));this.lastPlayer={x:w.x,z:w.z};
  const height=w.y;const depth=w.underworld>0?6.4*Math.min(1,(9-w.underworld)/1.2,w.underworld/2):0;this.burial.visible=depth>0;this.scar.visible=w.buried&&w.place==='crypt';this.gardenScar.visible=w.buried&&w.place==='garden';const lowHeight=manifestation(w,'alphaeus')?witnessBodyHeight(w):w.place==='nave'&&w.passage&&w.x>8&&w.z<-8?.85:1.7;this.camera.position.set(w.x,lowHeight+height-(reduced&&depth>0?6.4:depth),w.z);this.camera.rotation.set(w.pitch,w.yaw,0);
  this.water.visible=w.place==='water'||w.memory>2;this.water.position.y=w.place==='water'?(witnessVisual(w,'matthew')?12:.08):13+Math.sin(t*.1)*.2;
  this.dust.rotation.y=reduced?0:Math.sin(t*.03)*.15;this.dust.material.opacity=.2+w.attention*.025;
  this.bridge.visible=w.place==='water'&&w.bridge;this.screen.visible=w.place==='nave'&&!w.skin&&!w.stable;this.roots.visible=w.roots&&w.place==='nave';this.gardenRoots.visible=w.place==='garden';this.throne.visible=w.place==='crypt'&&throneVisible(w);this.low.scale.y=witnessVisual(w,'alphaeus')?1.8:1;this.low.visible=w.passage&&w.place==='nave';this.letter.visible=w.place==='crypt';
  this.angel.visible=w.place==='garden'&&w.angel>.12;this.angel.scale.setScalar(Math.max(.01,w.angel));this.angel.position.y=(w.underworld>0?-1:3.7)+(reduced?0:Math.sin(t*.3)*.3);this.angel.rotation.x=w.underworld>0?Math.PI:0;const aperture=w.underworld>0?.04:witnessVisual(w,'john')?.08:1;setEyeAperture(this.eyes,aperture);setEyeAperture(this.pupils,aperture);this.eyes.rotation.y=this.pupils.rotation.y=reduced?0:t*.055;this.wings.rotation.z=reduced?0:Math.sin(t*.12)*.12;
  this.centralEye.scale.y=aperture;
  const color=rooms[w.place].sky;this.scene.background.set(depth>0?'#0a0706':color);this.scene.fog.color.set(depth>0?'#0a0706':color);this.scene.fog.density=depth>0?.048:.019;this.light.color.set(rooms[w.place].light);
  let cx=5,cz=-5;if(w.catPhase===2){cx=5+Math.min(1,w.catTimer/3)*5;cz=-5-Math.min(1,w.catTimer/3)*6;}else if(w.catPhase===3){cx=10;cz=-11;}
  if(w.place!=='nave'){cx=w.x-Math.sin(this.followHeading)*2.8+Math.cos(this.followHeading)*1.3;cz=w.z-Math.cos(this.followHeading)*2.8-Math.sin(this.followHeading)*1.3;}
  const catPoint=actorPlacement(w,cx,cz,(this.catMotion?.y??w.y)+.34,.3,.95);
  if(changedRoom||!this.catMotion)this.catMotion=newActor(w,catPoint.x,catPoint.z,w.yaw,w.y+.34,.3,.95);
  advanceActor(w,this.catMotion,catPoint,dt,w.catPhase===2?3.5:2.8,.3,.95,this.actorObstacles(w));this.cat.position.set(this.catMotion.x,this.catMotion.y+.03,this.catMotion.z);this.cat.rotation.y=this.catMotion.yaw;this.cat.visible=w.catPhase!==3||w.place!=='nave';
  this.companions.forEach((g,i)=>{const id=w.party[i],waiting=w.waitSpots[id];g.visible=!!id&&(!w.left.includes(id)||waiting?.place===w.place);if(!g.visible)return;
   const changedWitness=g.userData.witness!==id,claim=waiting?.enthroned?waiting.x+':throne':waiting?'home':'following';
   if(changedWitness){g.clear();g.add(this.figures[id].clone(true));g.userData.witness=id;g.userData.motion=null;}
   const intended=waiting??formationPoint(w,i,this.followHeading),point=waiting?.enthroned?waiting:actorPlacement(w,intended.x,intended.z,(g.userData.motion?.y??w.y)+.34,.38,1.9);
   if(changedRoom||!g.userData.motion||waiting&&g.userData.claim!==claim){const resident=this.residents[id];const start=changedWitness&&!changedRoom&&resident.visible?resident.position:point;g.userData.motion=waiting?.enthroned?{...waiting,yaw:Math.PI,vy:0}:newActor(w,start.x,start.z,waiting?homes[id].yaw:this.followHeading,w.y+.34);}
   const motion=g.userData.motion as ActorMotion;
   if(!waiting?.enthroned){let goal=point;const fromPlayer=Math.hypot(motion.x-w.x,motion.z-w.z);if(fromPlayer<.85){const a=fromPlayer>.05?Math.atan2(motion.x-w.x,motion.z-w.z):this.followHeading+(i-1)*1.8;goal=actorPlacement(w,w.x+Math.sin(a)*1.1,w.z+Math.cos(a)*1.1,motion.y+.34);}
    advanceActor(w,motion,goal,dt,Math.hypot(motion.x-goal.x,motion.z-goal.z)>5?4.1:2.8,.38,1.9,this.actorObstacles(w,g));if(Math.hypot(motion.x-goal.x,motion.z-goal.z)<.18)motion.yaw=turnToward(motion.yaw,waiting?homes[id].yaw:Math.atan2(-(w.x-motion.x),-(w.z-motion.z)),dt*2);
   }
   g.position.set(motion.x,motion.y,motion.z);g.rotation.y=motion.yaw;g.userData.claim=claim;
  });this.lastPlace=w.place;
  for(const {id} of witnesses){const h=homes[id],g=this.residents[id];g.visible=!w.party.includes(id)&&h.place===w.place;g.position.set(h.x,floorHeight(h.place,h.x,h.z),h.z);g.rotation.y=h.yaw;}
  const copies=catCopies(w);this.copies.forEach((copy,i)=>{copy.visible=!!witnessVisual(w,'andrew');if(copy.visible){const p=actorPlacement(w,copies[i].x,copies[i].z,Infinity,.3,.95);copy.position.set(p.x,p.y+.03,p.z);copy.rotation.y=i*.9;}});
  const surface=(x:number,z:number,maximum:number)=>groundAt(w,x,z,maximum);for(const actor of [this.cat,...this.copies,...this.companions,...Object.values(this.residents)])if(actor.visible)groundShadows(actor,surface);
  this.effects.update(w,reduced);
  this.renderer.render(this.scene,this.camera);
 }
}
