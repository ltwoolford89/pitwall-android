/* PITWALL V5 — connected & offline-capable. Preserves V4.4 career and UI. */
'use strict';
const V5_KEY='pitwall-v5-snapshot';
const V5_WEATHER_KEY='pitwall-v5-weather';
const V5_PREF_KEY='pitwall-v5-options';
let v5Options={autoRefresh:true};
try{v5Options={...v5Options,...JSON.parse(localStorage.getItem(V5_PREF_KEY)||'{}')};}catch(e){}
let v5Source='demo',v5LastGood=null,v5Refreshing=false,v5RefreshMessage='';
let v5Verified={drivers:false,constructors:false,races:false,results:false};
const v5Clock=time=>time?new Intl.DateTimeFormat('en-AU',{timeZone:TZ,day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}).format(new Date(time))+' Adelaide':'never';
const v5Online=()=>navigator.onLine!==false;
const v5ValidRows=(a,k)=>Array.isArray(a)&&a.length>0&&a.every(x=>x&&typeof x==='object'&&typeof x[k]==='string');
function v5ReadSnapshot(){
 try{const s=JSON.parse(localStorage.getItem(V5_KEY)||'null');if(!s||s.schema!==5)return false;
  v5Verified={...v5Verified,...(s.verified||{})};
  if(v5Verified.drivers&&v5ValidRows(s.drivers,'last'))data.drivers=s.drivers;
  if(v5Verified.constructors&&v5ValidRows(s.constructors,'team'))data.constructors=s.constructors;
  if(v5Verified.races&&v5ValidRows(s.races,'race')&&s.races.length>=15)data.races=s.races;
  if(v5Verified.results&&Array.isArray(s.podiums))data.podiums=s.podiums;
  v5LastGood=s.updatedAt||null;v5Source=v5LastGood?'cache':'demo';
  data.online=false;data.lastUpdated='Cached data · '+v5Clock(v5LastGood);
  return Boolean(v5LastGood);
 }catch(e){return false;}
}
// The bundled V4.4 fallback contains illustrative values. Never pass it off as a saved result.
data.podiums=[];
v5ReadSnapshot();
function v5SaveSnapshot(){
 try{const value={schema:5,updatedAt:Date.now(),verified:v5Verified,drivers:v5Verified.drivers?data.drivers:[],constructors:v5Verified.constructors?data.constructors:[],races:v5Verified.races?data.races:[],podiums:v5Verified.results?data.podiums:[]};
  localStorage.setItem(V5_KEY,JSON.stringify(value));v5LastGood=value.updatedAt;v5Source='network';return true;
 }catch(e){v5RefreshMessage='Storage is full — results will not stay offline';return false;}
}
function v5StatusHTML(){
 const offline=!v5Online(),busy=v5Refreshing;
 const partial=!(v5Verified.drivers&&v5Verified.constructors);
 const label=offline?'OFFLINE':busy?'UPDATING':v5Source==='network'?(partial?'PARTIAL DATA':'ONLINE DATA'):v5Source==='cache'?(partial?'PARTIAL CACHE':'CACHED DATA'):'DEMO DATA';
 const dot=offline?'#fcb57e':busy?'#7abef8':v5Source==='network'?'#8bdfa7':'#fcb57e';
 return `<span class="v5-state-dot" style="background:${dot}"></span>${label}`;
}
function v5Banner(){
 const text=v5Source==='demo'?'Illustrative standings until the first successful sync. Do not treat these as real results.':
   (!v5Verified.drivers||!v5Verified.constructors)?'Some standings are illustrative because the results feed has not loaded. Check again online. ': 
   (!v5Online()?'Showing the last downloaded race data. ':v5Source==='cache'?'Showing saved race data while connecting. ':'Race data downloaded. ')+`Last successful update: ${v5Clock(v5LastGood)}.`;
 return `<aside class="v5-connect" aria-label="F1 connection and data age"><div class="v5-connect-text"><strong>${v5StatusHTML()}</strong><span>${safe(text)}</span></div><button type="button" class="v5-mini-refresh" data-v5-refresh ${v5Refreshing?'disabled':''} aria-label="Refresh race data">↻</button></aside>`;
}
const v5OldHome=home;
home=function(){return v5OldHome().replace('<section class="main-tab v4-home">','<section class="main-tab v4-home">'+v5Banner());};
const v5OldSettings=v3SettingsPage;
v3SettingsPage=function(){
 let html=v5OldSettings();
 const extra=`<div class="settings-group-title">CONNECTIVITY & OFFLINE</div>
 <div class="settings-group">
   <div class="settings-row"><span class="settings-ico">◉</span><span class="settings-label">F1 data status</span><span class="tiny v5-setting-status">${v5Online()?'Connected device':'Device offline'}</span></div>
   <div class="settings-row"><span class="settings-ico">↻</span><span class="settings-label">Automatic updates</span><button type="button" role="switch" aria-checked="${v5Options.autoRefresh}" class="switch ${v5Options.autoRefresh?'on':''}" data-v5-autorefresh><span></span></button></div>
   <div class="settings-row"><span class="settings-ico">☁</span><span class="settings-label">Last successful sync</span><span class="tiny">${safe(v5Clock(v5LastGood))}</span></div>
   <div class="settings-row"><span class="settings-ico">↓</span><span class="settings-label">Update standings & calendar</span><button class="v5-settings-action" data-v5-refresh ${v5Refreshing?'disabled':''}>${v5Refreshing?'Updating…':'Refresh now ↻'}</button></div>
 </div><p class="settings-hint">Race results, session times and weather need internet to update. Downloaded standings, race details, weather and your career can be opened offline. API availability varies.</p>
 <div class="settings-group-title">YOUR SAVE & INSTALLATION</div><div class="settings-group">
  <div class="settings-row"><span class="settings-ico">↥</span><span class="settings-label">Back up career & settings</span><button class="v5-settings-action" data-v5-export>Export save ↗</button></div>
  <div class="settings-row"><span class="settings-ico">↧</span><span class="settings-label">Restore an exported save</span><button class="v5-settings-action" data-v5-import>Import save ↗</button></div>
  <div class="settings-row"><span class="settings-ico">▣</span><span class="settings-label">Install PITWALL on iPhone</span><button class="v5-settings-action" data-v5-install>Instructions ↗</button></div>
 </div><p class="settings-hint">Your save is stored on this device. Exporting it helps protect your career if you clear website data or switch phones. Installed web apps are not App Store native apps; actual Home Screen widgets still require a native iOS version.</p>`;
 html=html.replace('<div class="settings-group-title">ABOUT</div>',extra+'<div class="settings-group-title">ABOUT</div>');
 return html.replace(/Version 4\.4 · Independent fan app/g,'Version 5 · Independent fan app');
};
const v5OldRender=render;
render=function(){v5OldRender();const status=document.querySelector('#dataStatus');if(status)status.innerHTML=v5StatusHTML();
 const tag=document.querySelector('.v41-version');if(tag)tag.textContent='V5';};
