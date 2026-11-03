// Frozen scenes still redraw occasionally for asynchronously loaded textures.
// Hidden tabs and lost graphics contexts never submit a frame to the GPU.
export class FramePacer {
 last=-Infinity;dirty=true;
 invalidate(){this.dirty=true;}
 draw(now:number,active:boolean,hidden:boolean,lost:boolean){
  if(hidden||lost)return false;
  if(!active&&!this.dirty&&now-this.last<250)return false;
  this.last=now;this.dirty=false;return true;
 }
}

// Do not create an audio context here: visibility is not a player gesture.
export function audioVisibility(channels:{ctx?:AudioContext|null}[],hidden:boolean){
 for(const {ctx} of channels){if(!ctx||ctx.state==='closed')continue;try{const pending=hidden?ctx.suspend():ctx.resume();pending?.catch(()=>{});}catch{}}
}
