/* PITWALL V4.3 — constructor archive, past-race weather and single circuit map.
   Historical statistics are attributed to the named F1 constructor, not all predecessor companies.
   This is an independent, unofficial fan project. */
'use strict';
const V43_TEAM_ARCHIVE = {
  ferrari: {name:'Scuderia Ferrari',first:1950,era:'On the F1 grid since 1950',baseWins:248,titles:16,wiki:'Scuderia_Ferrari',description:'Ferrari is Formula 1’s longest-standing team and the sport’s most successful constructor by championship titles. Its racing identity is inseparable from Maranello, the prancing horse and generations of champions.',highlights:['1950: Joins the inaugural Formula 1 World Championship.','1960s–70s: Championship success with John Surtees and Niki Lauda.','1999–2004: Six consecutive constructors’ titles during the Schumacher era.']},
  mclaren: {name:'McLaren',first:1966,era:'Competing in F1 since 1966',baseWins:203,titles:10,wiki:'McLaren',description:'Founded by New Zealand racer Bruce McLaren, the British team grew into one of F1’s great names, featuring the likes of Senna, Prost, Häkkinen and Hamilton. It won the 2024 and 2025 constructors’ championships.',highlights:['1966: Bruce McLaren’s team makes its Formula 1 debut.','1988: Senna and Prost dominate with the MP4/4.','2024 and 2025: McLaren returns to constructors’ championship success.']},
  mercedes: {name:'Mercedes-AMG F1',first:1954,activeSince:2010,era:'F1 debut 1954 · current works team since 2010',baseWins:131,titles:8,wiki:'Mercedes-Benz_in_Formula_One',description:'Mercedes first raced in Formula 1 in the 1950s with Juan Manuel Fangio, before returning as a works team in 2010. It dominated the turbo-hybrid era with Lewis Hamilton and Nico Rosberg.',highlights:['1954–55: Fangio wins titles in Mercedes machinery.','2010: Mercedes returns as a works constructor.','2014–21: Eight consecutive constructors’ championships.']},
  red_bull: {name:'Red Bull Racing',first:2005,era:'Racing under Red Bull name since 2005',baseWins:130,titles:6,wiki:'Red_Bull_Racing',description:'Red Bull acquired the former Jaguar F1 team and built a leading contender around technical innovation, first winning titles with Sebastian Vettel and later with Max Verstappen.',highlights:['2005: First season as Red Bull Racing.','2010–13: Four consecutive team championships with Vettel.','2022–23: Back-to-back constructors’ titles during Verstappen’s run.']},
  williams: {name:'Williams Racing',first:1978,era:'Williams constructor since 1978',baseWins:114,titles:9,wiki:'Williams_Racing',description:'Sir Frank Williams and Patrick Head built an independent British team famed for engineering excellence. The team became a championship powerhouse across the 1980s and 1990s.',highlights:['1978: First season as the Williams constructor.','1980: First constructors’ championship.','1997: Jacques Villeneuve wins the drivers’ title during the team’s last constructors’ title season.']},
  alpine: {name:'Alpine F1 Team',first:2021,era:'Alpine name since 2021 · Enstone team has earlier roots',baseWins:1,titles:0,wiki:'Alpine_F1_Team',description:'Alpine is the Renault group’s Formula 1 racing brand, introduced in 2021. Its Enstone-based operation traces its heritage through Toleman, Benetton, Renault and Lotus; trophies under those earlier names are not counted as Alpine-branded titles.',highlights:['2021: The Renault works outfit becomes Alpine F1 Team.','2021: Esteban Ocon wins the Hungarian Grand Prix for Alpine.','The team’s Enstone site previously won championships as Benetton and Renault.']},
  aston_martin: {name:'Aston Martin Aramco F1 Team',first:2021,era:'Current Aston Martin team since 2021',baseWins:0,titles:0,wiki:'Aston_Martin_in_Formula_One',description:'The Aston Martin name returned to Formula 1 as a works constructor in 2021 when Racing Point was rebranded. The Silverstone operation has roots in Jordan, Force India and Racing Point, with results under those names kept separate.',highlights:['1959–60: An earlier Aston Martin works project competes in F1.','2021: Aston Martin returns to the grid via the Silverstone team.','2023: Fernando Alonso records a string of podiums for the green team.']},
  rb: {name:'Racing Bulls',first:2025,era:'Racing Bulls name since 2025 · Faenza outfit since 2006',baseWins:0,titles:0,wiki:'Racing_Bulls',description:'Racing Bulls is Red Bull’s Faenza-based sister team. The operation began as Toro Rosso in 2006, became AlphaTauri and then RB before adopting the Racing Bulls name. Its two earlier race victories belong to those predecessor identities.',highlights:['2006: Faenza team debuts as Scuderia Toro Rosso.','2008 and 2020: Victories achieved under Toro Rosso and AlphaTauri names.','2025: The squad adopts the Racing Bulls identity.']},
  haas: {name:'Haas F1 Team',first:2016,era:'In Formula 1 since 2016',baseWins:0,titles:0,wiki:'Haas_F1_Team',description:'Founded by American motorsport team owner Gene Haas, Haas joined F1 in 2016. Its model uses partnerships with established technical suppliers while operating as its own constructor.',highlights:['2016: Romain Grosjean scores points on debut in Australia.','2018: Fifth place in the Constructors’ Championship.','2022: Kevin Magnussen takes the team’s first pole at São Paulo.']},
  audi: {name:'Audi F1 Team',first:2026,era:'Audi works constructor since 2026 · Sauber heritage since 1993',baseWins:0,titles:0,wiki:'Audi_in_Formula_One',description:'Audi enters Formula 1 as a works constructor in 2026 after taking over the Sauber operation. Sauber has raced in F1 since 1993, but its past results are separate from Audi-branded statistics.',highlights:['1993: Sauber first appears on the F1 grid.','2022–25: Audi prepares a works power-unit programme.','2026: Audi begins racing under its own name.']},
  cadillac: {name:'Cadillac F1 Team',first:2026,era:'New Formula 1 entry in 2026',baseWins:0,titles:0,wiki:'Cadillac_in_Formula_One',description:'The General Motors-backed Cadillac programme joins Formula 1 in 2026 as a new American constructor, adding an eleventh team to the grid. It is distinct from the older American teams in the championship.',highlights:['2024–25: Plans for an eleventh F1 entry develop.','2026: Cadillac begins its debut Formula 1 season.','The programme aims to establish a long-term American team identity.']}
};
function v43TeamKey(name){const raw=String(name||'');return aliases[raw]||(/red bull racing|^red bull$/i.test(raw)?'red_bull':/racing bulls|^rb/i.test(raw)?'rb':/aston/i.test(raw)?'aston_martin':/cadillac/i.test(raw)?'cadillac':/alpine/i.test(raw)?'alpine':/mclaren/i.test(raw)?'mclaren':/ferrari/i.test(raw)?'ferrari':/mercedes/i.test(raw)?'mercedes':/haas/i.test(raw)?'haas':/williams/i.test(raw)?'williams':/audi/i.test(raw)?'audi':'');}
const v43SeasonWins=new Map();
let v43SeasonWinsLoaded=false;
async function v43LoadWins(){
 try{
  // Count current-year Grand Prix victories by constructor, then add the F1-sourced end-2025 base.
  const j=await fetchJson(API+YEAR+'/results/1.json?limit=150',10500);
  const rows=j?.MRData?.RaceTable?.Races;
  if(!Array.isArray(rows)||!rows.length)return;
  v43SeasonWins.clear();
  for(const race of rows){const winner=race.Results?.[0];const k=v43TeamKey(winner?.Constructor?.name);if(k&&winner?.position==='1')v43SeasonWins.set(k,(v43SeasonWins.get(k)||0)+1);}
  v43SeasonWinsLoaded=true;
  const active=document.querySelector('.v43-team-shade');
  if(active){const name=active.dataset.v43TeamName;v43OpenTeam(name);}
 }catch(e){/* Keep the clearly dated end-2025 base if network is unavailable. */}
}
function v43OpenTeam(team){
 const key=v43TeamKey(team),h=V43_TEAM_ARCHIVE[key];if(!h)return toast('Team history is not available for this constructor yet');
 document.querySelector('.v4-profile-shade')?.remove();document.querySelector('.v43-team-shade')?.remove();
 const current=data.constructors.find(c=>v43TeamKey(c.team)===key),statsKnown=v43SeasonWinsLoaded;
 const wins=h.baseWins+(statsKnown?(v43SeasonWins.get(key)||0):0),yrs=YEAR-(h.activeSince||h.first)+1;
 const shade=document.createElement('div');shade.className='v43-team-shade';shade.dataset.v43TeamName=team;
 shade.innerHTML=`<section class="v43-team-modal" role="dialog" aria-modal="true" aria-labelledby="v43-team-title" style="--team:${teamColour(team)}"><button type="button" data-v43-close class="v43-team-close" aria-label="Close team history">×</button><div class="v43-team-head"><span class="v43-eyebrow">THE PITWALL ARCHIVE / CONSTRUCTORS</span><div class="v43-team-identity">${v41TeamBadge(team,'v43-team-logo')}<div><h2 id="v43-team-title">${safe(h.name)}</h2><p>${safe(h.era)}</p></div></div></div><div class="v43-team-stats"><div><b>${wins}</b><span>GRAND PRIX WINS<small>${statsKnown?'Through latest 2026 race':'Through end of 2025'}</small></span></div><div><b>${h.titles}</b><span>CONSTRUCTORS’ TITLES<small>Through 2025</small></span></div><div><b>${yrs}</b><span>SEASONS<small>${h.activeSince?'Since works return':'Since current-name debut'}</small></span></div></div><div class="v43-team-content"><span class="v43-meta">${current?'P'+current.position+' THIS SEASON · '+current.points+' POINTS':'CONSTRUCTOR HISTORY'}</span><h3>Team story</h3><p>${safe(h.description)}</p><h3>Key milestones</h3><ol>${h.highlights.map(s=>`<li>${safe(s)}</li>`).join('')}</ol><div class="v43-team-clarify">Statistics are counted under the named constructor, not its former owners or predecessor team identities. The season count indicates calendar years, not necessarily uninterrupted participation.</div><a class="v43-wiki" href="https://en.wikipedia.org/wiki/${encodeURIComponent(h.wiki)}" target="_blank" rel="noopener noreferrer">READ TEAM WIKIPEDIA ↗</a></div></section>`;
 document.body.appendChild(shade);shade.querySelector('.v43-team-close')?.focus();
}
// Replace only the constructors' list with clickable rows; keep V4.2 driver standings unchanged.
const v43OldStandings=standings;
standings=function(){
 if(st.standing!=='constructors')return v43OldStandings();
 return `<section class="main-tab"><div class="sectionhead"><div><div class="micro">2026 championship</div><h2>Standings</h2></div></div><div class="seg" role="group" aria-label="Standings selection"><button type="button" data-standing="drivers">DRIVERS</button><button type="button" data-standing="constructors" class="active">CONSTRUCTORS</button></div><p class="tiny" style="margin:13px 0 8px">${safe(data.lastUpdated)} · Tap a team to open its history</p><div class="card v43-team-table">${data.constructors.map(t=>`<button type="button" class="leader v43-team-row" data-v43-team="${safe(t.team)}" aria-label="Open ${safe(t.team)} history"><span class="pos">${t.position}</span>${v41TeamBadge(t.team,'v43-standings-logo')}<span class="v43-row-name"><b>${safe(t.team)}</b><small>View history, race wins &amp; titles ↗</small></span><span class="v43-row-points"><b>${t.points}</b><small>PTS</small></span></button>`).join('')}</div>${sourceFooter()}</section>`;
};
// In-app constructor cards should let visitors open a specific team, not just the standings tab.
v4WidgetConstructors=function(){const teams=data.constructors.slice(0,3),top=teams[0];return `<section class="v4-widget v4-widget-constructors v43-constructor-widget"><div class="v4-widget-top"><span>CONSTRUCTORS’ CHAMPIONSHIP</span><button type="button" data-action="go-standings" class="v43-widget-link">FULL TABLE ↗</button></div><button type="button" class="v43-featured-team" data-v43-team="${safe(top?.team||'')}">${v41TeamBadge(top?.team||'','v41-leading-logo')}<span>${safe(top?.team||'F1 team')}</span><strong>${top?.points??'—'} PTS</strong></button><div class="v4-team-ranking">${teams.map((t,i)=>`<button type="button" data-v43-team="${safe(t.team)}">${v41TeamBadge(t.team)}<b>${i+1}. ${safe(t.team)}</b><strong>${t.points}</strong></button>`).join('')}</div></section>`;};
// Enrich driver profiles with a tappable team name, without nesting buttons in the standings list.
const v43OldShowDriver=v4ShowDriver;
v4ShowDriver=function(code){v43OldShowDriver(code);const el=document.querySelector('.v41-profile-team');const d=data.drivers.find(x=>x.code===code);if(el&&d){el.dataset.v43Team=d.team;el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-label','View history of '+d.team);el.title='Open team history';}};

// Previously completed Grands Prix: hourly historical reanalysis, NOT race control observations.
const v43WeatherArchive=new Map(), v43WeatherLoading=new Set();
const v43WeatherOldMarkup=v42WeatherMarkup;
function v43HistoricalReady(r){return Date.now()-new Date(r.race).getTime()>7*86400000;}
function v43ArchiveAt(f,iso){const times=f?.hourly?.time;if(!Array.isArray(times))return null;const target=new Date(iso).getTime();let best=-1,delta=Infinity;for(let i=0;i<times.length;i++){const t=new Date(times[i]+'Z').getTime(),d=Math.abs(t-target);if(d<delta){best=i;delta=d;}}if(best<0||delta>65*60000)return null;const x=f.hourly;return {temp:x.temperature_2m?.[best],rain:x.precipitation?.[best],code:x.weather_code?.[best],wind:x.wind_speed_10m?.[best]};}
function v43ArchiveMarkup(r,view){const key=v42WeatherKey(r),entry=v43WeatherArchive.get(key),head=`<div class="v42-weather-head"><div><span class="v42-kicker">RACE-WEEKEND WEATHER ARCHIVE</span><h3>${safe(r.short)} <span>${v4Flag(r)}</span></h3></div><span class="v42-weather-mark">◷</span></div>`;let body='';
 if(!v42Spot(r))body='<p class="v42-weather-message">Circuit weather location is not available.</p>';
 else if(!v43HistoricalReady(r))body='<p class="v42-weather-message">Archived weather usually becomes available several days after the race. Check back soon.</p>';
 else if(!entry||entry.loading)body='<p class="v42-weather-message">Loading historical weather near the circuit…</p>';
 else if(entry.error)body=`<p class="v42-weather-message">Historical weather unavailable at the moment.</p><button class="v42-weather-retry" data-v43-retry="${r.round}" type="button">RETRY ↻</button>`;
 else {const rows=v42RaceSessions(r).map(s=>({s,wx:v43ArchiveAt(entry.archive,s.dateStart)}));body=`<div class="v42-weather-grid">${rows.map(({s,wx})=>{const [symbol,label]=v42WeatherCode(wx?.code);return `<div class="v42-weather-day"><div class="v42-weather-session">${safe(s.name)}</div><div class="v42-weather-symbol">${symbol}</div><div class="v42-weather-temp">${wx?v42Rounding(wx.temp,'°C'):'—'}</div><div class="v42-weather-desc">${wx?label:'Unavailable'}</div><div class="v42-weather-rain">🌧 ${wx?(Number.isFinite(Number(wx.rain))?Number(wx.rain).toFixed(1)+' mm':'—'):'—'}</div><small>${fmtDay(s.dateStart)}</small></div>`;}).join('')}</div><div class="v42-weather-bottom">Rainfall in the hour, not a rain probability · Wind near race start: ${v42Rounding(v43ArchiveAt(entry.archive,r.race)?.wind,' km/h')}</div>`;}
 return `<section class="v42-weather-panel v43-history-weather v42-${view}" data-v43-weather="${r.round}">${head}${body}<div class="v42-weather-source">Historical reanalysis (modelled estimates near the circuit, not official trackside measurements) · <a href="https://open-meteo.com/en/docs/historical-weather-api" target="_blank" rel="noopener noreferrer">Open-Meteo Archive</a> · Session dates/times shown in Adelaide time</div></section>`;
}
v42WeatherMarkup=function(r,view='home'){return started(r)?v43ArchiveMarkup(r,view):v43WeatherOldMarkup(r,view);};
async function v43LoadArchive(r,force=false){if(!r||!v42Spot(r)||!v43HistoricalReady(r))return;const key=v42WeatherKey(r),prev=v43WeatherArchive.get(key);if(v43WeatherLoading.has(key)||(!force&&prev?.archive&&Date.now()-prev.time<12*3600000)||(!force&&prev?.error&&Date.now()-prev.time<120000))return;
 const sessions=v42RaceSessions(r),times=sessions.map(s=>new Date(s.dateStart).getTime()).filter(Number.isFinite),base=new Date(r.race).getTime();let start=new Date(Math.min(base,...times)-86400000).toISOString().slice(0,10),end=new Date(Math.max(base,...times)+86400000).toISOString().slice(0,10);const [lat,lon]=v42Spot(r);const url=`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&hourly=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=UTC`;
 v43WeatherLoading.add(key);v43WeatherArchive.set(key,{loading:true,time:Date.now()});
 try{const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),13000);let response;try{response=await fetch(url,{mode:'cors',signal:controller.signal});}finally{clearTimeout(timeout);}if(!response.ok)throw Error('Archive HTTP '+response.status);const archive=await response.json();if(!Array.isArray(archive?.hourly?.time)||!archive.hourly.time.length)throw Error('No archive hours');v43WeatherArchive.set(key,{archive,time:Date.now()});}
 catch(e){v43WeatherArchive.set(key,{error:true,time:Date.now()});}
 finally{v43WeatherLoading.delete(key);if((st.tab==='home'&&nextRace().round===r.round)||(st.tab==='calendar'&&st.expanded===r.round))render();}
}
const v43OldQueueWeather=v42QueueWeather;
v42QueueWeather=function(){const r=st.tab==='home'?nextRace():st.tab==='calendar'&&st.expanded!=null?data.races.find(x=>x.round===st.expanded):null;if(r&&started(r))Promise.resolve().then(()=>v43LoadArchive(r));else v43OldQueueWeather();};

