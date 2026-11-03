import * as T from '../three.module.js';
import {material,mesh,ellipsoid,box,lathe,tube,ring,batch,ogive,archBand,vane,contactShadow} from './modeling.js';
import {witnesses,type Witness} from './content.js';

export function columnModel(stone:any,dark:any,gold:any){
 const g=new T.Group();g.name='carved-column';
 lathe(g,dark,[[0,0],[1.04,0],[1.04,.16],[.98,.22],[.98,.28],[.88,.32],[.86,.46],[.78,.52],[0,.52]]);
 lathe(g,stone,[[.75,.42],[.78,.52],[.8,.59],[.72,.66],[.69,.8],[.62,9.8],[.69,9.95],[.72,10.04]]);
 // Engaged shafts read as a clustered pier while staying inside the existing collision radius.
 for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*.58,z=Math.sin(a)*.58;const shaft=mesh(g,new T.CylinderGeometry(.13,.16,9.35,10),stone,x,5.28,z);ring(g,gold,.145,.025,x,.72,z).rotation.x=Math.PI/2;shaft.name='engaged-shaft';}
 lathe(g,stone,[[.68,9.8],[.71,9.94],[.76,10.04],[.78,10.15],[.91,10.48],[.98,10.55],[.98,10.72],[.9,10.82],[0,10.82]]);
 lathe(g,gold,[[.74,.59],[.77,.61],[.77,.66],[.72,.68]]);
 const leaf=vane(.68,.18,.18);for(let i=0;i<12;i++){const a=i*Math.PI/6,m=mesh(g,leaf.clone(),gold,Math.sin(a)*.74,9.9,Math.cos(a)*.74);m.rotation.y=a;}
 box(g,dark,0,10.94,0,1.9,.22,1.9,.06);return batch(g);
}

export function portalModel(stone:any,dark:any,gold:any){
 const g=new T.Group();
 for(let layer=0;layer<3;layer++){const h=2.46+layer*.23,z=-layer*.24;archBand(g,layer===1?gold:stone,h,5.25,3.05+layer*.07,.17,.23,z);for(const x of [-h-.085,h+.085]){lathe(g,stone,[[.16,0],[.16,.22],[.12,.3],[.12,5.1],[.18,5.15],[.18,5.3]]).position.set(x,0,z);}}
 const shape=new T.Shape();shape.moveTo(-2.45,0);for(const p of ogive(2.45,5.25,3.05))shape.lineTo(p[0],p[1]);shape.lineTo(2.45,0);shape.closePath();mesh(g,new T.ShapeGeometry(shape),material('#090e15'),0,0,-.7);
 // Radiating joints give the arch a masonry rhythm instead of a continuous metal hoop.
 const path=ogive(2.66,5.25,3.15);for(let i=2;i<path.length-2;i+=3){const p=path[i],j=box(g,dark,p[0],p[1]+.1,.145,.025,.28,.045,.005);j.rotation.z=-Math.atan2(path[i+1][0]-path[i-1][0],path[i+1][1]-path[i-1][1]);}
 box(g,gold,0,8.4,.03,.24,.52,.35,.04);return batch(g);
}

