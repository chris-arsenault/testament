// Build a local-only browser fixture using the actual shipped puzzle markup and modules.
import {readFileSync,writeFileSync} from 'node:fs';
let html=readFileSync('public/index.html','utf8');
html=html.replace('</head>','<style>#veil,header,footer,#touch{display:none!important}#dev{position:fixed;top:10px;left:10px;z-index:10;font:10px monospace;background:#000b;padding:8px}</style></head>');
html=html.replace('<script type="module" src="app/main.js"></script>',`<nav id="dev">LOCAL PUZZLE INSPECTOR <button data-place="nave">Nave</button><button data-place="stair">Stair</button><button data-place="garden">Garden</button><button data-place="water">Water</button><button data-place="crypt">Crypt</button></nav><script type="module">
import {Cathedral} from '/app/rendering.js';import {Sound} from '/app/audio.js';import {PuzzleUI} from '/app/puzzle-ui.js';import {initial} from '/app/world.js';
const w=initial();w.x=-3.7;w.z=8;const renderer=new Cathedral(document.querySelector('canvas')),audio=new Sound();const ui=new PuzzleUI(()=>w,audio.effects,()=>audio.pause(true),()=>audio.pause(false),matchMedia('(prefers-reduced-motion: reduce)').matches,'testament-tables-defect-preview');
document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>{w.place=b.dataset.place;audio.start();ui.open();});let last=performance.now();function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;ui.update(dt);renderer.draw(w,dt,false);requestAnimationFrame(frame);}requestAnimationFrame(frame);
</script>`);
writeFileSync('tests/puzzle-preview.html',html);
