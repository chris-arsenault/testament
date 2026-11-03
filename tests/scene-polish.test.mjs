import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/three.module.js';
import {drapeTerrain,contactShadow,groundShadows} from '../dist/app/modeling.js';
import {angelModel,setEyeAperture} from '../dist/app/models.js';
import {RoomScenery,onTerrain} from '../dist/app/room-scenery.js';
import {floorHeight,rooms} from '../dist/app/rooms.js';

const terrain=(x,z)=>floorHeight('garden',x,z);
function vertices(mesh){mesh.updateWorldMatrix(true,false);const p=mesh.geometry.attributes.position,point=new T.Vector3();return Array.from({length:p.count},(_,i)=>point.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld).clone());}

test('terrain displacement respects nested transforms and leaves source geometry reusable',()=>{
 const root=new T.Group(),mesh=new T.Mesh(new T.PlaneGeometry(2,2,4,4),new T.MeshBasicMaterial());root.position.set(-7,0,-3);root.rotation.y=.7;mesh.position.set(1,.025,-.3);mesh.rotation.x=-Math.PI/2;root.add(mesh);
 const original=mesh.geometry,positions=Array.from(original.attributes.position.array),before=vertices(mesh);drapeTerrain(root,terrain);const after=vertices(mesh);
 assert.notEqual(mesh.geometry,original);assert.deepEqual(Array.from(original.attributes.position.array),positions);
 for(let i=0;i<after.length;i++){assert.ok(Math.abs(after[i].x-before[i].x)<1e-5);assert.ok(Math.abs(after[i].z-before[i].z)<1e-5);assert.ok(Math.abs(after[i].y-before[i].y-terrain(before[i].x,before[i].z))<1e-5);}
});

test('instanced vegetation is raised in world space even below a transformed parent',()=>{
 const root=new T.Group(),instances=new T.InstancedMesh(new T.PlaneGeometry(.2,.3),new T.MeshBasicMaterial(),2),matrix=new T.Matrix4();root.position.set(5,.3,-2);root.rotation.y=.9;root.add(instances);
 instances.setMatrixAt(0,new T.Matrix4().makeTranslation(1,.2,2));instances.setMatrixAt(1,new T.Matrix4().makeTranslation(-2,.1,3));root.updateMatrixWorld(true);
 const before=[0,1].map(i=>{instances.getMatrixAt(i,matrix);return new T.Vector3().setFromMatrixPosition(matrix.premultiply(instances.matrixWorld));});onTerrain(root);
 for(let i=0;i<2;i++){instances.getMatrixAt(i,matrix);const after=new T.Vector3().setFromMatrixPosition(matrix.premultiply(instances.matrixWorld));assert.ok(Math.abs(after.y-before[i].y-terrain(before[i].x,before[i].z))<1e-5);}
});

test('garden home seals remain above the hills throughout their actual batched geometry',()=>{
 const scenery=new RoomScenery(new T.Group(),[]),view=scenery.build('garden'),gold=new T.Color(rooms.garden.accent);
 const marks=view.root.children[0].children.find(m=>m.isMesh&&m.material.color.equals(gold));assert.ok(marks);
 const points=vertices(marks);assert.ok(points.length>1000);
 for(const p of points){const clearance=p.y-terrain(p.x,p.z);assert.ok(clearance>.0025&&clearance<.0475,`seal surface clearance ${clearance}`);}
});

test('the burial ring follows garden terrain without altering its flat-room counterpart',()=>{
 const flat=new T.Mesh(new T.TorusGeometry(2.5,.045,10,64),new T.MeshBasicMaterial());flat.rotation.x=-Math.PI/2;flat.position.set(0,.045,-8);const scar=flat.clone(),before=vertices(flat);onTerrain(scar);const after=vertices(scar);
 for(let i=0;i<after.length;i++)assert.ok(Math.abs(after[i].y-before[i].y-terrain(after[i].x,after[i].z))<1e-5);
 assert.notEqual(scar.geometry,flat.geometry);assert.ok(Math.max(...vertices(flat).map(p=>p.y))<.091);assert.ok(Math.max(...after.map(p=>p.y))>.5);
});

test('moving actor shadows hug support and never mutate another clone or the source card',()=>{
 const source=new T.Group(),original=contactShadow(.5,.4,.5);source.add(original);const left=source.clone(true),right=source.clone(true);
 left.position.set(-7,terrain(-7,-3),-3);left.rotation.y=.7;right.position.set(7,terrain(7,5),5);right.rotation.y=-.4;
 const surface=(x,z)=>terrain(x,z);groundShadows(left,surface);groundShadows(right,surface);
 assert.notEqual(left.children[0].geometry,right.children[0].geometry);assert.notEqual(left.children[0].material,right.children[0].material);
 for(const actor of [left,right])for(const p of vertices(actor.children[0]))assert.ok(Math.abs(p.y-terrain(p.x,p.z)-.018)<1e-5);
 const stable=Array.from(right.children[0].geometry.attributes.position.array),owned=left.children[0].geometry;left.position.x+=3;left.rotation.y=2;groundShadows(left,surface);
 assert.equal(left.children[0].geometry,owned);assert.deepEqual(Array.from(right.children[0].geometry.attributes.position.array),stable);for(const p of vertices(left.children[0]))assert.ok(Math.abs(p.y-terrain(p.x,p.z)-.018)<1e-5);
 assert.ok(Array.from(original.geometry.attributes.position.array).every((v,i)=>i%3!==2||v===0));
 const late=left.clone(true),beforeLate=Array.from(left.children[0].geometry.attributes.position.array);late.position.set(1,terrain(1,-9),-9);groundShadows(late,surface);assert.notEqual(late.children[0].geometry,left.children[0].geometry);assert.deepEqual(Array.from(left.children[0].geometry.attributes.position.array),beforeLate);for(const p of vertices(late.children[0]))assert.ok(Math.abs(p.y-terrain(p.x,p.z)-.018)<1e-5);
});

test('closing a thousand eyes preserves their constellation, orientation, and pupil alignment',()=>{
 const angel=angelModel();angel.eyes.rotation.y=angel.pupils.rotation.y=.8;const meshes=[...angel.eyes.children,angel.pupils],matrices=meshes.map(m=>Array.from(m.instanceMatrix.array)),original=meshes.map(m=>Array.from(m.geometry.attributes.position.array));
 setEyeAperture(angel.eyes,.08);setEyeAperture(angel.pupils,.08);
 for(let j=0;j<meshes.length;j++){const m=meshes[j];assert.deepEqual(Array.from(m.instanceMatrix.array),matrices[j]);for(let i=0;i<m.geometry.attributes.position.count;i++)assert.ok(Math.abs(m.geometry.attributes.position.getY(i)-original[j][i*3+1]*.08)<1e-7);}
 assert.equal(angel.eyes.scale.y,1);assert.equal(angel.pupils.scale.y,1);
 const geometries=meshes.map(m=>m.geometry);for(let i=0;i<12;i++){setEyeAperture(angel.eyes,.04);setEyeAperture(angel.pupils,.04);setEyeAperture(angel.eyes,1);setEyeAperture(angel.pupils,1);}
 for(let j=0;j<meshes.length;j++){const m=meshes[j];assert.equal(m.geometry,geometries[j]);assert.deepEqual(Array.from(m.instanceMatrix.array),matrices[j]);assert.deepEqual(Array.from(m.geometry.attributes.position.array),original[j]);for(const v of m.geometry.attributes.normal.array)assert.ok(Number.isFinite(v));}
});
