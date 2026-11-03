export const movements = ['Navel of the Dust','Crown of Salt','Teeth of the Psalm','The Mouth of the Siren','Wound in the Sun','Letters to No One','The Garden Keeps Your Name'];
const TAU=Math.PI*2;
// An original seven-movement score. The same synthesis renders the album and the game.
export function composeMovement(stage,sampleRate=22050,duration=32){
 const size=Math.floor(sampleRate*duration),left=new Float32Array(size),right=new Float32Array(size);
 let seed=1977+stage*303;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)*2-1;
 const roots=[55,51.913,48.999,46.249,65.406,58.270,65.406],root=roots[stage%7];
 const scales=[[0,1,5,7,10],[0,2,3,7,8],[0,2,5,7,9],[0,1,6,7,10],[0,2,3,7,10],[0,2,5,7,10],[0,2,4,7,9]];
 const note=s=>root*2**(s/12),scale=scales[stage%7];
 function add(start,length,amp,pan,fn){const from=Math.max(0,Math.floor(start*sampleRate)),to=Math.min(size,Math.floor((start+length)*sampleRate));const l=Math.cos((pan+1)*Math.PI/4),r=Math.sin((pan+1)*Math.PI/4);for(let i=from;i<to;i++){const t=i/sampleRate-start,v=fn(t,length)*amp;left[i]+=v*l;right[i]+=v*r;}}
 // Breath-shaped, slightly detuned harmonics suggest a choir without sampled voices.
 for(let bar=0;bar<4;bar++)for(let voice=0;voice<3;voice++){const f=note(scale[(voice+bar+(stage%2))%scale.length]+12),pan=(voice-1)*.65;add(bar*8-1,10,.055,pan,(t,len)=>{const env=Math.sin(Math.PI*Math.min(1,t/len))**2;return env*(Math.sin(TAU*f*t+.025*Math.sin(t*2.1))+Math.sin(TAU*f*1.0021*t)*.45+Math.sin(TAU*f*2*t)*.22+Math.sin(TAU*f*3*t)*.08);});}
 add(0,duration,.075,0,t=>(Math.sin(TAU*root*t)+.23*Math.sin(TAU*root*.5*t))*(.65+.35*Math.sin(t*.32)**2));
 // Unequal bell intervals against a slow seven-beat cycle.
 const pattern=[0,2,4,1,3,2,0,4,3,1,4];
 for(let i=0;i<11;i++){const start=.6+i*2.73,f=note(scale[pattern[(i+stage)%pattern.length]]+24);add(start,6,.095,Math.sin(i*2.4)*.72,(t)=>{const attack=Math.min(1,t/.018);return attack*(Math.sin(TAU*f*t)*Math.exp(-t*.8)+.36*Math.sin(TAU*f*2.756*t)*Math.exp(-t*1.5)+.13*Math.sin(TAU*f*5.404*t)*Math.exp(-t*2.6));});}
 // Bowed metal rises through the warning movement; the final movement opens into fifths.
 for(let i=0;i<4;i++){const f=note((stage===6?7:stage===3?6:1)+12);add(i*8+3,4,stage===3?.055:.022,i%2?-.8:.8,(t,len)=>Math.sin(Math.PI*t/len)**2*Math.sin(TAU*f*t+2.2*Math.sin(TAU*f*.501*t)));}
 for(let i=0;i<14;i++){const start=i*2.24;add(start,.8,.06,0,t=>Math.exp(-t*8)*Math.sin(TAU*(38*t+3*(1-Math.exp(-t*12)))));if((i+stage)%3===0)add(start+.73,.28,.016,(i%2?1:-1)*.5,t=>random()*Math.exp(-t*24));}
 let lowNoise=0;for(let i=0;i<size;i++){lowNoise=lowNoise*.975+random()*.025;left[i]+=lowNoise*.018;right[i]-=lowNoise*.014;}
 // Cross-channel room echoes; finite tail and gentle loop boundary.
 const dryL=left.slice(),dryR=right.slice();for(const [seconds,level] of [[.31,.23],[.71,.15],[1.37,.1]]){const delay=Math.floor(seconds*sampleRate);for(let i=delay;i<size;i++){left[i]+=dryR[i-delay]*level;right[i]+=dryL[i-delay]*level;}}
 for(let i=0;i<size;i++){const edge=Math.min(1,i/(sampleRate*1.25),(size-1-i)/(sampleRate*2));left[i]=Math.tanh(left[i]*1.5)*edge;right[i]=Math.tanh(right[i]*1.5)*edge;}
 return {left,right,sampleRate,duration};
}
export class Score {
 constructor(){this.ctx=null;this.volume=.55;this.muted=false;this.paused=false;this.stage=-1;this.current=null;this.cache=new Map();this.beatAt=0;this.worker=null;this.pending=new Set();this.workerFailed=false;this.workerTimer=null;}
 start(){try{if(!this.ctx){this.ctx=new (globalThis.AudioContext||globalThis.webkitAudioContext)();this.master=this.ctx.createGain();const compressor=this.ctx.createDynamicsCompressor();compressor.threshold.value=-12;compressor.ratio.value=5;this.filter=this.ctx.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=20000;this.master.connect(this.filter);this.filter.connect(compressor);compressor.connect(this.ctx.destination);this.applyVolume();}this.ctx.resume()?.catch(()=>{});return true;}catch{return false;}}
 applyVolume(){if(this.master)this.master.gain.setTargetAtTime(this.muted?0:this.volume*(this.paused?.35:1),this.ctx.currentTime,.12);}
 setVolume(value){this.volume=Math.max(0,Math.min(1,value));this.applyVolume();}
 setMuted(value){this.muted=value;this.applyVolume();}
 setPaused(value){this.paused=value;this.applyVolume();}
 movement(stage){
  stage=Math.trunc(Math.min(6,Math.max(0,stage)));if(!this.ctx||!Number.isFinite(stage)||this.stage===stage)return;this.stage=stage;
  if(this.cache.has(stage)){this.playMovement(this.cache.get(stage));return;}
  if(this.pending.has(stage))return;
  if(this.workerFailed||typeof Worker==='undefined'){this.fallbackMovement(stage);return;}
  try{
   if(!this.worker){
    const worker=new Worker(new URL('./score-worker.js',import.meta.url),{type:'module'});this.worker=worker;
    worker.onmessage=({data})=>{
     if(this.worker!==worker||!this.pending.has(data?.stage))return;
     if(data.error||!(data.left instanceof Float32Array)||!(data.right instanceof Float32Array)||!data.left.length||data.left.length!==data.right.length||!Number.isFinite(data.sampleRate)){this.failWorker();return;}
     this.pending.delete(data.stage);const buffer=this.audioBuffer(data);this.cache.set(data.stage,buffer);
     // A slow reply belongs in the cache, never in a room the player has left.
     if(this.stage===data.stage)this.playMovement(buffer);
     if(!this.pending.size){clearTimeout(this.workerTimer);this.workerTimer=null;}
    };
    worker.onerror=event=>{event.preventDefault?.();this.failWorker();};worker.onmessageerror=()=>this.failWorker();
   }
   this.pending.add(stage);this.worker.postMessage({stage});
   if(!this.workerTimer)this.workerTimer=setTimeout(()=>this.failWorker(),15000);
  }catch{this.failWorker();}
 }
 audioBuffer(pcm){const buffer=this.ctx.createBuffer(2,pcm.left.length,pcm.sampleRate);buffer.copyToChannel(pcm.left,0);buffer.copyToChannel(pcm.right,1);return buffer;}
 failWorker(){this.worker?.terminate();this.worker=null;this.workerFailed=true;this.pending.clear();clearTimeout(this.workerTimer);this.workerTimer=null;if(this.ctx&&this.stage>=0&&!this.cache.has(this.stage))this.fallbackMovement(this.stage);}
 fallbackMovement(stage){
  // CSP or older browsers may reject module workers. A small, bounded drone
  // keeps the cathedral audible without moving the expensive score back here.
  const buffer=this.audioBuffer(composeFallback(stage));this.cache.set(stage,buffer);if(stage===this.stage)this.playMovement(buffer);
 }
 playMovement(buffer){const src=this.ctx.createBufferSource(),gain=this.ctx.createGain();src.buffer=buffer;src.loop=true;src.connect(gain);gain.connect(this.master);const t=this.ctx.currentTime;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.8,t+2);src.start();if(this.current){const old=this.current;old.gain.gain.cancelScheduledValues(t);old.gain.gain.setValueAtTime(old.gain.gain.value,t);old.gain.gain.linearRampToValueAtTime(0,t+2);old.src.stop(t+2.1);old.src.onended=()=>{old.src.disconnect();old.gain.disconnect();};}this.current={src,gain};}
 tone(freq,duration=.6,volume=.12,type='sine'){if(!this.ctx)return;const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};}
 cue(name){if(name==='purr'){this.tone(27.5,2,.17);this.tone(55.3,2,.06);}else if(name==='seal'){this.tone(330,2,.14);this.tone(495,2.5,.08);}else if(name==='radio'){this.tone(880,.08,.035);this.tone(1320,.13,.02);}else if(name==='step')this.tone(75,.08,.018,'triangle');else this.tone(440,.5,.06);}
 tension(value){if(!this.ctx||this.paused||value<.25)return;const now=this.ctx.currentTime;if(now>=this.beatAt){this.tone(45+value*15,.25,.055*value);this.beatAt=now+1.3-value*.85;}}
}

export function composeFallback(stage){
 const sampleRate=8000,duration=8,size=sampleRate*duration,left=new Float32Array(size),right=new Float32Array(size),root=[55,51.913,48.999,46.249,65.406,58.270,65.406][stage];
 for(let i=0;i<size;i++){const t=i/sampleRate,edge=Math.min(1,t/.4,(duration-t)/.6),body=Math.sin(TAU*root*t)*.08;left[i]=(body+Math.sin(TAU*root*2.002*t)*.025)*edge;right[i]=(body+Math.sin(TAU*root*1.998*t)*.025)*edge;}
 return {left,right,sampleRate,duration};
}
