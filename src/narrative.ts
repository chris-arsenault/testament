import type {Place,World,Event} from './world.js';
export type Verse={text:string;reference:string;source:string};
// Quotations are exact WEB text or explicitly identified excerpts. The room catalogue is separately fictional.
export const verses:Record<string,Verse>={
 beginning:{text:'In the beginning, God created the heavens and the earth.',reference:'Genesis 1:1 · WEB',source:'https://ebible.org/engwebp/GEN01.htm'},
 house:{text:'Surely the LORD is in this place, and I didn’t know it.',reference:'Genesis 28:16 · WEB · excerpt',source:'https://ebible.org/engwebp/GEN28.htm'},
 stair:{text:'He dreamed and saw a stairway set upon the earth, and its top reached to heaven. Behold, the angels of God were ascending and descending on it.',reference:'Genesis 28:12 · WEB',source:'https://ebible.org/engwebp/GEN28.htm'},
 return:{text:'For I will not leave you until I have done that which I have spoken of to you.',reference:'Genesis 28:15 · WEB · excerpt',source:'https://ebible.org/engwebp/GEN28.htm'},
 eyes:{text:'The four living creatures, each one of them having six wings, are full of eyes around and within.',reference:'Revelation 4:8 · WEB · excerpt',source:'https://ebible.org/engwebp/REV04.htm'},
 door:{text:'After these things I looked and saw a door opened in heaven;',reference:'Revelation 4:1 · WEB · excerpt',source:'https://ebible.org/engwebp/REV04.htm'},
 water:{text:'Let there be an expanse in the middle of the waters, and let it divide the waters from the waters.',reference:'Genesis 1:6 · WEB · excerpt',source:'https://ebible.org/engwebp/GEN01.htm'},
 bones:{text:'Son of man, can these bones live?',reference:'Ezekiel 37:3 · WEB · excerpt',source:'https://ebible.org/engwebp/EZK37.htm'},
 breath:{text:'Behold, I will cause breath to enter into you, and you will live.',reference:'Ezekiel 37:5 · WEB · excerpt',source:'https://ebible.org/engwebp/EZK37.htm'},
 still:{text:'Be still, and know that I am God.',reference:'Psalm 46:10 · WEB · excerpt',source:'https://ebible.org/engwebp/PSA046.htm'},
 doubt:{text:'Blessed are those who have not seen and have believed.',reference:'John 20:29 · WEB · excerpt',source:'https://ebible.org/engwebp/JHN20.htm'},
 renewal:{text:'Behold, I am making all things new.',reference:'Revelation 21:5 · WEB · excerpt',source:'https://ebible.org/engwebp/REV21.htm'}
};
export const roomRecords:Record<Place,{title:string;record:string;detail:string;verse:string}>={
 nave:{title:'THE HOUSE OF BREATH',record:'GENESIS 28:17',detail:'BETHEL / ONE DAY BEFORE THE FIRST DAY',verse:'house'},
 stair:{title:'JACOB’S SECOND LADDER',record:'GENESIS 28:13',detail:'UPPER FLOOR / BELOW THE POINT OF DEPARTURE',verse:'stair'},
 garden:{title:'THE GARDEN OF WITNESSES',record:'REVELATION 4:7',detail:'EDEN / EAST OF THE EASTERN GATE',verse:'door'},
 water:{title:'THE SEA ABOVE',record:'GENESIS 1:8',detail:'SECOND DAY / THIRD ATTEMPT',verse:'water'},
 crypt:{title:'THE VALLEY OF NAMES',record:'EZEKIEL 37:4',detail:'BURIAL REGISTER / NO DEATHS RECORDED',verse:'bones'},
 scriptorium:{title:'THE LETTER BEFORE LANGUAGE',record:'ACTS 2:5',detail:'BABEL / TRANSLATION PRECEDES THE ORIGINAL',verse:'doubt'},
 choir:{title:'THE CHOIR WITHOUT A MOUTH',record:'REVELATION 8:2',detail:'THE SEVENTH SILENCE / STILL BEING RECORDED',verse:'still'}
};
const eventVerses:Record<string,string>={ascent:'stair',descent:'return',angel:'eyes',reality:'door',stable:'doubt',rest:'still',lament:'still',division:'water',bridge:'water',bones:'breath',roots:'breath',garden:'renewal',renewal:'renewal',rejoin:'return',silver:'door',cat:'house'};
export type Cue={verse:Verse;key:string;delay:number};
export class Narrator {
 queue:Cue[]=[];spoken=new Set<string>();current:Cue|null=null;remaining=0;gap=0;
 enter(w:World){this.queue=[];this.current=null;this.remaining=0;this.gap=5.6;this.offer(roomRecords[w.place].verse,true);}
 offer(key:string,repeat=false){if(!verses[key]||(!repeat&&this.spoken.has(key))||this.queue.some(c=>c.key===key)||this.current?.key===key)return;this.queue.push({verse:verses[key],key,delay:0});if(this.queue.length>3)this.queue.shift();}
 event(e:Event){const key=eventVerses[e.kind];if(key)this.offer(key);}
 update(dt:number,enabled:boolean):Verse|null{
  if(!enabled){this.current=null;this.queue=[];this.remaining=0;return null;}
  if(this.current){this.remaining-=dt;if(this.remaining<=0){this.current=null;this.gap=3;}}
  else{this.gap-=dt;if(this.gap<=0&&this.queue.length){this.current=this.queue.shift()!;this.spoken.add(this.current.key);this.remaining=Math.max(7,this.current.verse.text.split(' ').length*.38);}}
  return this.current?.verse||null;
 }
}
