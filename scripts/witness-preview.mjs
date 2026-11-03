import fs from 'node:fs';
const html=fs.readFileSync('public/index.html','utf8');
const panel=`<aside id="inspector"><strong>LOCAL WITNESS INSPECTOR · NOT PUBLISHED</strong><div id="presets"></div><button id="next">Advance 6 seconds</button><button id="table">Table</button><button id="languageTest">Menu</button><button id="normal">Normal</button><button id="hideRecord">Hide record</button><pre id="report"></pre></aside><style>#inspector{position:fixed;left:8px;top:8px;width:330px;padding:10px;background:#071115ed;color:#ddd;font:10px monospace;z-index:12}#inspector button{padding:5px;margin:2px;font:10px monospace}#report{white-space:pre-wrap;max-height:180px;overflow:auto}#veil,header,footer,#roomCard{display:none!important}</style>`;
const script=`<script type="module">
import {initial,select,separate,tick,walk,destination} from '/app/world.js';import {Cathedral} from '/app/rendering.js';import {Sound} from '/app/audio.js';import {witnesses} from '/app/content.js';import {PuzzleUI} from '/app/puzzle-ui.js';import {menuTongue} from '/app/languages.js';
let w=initial(),chosen='peter',playing=false;const view=new Cathedral(document.querySelector('#world')),sound=new Sound();let last=performance.now();
const puzzles=new PuzzleUI(()=>w,sound.effects,()=>playing=false,()=>playing=true,false,'testament-witness-inspector');
function choose(id){w=initial();select(w,[id]);chosen=id;w.z=3;Object.assign(w,{bridge:true,skin:true,stable:true,ceiling:true,passage:true,roots:true});
 if(['peter','philip'].includes(id)){w.x=10;w.z=0;w.yaw=Math.PI/2;}
 if(['andrew','matthew'].includes(id)){w.place='water';w.z=9;}
 if(id==='john'){w.place='garden';w.z=0;w.angel=1;}
 if(id==='jude')w.absence=1;if(id==='simon')w.place='crypt';if(id==='judas')separate(w,0);
 sound.start();playing=false;advance(7);view.draw(w,.05,false);}
function observe(){const t=w.time;return {target:['peter','philip'].includes(chosen)&&t<3?'threshold':['thomas','bartholomew'].includes(chosen)&&t<5?'stone':chosen==='john'&&t<3?'angel':'none',moving:['andrew','bartholomew','alphaeus'].includes(chosen)&&t>5.4};}
function advance(seconds){for(let t=0;t<seconds;t+=.05)tick(w,.05,observe());while(w.events.length){const e=w.events.shift();if(e.kind==='witness')sound.event(e);}report();}
function report(){const m=w.manifestations[chosen];document.querySelector('#report').textContent=JSON.stringify({witness:chosen,time:+w.time.toFixed(1),foot:[w.x,w.y,w.z],world:m?.remaining,visual:m?.visual,acted:m?.acted,tongue:w.tongue,doors:['front','left','right'].map(d=>destination(w,d)),drawCalls:view.renderer.info.render.calls,webglPrograms:view.renderer.info.programs.length},null,2);}
for(const person of witnesses){const b=document.createElement('button');b.textContent=person.name;b.onclick=()=>choose(person.id);document.querySelector('#presets').append(b);}
document.querySelector('#next').onclick=()=>advance(6);document.querySelector('#table').onclick=()=>{if(chosen!=='matthew')choose('matthew');w.x=-3.7;w.z=8;puzzles.states.water={board:[1,0,0,4,0,4,1,0,0,1,4,0,4,0,0,1],elapsed:0,solved:false,selected:null,whispers:0};puzzles.open();};
document.querySelector('#languageTest').onclick=()=>{const t=menuTongue(w.tongue);document.querySelector('#menuHeading').textContent=t.heading;document.querySelector('#resume').textContent=t.resume;document.querySelector('#home').textContent=t.home;document.querySelector('#new').textContent=t.forget;document.querySelector('#menu').showModal();};document.querySelector('#resume').onclick=()=>document.querySelector('#menu').close();document.querySelector('#normal').onclick=()=>{w=initial();select(w,[]);playing=false;};
document.querySelector('#hideRecord').onclick=()=>document.querySelector('#inspector').hidden=true;\nfunction frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(playing)tick(w,dt,observe());puzzles.update(dt);view.draw(w,playing?dt:0,false);report();requestAnimationFrame(frame);}requestAnimationFrame(frame);choose('peter');
</script>`;
fs.writeFileSync('tests/witness-preview.html',html.replace('<script type="module" src="app/main.js"></script>',panel+script));