export function roseModel(stone:any,gold:any){
 const g=new T.Group(),glass=[material('#496f70',.35,.28),material('#a98a58',.4,.35),material('#4f586d',.3,.3)];
 for(const m of glass){m.emissive=m.color.clone();m.emissiveIntensity=.2;m.side=T.DoubleSide;}
 for(const [r,t] of [[3.08,.13],[2.85,.06],[1.12,.07],[.5,.065]])ring(g,r>3?stone:gold,r,t);
 for(let i=0;i<12;i++){const a=i*Math.PI/6,p=new T.Group();p.rotation.z=a;g.add(p);const s=new T.Shape();s.moveTo(0,.95);s.bezierCurveTo(-.65,1.55,-.6,2.36,0,2.8);s.bezierCurveTo(.6,2.36,.65,1.55,0,.95);mesh(p,new T.ShapeGeometry(s,16),glass[i%3],0,0,-.055);const points=s.getPoints(24).map((v:any)=>[v.x,v.y,0]);points.push(points[0]);tube(p,gold,points,.048,48,6);
  const trefoil=new T.Group();trefoil.position.y=2;trefoil.scale.setScalar(.47);p.add(trefoil);for(let j=0;j<3;j++)ring(trefoil,stone,.42,.045,Math.sin(j*Math.PI*2/3)*.28,Math.cos(j*Math.PI*2/3)*.28,0);
 }
 for(let i=0;i<8;i++){const a=i*Math.PI/4;ring(g,gold,.28,.027,Math.cos(a)*.76,Math.sin(a)*.76,.01);}mesh(g,new T.CircleGeometry(.45,32),glass[1],0,0,-.04);return batch(g);
}

export function windowModel(stone:any,gold:any,glow:any){
 const g=new T.Group(),recess=material('#17292c');box(g,recess,0,2.2,-.08,1.7,4.4,.12,.03);archBand(g,stone,.85,4.1,1.3,.13,.25);for(const x of [-.89,.89])box(g,stone,x,2.05,0,.18,4.1,.25,.03);
 for(const x of [-.39,.39]){const s=new T.Shape();s.moveTo(-.31,0);for(const p of ogive(.31,3.4,.8))s.lineTo(p[0],p[1]);s.lineTo(.31,0);s.closePath();mesh(g,new T.ShapeGeometry(s),glow,x,.12,.015);const a=archBand(g,gold,.31,3.52,.8,.025,.05,.055);a.position.x=x;box(g,gold,x,1.8,.06,.028,3.35,.035,.005);for(const y of [1.2,2.3,3.3])box(g,gold,x,y,.06,.64,.025,.035,.005);}
 ring(g,gold,.28,.035,0,4.52,.06);box(g,stone,0,.03,.08,2,.18,.45,.045);return batch(g);
}

export function throneModel(stone:any,gold:any,dark:any){
 const g=new T.Group();g.position.z=-9;
 // The seat surface remains exactly y=1.4, matching the three persistent wait positions.
 box(g,dark,0,.16,0,3.15,.32,2.2,.06);box(g,stone,0,.78,0,2.76,.92,1.8,.1);box(g,gold,0,1.31,0,3,.18,2,.045);
 box(g,dark,0,3.1,-1.03,2.65,3.6,.35,.09);box(g,stone,0,3.2,-.84,2.26,3.23,.14,.06);
 for(const x of [-1.43,1.43]){lathe(g,gold,[[.22,.3],[.23,.48],[.14,.58],[.14,2.22],[.22,2.34],[.21,2.46],[0,2.52]]).position.set(x,0,.62);box(g,dark,x,2.02,-.04,.3,.22,1.9,.06);lathe(g,gold,[[.15,1.4],[.15,4.9],[.22,5.02],[.19,5.16],[.08,5.4],[0,5.75]]).position.set(x,0,-1.03);}
 archBand(g,gold,1.2,4.1,1.75,.14,.2,-.7);archBand(g,stone,.96,4.1,1.34,.08,.16,-.62);
 for(let i=-2;i<=2;i++){const x=i*.4;archBand(g,gold,.15,3.25,.45,.027,.04,-.72).position.x=x;box(g,gold,x,2.7,-.72,.018,1.1,.05,.004);}
 const seal=ring(g,gold,.46,.065,0,4.05,-.59);seal.scale.y=.72;ellipsoid(g,material('#151e20',.6),0,4.05,-.55,.25,.17,.07);ring(g,gold,.16,.035,0,4.05,-.47);
 for(const x of [-1.1,1.1])for(let i=0;i<5;i++)box(g,gold,x,.5+i*.14,.92,.12,.07,.06,.015);
 batch(g);return g;
}

