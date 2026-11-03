import * as T from '../three.module.js';
import type {World} from './world.js';
// The same engraving is loaded twice: sRGB albedo and linear-data height. Bump affects lighting, not collision.
export class Relics {
 panels:any[]=[];floor:any;pillar:any;loader=new T.TextureLoader();eden:any;apocalypse:any;
 constructor(root:any){
  this.eden=this.material('adam-and-eve',.07);this.apocalypse=this.material('four-horsemen',.095);
  const frame=new T.MeshStandardMaterial({color:0x705c39,metalness:.7,roughness:.5});
  const add=(x:number,z:number,side:number,mat:any)=>{const g=new T.Group();g.position.set(x,4.4,z);g.rotation.y=side;root.add(g);const surround=new T.Mesh(new T.BoxGeometry(4.15,5.8,.12),frame);g.add(surround);const plate=new T.Mesh(new T.PlaneGeometry(3.8,5.3),mat);plate.position.z=.08;g.add(plate);this.panels.push(plate);};
  // Two central memorial panels are visible on entry; transept tablets repeat the disputed record.
  add(-4.6,-16.8,0,this.eden);add(4.6,-16.8,0,this.apocalypse);
  add(-12.55,-8,Math.PI/2,this.apocalypse);add(12.55,-8,-Math.PI/2,this.eden);
  const rubbed=this.apocalypse.clone();rubbed.color.set('#7b8178');rubbed.map=null;rubbed.bumpScale=.12;rubbed.roughness=.86;
  this.floor=new T.Mesh(new T.PlaneGeometry(5.2,7.2),rubbed);this.floor.rotation.x=-Math.PI/2;this.floor.position.set(0,.025,6);root.add(this.floor);
  this.pillar=new T.Mesh(new T.CylinderGeometry(.86,.86,3.6,32,1,true),rubbed);this.pillar.position.set(-7,3.2,0);root.add(this.pillar);
 }
 material(name:string,depth:number){const color=this.loader.load(`art/${name}.jpg`);color.colorSpace=T.SRGBColorSpace;color.anisotropy=4;const height=this.loader.load(`art/${name}.jpg`);height.colorSpace=T.NoColorSpace;height.anisotropy=4;return new T.MeshStandardMaterial({map:color,bumpMap:height,bumpScale:depth,color:0xd0c6ad,roughness:.83,metalness:.12});}
 update(w:World){const inverted=w.reality===2;this.panels.forEach((p,i)=>{p.material=(i%2===0)!==inverted?this.eden:this.apocalypse;});this.eden.bumpScale=.045+Math.min(1,w.attention/6)*.13;this.apocalypse.bumpScale=.07+Math.min(6,w.memory)*.018;this.floor.visible=w.place!=='stair'&&w.place!=='water';this.pillar.visible=w.place==='crypt'||w.memory>0;}
}
