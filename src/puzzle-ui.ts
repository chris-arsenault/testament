import {act,freshPuzzle,glyphs,puzzleInfo,restorePuzzle,sudokuClues,whisperInterval,type PuzzleState} from './puzzles.js';
import {places,type Place,type World} from './world.js';import {witnesses} from './content.js';import {discipleWhispers} from './whispers.js';import {PuzzleAudio} from './puzzle-audio.js';
const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const numerals=['','I','II','III','IV','V','VI','VII','VIII'];
export class PuzzleUI {
 states:Record<Place,PuzzleState>;place:Place='nave';dialog=$<HTMLDialogElement>('puzzle');sound:PuzzleAudio;nextWhisper=0;saveClock=0;
 constructor(private world:()=>World,channel:any,private onOpen:()=>void,private onClose:(capture:boolean)=>void,private reduced:boolean){
  let saved:any={};try{saved=JSON.parse(localStorage.getItem('testament-tables-v1')||'{}');}catch{}
  this.states=Object.fromEntries(places.map(p=>[p,restorePuzzle(p,saved?.[p])])) as Record<Place,PuzzleState>;this.sound=new PuzzleAudio(channel);
  $('puzzleLeave').onclick=()=>this.close(true);this.dialog.addEventListener('cancel',e=>{e.preventDefault();this.close(false);});
  $('puzzleAgain').onclick=()=>{this.sound.stop();this.sound.canticle();};
 }
 get isOpen(){return this.dialog.open;}
 near(){const w=this.world();return Math.hypot(w.x+3.7,w.z-8)<4.8;}
 open(){if(this.isOpen)return;this.place=this.world().place;this.onOpen();this.nextWhisper=whisperInterval(this.states[this.place].elapsed);this.dialog.showModal();this.dialog.scrollTop=0;$('puzzleStatus').textContent='';this.render();$('puzzleTitle').focus();}
 close(capture:boolean){this.save();this.dialog.close();this.sound.stop();$('whisperRain').replaceChildren();this.onClose(capture);}
 reset(){this.states=Object.fromEntries(places.map(p=>[p,freshPuzzle(p)])) as Record<Place,PuzzleState>;this.save();}
 save(){try{localStorage.setItem('testament-tables-v1',JSON.stringify(this.states));}catch{}}
 render(focusIndex?:number){
  const s=this.states[this.place],info=puzzleInfo[this.place];$('puzzleTitle').textContent=info.title;$('puzzleRubric').textContent=info.rubric;$('puzzleInstruction').textContent=info.instruction;
  $('puzzleWork').classList.toggle('hidden',s.solved);$('puzzleReward').classList.toggle('hidden',!s.solved);$('puzzleVerse').textContent='“'+info.verse+'”';$('puzzlePolitics').textContent='“'+info.political+'”';
  const board=$('puzzleBoard');board.className='puzzle-board '+this.place;board.replaceChildren();if(s.solved){$('puzzleLeave').focus();return;}
  const symbols=['ALEPH','BETH','GIMEL','DALETH'];
  s.board.forEach((v,i)=>{const button=document.createElement('button');button.className='puzzle-piece';button.dataset.index=String(i);
   if(this.place==='nave'){button.innerHTML='<span class="north-star" aria-hidden="true">✦</span><span class="halo" aria-hidden="true"></span>';button.querySelector<HTMLElement>('.halo')!.style.transform=`rotate(${v*90}deg)`;button.setAttribute('aria-label',`Halo ${i+1}, cut facing ${['north','east','south','west'][v]}. Rotate clockwise.`);}
   else if(this.place==='stair'){button.textContent=v?numerals[v]:'';button.classList.toggle('vacancy',v===0);button.setAttribute('aria-label',v?`Stone ${numerals[v]}`:'Empty place');button.disabled=v===0;}
   else if(this.place==='garden'){button.style.backgroundImage='url(art/adam-and-eve.jpg)';button.style.backgroundSize='300% 300%';button.style.backgroundPosition=`${(v%3)*50}% ${Math.floor(v/3)*50}%`;button.classList.toggle('chosen',s.selected===i);button.setAttribute('aria-pressed',String(s.selected===i));button.setAttribute('aria-label',`Position ${i+1}, image fragment ${v+1}. Select to exchange.`);}
   else if(this.place==='water'){button.textContent=glyphs[v]||'·';button.disabled=!!sudokuClues[i];button.classList.toggle('given',!!sudokuClues[i]);button.setAttribute('aria-label',`Row ${Math.floor(i/4)+1}, column ${i%4+1}: ${v?symbols[v-1]:'empty'}${sudokuClues[i]?', fixed':', click to cycle'}`);}
   else{button.textContent=v?'✦':'·';button.classList.toggle('lit',v===1);button.setAttribute('aria-label',`Lamp ${i+1}, ${v?'lit':'dark'}`);}
   button.onclick=()=>{const wasSolved=s.solved;act(this.place,s,i);this.render(i);this.save();if(!wasSolved&&s.solved){this.sound.stop();this.sound.canticle();$('whisperRain').replaceChildren();$('puzzleStatus').textContent='The table answers.';}};board.append(button);
  });if(focusIndex!==undefined)board.querySelector<HTMLButtonElement>(`[data-index="${focusIndex}"]`)?.focus({preventScroll:true});
 }
 update(dt:number){if(!this.isOpen||document.hidden)return;const s=this.states[this.place];if(s.solved)return;s.elapsed+=dt;this.nextWhisper-=dt;this.saveClock+=dt;if(this.saveClock>5){this.save();this.saveClock=0;}if(this.nextWhisper<=0){this.whisper();this.nextWhisper=whisperInterval(s.elapsed);}}
 whisper(){const s=this.states[this.place],w=this.world();const company=w.party.length?w.party:['john' as const];const id=company[s.whispers%company.length];const person=witnesses.find(x=>x.id===id)!;const line=discipleWhispers[id][Math.floor(s.whispers/company.length)%3];const n=s.whispers++;this.sound.rustle(n%2?.65:-.65);const stream=document.createElement('div');stream.className='disciple-whisper';stream.style.left=`${4+(n*29)%55}%`;stream.style.setProperty('--drift',`${n%2?30:-30}px`);stream.innerHTML='<small></small><span></span>';stream.querySelector('small')!.textContent=person.name.toUpperCase();stream.querySelector('span')!.textContent=line;const rain=$('whisperRain');rain.append(stream);while(rain.children.length>4)rain.firstElementChild?.remove();stream.addEventListener('animationend',()=>stream.remove());setTimeout(()=>stream.remove(),14000);if(this.reduced)stream.classList.add('still-whisper');$('puzzleStatus').textContent=person.name+' whispers: '+line;}
}


