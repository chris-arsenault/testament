// An authored mutation of the menu, not a player-selected language setting.
export const menuTongues=[
 {heading:'Company, in the silence.',help:'Choose up to three witnesses.',resume:'RETURN',home:'Find the entrance',forget:'Forget this place',confirm:'Forget permanently?'},
 {heading:'La compagnie, dans le silence.',help:'Choisissez jusqu’à trois témoins.',resume:'REVENIR',home:'Retrouver l’entrée',forget:'Oublier ce lieu',confirm:'Oublier pour toujours ?'},
 {heading:'A companhia, no silêncio.',help:'Escolha até três testemunhas.',resume:'VOLTAR',home:'Encontrar a entrada',forget:'Esquecer este lugar',confirm:'Esquecer para sempre?'}
];
export const menuTongue=(index:number)=>menuTongues[((Math.trunc(index)%3)+3)%3];
