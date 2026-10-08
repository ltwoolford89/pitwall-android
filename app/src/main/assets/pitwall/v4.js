/* PITWALL V4: weather-style season dashboard, original pixel avatars and redesigned widget previews. */
'use strict';
const V4_PREF_KEY='pitwall-v4-prefs';
let v4Prefs={portrait:'face',ladderSize:'full',widgetStyle:'racing',showRaceStrip:true};
try{v4Prefs={...v4Prefs,...JSON.parse(localStorage.getItem(V4_PREF_KEY)||'{}')};}catch(e){}
function v4Save(){try{localStorage.setItem(V4_PREF_KEY,JSON.stringify(v4Prefs));}catch(e){}}
const V4_FLAGS={Australia:'🇦🇺',China:'🇨🇳',Japan:'🇯🇵',Miami:'🇺🇸',Canada:'🇨🇦',Monaco:'🇲🇨','Barcelona-Catalunya':'🇪🇸',Austria:'🇦🇹','Great Britain':'🇬🇧',Belgium:'🇧🇪',Hungary:'🇭🇺',Netherlands:'🇳🇱',Italy:'🇮🇹',Spain:'🇪🇸',Azerbaijan:'🇦🇿','Bahrain in Malaysia':'🇲🇾',Bahrain:'🇧🇭',Singapore:'🇸🇬','United States':'🇺🇸',Mexico:'🇲🇽','São Paulo':'🇧🇷',Brazil:'🇧🇷','Las Vegas':'🇺🇸',Qatar:'🇶🇦','Abu Dhabi':'🇦🇪','Saudi Arabia':'🇸🇦'};
function v4Flag(r){return V4_FLAGS[r.short]||V4_FLAGS[(r.name||'').replace(/ Grand Prix/i,'')]||'🏁';}
const V4_FACES={
ANT:['#b77f58','#392922','waves','#4f342a'],RUS:['#d3a47c','#493223','side','#382721'],HAM:['#996444','#1a1718','braids','#181718'],LEC:['#cca07d','#302322','messy','#332622'],NOR:['#deb18d','#6c3d29','curly','#49312a'],VER:['#d5a883','#76583c','short','#4d392c'],PIA:['#e0b38d','#4a3429','fringe','#50372b'],HAD:['#9d6a51','#252022','curly','#251d20'],LAW:['#d7a17e','#5b3b26','side','#3a2c25'],GAS:['#c99e81','#342626','side','#382821'],LIN:['#ae7859','#211d20','curly','#261e22'],COL:['#c38e6e','#352522','messy','#302324'],BEA:['#e2b28e','#6e4834','fringe','#68452d'],BOR:['#cf966b','#282625','waves','#332723'],HUL:['#deb18b','#a0784a','short','#795c3e'],OCO:['#cf986f','#342822','short','#392a29'],ALO:['#c18c69','#473b34','waves','#4f443e'],SAI:['#be8061','#292021','waves','#2c2323'],ALB:['#be987c','#2e2725','messy','#302926'],TSU:['#d1a180','#2c2323','short','#302622'],STR:['#cb987a','#433124','side','#392a22'],BOT:['#e3b88e','#b9a183','short','#a17c55'],PER:['#c08a63','#35251e','short','#38261e']
};
const V4_TEAM_HELMET={Mercedes:['#26b9ab','#f1faf9'],Ferrari:['#e92d30','#ffed59'],McLaren:['#ff8c22','#38dbf3'],'Red Bull Racing':['#152d75','#fa3038'],'Racing Bulls':['#f1f7ff','#294db7'],Alpine:['#ec6bbd','#4b99f2'],Haas:['#f1f1f1','#e7293b'],Audi:['#d1242f','#e6e6e6'],Williams:['#1676d3','#f2f3f5'],'Aston Martin':['#137e68','#c9f9d4'],Cadillac:['#c7ccd4','#1b2330']};
const v4SpriteCache=new Map();
function v4SvgAvatar(d,kind=v4Prefs.portrait){
 const code=String(d.code||'').toUpperCase(), c=V4_FACES[code]||['#bf906d','#47342d','short','#392b28'];
 const team=d.team||'Unknown',accent=teamColour(team),isHelmet=kind==='helmet',hc=V4_TEAM_HELMET[team]||[accent,'#fff'];
 const key=code+'|'+team+'|'+kind;if(v4SpriteCache.has(key))return v4SpriteCache.get(key);
 const rect=(x,y,w,h,f)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`;
 const r=[];const add=(...a)=>r.push(rect(...a));
 add(0,0,40,44,'#1a2939');add(0,32,40,12,'#15212e');
 add(1,39,38,5,accent);add(4,35,32,5,accent);add(9,32,22,4,'#192533');add(13,28,14,7,isHelmet?'#1a1d2c':c[0]);
 if(isHelmet){
 add(8,7,24,21,hc[0]);add(5,16,30,16,hc[0]);add(8,6,24,3,hc[1]);add(10,4,20,3,hc[0]);add(6,23,28,6,'#132033');add(7,17,26,8,'#0b1727');add(10,18,20,5,'#101f30');add(10,18,18,2,'#7eacc4');add(6,29,28,4,hc[0]);add(9,34,22,3,'#101a2c');add(17,6,5,9,hc[1]);add(27,11,3,4,hc[1]);add(30,22,3,4,hc[1]);
 }else{
 add(10,10,20,17,c[0]);add(8,14,24,12,c[0]);add(12,26,16,6,c[0]);add(8,17,3,7,c[0]);add(29,17,3,7,c[0]);
 add(8,8,24,6,c[1]);add(10,6,20,5,c[1]);
 if(c[2]==='curly'||c[2]==='waves'){for(let x=8;x<32;x+=5)add(x,5+(x%3),4,5,c[1]);if(c[2]==='curly')for(let x=7;x<33;x+=6)add(x,10+(x%2),5,4,c[1]);}
 if(c[2]==='fringe'||c[2]==='messy'){add(9,10,16,4,c[1]);add(17,12,8,3,c[1]);add(26,8,4,6,c[1]);}
 if(c[2]==='side'){add(8,9,7,6,c[1]);add(10,7,20,3,c[1]);}
 if(c[2]==='braids'){add(7,10,4,15,c[1]);add(29,10,4,14,c[1]);add(9,7,22,6,c[1]);add(11,25,18,5,c[3]);}
 add(12,18,5,2,'#17161a');add(23,18,5,2,'#17161a');add(13,17,3,1,'#f1e3d7');add(24,17,3,1,'#f1e3d7');add(19,20,2,6,'#ae745b');add(16,27,9,1,c[3]);
 if(['HAM','ALO','SAI','BOT','PER'].includes(code)){add(12,27,17,2,c[3]);add(13,28,14,3,c[3]);add(17,30,6,2,c[3]);}
 add(9,13,2,5,c[1]);add(29,13,2,5,c[1]);
 }
 add(15,36,10,4,'#111824');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="44" viewBox="0 0 40 44" shape-rendering="crispEdges">${r.join('')}</svg>`;
 const uri='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);v4SpriteCache.set(key,uri);return uri;
}
function v4Avatar(d,cls='v4-avatar',kind=v4Prefs.portrait){return `<img class="${cls}" src="${v4SvgAvatar(d,kind)}" alt="Illustrated ${kind==='helmet'?'helmet':'pixel portrait'} of ${safe(d.first+' '+d.last)}" width="48" height="53" decoding="async">`;}
function v4Day(r){return new Intl.DateTimeFormat('en-AU',{timeZone:TZ,day:'numeric',month:'short'}).format(new Date(r.race));}
function v4Countdown(r){const ms=new Date(r.race).getTime()-Date.now();if(ms<=0)return {value:'FINISHED',sub:'Season event complete'};const days=Math.floor(ms/86400000),hours=Math.floor(ms%86400000/3600000),mins=Math.floor(ms%3600000/60000);return {value:`${String(days).padStart(2,'0')}:${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}`,sub:'DAYS  ·  HOURS  ·  MINUTES'};}
function v4Strip(){let races=sortedRaces(),upcoming=races.filter(r=>!started(r));if(!upcoming.length)upcoming=races.slice(-5);let visible=upcoming.slice(0,9);return `<div class="v4-strip-head"><b>Upcoming races</b><span>Scroll →</span></div><div class="v4-race-strip" aria-label="Upcoming race countries">${visible.map((r,i)=>`<button type="button" class="v4-race-chip ${i===0?'selected':''}" data-v4-race="${r.round}" aria-label="View ${safe(r.name)}"><span class="v4-flag">${v4Flag(r)}</span><b>${safe(r.short==='Barcelona-Catalunya'?'Barcelona':r.short==='Great Britain'?'Britain':r.short==='São Paulo'?'Brazil':r.short)}</b><span>${v4Day(r)}</span><small>R${r.round}</small></button>`).join('')}</div>`;}
function v4Ladder(){const list=v4Prefs.ladderSize==='top10'?data.drivers.slice(0,10):data.drivers;return `<section class="v4-forecast"><div class="v4-section-title"><div><b>Drivers’ Championship</b><span>${data.online?'Results feed connected':'Saved standings snapshot'} · ${YEAR}</span></div><button type="button" data-action="go-standings" aria-label="View full championship">↗</button></div><div class="v4-ladder">${list.map((d,i)=>{const x=data.drivers[0].points||1,p=Math.min(100,100*d.points/x);return `<button type="button" class="v4-ladder-row" data-v4-driver="${safe(d.code)}" aria-label="${safe(d.first+' '+d.last)}, position ${d.position}, ${d.points} points"><span class="v4-position">${d.position}</span>${v4Avatar(d)}<span class="v4-ladder-info"><b>${safe(d.first)} <strong>${safe(d.last)}</strong></b><small>${safe(d.team)}</small><span class="v4-mini-track"><i style="width:${p}%;background:${teamColour(d.team)}"></i></span></span><span class="v4-ladder-pts"><b>${d.points}</b><small>pts</small></span></button>`;}).join('')}</div><p class="v4-small-note">Fan-made pixel portraits are illustrations rather than official photographs. Race and standings data may be delayed.</p></section>`;}
function v4Hero(){const r=nextRace(),c=v4Countdown(r),flag=v4Flag(r);return `<section class="v4-weather-hero"><div class="v4-sky"></div><div class="v4-today">${new Intl.DateTimeFormat('en-AU',{timeZone:TZ,weekday:'long',day:'numeric',month:'long'}).format(new Date())}</div><div class="v4-hero-eyebrow">NEXT GRAND PRIX · ROUND ${String(r.round).padStart(2,'0')}</div><div class="v4-hero-flag" role="img" aria-label="Host country flag">${flag}</div><h1>${safe(r.short==='Barcelona-Catalunya'?'Barcelona':r.short)}<span>Grand Prix</span></h1><div class="v4-hero-circuit">${safe(r.location)} · ${v4Day(r)}</div><div class="v4-bigtime">${c.value}</div><div class="v4-bigtime-label">${c.sub}</div><div class="v4-racetime">Race start <b>${fmtHour(r.race)}</b> · Adelaide time</div><div class="v4-hero-actions"><button type="button" data-v4-race="${r.round}">Race weekend <span>→</span></button><a href="${KAYO}" target="_blank" rel="noopener noreferrer">Watch on Kayo ↗</a></div></section>`;}
function v4WidgetRace(){const r=nextRace();const pic=v3GetOfficialImage(r);return `<button type="button" class="v4-widget v4-widget-race" data-v4-race="${r.round}"><div class="v4-widget-top"><span>NEXT RACE</span><b>R${r.round}</b></div><div class="v4-widget-race-head"><span class="v4-widget-flag">${v4Flag(r)}</span><div><b>${safe(r.short)} GP</b><small>${safe(r.location)}</small></div></div><div class="v4-widget-map">${pic?`<img src="${safe(pic)}" alt="${safe(r.location)} circuit outline" loading="lazy" referrerpolicy="no-referrer">`:`<svg class="v4-circuit-outline" viewBox="0 0 360 230" aria-label="Not-to-scale circuit preview"><path d="${v2Schematic(r).d}"/></svg>`}</div><div class="v4-widget-footer"><span>${v4Day(r)} · Adelaide</span><strong>${fmtHour(r.race)}</strong></div></button>`;}
function v4WidgetDriver(){const d=v3Favourite();return `<button type="button" class="v4-widget v4-widget-driver" data-v4-driver="${safe(d.code)}" style="--team:${teamColour(d.team)}"><div class="v4-widget-top"><span>FAVOURITE DRIVER</span><span>#${safe(d.code)}</span></div><div class="v4-widget-driver-main">${v4Avatar(d,'v4-widget-person')}<div class="v4-widget-driver-copy"><small>${safe(d.team)}</small><b>${safe(d.last.toUpperCase())}</b><strong>P${d.position}</strong></div></div><div class="v4-widget-footer"><span>${safe(d.first+' '+d.last)}</span><strong>${d.points} PTS</strong></div></button>`;}
function v4WidgetConstructors(){const teams=data.constructors.slice(0,3),lead=teams[0];return `<button type="button" class="v4-widget v4-widget-constructors" data-action="go-standings"><div class="v4-widget-top"><span>CONSTRUCTORS’ CHAMPIONSHIP</span><span>2026</span></div><div class="v4-big-constructor">${safe(lead?.team||'Formula 1')} <strong>${lead?.points??'—'} PTS</strong></div><div class="v4-team-ranking">${teams.map((t,i)=>`<div><span style="background:${teamColour(t.team)}"></span><b>${i+1}. ${safe(t.team)}</b><strong>${t.points}</strong></div>`).join('')}</div></button>`;}
const v4OldHome=home;
home=function(){return `<section class="main-tab v4-home"><div class="v4-home-panel">${v4Hero()}${v4Prefs.showRaceStrip?v4Strip():''}${v4Ladder()}<div class="v4-home-bottom"><div class="v4-section-title"><div><b>Race centre</b><span>Widgets styled after your examples</span></div><button data-action="go-settings" aria-label="Customise dashboard">⚙</button></div><div class="v4-widget-grid">${v3Prefs.showRace?v4WidgetRace():''}${v3Prefs.showDriver?v4WidgetDriver():''}${v3Prefs.showConstructors?v4WidgetConstructors():''}</div><div class="v4-career-link"><div><small>YOUR RACING STORY</small><b>${career?safe(career.name):'Start your career'}</b><span>${career?safe(stages[career.stage]+' · '+career.team):'Karting → F4 → F3 → F2 → Formula 1'}</span></div><button data-action="go-career">PLAY →</button></div></div></div>${sourceFooter()}</section>`;};
// Retain the existing standings selection, but add illustrated portraits in driver rows.
const v4OldStandings=standings;
standings=function(){let html=v4OldStandings();if(st.standing==='drivers'){
 const arr=data.drivers.slice();let i=0;
 html=html.replace(/(<div class="stripe"[^>]*><\/div>)(<div style="min-width:0">)/g,(whole,stripe,next)=>`${stripe}${v4Avatar(arr[i++]||{first:'Driver',last:'',code:''},'v4-standing-avatar')}${next}`);
 }return html;};
