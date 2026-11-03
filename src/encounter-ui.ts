import {witnesses,type Witness} from './content.js';
import {recruit,THRONE_SOLITUDE,type World} from './world.js';
const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
export class EncounterUI {
 dialog=$<HTMLDialogElement>('encounter');id:Witness='peter';
 constructor(private world:()=>World,private save:()=>void,private onOpen:()=>void,private onClose:(capture:boolean)=>void,private onRecruit:(id:Witness)=>void=()=>{}){
  $('encounterLeave').onclick=()=>this.close(true);
  this.dialog.addEventListener('cancel',e=>{e.preventDefault();this.close(false);});
 }
 get isOpen(){return this.dialog.open;}
 open(id:Witness){if(this.isOpen)return;this.id=id;this.onOpen();this.render();this.dialog.showModal();$('encounterName').focus();}
 close(capture:boolean){if(!this.isOpen)return;this.dialog.close();this.onClose(capture);}
 render(){const w=this.world(),person=witnesses.find(p=>p.id===this.id)!;
  $('encounterName').textContent=person.name;$('encounterBody').textContent=person.body;
  $('encounterLine').textContent='“'+person.line+'”';const choices=$('encounterChoices');choices.replaceChildren();
  const add=(label:string,replace?:Witness,disabled=false)=>{const b=document.createElement('button');b.textContent=label;b.disabled=disabled;b.onclick=()=>{if(recruit(w,this.id,replace)){this.save();this.close(true);this.onRecruit(this.id);}else this.render();};choices.append(b);};
  if(w.party.includes(this.id)){const spot=w.waitSpots[this.id];if(w.left.includes(this.id)){const bound=!!spot?.enthroned&&spot.alone<THRONE_SOLITUDE;add(bound?'I have only just arrived.':'Walk beside me',undefined,bound);}}
  else{if(w.party.length<3)add('Walk beside me');for(const id of w.party){const name=witnesses.find(p=>p.id===id)!.name,bound=!!w.waitSpots[id]?.enthroned;add(bound?name+' · Upon the throne':'In place of '+name,id,bound);}}
 }
}