function v5NotifyResult(message){v5RefreshMessage=message;const status=document.querySelector('#dataStatus');if(status)status.innerHTML=v5StatusHTML();}
function v5BuildCalendar(rows){
 const old=data.races.slice();const result=[];
 for(const r of rows){if(!/^\d{4}-\d\d-\d\d$/.test(r.date||'')||!r.time||!/Z$/.test(r.time))continue;
  const iso=r.date+'T'+r.time;
  const prior=old.find(x=>x.name===r.raceName||x.location?.toLowerCase()===r.Circuit?.Location?.locality?.toLowerCase()||Math.abs(new Date(x.race).getTime()-Date.parse(iso))<86400000);
  const sessions=[];
  for(const [code,name] of [['FirstPractice','Practice 1'],['SecondPractice','Practice 2'],['ThirdPractice','Practice 3'],['SprintQualifying','Sprint Qualifying'],['Sprint','Sprint'],['Qualifying','Qualifying']])if(r[code]?.date&&r[code]?.time)sessions.push({name,dateStart:r[code].date+'T'+r[code].time});
  sessions.push({name:'Race',dateStart:iso});
  result.push({round:Number(r.round),name:r.raceName,short:prior?.short||r.Circuit?.Location?.country||r.raceName.replace(/ Grand Prix/,'').trim(),location:r.Circuit?.Location?.locality||prior?.location||'',race:iso,profile:prior?.profile||'balanced',sessions,sprint:!!(r.Sprint||r.SprintQualifying),slug:prior?.slug||String(r.raceName).toLowerCase().replace(/ grand prix$/,'').replace(/[^a-z0-9]+/g,'-')});
 }
 return result.length>=15?result:null;
}
async function v5Refresh(force=false){
 if(v5Refreshing)return;
 if(!v5Online()){v5NotifyResult('Offline — saved data is still available');render();if(force)toast('You are offline. Showing cached data.');return;}
 v5Refreshing=true;v5NotifyResult('Updating…');render();let updates=0,failures=0;
 const requests=await Promise.allSettled([
  fetchJson(API+YEAR+'/driverstandings.json',12000),fetchJson(API+YEAR+'/constructorstandings.json',12000),
  fetchJson(API+YEAR+'.json?limit=100',12000),fetchJson(API+YEAR+'/results.json?limit=2000',12000)
 ]);
 const get=(i)=>requests[i].status==='fulfilled'?requests[i].value:null;
 const drivers=get(0)?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
 if(Array.isArray(drivers)&&drivers.length>=8){data.drivers=drivers.map(x=>({position:+x.position,first:x.Driver.givenName,last:x.Driver.familyName,code:x.Driver.code||x.Driver.driverId?.toUpperCase().slice(0,3)||'???',team:x.Constructors?.at(-1)?.name||'Unknown',points:+x.points,wins:+x.wins}));v5Verified.drivers=true;updates++;}else failures++;
 const constructors=get(1)?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;
 if(Array.isArray(constructors)&&constructors.length>=5){data.constructors=constructors.map(x=>({position:+x.position,team:x.Constructor.name,points:+x.points}));v5Verified.constructors=true;updates++;}else failures++;
 const races=get(2)?.MRData?.RaceTable?.Races;
 if(Array.isArray(races)){const revised=v5BuildCalendar(races);if(revised){data.races=revised;v5Verified.races=true;updates++;}else failures++;}else failures++;
 const raceResults=get(3)?.MRData?.RaceTable?.Races;
 if(Array.isArray(raceResults)){
  const podiums=[];for(const r of raceResults){const three=(r.Results||[]).filter(x=>Number(x.position)<=3).sort((a,b)=>Number(a.position)-Number(b.position)).map(x=>x.Driver.code||x.Driver.driverId?.toUpperCase().slice(0,3));if(three.length===3)podiums[Number(r.round)-1]=three;}
  data.podiums=podiums;v5Verified.results=true;updates++;
 }else failures++;
 if(updates){data.online=true;data.lastUpdated='Results feed · '+v5Clock(Date.now());v5SaveSnapshot();}
 else{v5Source=v5LastGood?'cache':'demo';data.online=false;data.lastUpdated=(v5LastGood?'Saved download · '+v5Clock(v5LastGood):'Illustrative demo · no verified download');}
 v5Refreshing=false;v5NotifyResult(updates?`Updated ${updates} of 4 sources${failures?' · '+failures+' unavailable':''}`:'Data services unavailable');render();
 if(updates&&typeof refreshSessions==='function'&&v5Online())refreshSessions().then(()=>v5Persist());
 if(typeof v3LoadOfficialMaps==='function'&&updates)v3LoadOfficialMaps().catch(()=>{});
 if(force)toast(v5RefreshMessage);
}
function v5Persist(){if(v5LastGood){try{const old=JSON.parse(localStorage.getItem(V5_KEY)||'{}');if(old.schema===5){old.races=data.races;localStorage.setItem(V5_KEY,JSON.stringify(old));}}catch(e){}}}
// Restore historical weather and forecast downloads for the same race (not fictitious forecasts).
function v5LoadWeather(){try{const saved=JSON.parse(localStorage.getItem(V5_WEATHER_KEY)||'{}');for(const [k,entry] of Object.entries(saved.forecast||{}))if(entry?.forecast&&Array.isArray(entry.forecast.hourly?.time))v42ForecastCache.set(k,entry);for(const [k,entry] of Object.entries(saved.archive||{}))if(entry?.archive&&Array.isArray(entry.archive.hourly?.time))v43WeatherArchive.set(k,entry);}catch(e){}}
function v5SaveWeather(){try{const sorted=map=>[...map.entries()].filter(([,entry])=>entry?.forecast||entry?.archive).sort((a,b)=>(b[1].time||0)-(a[1].time||0)).slice(0,10);
 localStorage.setItem(V5_WEATHER_KEY,JSON.stringify({forecast:Object.fromEntries(sorted(v42ForecastCache)),archive:Object.fromEntries(sorted(v43WeatherArchive))}));}catch(e){/* local storage quota exceeded */}}
