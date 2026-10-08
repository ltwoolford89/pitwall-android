/* PITWALL V5.4 — App dashboard widgets and downloadable calendar reminders.
   No iPhone Home Screen widgets or background push are claimed here. */
'use strict';
(function(){
  const KEY='pitwall-v54-preferences';
  const defaults={race:true,driver:true,constructors:true,reminderType:'race',reminderMinutes:30};
  let pref={...defaults};
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}'); if(saved&&typeof saved==='object')pref={...pref,...saved};}catch(e){}
  const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(pref));}catch(e){toast('Could not save widget preferences');}};
  const isReal=()=>typeof v5Verified!=='undefined' && Boolean(v5Verified.drivers&&v5Verified.races);
  function raceData(){return (typeof sortedRaces==='function'?sortedRaces():data.races).find(r=>new Date(r.race).getTime()>Date.now())||null;}
  function timeText(iso){return new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Adelaide',weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(iso));}
  const h=val=>safe(val??'');
  function track(r){
    if(!r)return '<span aria-hidden="true">🏁</span>';
    if(typeof v41CircuitSvg==='function')return v41CircuitSvg(r,'v54-widget-track');
    return '<span aria-hidden="true">🏁</span>';
  }
  function widgetCards(){
    const r=raceData();const d=typeof v3Favourite==='function'?v3Favourite():data.drivers[0];
    const ct=(data.constructors||[]).slice(0,3);const verified=typeof v5Verified!=='undefined'&&v5Verified.drivers&&v5Verified.constructors;
    let content='';
    if(pref.race)content+=`<div class="v54-widget v54-race" role="group" aria-label="Next race widget preview"><div class="v54-caption">NEXT GRAND PRIX <span class="v54-label">${r?'ROUND '+h(r.round):'SEASON FINISHED'}</span></div><div class="v54-widget-row"><div><h3>${r?h(r.short)+' GP':'No upcoming races'}</h3><p>${r?h(r.location):'Check the next season when published'}</p><strong>${r?h(timeText(r.race)):'—'}</strong><small>Adelaide time</small></div><div class="v54-widget-map">${track(r)}</div></div></div>`;
    if(pref.driver)content+=`<div class="v54-widget v54-driver" role="group" aria-label="Favourite driver widget preview"><div class="v54-caption">FAVOURITE DRIVER <span class="v54-label">${verified?'UPDATED STANDINGS':'DATA PREVIEW'}</span></div>${d?`<div class="v54-drow"><span class="v54-bigpos">P${h(d.position??'—')}</span><div><b>${h(d.first)} ${h(d.last)}</b><small>${h(d.team)}</small></div><div class="v54-points">${h(d.points??'—')}<small>PTS</small></div></div>`:'<p>Set your favourite driver in Settings.</p>'}</div>`;
    if(pref.constructors)content+=`<div class="v54-widget v54-team" role="group" aria-label="Constructor widget preview"><div class="v54-caption">CONSTRUCTORS <span class="v54-label">TOP THREE</span></div>${ct.map((t,i)=>`<div class="v54-standrow"><span>${i+1}</span><i style="background:${h(teamColour(t.team))}"></i><b>${h(t.team)}</b><strong>${h(t.points)} PTS</strong></div>`).join('')}</div>`;
    return content||'<div class="v54-empty">Enable a widget in Settings to see its preview.</div>';
  }
  function homePanel(){return `<section class="v54-dashboard" id="v54-widgets"><div class="v54-heading"><div><span class="micro">RACE DAY AT A GLANCE</span><h2>My widgets</h2></div><button class="v54-textbtn" type="button" data-v54-goto-settings>Customise ↗</button></div><p class="v54-explain">Live-style cards inside PITWALL. These are previews, not iPhone Home Screen widgets.</p><div class="v54-widget-grid">${widgetCards()}</div><div class="v54-reminder-banner"><div><b>Never miss lights out</b><small>Save a race reminder to your calendar.</small></div><button type="button" class="v54-button" data-v54-ics="next">Race reminder ↗</button></div></section>`;}
  const switchHTML=(key,title,desc)=>`<div class="settings-row v54-setting-row"><span class="settings-label"><b>${title}</b><small>${desc}</small></span><button type="button" role="switch" aria-checked="${Boolean(pref[key])}" class="v54-switch ${pref[key]?'on':''}" data-v54-toggle="${key}" aria-label="Show ${title}"><span></span></button></div>`;
  function optionsHTML(){
    return `<div class="v54-settings"><div class="settings-group-title">DASHBOARD WIDGETS</div><div class="settings-group">
    ${switchHTML('race','Next race','Circuit outline and Adelaide race time')}
    ${switchHTML('driver','Favourite driver','Championship place and points')}
    ${switchHTML('constructors','Constructors','Top three teams in the standings')}
    <div class="settings-row"><span class="settings-label">Preview your widgets</span><button class="v54-settingbtn" type="button" data-v54-goto-widgets>View cards ↗</button></div>
    </div><p class="settings-hint">These appear inside PITWALL only. Native Home Screen widgets need a separate iOS WidgetKit app.</p>
    <div class="settings-group-title">RACE REMINDERS</div><div class="settings-group">
    <div class="settings-row"><label for="v54-event-kind" class="settings-label">Session reminders</label><select id="v54-event-kind" class="v54-select" data-v54-field="reminderType"><option value="race" ${pref.reminderType==='race'?'selected':''}>Race only</option><option value="key" ${pref.reminderType==='key'?'selected':''}>Qualifying + race</option><option value="all" ${pref.reminderType==='all'?'selected':''}>All available sessions</option></select></div>
    <div class="settings-row"><label for="v54-alert-minutes" class="settings-label">Alert before start</label><select id="v54-alert-minutes" class="v54-select" data-v54-field="reminderMinutes">${[15,30,60,120].map(m=>`<option value="${m}" ${+pref.reminderMinutes===m?'selected':''}>${m>=60?m/60+' hour'+(m===120?'s':''):m+' minutes'} before</option>`).join('')}</select></div>
    <div class="settings-row"><span class="settings-label">Upcoming Grand Prix</span><button class="v54-settingbtn" type="button" data-v54-ics="next">Download .ics ↗</button></div>
    <div class="settings-row"><span class="settings-label">Remaining 2026 season</span><button class="v54-settingbtn" type="button" data-v54-ics="season">Download .ics ↗</button></div>
    </div><p class="settings-hint">Calendar downloads include alerts in your phone's Calendar app after you import them. PITWALL does not send scheduled push notifications yet. The calendar must be downloaded again if race times change. Sync real race data first.</p>
    </div>`;
  }
  // Wrap only the last display stage. Preserve the original scrollable document and save formats.
  const previousRender=render;
  render=function(...args){const result=previousRender(...args);
    document.title='PITWALL V5.4 — Race Companion';
    const badge=document.querySelector('.v41-version');if(badge)badge.textContent='V5.4';
    const brand=document.querySelector('.topbar .brand > span');if(brand)brand.innerHTML='PITWALL<span style="color:#ff636d">. V5.4</span>';
    document.querySelectorAll('.v521-settings-version').forEach(n=>{n.textContent='✓ V5.4';n.setAttribute('aria-label','App version 5.4');});
    if(st.tab==='home'){
      const main=document.querySelector('#app .main-tab');if(main&&!main.querySelector('#v54-widgets'))main.insertAdjacentHTML('beforeend',homePanel());
    }
    if(st.tab==='settings'){
      const main=document.querySelector('#app .main-tab');if(main&&!main.querySelector('.v54-settings'))main.insertAdjacentHTML('beforeend',optionsHTML());
    }
    return result;
  };
  function upcoming(){return (typeof sortedRaces==='function'?sortedRaces():data.races).filter(r=>Date.parse(r.race)>Date.now());}
  function remindersFor(r){
    let sessions=typeof scheduleFor==='function'?scheduleFor(r):[{name:'Race',dateStart:r.race}];
    const uniq=new Map();
    for(const s of sessions){if(!Number.isFinite(Date.parse(s.dateStart))||Date.parse(s.dateStart)<Date.now())continue;
      const name=String(s.name||'Race');if(pref.reminderType==='race'&&!/^Race$/i.test(name))continue;
      if(pref.reminderType==='key'&&!/^(Race|Qualifying|Sprint Qualifying|Sprint)$/i.test(name))continue;
      uniq.set(name+'|'+s.dateStart,{name,iso:s.dateStart,r});
    }
    if(!uniq.size&&pref.reminderType==='race'&&Date.parse(r.race)>Date.now())uniq.set('Race|'+r.race,{name:'Race',iso:r.race,r});
    return [...uniq.values()];
  }
  const icsText=str=>String(str??'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  function foldLine(line){const encoder=new TextEncoder();const parts=[];let current='',n=0;for(const char of line){const amount=encoder.encode(char).length;if(n+amount>73){parts.push(current);current=' '+char;n=amount+1;}else{current+=char;n+=amount;}}parts.push(current);return parts.join('\r\n');}
  const utcDate=d=>new Date(d).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  function makeCalendar(scope='next'){
    if(typeof v5Verified!=='undefined'&&!v5Verified.races){toast('Update the real F1 calendar in Settings before exporting reminders');return null;}
    const selected=scope==='season'?upcoming():upcoming().slice(0,1);
    const items=selected.flatMap(remindersFor);
    if(!items.length){toast('No upcoming sessions available to export');return null;}
    const generated=utcDate(Date.now());
    const alert=Number(pref.reminderMinutes)||30;
    const events=items.map(({r,iso,name})=>{
      const start=Date.parse(iso),duration=/Race/i.test(name)?2*60*60*1000:60*60*1000;
      return ['BEGIN:VEVENT','UID:pitwall-'+YEAR+'-'+r.round+'-'+name.toLowerCase().replace(/[^a-z]/g,'')+'-'+start+'@pitwall.local','DTSTAMP:'+generated,'DTSTART:'+utcDate(start),'DTEND:'+utcDate(start+duration),'SUMMARY:'+icsText('PITWALL • '+r.name+' • '+name),'LOCATION:'+icsText((r.location||r.short||'')+' — Formula 1 circuit'),'DESCRIPTION:'+icsText('F1 session — check current start time with Formula 1. Adelaide local time: '+timeText(iso)+'.'),'BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:-PT'+alert+'M','DESCRIPTION:'+icsText('PITWALL: '+name+' begins soon'),'END:VALARM','END:VEVENT'].join('\r\n');
    });
    return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//PITWALL//F1 Calendar//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:PITWALL F1 reminders',...events,'END:VCALENDAR'].join('\r\n').split('\r\n').map(foldLine).join('\r\n')+'\r\n';
  }
  function downloadCalendar(scope){const value=makeCalendar(scope);if(!value)return;
    if(window.PitwallAndroid?.saveTextFile){window.PitwallAndroid.saveTextFile('pitwall-'+(scope==='season'?'season':'next-race')+'-reminders.ics','text/calendar',value);toast('Save the calendar file, then import it in your calendar app.');return;}
    const blob=new Blob([value],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download='pitwall-'+(scope==='season'?'season':'next-race')+'-reminders.ics';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
    toast('Calendar file created. Import it into your calendar to activate alerts.');
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-v54-toggle]');if(button){const k=button.dataset.v54Toggle;if(['race','driver','constructors'].includes(k)){pref[k]=!pref[k];persist();render();}return;}
    const ics=event.target.closest('[data-v54-ics]');if(ics){downloadCalendar(ics.dataset.v54Ics);return;}
    if(event.target.closest('[data-v54-goto-settings]')){nav('settings');return;}
    if(event.target.closest('[data-v54-goto-widgets]')){nav('home');setTimeout(()=>document.getElementById('v54-widgets')?.scrollIntoView({behavior:'smooth',block:'start'}),50);return;}
  });
  document.addEventListener('change',event=>{const sel=event.target.closest('[data-v54-field]');if(!sel)return;
    if(sel.dataset.v54Field==='reminderType'&&['race','key','all'].includes(sel.value))pref.reminderType=sel.value;
    if(sel.dataset.v54Field==='reminderMinutes'&&[15,30,60,120].includes(Number(sel.value)))pref.reminderMinutes=Number(sel.value);
    persist();
  });
  window.PITWALLV54={widgetCards,makeCalendar,remindersFor,getPreferences:()=>({...pref})};
  render();
})();
