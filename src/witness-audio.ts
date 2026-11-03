import {witnesses,type Witness} from './content.js';
// Deterministic stereo PCM used by both the browser and signal tests; no downloaded samples.
export function composeWitnessCue(id:Witness,sampleRate=22050){
 const index=witnesses.findIndex(w=>w.id===id),duration=[4.8,4.1,5,4.7,3.8,3.2,3.5,3.1,4.3,4.4,5.2,4.5][index];
 const size=Math.ceil(duration*sampleRate),left=new Float32Array(size),right=new Float32Array(size);let seed=735+index*97,low=0;
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)*2-1;
 const sin=(f:number,t:number)=>Math.sin(2*Math.PI*f*t);
 for(let i=0;i<size;i++){
  const t=i/sampleRate,n=random();low=low*.97+n*.03;let v=0;
  switch(id){
   case 'peter':v=(sin(110,t)+.37*sin(303.16,t)+.15*sin(594.44,t))*Math.exp(-t*.9)*Math.min(1,t/.012);break;
   case 'andrew':v=(sin(73.4,t+.006*Math.sin(t*3))*.6+low*2)*Math.sin(Math.PI*t/duration)**2;break;
   case 'james':v=(low*4+sin(34,t)*.5+sin(51.1,t)*.2)*Math.exp(-t*.8)*Math.min(1,t/.08);break;
   case 'john':v=(sin(130.81,t)+sin(196.4,t)*.5+sin(261.9,t)*.25)*Math.sin(Math.PI*t/duration)**2*(.6+.4*Math.cos(t*2));break;
   case 'philip':for(let j=0;j<3;j++){const u=t-j*.29;if(u>0)v+=sin([392,554.37,698.9][j],u)*Math.exp(-u*2.2)*.5;}break;
   case 'bartholomew':v=n*.36*Math.sin(t*91)**8*Math.exp(-t*.85)+low*.7*Math.sin(Math.PI*t/duration);break;
   case 'matthew':for(let j=0;j<6;j++){const u=t-j*.31;if(u>0)v+=(sin(740+j*79,u)+.3*sin(1700+j*67,u))*Math.exp(-u*14)*.6;}break;
   case 'thomas':for(const start of [0,.47]){const u=t-start;if(u>=0)v+=(low*1.8+sin(88,u)*.8)*Math.exp(-u*17);}v+=sin(176,t)*Math.exp(-t*2)*.2;break;
   case 'alphaeus':v=Math.sin(2*Math.PI*(310*t-29*t*t))*.45*Math.sin(Math.PI*t/duration)**2+low*.3;break;
   case 'jude':v=(low*3+sin(53,t)*.12)*(.3+.7*Math.sin(t*13)**4)*Math.sin(Math.PI*t/duration);break;
   case 'simon':v=(sin(58.27,t)+.6*sin(160.59,t)+.28*sin(314.8,t))*Math.exp(-t*.7)*Math.min(1,t/.02);break;
   case 'judas':for(let j=0;j<7;j++){const u=t-j*.24;if(u>=0)v+=sin(930-j*71,u)*Math.exp(-u*9)*.3;}v+=sin(82,t)*.32*(t/duration)**2;break;
  }
  const edge=Math.min(1,t/.012,(duration-t)/.14),pan=Math.sin(t*(.7+index*.09))*.3;
  left[i]=Math.tanh(v*.36)*edge*(.8-pan);right[i]=Math.tanh(v*.36)*edge*(.8+pan);
 }
 return {left,right,sampleRate,duration};
}
export class WitnessAudio {
 cache=new Map<Witness,AudioBuffer>();
 play(channel:any,id:Witness){const ctx:AudioContext=channel.ctx;if(!ctx)return;let buffer=this.cache.get(id);if(!buffer){const pcm=composeWitnessCue(id,ctx.sampleRate);buffer=ctx.createBuffer(2,pcm.left.length,ctx.sampleRate);buffer.copyToChannel(pcm.left,0);buffer.copyToChannel(pcm.right,1);this.cache.set(id,buffer);}const source=ctx.createBufferSource();source.buffer=buffer;source.connect(channel.master);source.start();source.onended=()=>source.disconnect();}
}
