/* PITWALL V4.1 — fidelity pass for the actual running interface.
   Builds on the existing V4 logic without replacing its calendar or career simulation. */
'use strict';
function v41CompactSession(s){
  const n=String(s.name||'').toLowerCase();
  if(n.includes('practice'))return 'FP'+(n.match(/[1-3]/)?.[0]||'');
  if(n.includes('sprint qualifying'))return 'SQ';
  if(n.includes('qualifying'))return 'QUALI';
  if(n.includes('sprint'))return 'SPRINT';
  if(n.includes('race'))return 'RACE';return s.name;
}
function v41CircuitSvg(r,cl='v41-circuit'){
  const path=v2Schematic(r).d;
  return `<svg class="${cl}" viewBox="0 0 360 230" aria-label="Simplified ${safe(r.name)} circuit silhouette" role="img"><path d="${path}" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="40" cy="40" r="0" fill="none"/></svg>`;
}
v4Hero=function(){
  const r=nextRace(),c=v4Countdown(r),flag=v4Flag(r),sessions=scheduleFor(r).filter(x=>/practice|qualifying|sprint|race/i.test(x.name));
  let raceDisplay=r.short==='Barcelona-Catalunya'?'Spanish':r.short==='Great Britain'?'British':r.short;
  const chips=sessions.slice(-5).map(s=>`<div class="v41-session ${/race/i.test(s.name)?'is-race':''}"><small>${v41CompactSession(s)}</small><span>${v4Flag(r)}</span><b>${fmtDay(s.dateStart).split(' ')[0]}</b><strong>${fmtHour(s.dateStart).replace(' ','')}</strong></div>`).join('');
  const pieces=c.value==='FINISHED'?['00','00','00']:c.value.split(':');
  return `<section class="v4-weather-hero v41-hero">
    <div class="v41-ambient" aria-hidden="true"></div>
    <div class="v41-overline"><span class="v41-overline-red">NEXT RACE</span><span>ROUND ${String(r.round).padStart(2,'0')}</span></div>
    <div class="v41-hero-main">
      <div class="v41-hero-copy"><div class="v41-grandprix-title">${safe(raceDisplay)} <span class="v41-hero-flag">${flag}</span></div><h1>Grand Prix</h1><p>${safe(r.location)} · ${v4Day(r)}</p><div class="v41-hero-time">${fmtHour(r.race)} <span>ACDT / ACST · ADELAIDE</span></div></div>
      <div class="v41-hero-map">${v41CircuitSvg(r)}<small>TRACK PREVIEW</small></div>
    </div>
    <div class="v41-clock"><div><b>${pieces[0]||'00'}</b><span>DAYS</span></div><div><b>${pieces[1]||'00'}</b><span>HOURS</span></div><div><b>${pieces[2]||'00'}</b><span>MINUTES</span></div></div>
    <div class="v41-session-head"><b>RACE WEEKEND</b><span>Adelaide time</span></div><div class="v41-sessions">${chips}</div>
    <div class="v4-hero-actions"><button type="button" data-v4-race="${r.round}">VIEW WEEKEND <span>↗</span></button><a href="${KAYO}" target="_blank" rel="noopener noreferrer">WATCH ON KAYO ↗</a></div>
  </section>`;
};
// Replace the Weather-app structure's forecast strip with a closer racing-card treatment.
v4Strip=function(){let upcoming=sortedRaces().filter(r=>!started(r));if(!upcoming.length)upcoming=sortedRaces().slice(-5);
return `<section class="v41-calendar-forecast"><div class="v4-strip-head"><b>UPCOMING RACES</b><span>See calendar ↗</span></div><div class="v4-race-strip" aria-label="Upcoming Grand Prix races">${upcoming.slice(0,9).map((r,i)=>`<button type="button" class="v4-race-chip ${i===0?'selected':''}" data-v4-race="${r.round}"><span class="v4-flag">${v4Flag(r)}</span><b>${safe(r.short==='Great Britain'?'Britain':r.short==='São Paulo'?'Brazil':r.short)}</b><span>${v4Day(r)}</span><small>R${r.round}</small></button>`).join('')}</div></section>`;
};
// Make the main brand a real, working Settings link while preserving data status semantics.
const v41Header=document.querySelector('.topbar');
if(v41Header){v41Header.innerHTML=`<div class="brand"><img class="brand-icon" src="icon-192.png" alt=""><span>PIT<span class="v41-brand-red">WALL</span></span><span class="v41-version">V4.1</span></div><div class="v41-header-actions"><span class="live" id="dataStatus"><span class="dot"></span> SAVED DATA</span><button type="button" class="v41-settings-gear" aria-label="Open settings" data-action="go-settings">⚙</button></div>`;}
document.title='PITWALL V4.1 — Race Companion';
const v41OriginalStatus=setStatus;
setStatus=function(){v41OriginalStatus();};
// Re-render now that the styling-target markup is installed.
render();setStatus();