export function tableModel(stone:any,gold:any){
 const g=new T.Group();lathe(g,stone,[[0,0],[.65,0],[.65,.1],[.56,.18],[.38,.23],[.25,.34],[.22,.66],[.32,.82],[.62,.87],[.66,.9],[0,.9]],8);
 for(let i=0;i<4;i++){const a=i*Math.PI/2;archBand(g,gold,.13,.38,.22,.025,.035,.22).rotation.y=a;}
 box(g,gold,0,.872,0,1.8,.075,1.8,.025);return batch(g);
}

function furPart(parent:any,mat:any,x:number,y:number,z:number,sx:number,sy:number,sz:number,head=false){
 const geo=new T.SphereGeometry(1,32,20),p=geo.attributes.position,colors:number[]=[],cream=new T.Color('#e2d9c5'),soot=new T.Color('#393b33'),orange=new T.Color('#b6753f'),stripe=new T.Color('#62614b');
 for(let i=0;i<p.count;i++){const px=p.getX(i),py=p.getY(i),pz=p.getZ(i);let c=cream;
  if(head){if(py>.02||pz>.2){c=px>-.13&&px<.2+py*.06?orange:soot;if(c===soot&&Math.sin(py*33+px*14)> .55)c=stripe;}}
  else if(pz>-.4||px>.57){c=Math.sin(px*5+py*2+pz*3)>.4?orange:soot;if(c===soot&&Math.sin(py*30+pz*10)>.55)c=stripe;}
  colors.push(c.r,c.g,c.b);
 }geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));const m=mesh(parent,geo,mat,x,y,z);m.scale.set(sx,sy,sz);return m;
}
export function catModel(){
 const g=new T.Group();g.name='calico';const fur=material('#ffffff',0,.95);fur.vertexColors=true;const ivory=material('#e2d9c5'),dark=material('#292d29'),orange=material('#ad7044'),pink=material('#9f746a'),iris=material('#7e9e59',.12,.22),pupil=material('#0b1717',.1,.15),shine=new T.MeshBasicMaterial({color:'#e8f1d6'});
 furPart(g,fur,0,.4,.11,.28,.39,.32);furPart(g,fur,-.23,.23,.16,.15,.22,.25);furPart(g,fur,.23,.23,.16,.15,.22,.25);
 ellipsoid(g,ivory,0,.49,-.12,.2,.28,.14);
 for(const x of [-.115,.115]){ellipsoid(g,ivory,x,.25,-.15,.075,.23,.09);ellipsoid(g,ivory,x,.064,-.22,.095,.063,.14);for(let j=-1;j<=1;j++)tube(g,pink,[[x+j*.025,.057,-.35],[x+j*.026,.077,-.335]],.003,3,4);}
 furPart(g,fur,0,.77,-.12,.235,.207,.195,true);
 for(const side of [-1,1]){
  const ear=new T.Shape();ear.moveTo(-.115,0);ear.lineTo(-.07,.21);ear.quadraticCurveTo(0,.19,.12,0);ear.closePath();const e=mesh(g,new T.ExtrudeGeometry(ear,{depth:.055,bevelEnabled:true,bevelSize:.015,bevelThickness:.012,bevelSegments:2,steps:1}),side<0?dark:orange,side*.145,.88,-.13);e.rotation.z=-side*.2;
  const inside=mesh(g,new T.ShapeGeometry(ear),pink,side*.145,.896,-.151);inside.rotation.z=-side*.2;inside.scale.set(.68,.75,1);pink.side=T.DoubleSide;
  ellipsoid(g,dark,side*.104,.795,-.284,.079,.083,.032);ellipsoid(g,iris,side*.104,.795,-.31,.062,.069,.022);ellipsoid(g,pupil,side*.104,.795,-.331,.018,.055,.006);ellipsoid(g,shine,side*.104-.018,.819,-.337,.013,.016,.004);
  ellipsoid(g,ivory,side*.052,.686,-.296,.072,.05,.044);
  for(let i=0;i<3;i++)tube(g,ivory,[[side*.07,.688,-.326],[side*.2,.69+(i-1)*.022,-.34],[side*.32,.71+(i-1)*.045,-.3]],.0025,8,3);
 }
 const nose=mesh(g,new T.ConeGeometry(.034,.035,3),pink,0,.716,-.333);nose.rotation.z=Math.PI;nose.rotation.x=Math.PI/2;
 tube(g,pink,[[0,.706,-.334],[0,.683,-.337],[.027,.674,-.332]],.0035,6,4);tube(g,pink,[[0,.683,-.337],[-.027,.674,-.332]],.0035,4,4);
 tube(g,dark,[[.14,.16,.35],[.35,.12,.35],[.42,.08,.1],[.37,.07,-.21],[.23,.07,-.32]],.048,28,8);
 batch(g);g.add(contactShadow(.53,.53,.55));return g;
}

