import * as T from '../three.module.js';
export function returningRoots(){
 const group=new T.Group(),bark=new T.MeshStandardMaterial({color:0x3c4633,roughness:.98}),young=new T.MeshStandardMaterial({color:0x596044,roughness:.95});
 function root(points:number[][],radius:number,material:any){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),geo=new T.TubeGeometry(curve,32,radius,7,false),position=geo.attributes.position;
  for(let i=0;i<position.count;i++){const t=Math.floor(i/8)/32,center=curve.getPointAt(t),scale=.12+.88*Math.pow(1-t,.65);position.setXYZ(i,center.x+(position.getX(i)-center.x)*scale,center.y+(position.getY(i)-center.y)*scale,center.z+(position.getZ(i)-center.z)*scale);}geo.computeVertexNormals();const mesh=new T.Mesh(geo,material);group.add(mesh);return curve;
 }
 for(let index=0;index<6;index++){const x=index%2?-7:7,z=[-10,0,10][Math.floor(index/2)],side=x<0?1:-1;
  const trunk=root([[x+side*.62,1.9,z],[x+side*.79,1.15,z+.27],[x+side*1.05,.24,z+.8],[x+side*2.1,.11,z+1.25],[x+side*3.3,.08,z+.9],[x+side*4.8,-.04,z+1.8]],.2,bark);
  for(let branch=0;branch<4;branch++){const t=.36+branch*.13,p=trunk.getPointAt(t),direction=branch%2?-1:1;root([[p.x,p.y,p.z],[p.x+side*.5,.09,p.z+direction*.6],[p.x+side*1.2,.055,p.z+direction*1.45],[p.x+side*(1.8+branch*.15),-.035,p.z+direction*2.25]],.09-branch*.012,branch%2?bark:young);}
 }
 return group;
}
