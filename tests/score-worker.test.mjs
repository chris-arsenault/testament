import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker as NodeWorker} from 'node:worker_threads';
import {readFileSync} from 'node:fs';
import {Score,composeFallback} from '../public/score.js';

class SynthWorker {
 static instances=[];messages=[];terminated=false;
 constructor(url,options){this.url=url;this.options=options;SynthWorker.instances.push(this);}
 postMessage(message){this.messages.push(message);}
 terminate(){this.terminated=true;}
 answer(stage){this.onmessage({data:{stage,left:new Float32Array([.1,0]),right:new Float32Array([.08,0]),sampleRate:22050}});}
}
function context(){return {
 currentTime:10,
 createBuffer:(channels,length,sampleRate)=>({channels,length,sampleRate,copyToChannel(){}}),
 createBufferSource:()=>({connect(){},disconnect(){},start(){this.started=true;},stop(time){this.stoppedAt=time;}}),
 createGain:()=>({connect(){},disconnect(){},gain:{value:.8,setValueAtTime(){},linearRampToValueAtTime(){},cancelScheduledValues(){}}})
};}

test('room changes queue work without creating an audio context, and stale replies cannot replace the current room',()=>{
 const previous=globalThis.Worker;globalThis.Worker=SynthWorker;SynthWorker.instances=[];const score=new Score(),played=[];score.playMovement=buffer=>played.push({stage:score.stage,buffer});
 try{
  score.movement(0);assert.equal(SynthWorker.instances.length,0);assert.equal(score.ctx,null);
  score.ctx=context();score.movement(0);const worker=SynthWorker.instances[0];assert.match(worker.url.pathname,/score-worker\.js$/);assert.deepEqual(worker.options,{type:'module'});assert.equal(played.length,0);
  worker.answer(0);assert.equal(played[0].stage,0);
  score.movement(1);score.movement(2);assert.equal(played.length,1,'old movement continues until a new buffer exists');
  worker.answer(2);assert.equal(played.at(-1).stage,2);worker.answer(1);assert.equal(played.length,2,'late room reply is cached, not played');
  score.movement(1);assert.equal(played.at(-1).stage,1);assert.equal(worker.messages.length,3);assert.equal(score.pending.size,0);assert.equal(score.workerTimer,null);
 }finally{score.worker?.terminate();clearTimeout(score.workerTimer);globalThis.Worker=previous;}
});

test('the playing source only fades when the requested room is ready',()=>{
 const previous=globalThis.Worker;globalThis.Worker=SynthWorker;const score=new Score();score.ctx=context();score.master={};
 try{score.movement(0);score.worker.answer(0);const playing=score.current;score.movement(3);assert.equal(score.current,playing);assert.equal(playing.src.stoppedAt,undefined);score.worker.answer(3);assert.notEqual(score.current,playing);assert.equal(playing.src.stoppedAt,12.1);}
 finally{score.worker?.terminate();clearTimeout(score.workerTimer);globalThis.Worker=previous;}
});

test('worker errors release pending requests and supply a short bounded fallback through the same gain path',()=>{
 const previous=globalThis.Worker;globalThis.Worker=SynthWorker;const score=new Score();score.ctx=context();score.master={};
 try{
  score.movement(5);const worker=score.worker;worker.onerror({preventDefault(){}});
  assert.equal(worker.terminated,true);assert.equal(score.workerFailed,true);assert.equal(score.pending.size,0);assert.equal(score.workerTimer,null);assert.equal(score.cache.get(5).sampleRate,8000);assert.ok(score.current.src.started);
  score.movement(3);assert.equal(score.cache.get(3).sampleRate,8000);assert.equal(score.worker,null);
 }finally{clearTimeout(score.workerTimer);globalThis.Worker=previous;}
});

test('fallback rooms produce finite, quiet stereo loops',()=>{
 for(let stage=0;stage<7;stage++){const pcm=composeFallback(stage);assert.equal(pcm.left.length,64000);let energy=0;for(let i=0;i<pcm.left.length;i++){assert.ok(Number.isFinite(pcm.left[i])&&Number.isFinite(pcm.right[i]));assert.ok(Math.abs(pcm.left[i])<.11);energy+=pcm.left[i]**2;}assert.ok(energy>1);assert.equal(pcm.left[0],0);}
});

test('the production module worker synthesizes full stereo PCM on a separate thread',async()=>{
 const workerUrl=new URL('../public/score-worker.js',import.meta.url).href;
 const code=`const {parentPort}=require('node:worker_threads');globalThis.self={postMessage:(data,transfer)=>parentPort.postMessage(data,transfer)};import(${JSON.stringify(workerUrl)}).then(()=>{parentPort.on('message',data=>self.onmessage({data}));parentPort.postMessage({ready:true});});`;
 const worker=new NodeWorker(code,{eval:true});
 try{
  const pcm=await new Promise((resolve,reject)=>{worker.on('error',reject);worker.on('message',message=>{if(message.ready)worker.postMessage({stage:4});else resolve(message);});});
  assert.equal(pcm.stage,4);assert.equal(pcm.sampleRate,22050);assert.equal(pcm.left.length,705600);assert.equal(pcm.right.length,705600);assert.ok(pcm.left instanceof Float32Array);assert.ok(pcm.left.some(v=>Math.abs(v)>.01));
 }finally{await worker.terminate();}
});

test('the production build packages the worker alongside the score module',()=>{
 assert.equal(readFileSync('dist/score-worker.js','utf8'),readFileSync('public/score-worker.js','utf8'));
 assert.equal(readFileSync('dist/score.js','utf8'),readFileSync('public/score.js','utf8'));
});
