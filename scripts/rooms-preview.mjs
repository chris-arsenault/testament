import fs from 'node:fs';
let code=fs.readFileSync('dist/app/main.js','utf8').replaceAll("from './","from '/app/").replaceAll('testament-cathedral-v2','testament-room-preview-world').replaceAll('testament-volume','testament-room-preview-volume').replace('continueWorld, reduced);',"continueWorld, reduced, 'testament-room-preview-tables');");
code="import {rooms,homes,floorHeight,places} from '/app/rooms.js';\n"+code;
code+=`
const qa=document.createElement('aside');qa.id='qa';qa.innerHTML='<b>LOCAL ROOM REVIEW · NOT PUBLISHED</b><div id="qaRooms"></div><div id="qaPeople"></div><button id="qaThrone">Philip with throne claim</button><button id="qaTable">Approach table</button><button id="qaHide">Hide review</button><pre id="qaReport"></pre>';document.body.append(qa);
function ready(place){menu.close();encounters.dialog.close();puzzles.dialog.close();w.place=place;Object.assign(w,rooms[place].spawn,{y:0,yaw:0,pitch:.1,vy:0,skin:true,stable:true,cooldown:1.3});w.y=floorHeight(place,w.x,w.z);w.angel=place==='garden'?1:0;w.events=[];roomTime=0;castTime=0;started=true;active=true;$('veil').classList.add('hidden');renderer.draw(w,0,false);}
for(const place of places){const b=document.createElement('button');b.textContent=place;b.onclick=()=>ready(place);$('qaRooms').append(b);}
function person(id){const h=homes[id];ready(h.place);w.x=h.x;w.z=h.z+3;w.y=floorHeight(w.place,w.x,w.z);w.pitch=-.1;renderer.draw(w,0,false);}
for(const p of witnesses){const b=document.createElement('button');b.textContent=p.name;b.onclick=()=>person(p.id);$('qaPeople').append(b);}
$('qaThrone').onclick=()=>{w=initial();w.place='crypt';separate(w,1);person('philip');};
$('qaTable').onclick=()=>{const p=rooms[w.place].table;w.x=p.x;w.z=p.z+2.5;w.y=floorHeight(w.place,w.x,w.z);w.yaw=0;w.pitch=-.28;renderer.draw(w,0,false);};
$('qaHide').onclick=()=>qa.style.display='none';
setInterval(()=>$('qaReport').textContent=JSON.stringify({room:w.place,party:w.party,waiting:w.waitSpots,position:[w.x,w.y,w.z],calls:renderer.renderer.info.render.calls,triangles:renderer.renderer.info.render.triangles,target:renderer.interaction(w)},null,1),500);
ready('nave');
`;
let html=fs.readFileSync('public/index.html','utf8').replace('<script type="module" src="app/main.js"></script>',`<script type="module">${code}</script>`).replace('</head>','<style>#qa{position:fixed;z-index:4;top:65px;left:10px;width:440px;max-width:90vw;background:#10171dea;color:#eee;padding:10px;font:10px monospace}#qa button{font:10px monospace;padding:5px;margin:2px}#qaReport{max-height:140px;overflow:auto}</style></head>');
fs.writeFileSync('tests/rooms-preview.html',html);
