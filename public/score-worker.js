import {composeMovement} from './score.js';

self.onmessage=({data})=>{
 const stage=data?.stage;if(!Number.isInteger(stage)||stage<0||stage>6)return;
 try{const pcm=composeMovement(stage);self.postMessage({stage,left:pcm.left,right:pcm.right,sampleRate:pcm.sampleRate},[pcm.left.buffer,pcm.right.buffer]);}
 catch{self.postMessage({stage,error:true});}
};
