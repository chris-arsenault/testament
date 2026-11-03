// An authored mutation of the menu, not a player-selected language setting.
export const menuTongues=[
 {heading:'The cathedral waits.',resume:'RETURN',home:'Find the entrance',forget:'Forget this place',confirm:'Forget permanently?'},
 {heading:'La cathédrale attend.',resume:'REVENIR',home:'Retrouver l’entrée',forget:'Oublier ce lieu',confirm:'Oublier pour toujours ?'},
 {heading:'A catedral espera.',resume:'VOLTAR',home:'Encontrar a entrada',forget:'Esquecer este lugar',confirm:'Esquecer para sempre?'}
];
export const menuTongue=(index:number)=>menuTongues[((Math.trunc(index)%3)+3)%3];