// Exactly one circuit illustration per expanded race. When an official F1 image is
// available show it by default, or switch to the animated/CC0 outline. Never stack both.
const v43MapChoice=new Map();
v2TrackMarkup=function(r){const image=v3GetOfficialImage(r),choice=v43MapChoice.get(r.round)||(image?'official':'simulated'),official=Boolean(image)&&choice==='official';
 let map='';if(official){map=`<div class="official-circuit v43-one-map"><div class="split"><div><div class="micro">Circuit layout · official F1 image</div><h3 class="track-title">${safe(r.location)}</h3></div><a class="btn flat" href="${v3F1RaceUrl(r)}" target="_blank" rel="noopener noreferrer">F1 PAGE ↗</a></div><div class="f1-track-art"><img src="${safe(image)}" alt="Circuit outline for ${safe(r.name)}" loading="lazy" referrerpolicy="no-referrer" data-v43-map-image="${r.round}"></div><p class="note">Official artwork appears from Formula 1’s media site. See the F1 page for details.</p></div>`;}
 else map=v3OriginalTrackMarkup(r);
 return `<div class="v43-map-box">${image?`<div class="v43-map-toggle" role="group" aria-label="Circuit map type"><button type="button" class="${official?'active':''}" data-v43-map="${r.round}" data-v43-mode="official">OFFICIAL MAP</button><button type="button" class="${!official?'active':''}" data-v43-map="${r.round}" data-v43-mode="simulated">DRIVER SIMULATION</button></div>`:''}${map}<div class="v42-history-cta"><button type="button" class="v42-history-button" data-v42-history="${r.round}">◷ &nbsp; CIRCUIT HISTORY ↗</button><p>Only one map is displayed. Open the history for circuit facts and major moments.</p></div></div>`;
};
const v43OldSettings=v3SettingsPage;
v3SettingsPage=function(){return v43OldSettings().replace(/Version 4\.2 · Independent fan app/g,'Version 4.3 · Independent fan app');};
const v43OldRender=render;
render=function(){v43OldRender();const badge=document.querySelector('.v41-version');if(badge)badge.textContent='V4.3';};
function v43CloseTeam(){document.querySelector('.v43-team-shade')?.remove();}
document.addEventListener('click',e=>{
 const close=e.target.closest('[data-v43-close]');if(close||e.target.classList?.contains('v43-team-shade')){v43CloseTeam();return;}
 const team=e.target.closest('[data-v43-team]');if(team){v43OpenTeam(team.dataset.v43Team);return;}
 const mode=e.target.closest('[data-v43-map]');if(mode){v43MapChoice.set(Number(mode.dataset.v43Map),mode.dataset.v43Mode);render();return;}
 const retry=e.target.closest('[data-v43-retry]');if(retry){const r=data.races.find(x=>x.round===Number(retry.dataset.v43Retry));if(r)v43LoadArchive(r,true);return;}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')v43CloseTeam();if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('[role="button"][data-v43-team]')){e.preventDefault();v43OpenTeam(e.target.dataset.v43Team);}});
document.addEventListener('error',e=>{const image=e.target;if(image?.matches?.('[data-v43-map-image]')){v43MapChoice.set(Number(image.dataset.v43MapImage),'simulated');render();}},true);
document.title='PITWALL V4.3 — Race Companion';
render();
v43LoadWins();
