import type {Place} from './world.js';
export class PuzzleAudio {
 nodes:AudioScheduledSourceNode[]=[];seed=1407;
 cleanups=new Map<AudioScheduledSourceNode,()=>void>();
 constructor(private channel:any){}
 private track(source:AudioScheduledSourceNode,...downstream:AudioNode[]){let disposed=false;const cleanup=()=>{if(disposed)return;disposed=true;source.disconnect();for(const node of downstream)node.disconnect();this.nodes=this.nodes.filter(n=>n!==source);this.cleanups.delete(source);};this.nodes.push(source);this.cleanups.set(source,cleanup);source.onended=cleanup;}
 private retire(source:AudioScheduledSourceNode){try{source.stop();}catch{}this.cleanups.get(source)?.();}
 private reserve(count:number){while(this.nodes.length+count>28)this.retire(this.nodes[0]);}
 gesture(place:Place,index:number,value:number,kind:'move'|'select'|'blocked'|'undo'|'open'='move',resonance=0){
  const ctx:AudioContext=this.channel.ctx;if(!ctx||ctx.state!=='running')return;
  // A small, bounded voice budget keeps fast repeated turns from accumulating loud tails.
  this.reserve(4);
  const t=ctx.currentTime,pan=((index%4)-1.5)*.24,level=kind==='blocked'?.018:kind==='select'?.025:.042;
  const roots:Record<Place,number>={nave:130.81,stair:65.41,garden:98,water:196,crypt:55,scriptorium:146.83,choir:174.61};
  const base=roots[place]*(kind==='undo'?.75:kind==='open'?.5:1),duration=kind==='blocked'?.11:place==='choir'?.75:place==='water'?.45:.28;
  const voiced=(frequency:number,amplitude:number,delay=0)=>{const source=ctx.createOscillator(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),stereo=ctx.createStereoPanner();source.type=place==='water'||place==='choir'?'sine':place==='stair'?'triangle':'sine';source.frequency.setValueAtTime(frequency,t+delay);source.frequency.exponentialRampToValueAtTime(Math.max(25,frequency*(place==='stair'?.55:kind==='undo'?.86:1)),t+delay+duration);filter.type='lowpass';filter.frequency.setValueAtTime(place==='scriptorium'?2600:1300,t+delay);filter.frequency.exponentialRampToValueAtTime(140+resonance*450,t+delay+duration);gain.gain.setValueAtTime(0,t+delay);gain.gain.linearRampToValueAtTime(amplitude,t+delay+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+delay+duration);stereo.pan.value=pan;source.connect(filter);filter.connect(gain);gain.connect(stereo);stereo.connect(this.channel.master);this.track(source,filter,gain,stereo);source.start(t+delay);source.stop(t+delay+duration+.03);};
  const pitch=place==='water'?2**((value-1)/12):place==='choir'?2**((index*2+(value<=2?value:value-5)*.23)/12):1;
  voiced(base*pitch,level);if(kind==='move'){voiced(base*pitch*(place==='crypt'?2.71:place==='choir'?1.503:2.01),level*.32,.012);if(resonance>.65)voiced(base*3.002,level*.16,.08);}
  if(['stair','garden','scriptorium'].includes(place)&&kind!=='select'){const source=ctx.createBufferSource(),buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.085),ctx.sampleRate),samples=buffer.getChannelData(0);let low=0;for(let i=0;i<samples.length;i++){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;const n=this.seed/4294967296*2-1;low=low*.78+n*.22;samples[i]=(place==='scriptorium'?n-low:low)*Math.exp(-i/samples.length*7);}source.buffer=buffer;const gain=ctx.createGain();gain.gain.value=kind==='blocked'?.025:.07;source.connect(gain);gain.connect(this.channel.master);this.track(source,gain);source.start(t);}
 }
 rustle(pan:number){const ctx:AudioContext=this.channel.ctx;if(!ctx||ctx.state!=='running')return;this.reserve(1);const length=1.7,buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*length),ctx.sampleRate),data=buffer.getChannelData(0);let low=0;
  for(let i=0;i<data.length;i++){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;const noise=this.seed/4294967296*2-1;low=low*.86+noise*.14;const t=i/ctx.sampleRate;data[i]=(noise-low)*Math.sin(Math.PI*t/length)**2*(.45+.55*Math.sin(t*31)**2);}
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),stereo=ctx.createStereoPanner();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=1900;filter.Q.value=.65;gain.gain.value=.11;stereo.pan.value=pan;source.connect(filter);filter.connect(gain);gain.connect(stereo);stereo.connect(this.channel.master);this.track(source,filter,gain,stereo);source.start();
 }
 canticle(){const ctx:AudioContext=this.channel.ctx;if(!ctx||ctx.state!=='running')return;this.reserve(12);const notes=[146.83,164.81,196,174.61,130.81,146.83];for(let i=0;i<notes.length;i++)for(const detune of [-27,19]){const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+i*.82;o.type='triangle';o.frequency.value=notes[i];o.detune.value=detune+(i%2?13:-9);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.055,t+.16);g.gain.exponentialRampToValueAtTime(.0001,t+2);o.connect(g);g.connect(this.channel.master);this.track(o,g);o.start(t);o.stop(t+2.05);}}
 stop(){for(const source of [...this.nodes])this.retire(source);}
}
