/* PITWALL 5.1 — accurate F1 career-stat totals for experienced drivers.
 * Jolpica limits requests to 100 rows, so asking for the entire driver's
 * results in one request silently truncates established drivers' records.
 * Instead fetch tiny filtered count summaries: 6 calls, 1 record each. */
'use strict';
const V51_ERROR={};
const V51_RETRY_WAIT=750;
const v51PriorVisual=v44VisualStats;
v44VisualStats=function(code){
 const shown=v51PriorVisual(code);
 if(v44Loading.has(code))return {...shown,sub:shown.s?'Refreshing career totals…':'Loading all-time career totals…'};
 if(V51_ERROR[code])return {...shown,sub:shown.s?'Some statistics could not refresh — saved numbers shown':'Career archive unavailable right now — try again'};
 if(v44Cached[code]?.partial)return {...shown,sub:'Partial archive data — retry to complete statistics'};
 return shown;
};
const v51PriorRender=v44RenderStats;
v44RenderStats=function(code){
 v51PriorRender(code);
 const shade=document.querySelector(`.v44-driver-shade[data-driver-code="${code}"]`);
 const status=shade?.querySelector('.v44-data-status');
 if(!status)return;
 let retry=shade.querySelector('.v51-retry');
 if(V51_ERROR[code]||v44Cached[code]?.partial){
  if(!retry){retry=document.createElement('button');retry.type='button';retry.className='v51-retry';retry.dataset.v51Retry=code;retry.textContent='↻ Retry career statistics';status.insertAdjacentElement('afterend',retry);}
  retry.disabled=v44Loading.has(code);
 }else if(retry)retry.remove();
};
async function v51Count(url){
 // An empty result is valid; a missing/non-numeric total is NOT zero.
 for(let attempt=0;attempt<2;attempt++){
  try{
   const json=await fetchJson(url+(url.includes('?')?'&':'?')+'limit=1',13500);
   const raw=json?.MRData?.total;
   if(raw==null||raw===''||!Number.isFinite(Number(raw))||Number(raw)<0)throw Error('Missing API total');
   return {total:Number(raw),first:json?.MRData?.RaceTable?.Races?.[0]||null};
  }catch(e){if(attempt===1)throw e;await new Promise(resolve=>setTimeout(resolve,V51_RETRY_WAIT));}
 }
}
v44LoadDriver=async function(code){
 const id=V44_DRIVER_IDS[code];if(!id)return;
 const existing=v44Cached[code];
 if(existing?.data&&existing.verifiedV51&&!existing.partial&&Date.now()-existing.fetchedAt<V44_STATS_TTL)return;
 if(v44Loading.has(code))return v44Loading.get(code);
 delete V51_ERROR[code];
 const prefix=API+'drivers/'+encodeURIComponent(id)+'/';
 const run=(async()=>{
  try{
   const queries=[
    prefix+'results.json',
    prefix+'results/1.json',
    prefix+'results/2.json',
    prefix+'results/3.json',
    prefix+'qualifying/1.json',
    prefix+'driverstandings/1.json'
   ];
   // Two calls at a time reduces the risk of hitting the public API burst limit.
   const responses=[];
   for(let i=0;i<queries.length;i+=2){
    const pair=await Promise.allSettled(queries.slice(i,i+2).map(v51Count));
    responses.push(...pair.map(r=>r.status==='fulfilled'?r.value:null));
    if(i+2<queries.length)await new Promise(resolve=>setTimeout(resolve,350));
   }
   const old=existing?.data||{};
   const count=index=>responses[index]?.total;
   const knownWins=count(1),knownSeconds=count(2),knownThirds=count(3);
   const next={
    entries:count(0)??old.entries??null,
    debut:responses[0]?.first?.season||old.debut||v44FirstSeason(V41_DRIVER_HISTORY[code],code),
    wins:knownWins??old.wins??null,
    podiums:[knownWins,knownSeconds,knownThirds].every(Number.isFinite)?knownWins+knownSeconds+knownThirds:old.podiums??null,
    poles:count(4)??old.poles??null,
    titles:count(5)??old.titles??null
   };
   const ok=responses.every(Boolean);
   if(responses.some(Boolean)){
    v44Cached[code]={data:next,fetchedAt:Date.now(),verifiedV51:ok,partial:!ok};
    v44CacheSave();
   }
   if(!ok)V51_ERROR[code]='Some archive requests failed';
  }catch(e){V51_ERROR[code]=String(e?.message||e);}
  finally{v44Loading.delete(code);v44RenderStats(code);}
 })();
 v44Loading.set(code,run);v44RenderStats(code);return run;
};
document.addEventListener('click',e=>{
 const button=e.target.closest('[data-v51-retry]');if(!button)return;
 const code=button.dataset.v51Retry;
 if(v44Loading.has(code))return;
 delete V51_ERROR[code];
 if(v44Cached[code])v44Cached[code].verifiedV51=false;
 v44LoadDriver(code);
});
const v51OldRender=render;
render=function(){v51OldRender();const version=document.querySelector('.v41-version');if(version)version.textContent='V5.1';};
document.title='PITWALL V5.1 — F1 Race Companion';
render();
