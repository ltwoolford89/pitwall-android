/* PITWALL V4.1 — stylised 8-bit constructor emblems and linked driver biographies.
   Original fan artwork; not official brand marks or photographs. */
'use strict';
const V41_TEAM_META={
 mercedes:{short:'MER',name:'Mercedes',bg:'#102629',fg:'#65d6c6',secondary:'#e6ffff',type:'star'},
 ferrari:{short:'FER',name:'Ferrari',bg:'#61151b',fg:'#f93240',secondary:'#ffe565',type:'horse'},
 mclaren:{short:'MCL',name:'McLaren',bg:'#49240a',fg:'#ff9027',secondary:'#fff2da',type:'wing'},
 red_bull:{short:'RBR',name:'Red Bull Racing',bg:'#18244d',fg:'#e53549',secondary:'#f8d34c',type:'bull'},
 rb:{short:'RB',name:'Racing Bulls',bg:'#1d3261',fg:'#f3f7ff',secondary:'#488cfe',type:'rb'},
 alpine:{short:'ALP',name:'Alpine',bg:'#351f47',fg:'#fb83c8',secondary:'#72c9ff',type:'peak'},
 haas:{short:'HAA',name:'Haas',bg:'#32333c',fg:'#f34450',secondary:'#fff',type:'h'},
 audi:{short:'AUD',name:'Audi',bg:'#252327',fg:'#f6444c',secondary:'#f4f4f4',type:'rings'},
 williams:{short:'WIL',name:'Williams',bg:'#152b58',fg:'#53a4ff',secondary:'#f7fbff',type:'w'},
 aston_martin:{short:'AST',name:'Aston Martin',bg:'#103d39',fg:'#30be99',secondary:'#e1fff3',type:'wings'},
 cadillac:{short:'CAD',name:'Cadillac',bg:'#34353a',fg:'#c4d2d9',secondary:'#fae6a7',type:'shield'}
};
const V41_BADGE_CACHE=new Map();
function v41BadgeSvg(team){
 const code=aliases[team]||team.toLowerCase().replace(/[^a-z]+/g,'_');
 if(V41_BADGE_CACHE.has(code))return V41_BADGE_CACHE.get(code);
 const d=V41_TEAM_META[code]||{short:'F1',name:team||'Team',bg:'#283341',fg:'#e0e8ef',secondary:'#ffffff',type:'shield'};
 const a=d.fg,b=d.secondary;
 const rect=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
 const pixel=(rows,x,y,s,c)=>rows.map((row,ri)=>[...row].map((e,ci)=>e==='1'?rect(x+ci*s,y+ri*s,s,s,c):'').join('')).join('');
 const motifs={
   star:()=>`<polygon points="16,2 19,11 29,7 22,15 27,25 16,19 5,25 10,15 3,7 13,11" fill="${b}"/><polygon points="16,6 18,14 23,12 19,16 21,21 16,18 11,21 13,16 9,12 14,14" fill="${a}"/>`,
   horse:()=>pixel(['000011100','000111100','001101110','001111000','001111100','001011010','001011010','011001011','011001011'],5,3,2,b)+rect(14,7,8,3,a),
   wing:()=>pixel(['111111110000','001111111000','000011111110','000000111111','000001111100','000111100000','001110000000'],3,6,2,a),
   bull:()=>`<circle cx="16" cy="14" r="11" fill="${b}"/>`+pixel(['110000011','011111110','001111100','011111110','110110011','100100001','100000001'],7,7,2,a),
   rb:()=>pixel(['110011011','101011101','110011011','101011101','101011011'],6,6,2,b),
   peak:()=>pixel(['000000010','000000110','000001110','000011110','000110110','001111110','011111110','111111110'],7,4,2,a)+pixel(['00000001','00000011','00000110','00001100','00011000','00110000','01100000','11000000'],6,4,2,b),
   h:()=>pixel(['11000011','11000011','11000011','11111111','11111111','11000011','11000011','11000011'],8,4,2,b)+rect(21,4,3,16,a),
   rings:()=>[0,1,2,3].map(i=>`<rect x="${3+i*7}" y="8" width="10" height="9" rx="4" fill="none" stroke="${i%2?a:b}" stroke-width="2"/>`).join(''),
   w:()=>pixel(['110000011','110000011','110000011','110110011','110110011','111111111','011001110','011001110'],7,4,2,b),
   wings:()=>pixel(['11111111111111','01111111111110','00111111111100','00011111111000','00001111110000','00000111100000'],2,6,2,b)+rect(12,10,8,4,a),
   shield:()=>`<path d="M9 4h14v13l-7 8-7-8z" fill="${b}"/><path d="M12 7h8v9l-4 5-4-5z" fill="${a}"/>`+rect(12,11,8,2,d.bg)
 };
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 30" width="64" height="60" shape-rendering="crispEdges"><rect width="32" height="30" rx="6" fill="${d.bg}"/><rect x="1" y="1" width="30" height="28" rx="5" fill="none" stroke="${a}" stroke-opacity="0.36"/>${(motifs[d.type]||motifs.shield)()}</svg>`;
 const src='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
 V41_BADGE_CACHE.set(code,src);
 return src;
}
function v41TeamBadge(team,cl='v41-team-icon'){
 const m=V41_TEAM_META[aliases[team]||team.toLowerCase().replace(/[^a-z]+/g,'_')];
 return `<img class="${cl}" src="${v41BadgeSvg(team)}" alt="" aria-hidden="true" loading="lazy" width="32" height="30" title="${safe(m?.name||team)} (fan pixel badge)">`;
}
const V41_DRIVER_HISTORY={
 ANT:{line:'Italy · Mercedes · F1 debut 2025',bio:'Andrea Kimi Antonelli rose rapidly through junior single-seaters, winning the 2023 Formula Regional European title. Mercedes promoted him to Formula 1 for 2025 after his impressive junior career.',wiki:'Kimi Antonelli'},
 RUS:{line:'Great Britain · F1 debut 2019',bio:'George Russell won the 2017 GP3 and 2018 Formula 2 titles in consecutive years. He made his Formula 1 debut with Williams in 2019 and moved to Mercedes in 2022.',wiki:'George Russell (racing driver)'},
 HAM:{line:'Great Britain · Seven-time world champion',bio:'Lewis Hamilton made his Formula 1 debut with McLaren in 2007 and won his first world title in 2008. He won six more titles with Mercedes before joining Ferrari for 2025.',wiki:'Lewis Hamilton'},
 LEC:{line:'Monaco · Ferrari · F1 debut 2018',bio:'Charles Leclerc won the 2017 Formula 2 championship before joining Sauber in 2018. He moved to Ferrari in 2019 and achieved a landmark home win at Monaco in 2024.',wiki:'Charles Leclerc'},
 NOR:{line:'Great Britain · McLaren · 2025 champion',bio:'Lando Norris made his Formula 1 debut with McLaren in 2019. His first Grand Prix win came at Miami in 2024, and he became world champion in 2025.',wiki:'Lando Norris'},
 VER:{line:'Netherlands · Four-time world champion',bio:'Max Verstappen became Formula 1’s youngest race starter with Toro Rosso in 2015. He won on his Red Bull debut in 2016 and earned four consecutive drivers’ championships from 2021 to 2024.',wiki:'Max Verstappen'},
 PIA:{line:'Australia · McLaren · F1 debut 2023',bio:'Oscar Piastri won the 2020 Formula 3 and 2021 Formula 2 championships. He joined McLaren for his Formula 1 debut in 2023 and took his first Grand Prix win in Hungary in 2024.',wiki:'Oscar Piastri'},
 HAD:{line:'France · F1 debut 2025',bio:'Isack Hadjar worked through the Red Bull junior programme and finished runner-up in the 2024 Formula 2 championship. He made his Formula 1 debut with Racing Bulls in 2025.',wiki:'Isack Hadjar'},
 LAW:{line:'New Zealand · F1 debut 2023',bio:'Liam Lawson advanced through the Red Bull junior ranks and gained experience in European and Japanese single-seaters. He made his Formula 1 debut as a substitute for AlphaTauri in 2023.',wiki:'Liam Lawson'},
 GAS:{line:'France · Italian GP winner',bio:'Pierre Gasly won the 2016 GP2 Series before entering Formula 1 with Toro Rosso in 2017. He scored a memorable first Grand Prix victory at Monza in 2020.',wiki:'Pierre Gasly'},
 LIN:{line:'Great Britain · F1 debut 2026',bio:'Arvid Lindblad developed through karting and the Red Bull junior driver system, progressing to FIA Formula 3 and Formula 2 before joining Racing Bulls for his Formula 1 debut in 2026.',wiki:'Arvid Lindblad'},
 COL:{line:'Argentina · F1 debut 2024',bio:'Franco Colapinto is an Argentine racing driver who rose through junior championships. He made his Formula 1 debut with Williams during the 2024 season and subsequently raced for Alpine.',wiki:'Franco Colapinto'},
 BEA:{line:'Great Britain · F1 debut 2024',bio:'Oliver Bearman impressed in Formula 2 before stepping in for Carlos Sainz at Ferrari in the 2024 Saudi Arabian Grand Prix. He became a full-time Formula 1 driver with Haas in 2025.',wiki:'Oliver Bearman'},
 BOR:{line:'Brazil · F1 debut 2025',bio:'Gabriel Bortoleto won the FIA Formula 3 championship in 2023 and the Formula 2 championship in 2024. He made his Formula 1 debut with Sauber in 2025.',wiki:'Gabriel Bortoleto'},
 HUL:{line:'Germany · F1 debut 2010',bio:'Nico Hülkenberg won the 2009 GP2 title before making his Formula 1 debut with Williams in 2010. He also won the 2015 24 Hours of Le Mans with Porsche.',wiki:'Nico Hülkenberg'},
 OCO:{line:'France · 2021 Hungarian GP winner',bio:'Esteban Ocon made his Formula 1 debut with Manor in 2016. He later raced for Force India/Racing Point and Alpine, winning his first Grand Prix in Hungary in 2021.',wiki:'Esteban Ocon'},
 ALO:{line:'Spain · Two-time world champion',bio:'Fernando Alonso made his Formula 1 debut in 2001 and won back-to-back world championships with Renault in 2005 and 2006. His long career has also included major endurance-racing victories.',wiki:'Fernando Alonso'},
 SAI:{line:'Spain · F1 debut 2015',bio:'Carlos Sainz made his Formula 1 debut with Toro Rosso in 2015. He later raced for Renault, McLaren and Ferrari, earning his first Grand Prix victory at Silverstone in 2022.',wiki:'Carlos Sainz Jr.'},
 ALB:{line:'Thailand · F1 debut 2019',bio:'Alexander Albon made his Formula 1 debut with Toro Rosso in 2019 before stepping up to Red Bull. After a season away from racing, he joined Williams in 2022.',wiki:'Alexander Albon'},
 TSU:{line:'Japan · F1 debut 2021',bio:'Yuki Tsunoda moved through Honda’s and Red Bull’s junior programmes and made his Formula 1 debut with AlphaTauri in 2021. He later raced for the Red Bull organisation.',wiki:'Yuki Tsunoda'},
 STR:{line:'Canada · F1 debut 2017',bio:'Lance Stroll won the 2016 FIA Formula 3 European Championship. He made his Formula 1 debut with Williams in 2017 and took his first podium in Azerbaijan that year.',wiki:'Lance Stroll'},
 BOT:{line:'Finland · Ten Grand Prix victories',bio:'Valtteri Bottas made his Formula 1 debut with Williams in 2013. His five seasons with Mercedes from 2017 to 2021 brought ten Grand Prix wins and multiple constructors’ titles.',wiki:'Valtteri Bottas'},
 PER:{line:'Mexico · Multiple Grand Prix winner',bio:'Sergio Pérez made his Formula 1 debut with Sauber in 2011. He earned his first Grand Prix victory with Racing Point in 2020 and later raced for Red Bull from 2021 to 2024.',wiki:'Sergio Pérez'}
};
const v41OldLadder=v4Ladder;
v4Ladder=function(){
 const list=v4Prefs.ladderSize==='top10'?data.drivers.slice(0,10):data.drivers;
 const max=Math.max(...data.drivers.map(x=>Number(x.points)||0),1);
 return `<section class="v4-forecast"><div class="v4-section-title"><div><b>DRIVERS’ CHAMPIONSHIP</b><span>${data.online?'Latest feed':'Standings snapshot'} · ${YEAR}</span></div><button type="button" data-action="go-standings" aria-label="View full championship">VIEW ALL ↗</button></div><div class="v4-ladder">${list.map(d=>`<button type="button" class="v4-ladder-row" data-v4-driver="${safe(d.code)}" aria-label="Profile of ${safe(d.first+' '+d.last)}, position ${d.position}"><span class="v4-position">${d.position}</span>${v4Avatar(d)}<span class="v4-ladder-info"><b>${safe(d.first)} <strong>${safe(d.last)}</strong></b><small class="v41-teamline">${v41TeamBadge(d.team)}<span>${safe(d.team)}</span></small><span class="v4-mini-track"><i style="width:${Math.min(100,100*(Number(d.points)||0)/max)}%;background:${teamColour(d.team)}"></i></span></span><span class="v4-ladder-pts"><b>${d.points}</b><small>PTS</small></span></button>`).join('')}</div><p class="v4-small-note">Tap any driver to see their biography and Wikipedia link. Pixel team marks are unofficial illustrations.</p></section>`;
};
const v41OldStandings=standings;
standings=function(){
 let html=v41OldStandings();
 if(st.standing==='drivers'){
   for(const d of data.drivers){html=html.replace(`<div class="team">${safe(d.team)}</div>`,`<div class="team v41-teamline">${v41TeamBadge(d.team)}<span>${safe(d.team)}</span></div>`);}
   // Full driver standings are now actionable just like Home ladder rows.
   let i=0;
   html=html.replace(/<div class="leader">/g,()=>{const d=data.drivers[i++];return `<button type="button" class="leader v41-standing-row" data-v4-driver="${safe(d?.code||'')}" aria-label="View ${safe(d?.first||'')} ${safe(d?.last||'')} biography">`;});
   html=html.replace(/(<div class="pts">[\s\S]*?<\/small><\/div>)<\/div>/g,'$1</button>');
 }else{
   for(const t of data.constructors){html=html.replace(`<div class="name">${safe(t.team)}</div>`,`<div class="name v41-teamline">${v41TeamBadge(t.team)}<span>${safe(t.team)}</span></div>`);}
 }
 return html;
};
const v41OldConstructorsWidget=v4WidgetConstructors;
v4WidgetConstructors=function(){
 const teams=data.constructors.slice(0,3),top=teams[0];
 return `<button type="button" class="v4-widget v4-widget-constructors" data-action="go-standings"><div class="v4-widget-top"><span>CONSTRUCTORS’ CHAMPIONSHIP</span><span>2026</span></div><div class="v4-big-constructor">${v41TeamBadge(top?.team||'', 'v41-leading-logo')}<span>${safe(top?.team||'F1 team')}</span><strong>${top?.points??'—'} PTS</strong></div><div class="v4-team-ranking">${teams.map((t,i)=>`<div>${v41TeamBadge(t.team)}<b>${i+1}. ${safe(t.team)}</b><strong>${t.points}</strong></div>`).join('')}</div></button>`;
};
const v41OldDriverWidget=v4WidgetDriver;
v4WidgetDriver=function(){const d=v3Favourite();return `<button type="button" class="v4-widget v4-widget-driver" data-v4-driver="${safe(d.code)}" style="--team:${teamColour(d.team)}"><div class="v4-widget-top"><span>FAVOURITE DRIVER</span><span>${v41TeamBadge(d.team)} ${safe(d.code)}</span></div><div class="v4-widget-driver-main">${v4Avatar(d,'v4-widget-person')}<div class="v4-widget-driver-copy"><small>${safe(d.team)}</small><b>${safe(d.last.toUpperCase())}</b><strong>P${d.position}</strong></div></div><div class="v4-widget-footer"><span>${safe(d.first+' '+d.last)}</span><strong>${d.points} PTS</strong></div></button>`;};
// The pre-existing click listeners and Escape handler continue to work with this dialog.
v4ShowDriver=function(code){
 const d=data.drivers.find(x=>x.code===code);if(!d)return;
 document.querySelector('.v4-profile-shade')?.remove();
 const h=V41_DRIVER_HISTORY[String(d.code||'').toUpperCase()];
 const wiki=h?.wiki||`${d.first} ${d.last}`;
 const wikiURL='https://en.wikipedia.org/wiki/'+encodeURIComponent(wiki.replace(/ /g,'_'));
 const shade=document.createElement('div');shade.className='v4-profile-shade';
 shade.innerHTML=`<section class="v4-profile v41-profile" role="dialog" aria-modal="true" aria-labelledby="v41-driver-title"><button class="v4-close" data-v4-close aria-label="Close driver details">×</button><div class="v4-profile-heading">DRIVER FILE / ${YEAR}</div><div class="v41-profile-head"><div class="v41-profile-art">${v4Avatar(d,'v41-profile-driver',v4Prefs.portrait)}</div><div class="v41-profile-copy"><div class="v41-driver-code">${safe(d.code)}</div><h2 id="v41-driver-title">${safe(d.first)}<br><strong>${safe(d.last.toUpperCase())}</strong></h2><div class="v41-profile-team">${v41TeamBadge(d.team)}<span>${safe(d.team)}</span></div></div></div><div class="v41-profile-stats"><div><b>P${d.position}</b><small>POSITION</small></div><div><b>${d.points}</b><small>POINTS</small></div><div><b>${d.wins}</b><small>WINS ${YEAR}</small></div></div><div class="v41-profile-history"><div class="v41-history-label">RACING HISTORY</div><p class="v41-history-line">${safe(h?.line||'Formula 1 driver')}</p><p>${safe(h?.bio||`${d.first} ${d.last} is a Formula 1 driver competing for ${d.team}. For a fuller career history, explore the linked Wikipedia article.`)}</p></div><div class="v41-profile-actions"><a class="v41-wiki-link" href="${safe(wikiURL)}" target="_blank" rel="noopener noreferrer">READ ON WIKIPEDIA <span aria-hidden="true">↗</span></a><button type="button" class="v41-dismiss" data-v4-close>CLOSE</button></div><p class="v41-artist-note">Original pixel art · Unofficial team marks · Historical information is a brief summary</p></section>`;
 document.body.appendChild(shade);shade.querySelector('.v4-close')?.focus();
};
render();