function robe(){
 const g=new T.CylinderGeometry(.26,.34,1.19,48,18,true),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const y=p.getY(i)+.595,t=y/1.19,a=Math.atan2(p.getZ(i),p.getX(i)),shoulder=1-.56*Math.pow(Math.max(0,(t-.82)/.18),.8),waist=(1-.24*Math.exp(-Math.pow((t-.67)*4,2)))*shoulder,fold=(.018+.016*(1-t))*Math.sin(a*13+t*.8);p.setXYZ(i,p.getX(i)*waist+Math.cos(a)*fold,y+.19+Math.sin(a*3)*.015*(1-t),p.getZ(i)*.78*waist+Math.sin(a)*fold);}g.computeVertexNormals();return g;
}
export function discipleModel(id:Witness){
 const index=witnesses.findIndex(w=>w.id===id),g=new T.Group();g.name='witness-'+id;
 const colors=['#454c48','#465553','#55515a','#6c6960','#485765','#62675e','#514c43','#47515b','#514e60','#4d5c43','#554b46','#4b5053'];
 const cloth=material(colors[index],.08,.95),lining=material('#242d2d'),bronze=material('#887e65',.72,.4),ivory=material('#b9b8a7',.3,.65),signal=material(['#b8cfb4','#8ac9c2','#c6b2dc','#c7ce9d'][index%4],.35,.3);signal.emissive=signal.color.clone();signal.emissiveIntensity=.4;
 mesh(g,robe(),cloth);
 // Asymmetric mantle with visible fold relief, leaving the sternum mechanism exposed.
 const mantle=mesh(g,robe(),cloth,-.045,.36,.045);mantle.scale.set(1.13,.7,1.1);mantle.rotation.z=.1;
 for(const x of [-.13,.13]){ellipsoid(g,bronze,x,.065,-.065,.095,.065,.18);mesh(g,new T.CylinderGeometry(.055,.065,.24,10),lining,x,.21,0);}
 for(const side of [-1,1]){const arm=new T.Group();g.add(arm);arm.position.set(side*.275,1.27,0);arm.rotation.z=side*.12;ellipsoid(arm,cloth,0,-.14,0,.115,.23,.12);tube(arm,bronze,[[0,-.2,0],[side*.03,-.38,-.04],[side*.025,-.59,-.08]],.04,12,8);ellipsoid(arm,ivory,side*.025,-.63,-.08,.052,.09,.034);ring(arm,bronze,.064,.018,side*.025,-.57,-.08).rotation.x=Math.PI/2;}
 // Recessed face, hood shell and a broken metal aureole.
 const hp:number[][]=[];for(let i=0;i<=12;i++){const t=i/12;hp.push([.235*Math.sqrt(Math.max(.001,1-t*t)),t*.34]);}const hood=lathe(g,cloth,hp,32);hood.rotation.x=Math.PI/2;hood.scale.set(1,1,1.24);hood.position.set(0,1.58,-.145);
 ellipsoid(g,lining,0,1.59,-.143,.182,.22,.065);ellipsoid(g,ivory,0,1.595,-.178,.127,.169,.073);ellipsoid(g,bronze,.082,1.59,-.2,.058,.14,.055);
 for(const x of [-.052,.052]){ellipsoid(g,lining,x,1.632,-.243,.035,.025,.015);ellipsoid(g,signal,x,1.633,-.257,.016,.01,.005);}ellipsoid(g,ivory,-.005,1.59,-.254,.02,.04,.027);
 box(g,lining,-.018,1.515,-.237,.068,.009,.009,.002);
 const halo=ring(g,bronze,.295,.012,0,1.61,.05,Math.PI*1.62);halo.rotation.z=.2+index*.24;
 // Each named augmentation has a modeled silhouette, not just a palette change.
 if(id==='peter'||id==='judas'){for(let i=0;i<9;i++)box(g,id==='judas'?ivory:bronze,0,.59+i*.09,.29,.075,.055,.06,.012);}
 if(id==='andrew'||id==='jude'){for(const side of [-1,1])for(let i=0;i<3;i++)tube(g,id==='jude'?signal:bronze,[[side*.22,1.3,.12],[side*(.32+i*.02),1,.13],[side*.25,.65+i*.07,.12]],.011,14,5);}
 if(id==='james'||id==='simon'){for(let i=0;i<5;i++){const rib=ring(g,bronze,.16-i*.014,.017,0,1.17-i*.075,-.23,Math.PI*1.35);rib.rotation.z=-.52;rib.scale.x=id==='simon'?1.35:1;}}
 if(id==='john'){ellipsoid(g,signal,0,1.18,-.25,.075,.09,.045);ring(g,bronze,.105,.02,0,1.18,-.25);}
 if(id==='philip'||id==='thomas'){for(const x of [-.07,.07]){ring(g,bronze,.052,.015,x,1.635,-.28);ellipsoid(g,signal,x,1.635,-.28,.035,.03,.018);}if(id==='thomas')tube(g,bronze,[[.11,1.65,-.25],[.2,1.74,-.02],[.14,1.83,.06]],.022,12,6);}
 if(id==='bartholomew'){for(let i=0;i<5;i++)tube(g,signal,[[.2,1.27-i*.1,-.18],[0,1.25-i*.1,-.26],[-.16,1.3-i*.1,-.18]],.006,12,4);}
 if(id==='matthew'){for(const side of [-1,1])for(let i=0;i<3;i++)ring(g,signal,.03+i*.018,.007,side*.36,.65,-.12);}
 if(id==='alphaeus'){for(let i=0;i<4;i++)ring(g,bronze,.09-i*.01,.013,0,.96+i*.08,-.24);}
 batch(g);g.add(contactShadow(.5,.38,.5));return g;
}

