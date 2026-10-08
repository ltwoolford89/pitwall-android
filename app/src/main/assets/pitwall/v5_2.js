/* PITWALL V5.2: Wikipedia-first career statistics, Settings-only connection panel,
 * and a restrained, real UI redesign. Never inject Wikipedia HTML into the app. */
'use strict';
const V52_WIKI_TTL=24*60*60*1000;
const v52PriorJolpica=v44LoadDriver;
const v52PriorVisual=v44VisualStats;
const v52WikiLoading=new Map();
const v52StatsOrigin={};
const v52WikiProblem={};
function v52WikiTitle(code){
 const h=V41_DRIVER_HISTORY[code];
 const d=data.drivers.find(x=>x.code===code);
 return h?.wiki||[d?.first,d?.last].filter(Boolean).join(' ');
}
function v52Number(value){
 const first=String(value??'').replace(/\[[^\]]*\]/g,'').match(/(?:^|\D)(\d{1,3}(?:,\d{3})*|\d+)(?:\D|$)/);
 if(!first)return null;
 const n=Number(first[1].replaceAll(',',''));
 return Number.isSafeInteger(n)&&n>=0?n:null;
}
function v52WikipediaParse(raw){
 const doc=new DOMParser().parseFromString(raw,'text/html');
 // Only read tables used as biography/F1 infoboxes, not race-by-race tables.
 const tables=[...doc.querySelectorAll('table.infobox')];
 const candidates=tables.length?tables:[...doc.querySelectorAll('table')].slice(0,3);
 const stats={};
 for(const table of candidates){
  const heading=(table.textContent||'').slice(0,2000).toLowerCase();
  if(!heading.includes('formula one')&&!heading.includes('pole position')&&!heading.includes('entries'))continue;
  for(const tr of table.querySelectorAll('tr')){
   const th=tr.querySelector(':scope > th');const td=tr.querySelector(':scope > td');
   if(!th||!td)continue;
   // Only the page's field values are read, never inserted as HTML.
   const label=th.textContent.replace(/\[[^\]]*\]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
   const val=td.cloneNode(true);val.querySelectorAll('sup,style,script,.reference').forEach(el=>el.remove());
   const text=(val.textContent||'').replace(/\s+/g,' ').trim();
   const num=v52Number(text);
   if(/^entries(?:\s|$)|^grand prix entries|^races entered/.test(label))stats.entries=num;
   else if(/^wins$|^race wins$|^grand prix wins$/.test(label))stats.wins=num;
   else if(/^podiums$|^podium finishes$/.test(label))stats.podiums=num;
   else if(/^championships$|^world championships$|^world drivers.? championships$|^drivers.? championships$/.test(label))stats.titles=num;
   else if(/^pole positions$|^poles$/.test(label))stats.poles=num;
   else if(/^fastest laps$/.test(label))stats.fastestLaps=num;
   else if(/^first entry$|^formula one debut$/.test(label)){
    stats.firstEntry=text.slice(0,105);
    const year=text.match(/\b(?:19|20)\d\d\b/);if(year)stats.debut=year[0];
   }
  }
  if(['entries','wins','podiums','poles','titles'].filter(k=>Number.isFinite(stats[k])).length>=3)break;
 }
 return Object.fromEntries(Object.entries(stats).filter(([,v])=>v!=null));
}
async function v52GetWikipedia(code){
 const title=v52WikiTitle(code);if(!title)throw Error('Driver article unavailable');
 const params=new URLSearchParams({action:'parse',page:title,prop:'text',section:'0',format:'json',origin:'*',redirects:'1'});
 const response=await fetchJson('https://en.wikipedia.org/w/api.php?'+params.toString(),16000);
 if(response?.error)throw Error('Wikipedia returned an error');
 const raw=response?.parse?.text?.['*']??response?.parse?.text;
 if(typeof raw!=='string')throw Error('Wikipedia article was not readable');
 const result=v52WikipediaParse(raw);
 if(['entries','wins','podiums','poles','titles'].filter(k=>Number.isFinite(result[k])).length<2)throw Error('Wikipedia has no readable F1 career table');
 return result;
}
v44VisualStats=function(code){
 const out=v52PriorVisual(code);
 if(v52WikiLoading.has(code)&&!v44Cached[code]?.data)return {...out,sub:'Checking Wikipedia career records…'};
 const source=v52StatsOrigin[code]||v44Cached[code]?.source;
 if(source==='wikipedia')return {...out,sub:'Wikipedia F1 career infobox · '+v44Date(v44Cached[code].fetchedAt)+' · data may be edited'};
 if(source==='mixed')return {...out,sub:'Wikipedia + saved results archive · '+v44Date(v44Cached[code].fetchedAt)};
 if(v52WikiProblem[code]&&out.s)return {...out,sub:'Wikipedia unavailable · showing saved/results archive data'};
 return out;
};
v44LoadDriver=async function(code){
 if(!V44_DRIVER_IDS[code])return;
 if(navigator.onLine===false){v52WikiProblem[code]='Offline';v44RenderStats(code);return;}
 const entry=v44Cached[code];
 if(entry?.source==='wikipedia'&&!entry.partial&&Date.now()-entry.fetchedAt<V52_WIKI_TTL)return;
 if(v52WikiLoading.has(code))return v52WikiLoading.get(code);
 const p=(async()=>{
  try{
   const wiki=await v52GetWikipedia(code);
   const present=['entries','wins','podiums','poles','titles'].filter(k=>Number.isFinite(wiki[k]));
   // Use the archive for missing fields; prefer Wikipedia when both sources provide a value.
   if(present.length<5&&!v44Cached[code]?.data)await v52PriorJolpica(code);
   const archive=v44Cached[code]?.data||{};
   const combined={...archive,...wiki};
   const partial=['entries','wins','podiums','poles','titles'].some(k=>!Number.isFinite(combined[k]));
   v44Cached[code]={data:combined,source:present.length===5?'wikipedia':'mixed',fetchedAt:Date.now(),partial,verifiedV51:true};
   v52StatsOrigin[code]=v44Cached[code].source;
   delete V51_ERROR[code];delete v52WikiProblem[code];v44CacheSave();
  }catch(err){
   v52WikiProblem[code]=String(err?.message||err);
   if(!v44Cached[code]?.data||v44Cached[code].partial)await v52PriorJolpica(code);
   // Preserve existing verified/cached archive values when Wikipedia cannot be fetched.
  }finally{
   v52WikiLoading.delete(code);v44RenderStats(code);
   const shade=document.querySelector(`.v44-driver-shade[data-driver-code="${code}"]`);
   if(shade){
    let extra=shade.querySelector('.v52-additional');
    if(!extra){extra=document.createElement('div');extra.className='v52-additional';shade.querySelector('.v44-data-status')?.insertAdjacentElement('afterend',extra);}
    const stats=v44Cached[code]?.data||{};
    const parts=[];
    if(Number.isFinite(stats.fastestLaps))parts.push(`<span>FASTEST LAPS <b>${stats.fastestLaps}</b></span>`);
    if(stats.firstEntry)parts.push(`<span>FIRST GRAND PRIX <b>${safe(stats.firstEntry)}</b></span>`);
    extra.innerHTML=parts.join('');
   }
  }
 })();
 v52WikiLoading.set(code,p);v44RenderStats(code);return p;
};
// The network connection card no longer interrupts the Home / Race dashboard.
// The same status, timestamp, and refresh button are available under Settings.
const v52OriginalBanner=v5Banner;
v5Banner=function(){return '';};
const v52OldSettings=v3SettingsPage;
v3SettingsPage=function(){
 let page=v52OldSettings();
 const card=v52OriginalBanner();
 page=page.replace('<div class="settings-group-title">CONNECTIVITY & OFFLINE</div>',
  '<div class="settings-group-title">CONNECTIVITY & OFFLINE</div>'+card);
 page=page.replace('<h1 class="settings-title">Settings</h1>', '<div class="split" style="gap:12px;align-items:center;margin-bottom:14px"><h1 class="settings-title" style="margin:0">Settings</h1><span class="v521-settings-version" aria-label="App version 5.2.1">✓ V5.2.1</span></div>');
 return page.replace(/Version (?:3|5(?:\.\d+)?) · Independent fan app/g,'Version 5.2.1 · Independent fan app');
};
// Let people refresh Wikipedia manually without clearing the whole career cache.
document.addEventListener('click',e=>{
 const refresh=e.target.closest('[data-v52-wiki-refresh]');if(!refresh)return;
 const code=refresh.dataset.v52WikiRefresh;
 if(v52WikiLoading.has(code))return;
 if(v44Cached[code])v44Cached[code].fetchedAt=0;
 delete V51_ERROR[code];delete v52WikiProblem[code];
 v44LoadDriver(code);
});
const v52OldShowDriver=v4ShowDriver;
v4ShowDriver=function(code){
 v52OldShowDriver(code);
 const shade=document.querySelector('.v44-driver-shade');
 if(!shade)return;
 const history=shade.querySelector('.v44-archive-body');
 if(history){
  const credit=history.querySelector('.v44-fineprint');
  if(credit)credit.textContent='Career statistics are requested from Wikipedia’s Formula One career infobox (including GP entries and pole positions). If Wikipedia is unavailable, saved figures or the Jolpica race-results archive are used instead. Sources may differ on entries versus starts, qualifying records, and the timing of updates. A dash means a figure is unavailable, not zero.';
  const link=history.querySelector('.v43-wiki');
  if(link){const button=document.createElement('button');button.type='button';button.className='v52-wiki-refresh';button.dataset.v52WikiRefresh=code;button.textContent='↻ Update Wikipedia stats';link.insertAdjacentElement('beforebegin',button);}
 }
};
const v52OldRender=render;
render=function(){
 v52OldRender();
 const badge=document.querySelector('.v41-version');if(badge)badge.textContent='V5.2.1';
};
document.title='PITWALL V5.2.1 — Race Companion';
render();