// Accent the existing calendar card with its host flag and preserve its full schedule, F1 map, prediction and dots.
const v4OldRaceCard=raceCard;
raceCard=function(r){return v4OldRaceCard(r).replace('<div class="racename">',`<div class="racename"><span class="v4-card-flag">${v4Flag(r)}</span> `);};
const v4OldSettingsPage=v3SettingsPage;
v3SettingsPage=function(){let html=v4OldSettingsPage().replace('Version 3 · Independent fan app','Version 4 · Independent fan app');
 const extra=`<div class="settings-group-title">PIXEL DRIVER ART</div><div class="settings-group"><div class="settings-row"><span class="settings-ico">◉</span><span class="settings-label">Portrait style</span>${v3SettingSelect('v4Portrait',v4Prefs.portrait,[['face','Faces'],['helmet','Helmets']])}</div><div class="settings-row"><span class="settings-ico">▥</span><span class="settings-label">Championship list</span>${v3SettingSelect('v4Ladder',v4Prefs.ladderSize,[['full','All drivers'],['top10','Top 10']])}</div><div class="settings-row"><span class="settings-ico">🏁</span><span class="settings-label">Race flag strip</span><button type="button" class="switch ${v4Prefs.showRaceStrip?'on':''}" data-v4-toggle="raceStrip" role="switch" aria-checked="${v4Prefs.showRaceStrip}"><span></span></button></div></div><p class="settings-hint">Original pixel-art interpretations of the 2026 grid. Choose faces or helmets for standings, favourite-driver cards and the Weather-style home screen.</p>`;
 html=html.replace('<div class="settings-group-title">YOUR F1 DASHBOARD</div>',extra+'<div class="settings-group-title">YOUR F1 DASHBOARD</div>');
 html=html.replace('<div class="settings-group-title">PREVIEW YOUR WIDGETS</div>',`<div class="settings-group-title">WIDGET PREVIEWS</div><p class="settings-hint" style="margin:0 13px 12px">Interactive dashboard cards only; native Home Screen / Lock Screen widgets come in a later iOS version.</p>`);
 html=html.replace('<div class="home-widgets" style="margin-bottom:26px">', '<div class="v4-widget-grid v4-settings-widgets" style="margin-bottom:26px">');
 html=html.replace('These personalised widget-style cards appear on PITWALL’s Home tab.', 'These personalised widget-style cards appear on PITWALL’s Home tab.');
 return html;
};
// Replace V3 widgets with the new customisable racing-themed in-app preview cards.
v3RaceWidget=v4WidgetRace;
v3DriverWidget=v4WidgetDriver;
// Make tapping a driver show an accessible mini-profile with larger portrait and both variants.
function v4ShowDriver(code){const d=data.drivers.find(x=>x.code===code);if(!d)return;const existing=document.querySelector('.v4-profile-shade');if(existing)existing.remove();const shade=document.createElement('div');shade.className='v4-profile-shade';shade.innerHTML=`<section class="v4-profile" role="dialog" aria-modal="true" aria-label="${safe(d.first+' '+d.last)} driver profile"><button class="v4-close" data-v4-close aria-label="Close driver details">×</button><div class="v4-profile-heading">DRIVER PROFILE · ${YEAR}</div><div class="v4-profile-pics">${v4Avatar(d,'v4-profile-image','face')}${v4Avatar(d,'v4-profile-image','helmet')}</div><h2>${safe(d.first+' '+d.last)}</h2><p>${safe(d.team)}</p><div class="v4-profile-stats"><div><b>P${d.position}</b><small>POSITION</small></div><div><b>${d.points}</b><small>POINTS</small></div><div><b>${d.wins}</b><small>WINS</small></div></div><p class="v4-small-note">These portraits are original stylised pixel illustrations, not official driver photos.</p></section>`;document.body.appendChild(shade);shade.querySelector('.v4-close').focus();}
document.addEventListener('change',e=>{const setting=e.target.closest('[data-v3-setting]');if(!setting)return;
 if(setting.dataset.v3Setting==='v4Portrait'){v4Prefs.portrait=['face','helmet'].includes(setting.value)?setting.value:'face';v4SpriteCache.clear();v4Save();render();}
 if(setting.dataset.v3Setting==='v4Ladder'){v4Prefs.ladderSize=setting.value==='top10'?'top10':'full';v4Save();render();}
});
document.addEventListener('click',e=>{
 const close=e.target.closest('[data-v4-close]');if(close||e.target.classList.contains('v4-profile-shade')){document.querySelector('.v4-profile-shade')?.remove();return;}
 const toggle=e.target.closest('[data-v4-toggle]');if(toggle){if(toggle.dataset.v4Toggle==='raceStrip'){v4Prefs.showRaceStrip=!v4Prefs.showRaceStrip;v4Save();render();}return;}
 const driver=e.target.closest('[data-v4-driver]');if(driver){v4ShowDriver(driver.dataset.v4Driver);return;}
 const race=e.target.closest('[data-v4-race]');if(race){st.tab='calendar';st.filter='all';st.expanded=Number(race.dataset.v4Race);render();setTimeout(()=>document.querySelector(`[data-race="${st.expanded}"]`)?.scrollIntoView({block:'start',behavior:'smooth'}),60);return;}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelector('.v4-profile-shade')?.remove();});
const v4OldRender=render;
render=function(){document.querySelector('.v4-profile-shade')?.remove();v4OldRender();};
render();
