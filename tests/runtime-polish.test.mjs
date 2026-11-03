import test from 'node:test';
import assert from 'node:assert/strict';
import {FramePacer,audioVisibility} from '../dist/app/runtime.js';
import {Sound} from '../dist/app/audio.js';

test('background and lost-context scenes submit no frames; idle draws are bounded and resume is immediate',()=>{
 const gate=new FramePacer();let idle=0;
 for(let n=0;n<1000;n+=10)if(gate.draw(n,false,false,false))idle++;
 assert.equal(idle,4);assert.ok(gate.draw(1001,true,false,false));
 for(let n=1010;n<2000;n+=10){assert.equal(gate.draw(n,true,true,false),false);assert.equal(gate.draw(n,true,false,true),false);}
 gate.invalidate();assert.equal(gate.draw(2001,false,false,false),true);assert.equal(gate.draw(2010,false,false,false),false);
 gate.invalidate();assert.equal(gate.draw(2011,false,false,false),true,'resize/restoration can repaint immediately');
});

test('visibility suspends existing contexts without creating any and resumes both channels',async()=>{
 const calls=[],context=name=>({state:'running',suspend(){calls.push(name+':suspend');return Promise.resolve();},resume(){calls.push(name+':resume');return Promise.resolve();}});
 const channels=[{ctx:context('music')},{ctx:context('effects')},{ctx:null},{ctx:{state:'closed',suspend(){throw Error('closed');}}}];
 audioVisibility(channels,true);audioVisibility(channels,false);assert.deepEqual(calls,['music:suspend','effects:suspend','music:resume','effects:resume']);
 audioVisibility([{ctx:{state:'running',suspend(){return Promise.reject(new Error('device disconnected'));}}}],true);await new Promise(resolve=>setImmediate(resolve));
});

test('overlay callbacks cannot restart sound while the tab is hidden',()=>{
 const calls=[],sound=new Sound();const channel=name=>({ctx:{state:'running',suspend(){calls.push(name+' off');},resume(){calls.push(name+' on');}},setPaused(){}});
 sound.music=channel('music');sound.effects=channel('effects');sound.visibility(true);sound.pause(false);assert.deepEqual(calls,['music off','effects off']);sound.visibility(false);assert.deepEqual(calls,['music off','effects off','music on','effects on']);
});
