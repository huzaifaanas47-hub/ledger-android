// Ledger logo: an open ledger book with a rising gold arrow, on an emerald tile.
const GOLD='<linearGradient id="gd" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f59e0b"/><stop offset="1" stop-color="#fde68a"/></linearGradient>';
const book=(mono)=>{
 const L='M512 396C438 346 330 340 246 368L246 694C330 668 438 676 512 726Z', R='M512 396C586 346 694 340 778 368L778 694C694 668 586 676 512 726Z';
 const arrow='M584 640L650 574L704 612L786 494';
 const head='M742 468L828 436L812 526Z';
 if(mono) return `<defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024"><rect width="1024" height="1024" fill="#fff"/><path d="M512 396V726" stroke="#000" stroke-width="12"/><path d="${arrow}" fill="none" stroke="#000" stroke-width="86" stroke-linecap="round" stroke-linejoin="round"/><path d="${head}" fill="#000" stroke="#000" stroke-width="52" stroke-linejoin="round"/></mask></defs>
 <g mask="url(#m)"><path d="${L}" fill="#fff"/><path d="${R}" fill="#fff"/></g><path d="${arrow}" fill="none" stroke="#fff" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/><path d="${head}" fill="#fff" stroke="#fff" stroke-width="14" stroke-linejoin="round"/>`;
 return `<defs>${GOLD}<filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#012017" flood-opacity=".38"/></filter></defs>
 <g filter="url(#sh)"><path d="${L}" fill="#fff"/><path d="${R}" fill="#d9f7e9"/></g>
 <path d="M512 396V726" stroke="#0a7a55" stroke-opacity=".35" stroke-width="10"/>
 <g stroke="#9bdcc0" stroke-width="22" stroke-linecap="round"><path d="M304 470C350 466 396 470 444 488"/><path d="M304 538C350 534 396 538 444 556"/><path d="M304 606C350 602 396 606 444 624"/></g>
 <path d="M584 640L650 574L704 612L786 494" fill="none" stroke="#7a4a00" stroke-opacity=".16" stroke-width="42" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 6)"/>
 <path d="M584 640L650 574L704 612L786 494" fill="none" stroke="url(#gd)" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M742 468L828 436L812 526Z" fill="url(#gd)" stroke="url(#gd)" stroke-width="14" stroke-linejoin="round"/>`;
};
const bg=`<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14c88b"/><stop offset=".55" stop-color="#0a8a5f"/><stop offset="1" stop-color="#05432f"/></linearGradient><radialGradient id="hl" cx=".25" cy=".1" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".30"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
const wrap=(inner,extra='')=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${inner}${extra}</svg>`;
// tile: rounded=true -> squircle tile; shape 'circle'; 'square' full-bleed
const tile=(shape='round',scale=1.2)=>{
 const r=shape==='round'?230:shape==='circle'?512:0;
 const t=`translate(${512-512*scale} ${512-512*scale+(scale<1?10:0)}) scale(${scale})`;
 return wrap(`${bg}<rect width="1024" height="1024" rx="${r}" fill="url(#bg)"/><rect width="1024" height="1024" rx="${r}" fill="url(#hl)"/><g transform="${t}">${book(false)}</g>`);
};
const markOnly=(scale)=>wrap(`<g transform="translate(${512-512*scale} ${512-512*scale}) scale(${scale})">${book(false)}</g>`);
const mono=(scale)=>wrap(`<g transform="translate(${512-512*scale} ${512-512*scale}) scale(${scale})">${book(true)}</g>`);
module.exports={tile,markOnly,mono};
