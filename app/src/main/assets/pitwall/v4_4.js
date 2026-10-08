/* PITWALL 4.4: F1 driver career archives.
 * Stats are queried from the Jolpica F1 public results archive on profile open.
 * Cached read-only for offline viewing; unavailable data is never represented as zero. */
'use strict';
const V44_DRIVER_IDS={
 ANT:'antonelli',RUS:'russell',HAM:'hamilton',LEC:'leclerc',NOR:'norris',VER:'verstappen',
 PIA:'piastri',HAD:'hadjar',LAW:'lawson',GAS:'gasly',LIN:'lindblad',COL:'colapinto',
 BEA:'bearman',BOR:'bortoleto',HUL:'hulkenberg',OCO:'ocon',ALO:'alonso',SAI:'sainz',
 ALB:'albon',TSU:'tsunoda',STR:'stroll',BOT:'bottas',PER:'perez'
};
const V44_CACHE_KEY='pitwall-driver-career-v4.4';
const V44_STATS_TTL=12*60*60*1000;
const v44Cached={};
try{const saved=JSON.parse(localStorage.getItem(V44_CACHE_KEY)||'{}');
 for(const [key,entry] of Object.entries(saved))if(V44_DRIVER_IDS[key]&&entry?.data&&Number.isFinite(entry.fetchedAt))v44Cached[key]=entry;
}catch(e){}
const v44Loading=new Map();
function v44CacheSave(){try{localStorage.setItem(V44_CACHE_KEY,JSON.stringify(v44Cached));}catch(e){}}
function v44Stored(code){return v44Cached[code]?.data||null;}
function v44Date(when){return new Intl.DateTimeFormat('en-AU',{day:'numeric',month:'short',year:'numeric'}).format(new Date(when));}
function v44Cell(value,label,sub=''){
 const val=Number.isFinite(value)?value.toLocaleString('en-AU'):typeof value==='string'?value:'—';
 return `<div class="v44-stat"><b>${safe(val)}</b><span>${safe(label)}</span>${sub?`<small>${safe(sub)}</small>`:''}</div>`;
}
function v44FirstSeason(h,code){return String(h?.line||'').match(/debut\s+(\d{4})/i)?.[1]||({HAM:'2007',ALO:'2001',VER:'2015',NOR:'2019',RUS:'2019',ANT:'2025',LEC:'2018',PIA:'2023',BOT:'2013',PER:'2011',GAS:'2017',HUL:'2010',SAI:'2015',TSU:'2021',LIN:'2026'})[code]||'—';}
function v44VisualStats(code){
 const c=v44Cached[code];if(c?.data){return {s:c.data,sub:c.failed?'Saved statistics · offline':Date.now()-c.fetchedAt>V44_STATS_TTL?'Saved statistics · refresh pending':`Results archive · ${v44Date(c.fetchedAt)}`};}
 return {s:null,sub:v44Loading.has(code)?'Loading career statistics…':'Career data needs an internet connection'};
}
function v44RenderStats(code){
 const container=document.querySelector(`.v44-driver-shade[data-driver-code="${code}"] .v44-career-grid`);
 const note=document.querySelector(`.v44-driver-shade[data-driver-code="${code}"] .v44-data-status`);
 if(!container||!note)return;
 const {s,sub}=v44VisualStats(code);
 container.innerHTML=[
 v44Cell(s?.wins,'RACE WINS'),v44Cell(s?.podiums,'PODIUMS'),v44Cell(s?.titles,'WORLD TITLES'),
 v44Cell(s?.poles,'POLE POSITIONS'),v44Cell(s?.entries,'GP ENTRIES'),v44Cell(s?.debut||v44FirstSeason(V41_DRIVER_HISTORY[code],code),'F1 DEBUT')
 ].join('');
 note.textContent=sub;
}
async function v44FetchArray(url,path){
 const payload=await fetchJson(url,14000);
 let obj=payload;
 for(const part of path)obj=obj?.[part];
 if(!Array.isArray(obj))throw new Error('Incomplete driver archive data');
 return {list:obj,total:Number(payload?.MRData?.total||obj.length)};
}
async function v44LoadDriver(code){
 if(!V44_DRIVER_IDS[code])return;
 const current=v44Cached[code];
 if(current?.data&&Date.now()-current.fetchedAt<V44_STATS_TTL)return;
 if(v44Loading.has(code))return v44Loading.get(code);
 const driver=V44_DRIVER_IDS[code],prefix=API+'drivers/'+encodeURIComponent(driver)+'/';
 const run=(async()=>{
  try{
   // Request archived GP results, P1 qualifying classifications and P1 season standings.
   // Fetch sequentially to be considerate of a freely hosted, rate-limited public API.
   const results=await v44FetchArray(prefix+'results.json?limit=1000',['MRData','RaceTable','Races']);
   let q=null,champ=null;
   try{q=await v44FetchArray(prefix+'qualifying/1.json?limit=1000',['MRData','RaceTable','Races']);}catch(e){}
   try{champ=await v44FetchArray(prefix+'driverstandings/1.json?limit=250',['MRData','StandingsTable','StandingsLists']);}catch(e){}
   if(results.total>results.list.length)throw new Error('Archive truncated');
   const flat=results.list.flatMap(r=>r.Results||[]);
   const valid=flat.filter(row=>Number.isFinite(+row.position)&&+row.position>0);
   const byWins=valid.filter(row=>+row.position===1).length;
   const byPodiums=valid.filter(row=>+row.position>=1&&+row.position<=3).length;
   const years=results.list.map(r=>Number(r.season)).filter(y=>y>=1950&&y<=YEAR);
   const data={wins:byWins,podiums:byPodiums,titles:champ?champ.total:null,poles:q?q.total:null,
     entries:results.total,debut:years.length?String(Math.min(...years)):null};
   v44Cached[code]={data,fetchedAt:Date.now()};v44CacheSave();
  }catch(e){if(v44Cached[code]?.data)v44Cached[code].failed=true;}
  finally{v44Loading.delete(code);v44RenderStats(code);}
 })();
 v44Loading.set(code,run);v44RenderStats(code);return run;
}
// Use the same clickable driver cards that V4.1 added to Home and Standings.
// V4.3's team history can still be opened from inside the profile.
v4ShowDriver=function(code){
 const d=data.drivers.find(x=>x.code===code);if(!d)return;
 const history=V41_DRIVER_HISTORY[code]||{};
 const wikiName=history.wiki||`${d.first} ${d.last}`;
 const wikiURL='https://en.wikipedia.org/wiki/'+encodeURIComponent(wikiName.replaceAll(' ','_'));
 document.querySelector('.v4-profile-shade')?.remove();
 document.querySelector('.v43-team-shade')?.remove();
 const shade=document.createElement('div');shade.className='v4-profile-shade v44-driver-shade';shade.dataset.driverCode=code;
 shade.innerHTML=`<section class="v4-profile v44-driver-modal" role="dialog" aria-modal="true" aria-labelledby="v44-title" style="--team:${teamColour(d.team)}">
  <button type="button" class="v4-close" data-v4-close aria-label="Close driver profile">×</button>
  <div class="v44-driver-header"><span class="v43-eyebrow">THE PITWALL ARCHIVE / DRIVERS</span>
   <div class="v44-identity"><div class="v44-driver-pixel">${v4Avatar(d,'v44-driver-avatar',v4Prefs.portrait)}</div>
   <div class="v44-id-copy"><small class="v44-code">${safe(d.code)}</small><h2 id="v44-title">${safe(d.first)} <strong>${safe(d.last.toUpperCase())}</strong></h2><button type="button" class="v44-team-button" data-v43-team="${safe(d.team)}" aria-label="Read the history of ${safe(d.team)}">${v41TeamBadge(d.team)}<span>${safe(d.team)}</span><span aria-hidden="true">↗</span></button></div></div>
  </div>
  <div class="v44-season-bar"><div><b>P${d.position}</b><small>${YEAR} POSITION</small></div><div><b>${Number(d.points).toLocaleString('en-AU')}</b><small>${YEAR} POINTS</small></div><div><b>${d.wins}</b><small>${YEAR} WINS</small></div></div>
  <div class="v44-archive-body"><div class="v44-section-head"><h3>Career statistics</h3><small>GRAND PRIX / F1 WORLD CHAMPIONSHIP</small></div>
   <div class="v44-career-grid" aria-live="polite"></div><p class="v44-data-status" role="status"></p>
   <h3>Driver history</h3><p class="v44-history-summary">${safe(history.line||'Formula 1 driver')}</p><p>${safe(history.bio||`${d.first} ${d.last} races in Formula 1 for ${d.team}.`)}</p>
   <div class="v44-fineprint">Career totals use the Jolpica F1 results archive, including completed 2026 Grands Prix when online. GP entries count recorded race-result entries, including non-starters; qualifying poles are P1 qualifying classifications. Championship titles count first-place season standings. Some historical/edge-case totals can differ from official F1 figures. A dash means the data was not available, not zero.</div>
   <a href="${safe(wikiURL)}" class="v43-wiki" target="_blank" rel="noopener noreferrer">READ DRIVER WIKIPEDIA ↗</a>
  </div>
 </section>`;
 document.body.appendChild(shade);
 shade.querySelector('.v4-close')?.focus();
 v44RenderStats(code);v44LoadDriver(code);
};
const v44OldSettingsPage=v3SettingsPage;
v3SettingsPage=function(){return v44OldSettingsPage().replace(/Version 4\.3 · Independent fan app/g,'Version 4.4 · Independent fan app');};
const v44OldRender=render;
render=function(){v44OldRender();const tag=document.querySelector('.v41-version');if(tag)tag.textContent='V4.4';};
document.title='PITWALL V4.4 — Race Companion';
render();
