import type {Place} from './world.js';
export type PuzzleState={board:number[];elapsed:number;solved:boolean;selected:number|null;whispers:number};
export const glyphs=['','𐤀','𐤁','𐤂','𐤃'];
export const sudokuSolution=[1,2,3,4,3,4,1,2,2,1,4,3,4,3,2,1];
export const sudokuClues=[1,0,0,4,0,4,1,0,0,1,4,0,4,0,0,1];
export const puzzleInfo:Record<Place,{title:string;verse:string;political:string}>={
 nave:{title:'THE FIFTH DIRECTION',verse:'Let there be light. Let there be light. Let there be a meter.',political:'They did not privatize the sun. They privatized the window, and called the darkness a personal choice.'},
 stair:{title:'THE MISSING STEP',verse:'The angels were ascending and descending. No one had paid them for the descent.',political:'Every promotion promises a higher floor. Someone still owns the staircase.'},
 garden:{title:'THE BODY BEFORE THE BODY',verse:'In the beginning, God created the heavens and the earth. The deed was filed later.',political:'The first enclosure was a sentence: this is mine. The serpent only taught us how to sign it.'},
 water:{title:'FOUR NAMES FOR WATER',verse:'Let it divide the waters from the waters. Let neither bank remember the river was whole.',political:'They promised that everything would belong to everyone. Then they kept the key to the storehouse.'},
 crypt:{title:'THE UNEMPLOYED STARS',verse:'Son of man, can these bones live? Only if their return can be entered as growth.',political:'The ledger counts resurrection as productivity. It has no column for the life that wanted to remain unmeasured.'},
 scriptorium:{title:'THE LETTER THAT WROTE ITS READER',verse:'They began to speak with other tongues. The translation charged them by the word.',political:'A border is a sentence with an army behind it. The people who cannot read it still have to pay.'},
 choir:{title:'THE SIXTH PART OF SILENCE',verse:'Be still, and know. The silence was leased before anyone had heard it.',political:'The factory closed, but its rhythm remained in our bodies. We called the silence unemployment.'}
};
export function toggleCross(board:number[],index:number){const row=Math.floor(index/3),col=index%3;for(const [r,c] of [[row,col],[row-1,col],[row+1,col],[row,col-1],[row,col+1]])if(r>=0&&r<3&&c>=0&&c<3)board[r*3+c]=1-board[r*3+c];}
export function freshPuzzle(place:Place):PuzzleState{
 let board:number[];
 if(place==='scriptorium')board=[1,2,0,5,3,4,7,8,6];
 else if(place==='choir'){board=Array(6).fill(0);for(const i of [0,2,5]){board[i]++;board[(i+1)%6]++;}}
 else if(place==='nave')board=[1,3,2,1,3];
 else if(place==='stair'){board=[1,2,3,4,5,6,7,8,0];let empty=8,previous=-1;for(let i=0;i<34;i++){const neighbours=[empty-3,empty+3,...(empty%3?[empty-1]:[]),...(empty%3<2?[empty+1]:[])].filter(x=>x>=0&&x<9&&x!==previous);const next=neighbours[(i*7+3)%neighbours.length];[board[empty],board[next]]=[board[next],board[empty]];previous=empty;empty=next;}}
 else if(place==='garden')board=[4,0,7,2,8,1,5,3,6];
 else if(place==='water')board=[...sudokuClues];
 else{board=Array(9).fill(0);for(const i of [0,1,4,6,8])toggleCross(board,i);}
 return {board,elapsed:0,solved:false,selected:null,whispers:0};
}
export function isSolved(place:Place,b:number[]){
 if(place==='nave'||place==='crypt'||place==='choir')return b.every(v=>v===0);
 if(place==='stair')return b.every((v,i)=>v===(i+1)%9);
 if(place==='garden'||place==='scriptorium')return b.every((v,i)=>v===i);
 const unique=(a:number[])=>a.every(v=>v>=1&&v<=4)&&new Set(a).size===4;
 for(let r=0;r<4;r++)if(!unique(b.slice(r*4,r*4+4)))return false;
 for(let c=0;c<4;c++)if(!unique([b[c],b[c+4],b[c+8],b[c+12]]))return false;
 for(const start of [0,2,8,10])if(!unique([b[start],b[start+1],b[start+4],b[start+5]]))return false;
 return true;
}
export function act(place:Place,s:PuzzleState,index:number){
 if(s.solved||index<0||index>=s.board.length)return false;let changed=true;
 if(place==='scriptorium'){const row=Math.floor(index/3)*3;s.board.splice(row,3,...[s.board[row+1],s.board[row+2],s.board[row]]);}
 else if(place==='choir'){s.board[index]=(s.board[index]+1)%4;const next=(index+1)%6;s.board[next]=(s.board[next]+1)%4;}
 else if(place==='nave')s.board[index]=(s.board[index]+1)%4;
 else if(place==='stair'){const empty=s.board.indexOf(0);if(Math.abs(Math.floor(empty/3)-Math.floor(index/3))+Math.abs(empty%3-index%3)!==1)return false;[s.board[empty],s.board[index]]=[s.board[index],s.board[empty]];}
 else if(place==='garden'){if(s.selected===null){s.selected=index;return false;}if(s.selected===index){s.selected=null;return false;}[s.board[s.selected],s.board[index]]=[s.board[index],s.board[s.selected]];s.selected=null;}
 else if(place==='water'){if(sudokuClues[index])return false;s.board[index]=(s.board[index]+1)%5;}
 else toggleCross(s.board,index);
 s.solved=isSolved(place,s.board);return changed;
}
export function whisperInterval(elapsed:number){return Math.max(3,18*Math.exp(-Math.max(0,elapsed)/85));}
export function restorePuzzle(place:Place,value:unknown):PuzzleState{
 const fresh=freshPuzzle(place),s=value as Partial<PuzzleState>|null;if(!s||!Array.isArray(s.board)||s.board.length!==fresh.board.length)return fresh;
 const max=place==='nave'||place==='choir'?3:place==='water'?4:place==='crypt'?1:8;
 if(!s.board.every(n=>Number.isInteger(n)&&n>=0&&n<=max))return fresh;
 if((place==='garden'||place==='stair')&&new Set(s.board).size!==9)return fresh;
 if(place==='choir'&&((s.board.reduce((sum,n,i)=>sum+n*(i%2?-1:1),0)%4)+4)%4!==0)return fresh;
 if(place==='scriptorium'&&[0,3,6].some(start=>new Set(s.board!.slice(start,start+3)).size!==3||s.board!.slice(start,start+3).some((n,i)=>n<start||n>start+2||(i<2&&(n-start+1)%3!==s.board![start+i+1]-start))))return fresh;
 if(place==='water'&&sudokuClues.some((n,i)=>n!==0&&s.board![i]!==n))return fresh;
 if(place==='stair'){const vals=s.board.filter(n=>n!==0);let inversions=0;for(let i=0;i<vals.length;i++)for(let j=i+1;j<vals.length;j++)if(vals[i]>vals[j])inversions++;if(inversions%2)return fresh;}
 return {board:[...s.board],elapsed:typeof s.elapsed==='number'&&Number.isFinite(s.elapsed)?Math.max(0,s.elapsed):0,solved:isSolved(place,s.board),selected:null,whispers:typeof s.whispers==='number'&&Number.isFinite(s.whispers)?Math.max(0,Math.floor(s.whispers)):0};
}