export function angelModel(){
 const root=new T.Group(),wings=new T.Group(),eyes=new T.Group(),ivory=material('#c8c8b3',.2,.6),ivory2=material('#839184',.3,.5),gold=material('#a58c58',.8,.35),black=material('#111d1b',.1,.2),sclera=material('#c4caae',.2,.32),iris=material('#71886c',.5,.25);ivory.side=ivory2.side=T.DoubleSide;root.add(wings,eyes);
 for(let i=0;i<6;i++){const wing=new T.Group();wing.rotation.z=i*Math.PI/3+.18;wing.rotation.y=(i%2?1:-1)*.16;wings.add(wing);tube(wing,gold,[[.8,0,0],[1.8,.2,.15],[2.9,.6,.2],[4.6,1,.4]],.065,28,8);
  for(let row=0;row<2;row++)for(let j=0;j<17;j++){const t=j/16,f=mesh(wing,vane((row?1.1:2.4)*(1-.35*t),row?.16:.23,.22),row?ivory2:ivory,1.1+t*3.3,.1+t*.8,row?.12:0);f.rotation.z=-2.65+t*.85;f.rotation.y=.2+row*.12;}
 }
 batch(wings);
 const rings=new T.Group();root.add(rings);for(let i=0;i<3;i++){const g=new T.Group();rings.add(g);g.rotation.set(i*.78,i*.68,.2);const r=1.4+i*.55;ring(g,gold,r,.075);ring(g,ivory2,r+.13,.022);for(let j=0;j<32;j++){const a=j*Math.PI/16,m=box(g,gold,Math.cos(a)*r,Math.sin(a)*r,.08,.045,.12,.035,.007);m.rotation.z=a-Math.PI/2;}}
 batch(rings);
 const whites=new T.InstancedMesh(new T.SphereGeometry(.07,8,6),sclera,1000),irises=new T.InstancedMesh(new T.SphereGeometry(.042,8,6),iris,1000),pupils=new T.InstancedMesh(new T.SphereGeometry(.019,6,4),black,1000),rims=new T.InstancedMesh(new T.TorusGeometry(.072,.009,4,12),gold,1000),d=new T.Object3D();
 for(let i=0;i<1000;i++){const a=i*2.399963,y=1-2*(i+.5)/1000,r=Math.sqrt(1-y*y),rad=1.3+(i%3)*.55,normal=new T.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);d.position.copy(normal).multiplyScalar(rad);d.lookAt(normal.clone().multiplyScalar(rad+1));d.scale.set(1.45,.75,.55);d.updateMatrix();whites.setMatrixAt(i,d.matrix);rims.setMatrixAt(i,d.matrix);d.position.copy(normal).multiplyScalar(rad+.035);d.scale.set(1,1,.38);d.updateMatrix();irises.setMatrixAt(i,d.matrix);d.position.copy(normal).multiplyScalar(rad+.05);d.scale.set(.5,1.4,.3);d.updateMatrix();pupils.setMatrixAt(i,d.matrix);}
 eyes.add(whites,irises,rims);root.add(pupils);
 // A single larger eye gives the thousand-eye cloud an intelligible focal point.
 const focus=new T.Group();root.add(focus);focus.position.z=2.4;const eyelid=ring(focus,gold,.45,.045);eyelid.scale.set(1.6,.65,1);ellipsoid(focus,sclera,0,0,0,.67,.27,.12);ellipsoid(focus,iris,0,0,.115,.22,.22,.05);ellipsoid(focus,black,0,0,.16,.055,.17,.015);focus.name='central-eye';
 return {root,wings,eyes,pupils,center:focus};
}

export function gardenModel(){
 const g=new T.Group(),stem=material('#3d4939'),leafMat=material('#526447',.12,.85);leafMat.side=T.DoubleSide;const leaves=new T.InstancedMesh(vane(.55,.105,.11),leafMat,560),dummy=new T.Object3D();let count=0;
 for(let i=0;i<35;i++){const a=i*2.399,r=Math.sqrt(i)*.6,x=Math.sin(a)*r,z=Math.cos(a)*r-8,h=.5+(i%5)*.17;for(let b=0;b<2;b++){const angle=a+b*2;const ex=x+Math.cos(angle)*.45,ez=z+Math.sin(angle)*.45;tube(g,stem,[[x,0,z],[x,.3,z],[ex,h,ez]],.018,10,5);for(let j=0;j<8;j++){const t=.22+j*.1;dummy.position.set(x+(ex-x)*t,.15+(h-.15)*t,z+(ez-z)*t);dummy.rotation.set(.5+(j%3)*.35,angle+j*2.4,-.55+(j%2)*1.1);dummy.scale.setScalar(.65+(i%3)*.16);dummy.updateMatrix();leaves.setMatrixAt(count++,dummy.matrix);}}}
 batch(g);g.add(leaves);return g;
}