v5LoadWeather();
const v5OldForecast=v42LoadForecast;
v42LoadForecast=async function(...args){await v5OldForecast(...args);v5SaveWeather();};
const v5OldArchive=v43LoadArchive;
v43LoadArchive=async function(...args){await v5OldArchive(...args);v5SaveWeather();};
// A backup is a readable JSON file. Only PITWALL storage keys are ever imported.
const V5_BACKUP_KEYS=['pitwall-career-v1','pitwall-career-v2','pitwall-v3-prefs','pitwall-v4-prefs','pitwall-v5-options','pitwall-v5-snapshot','pitwall-v5-weather','pitwall-v4_4-driver-cache'];
function v5ExportSave(){const storage={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('pitwall-'))storage[k]=localStorage.getItem(k);}
 const backupText=JSON.stringify({app:'PITWALL',version:5,exportedAt:new Date().toISOString(),storage},null,2);
 if(window.PitwallAndroid?.saveTextFile){window.PitwallAndroid.saveTextFile('pitwall-career-backup-'+new Date().toISOString().slice(0,10)+'.json','application/json',backupText);return;}
 const blob=new Blob([backupText],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='pitwall-career-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),8000);toast('Backup file created');}
async function v5ImportSave(file){if(!file)return;if(file.size>5_000_000){toast('That file is too large');return;}
 try{const backup=JSON.parse(await file.text());if(backup?.app!=='PITWALL'||!backup.storage||typeof backup.storage!=='object')throw Error('Not a PITWALL backup');
 if(!('pitwall-career-v2' in backup.storage)&&!('pitwall-career-v1' in backup.storage))throw Error('No career save in this file');
 if(!confirm('Replace your current PITWALL save and settings with the imported backup?'))return;
 for(const [key,value] of Object.entries(backup.storage))if(key.startsWith('pitwall-')&&typeof value==='string'&&value.length<1500000)localStorage.setItem(key,value);
 location.reload();
 }catch(e){toast('Import failed: '+e.message);}}
function v5ShowInstall(){document.querySelector('.v5-install-shade')?.remove();const shade=document.createElement('div');shade.className='v5-install-shade';shade.innerHTML=`<section class="v5-install-modal" role="dialog" aria-modal="true" aria-label="Install PITWALL"><button class="v5-modal-close" data-v5-close aria-label="Close">×</button><div class="micro">PITWALL V5 · iPHONE</div><h2>Add PITWALL to Home Screen</h2><ol><li>Publish the included files on a secure <b>HTTPS</b> website such as GitHub Pages.</li><li>Open that website using <b>Safari</b> on your iPhone.</li><li>Tap <b>Share → Add to Home Screen</b>.</li><li>Turn on <b>Open as Web App</b> and tap <b>Add</b>.</li></ol><p class="sub">Launch once while online to download the app files and standings. Afterwards it can open offline. Real iOS widgets and App Store installation require a separate native iOS build.</p><button class="btn primary wide" data-v5-close>GOT IT</button></section>`;document.body.appendChild(shade);shade.querySelector('.v5-modal-close').focus();}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-v5-refresh]')){v5Refresh(true);return;}
 if(e.target.closest('[data-v5-autorefresh]')){v5Options.autoRefresh=!v5Options.autoRefresh;localStorage.setItem(V5_PREF_KEY,JSON.stringify(v5Options));render();toast(v5Options.autoRefresh?'Automatic updates on':'Automatic updates off');return;}
 if(e.target.closest('[data-v5-export]')){v5ExportSave();return;}
 if(e.target.closest('[data-v5-import]')){let input=document.getElementById('v5-import-file');if(!input){input=document.createElement('input');input.id='v5-import-file';input.type='file';input.accept='.json,application/json';input.hidden=true;document.body.append(input);input.addEventListener('change',()=>{v5ImportSave(input.files?.[0]);input.value='';});}input.click();return;}
 if(e.target.closest('[data-v5-install]')){v5ShowInstall();return;}
 if(e.target.closest('[data-v5-close]')||e.target.classList?.contains('v5-install-shade'))document.querySelector('.v5-install-shade')?.remove();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelector('.v5-install-shade')?.remove();});
window.addEventListener('online',()=>{render();if(v5Options.autoRefresh)v5Refresh();});
window.addEventListener('offline',()=>{data.online=false;v5Source=v5LastGood?'cache':'demo';render();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&v5Options.autoRefresh&&(!v5LastGood||Date.now()-v5LastGood>15*60*1000))v5Refresh();});
setInterval(()=>{if(v5Options.autoRefresh&&!document.hidden&&v5Online()&&(!v5LastGood||Date.now()-v5LastGood>15*60*1000))v5Refresh();},15*60*1000);
document.title='PITWALL V5 — F1 Race Companion';
render();
// The prior app performs an initial load; V5 also refreshes using its verified, persistable pipeline.
setTimeout(()=>{if(v5Online())v5Refresh();else render();},350);
