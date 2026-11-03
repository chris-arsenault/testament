import type {Place} from './world.js';
export const PUZZLE_REVISION=2;
export type PuzzleState={revision:number;board:number[];elapsed:number;solved:boolean;selected:number|null;whispers:number};
export const glyphs=['','𐤀','𐤁','𐤂','𐤃','𐤄','𐤅'];
export const letterGlyphs=['𐤀','𐤁','𐤂','𐤃','𐤄','𐤅','𐤆','𐤇','𐤈'];
export const sudokuSolution=[1,2,3,4,5,6,4,5,6,1,2,3,2,3,4,5,6,1,5,6,1,2,3,4,3,4,5,6,1,2,6,1,2,3,4,5];
// Eleven fixed names, one completion. The first and fourth cells also anchor Matthew's borrowed ledger.
export const sudokuClues=[1,0,3,4,5,0,4,0,0,0,0,0,0,0,0,5,0,1,0,0,0,0,3,0,0,0,5,6,0,0,0,0,0,0,4,0];
export const puzzleInfo:Record<Place,{title:string;verse:string;political:string}>={
 nave:{title:'THE FIFTH DIRECTION',verse:'Let there be light. Let there be light. Let there be a meter.',political:'They did not privatize the sun. They privatized the window, and called the darkness a personal choice.'},
 stair:{title:'THE MISSING STEP',verse:'The angels were ascending and descending. No one had paid them for the descent.',political:'Every promotion promises a higher floor. Someone still owns the staircase.'},
 garden:{title:'THE BODY BEFORE THE BODY',verse:'In the beginning, God created the heavens and the earth. The deed was filed later.',political:'The first enclosure was a sentence: this is mine. The serpent only taught us how to sign it.'},
 water:{title:'FOUR NAMES FOR WATER',verse:'Let it divide the waters from the waters. Let neither bank remember the river was whole.',political:'They promised that everything would belong to everyone. Then they kept the key to the storehouse.'},
 crypt:{title:'THE UNEMPLOYED STARS',verse:'Son of man, can these bones live? Only if their return can be entered as growth.',political:'The ledger counts resurrection as productivity. It has no column for the life that wanted to remain unmeasured.'},
 scriptorium:{title:'THE LETTER THAT WROTE ITS READER',verse:'They began to speak with other tongues. The translation charged them by the word.',political:'A border is a sentence with an army behind it. The people who cannot read it still have to pay.'},
 choir:{title:'THE SIXTH PART OF SILENCE',verse:'Be still, and know. The silence was leased before anyone had heard it.',political:'The factory closed, but its rhythm remained in our bodies. We called the silence unemployment.'}
};
export const puzzleSize=(place:Place)=>place==='water'?6:place==='scriptorium'?3:4;
const mod=(n:number,m:number)=>(n%m+m)%m;
export const conduitMasks=(()=>{const b=Array(16).fill(0);for(const [a,c] of [[0,1],[1,5],[5,4],[4,8],[8,9],[9,13],[13,12],[13,14],[14,10],[10,6],[6,2],[2,3],[3,7],[7,11],[11,15]]){const d=c-a;const bit=d===1?2:d===-1?8:d===4?4:1;b[a]|=bit;b[c]|=bit===1?4:bit===2?8:bit===4?1:2;}b[0]|=8;b[15]|=2;return b;})();
export function turnedMask(mask:number,turns:number){return ((mask<<turns)|(mask>>(4-turns)))&15;}
const neighbours=(i:number,n:number)=>[i-n,i+n,...(i%n?[i-1]:[]),...(i%n<n-1?[i+1]:[])].filter(j=>j>=0&&j<n*n);
const adjacent=(a:number,b:number,n:number)=>Math.abs(Math.floor(a/n)-Math.floor(b/n))+Math.abs(a%n-b%n)===1;
export function toggleCross(board:number[],index:number){const n=Math.sqrt(board.length);for(const i of [index,...neighbours(index,n)])board[i]=1-board[i];}
export function turnLoom(board:number[],index:number){const row=index<3,offset=index%3,ids=row?[offset*3,offset*3+1,offset*3+2]:[offset,offset+3,offset+6];const first=board[ids[0]];for(let i=0;i<2;i++)board[ids[i]]=board[ids[i+1]];board[ids[2]]=first;}
export function turnChimes(board:number[],index:number){for(const [offset,amount] of [[0,1],[1,1],[3,2]]){const j=(index+offset)%8;board[j]=mod(board[j]+amount,5);}}
export function solvedBoard(place:Place):number[]{
 if(place==='water')return [...sudokuSolution];if(place==='stair')return Array.from({length:16},(_,i)=>(i+1)%16);
 if(place==='garden'||place==='scriptorium')return Array.from({length:place==='garden'?16:9},(_,i)=>i);
 return Array(place==='choir'?8:16).fill(0);
}
export function freshPuzzle(place:Place):PuzzleState{
 let board=solvedBoard(place);
 if(place==='nave')board=[0,1,3,2,2,1,3,2,1,3,2,1,2,3,1,2];
 else if(place==='stair'){let empty=15,previous=-1;for(let i=0;i<42;i++){const options=neighbours(empty,4).filter(n=>n!==previous),next=options[(i*7+3)%options.length];[board[empty],board[next]]=[board[next],board[empty]];previous=empty;empty=next;}}
 else if(place==='garden'){for(let i=0;i<36;i++){const a=(i*7+3)%16,opts=neighbours(a,4),b=opts[(i*5+1)%opts.length];[board[a],board[b]]=[board[b],board[a]];}}
 else if(place==='water')board=[...sudokuClues];
 else if(place==='crypt')for(const i of [0,2,3,4,5,7,8])toggleCross(board,i);
 else if(place==='scriptorium')for(const i of [0,3,1,4,2,5,0])turnLoom(board,i);
 else if(place==='choir')for(const i of [0,0,1,2,2,2,4,4,5,6,6,7])turnChimes(board,i);
 return {revision:PUZZLE_REVISION,board,elapsed:0,solved:false,selected:null,whispers:0};
}
function validSudoku(b:number[],n=6,boxWidth=3){
 if(b.length!==n*n)return false;const valid=(a:number[])=>a.every(v=>Number.isInteger(v)&&v>=1&&v<=n)&&new Set(a).size===n;
 for(let r=0;r<n;r++)if(!valid(b.slice(r*n,(r+1)*n)))return false;
 for(let c=0;c<n;c++)if(!valid(Array.from({length:n},(_,r)=>b[r*n+c])))return false;
 const h=n/boxWidth;for(let r=0;r<n;r+=h)for(let c=0;c<n;c+=boxWidth){const a=[];for(let y=0;y<h;y++)for(let x=0;x<boxWidth;x++)a.push(b[(r+y)*n+c+x]);if(!valid(a))return false;}return true;
}
export function conduitLight(b:number[]){
 const masks=b.map((v,i)=>turnedMask(conduitMasks[i],v)),lit=new Set<number>(),leaks=new Set<number>();
 if(masks[0]&8)lit.add(0);const todo=[...lit];
 for(let h=0;h<todo.length;h++){const i=todo[h];for(const [bit,dr,dc,back] of [[1,-1,0,4],[2,0,1,8],[4,1,0,1],[8,0,-1,2]])if(masks[i]&bit){const r=Math.floor(i/4)+dr,c=i%4+dc;if(r<0||r>3||c<0||c>3){if(!((i===0&&bit===8)||(i===15&&bit===2)))leaks.add(i);continue;}const j=r*4+c;if(!(masks[j]&back)){leaks.add(i);continue;}if(!lit.has(j)){lit.add(j);todo.push(j);}}}
 return {lit:[...lit],leaks:[...leaks],complete:lit.size===16&&leaks.size===0&&!!(masks[15]&2)};
}
export function isSolved(place:Place,b:number[]){
 if(b.length!==solvedBoard(place).length)return false;
 if(place==='nave')return b.every(v=>Number.isInteger(v)&&v>=0&&v<4)&&conduitLight(b).complete;
 if(place==='crypt'||place==='choir')return b.every(v=>v===0);
 if(place==='stair')return b.every((v,i)=>v===(i+1)%16);
 if(place==='garden'||place==='scriptorium')return b.every((v,i)=>v===i);
 return validSudoku(b)&&sudokuClues.every((v,i)=>!v||b[i]===v);
}
export function act(place:Place,s:PuzzleState,index:number){
 const count=place==='scriptorium'?6:s.board.length;if(s.solved||!Number.isInteger(index)||index<0||index>=count)return false;
 if(place==='scriptorium')turnLoom(s.board,index);
 else if(place==='choir')turnChimes(s.board,index);
 else if(place==='nave')s.board[index]=(s.board[index]+1)%4;
 else if(place==='stair'){const empty=s.board.indexOf(0);if(!adjacent(empty,index,4))return false;[s.board[empty],s.board[index]]=[s.board[index],s.board[empty]];}
 else if(place==='garden'){if(s.selected===null){s.selected=index;return false;}if(s.selected===index){s.selected=null;return false;}if(!adjacent(s.selected,index,4)){s.selected=index;return false;}[s.board[s.selected],s.board[index]]=[s.board[index],s.board[s.selected]];s.selected=null;}
 else if(place==='water'){if(sudokuClues[index])return false;s.board[index]=(s.board[index]+1)%7;}
 else toggleCross(s.board,index);
 s.solved=isSolved(place,s.board);return true;
}
export function puzzleFeedback(place:Place,b:number[]){
 const active:number[]=[],conflicts:number[]=[];let matched=0;
 if(place==='nave'){const flow=conduitLight(b);return {active:flow.lit,conflicts:flow.leaks,matched:flow.lit.length/16};}
 if(place==='water'){for(let i=0;i<36;i++)if(b[i]){let conflict=false;for(let j=0;j<36;j++)if(i!==j&&b[i]===b[j]&&(Math.floor(i/6)===Math.floor(j/6)||i%6===j%6||(Math.floor(i/12)===Math.floor(j/12)&&Math.floor((i%6)/3)===Math.floor((j%6)/3))))conflict=true;if(conflict)conflicts.push(i);else active.push(i);}return {active,conflicts,matched:active.length/36};}
 const target=solvedBoard(place);for(let i=0;i<b.length;i++)if(b[i]===target[i]){matched++;active.push(i);}return {active,conflicts,matched:matched/b.length};
}
export function whisperInterval(elapsed:number){return Math.max(3,18*Math.exp(-Math.max(0,elapsed)/85));}
const inversions=(board:number[])=>board.reduce((sum,v,i)=>sum+board.slice(i+1).filter(n=>n<v).length,0);
function lightsReachable(board:number[]){
 const n=board.length,rows=Array.from({length:n},(_,r)=>{const row=Array(n+1).fill(0);for(let c=0;c<n;c++){const move=Array(n).fill(0);toggleCross(move,c);row[c]=move[r];}row[n]=board[r];return row;});let pivot=0;
 for(let c=0;c<n;c++){const next=rows.findIndex((row,r)=>r>=pivot&&row[c]);if(next<0)continue;[rows[next],rows[pivot]]=[rows[pivot],rows[next]];for(let r=0;r<n;r++)if(r!==pivot&&rows[r][c])for(let j=c;j<=n;j++)rows[r][j]^=rows[pivot][j];pivot++;}
 return rows.every(row=>row.slice(0,n).some(Boolean)||!row[n]);
}
function legacyCompletion(place:Place,b:unknown){
 if(!Array.isArray(b)||!b.every(Number.isInteger))return false;
 if(place==='water')return validSudoku(b,4,2)&&[1,0,0,4,0,4,1,0,0,1,4,0,4,0,0,1].every((v,i)=>!v||b[i]===v);
 if(place==='nave'||place==='crypt'||place==='choir')return b.length===(place==='nave'?5:place==='crypt'?9:6)&&b.every(v=>v===0);
 if(b.length!==9)return false;return b.every((v,i)=>v===(place==='stair'?(i+1)%9:i));
}
export function restorePuzzle(place:Place,value:unknown):PuzzleState{
 const fresh=freshPuzzle(place),s=value as Partial<PuzzleState>|null;if(!s)return fresh;
 const elapsed=typeof s.elapsed==='number'&&Number.isFinite(s.elapsed)?Math.max(0,s.elapsed):0,whispers=typeof s.whispers==='number'&&Number.isFinite(s.whispers)?Math.max(0,Math.floor(s.whispers)):0;
 if(s.revision!==PUZZLE_REVISION){if(legacyCompletion(place,s.board))return {...fresh,board:solvedBoard(place),solved:true,elapsed,whispers};return {...fresh,elapsed,whispers};}
 if(!Array.isArray(s.board)||s.board.length!==fresh.board.length)return fresh;
 const b=s.board,max=place==='nave'?3:place==='choir'?4:place==='water'?6:place==='crypt'?1:place==='scriptorium'?8:15;
 if(!b.every(n=>Number.isInteger(n)&&n>=0&&n<=max))return fresh;
 if(['garden','stair','scriptorium'].includes(place)&&new Set(b).size!==b.length)return fresh;
 if(place==='water'&&sudokuClues.some((n,i)=>n!==0&&b[i]!==n))return fresh;
 if(place==='stair'&&(inversions(b.filter(v=>v!==0))+4-Math.floor(b.indexOf(0)/4))%2!==1)return fresh;
 if(place==='scriptorium'&&inversions(b)%2)return fresh;
 if(place==='crypt'&&!lightsReachable(b))return fresh;
 return {revision:PUZZLE_REVISION,board:[...b],elapsed,solved:isSolved(place,b),selected:null,whispers};
}
