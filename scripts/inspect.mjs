// Private CLI inspector. Never copied into dist or imported by the player runtime.
import {initial,restore,destination} from '../dist/app/world.js';import {readFileSync} from 'node:fs';
const w=process.argv[2]?restore(readFileSync(process.argv[2],'utf8')):initial();console.log(JSON.stringify({state:w,connections:Object.fromEntries(['front','left','right','low'].map(d=>[d,destination(w,d)]))},null,2));
