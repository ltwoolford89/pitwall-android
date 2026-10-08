/* PITWALL V5.3.1: presentation-only enhancements. Retains data, settings and save formats. */
'use strict';
(function(){
  const oldRender=render;
  function updateDesign(){
    document.title='PITWALL V5.3.1 — Race Companion';
    const badge=document.querySelector('.v41-version');if(badge)badge.textContent='V5.3.1';
    document.querySelectorAll('.v521-settings-version').forEach(n=>{n.textContent='✓ V5.3.1';n.setAttribute('aria-label','App version 5.3');});
    document.querySelectorAll('.settings-row .settings-label').forEach(n=>{if(n.textContent.trim()==='Version 5.2.1')n.textContent='Version 5.3';});
    document.querySelectorAll('.settings-group').forEach(n=>{if(n.textContent.includes('Version 5.2.1')){const w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);while(w.nextNode())if(w.currentNode.nodeValue.includes('Version 5.2.1'))w.currentNode.nodeValue=w.currentNode.nodeValue.replaceAll('Version 5.2.1','Version 5.3');}});
    // A little circuit diagram on each calendar race card, drawn from the game's
    // existing geometry; no extra map/network request and only one expanded map.
    document.querySelectorAll('.racecard>button[data-race]').forEach(btn=>{
      if(btn.querySelector('.v53-track-thumb'))return;
      const id=Number(btn.dataset.race);const r=data.races.find(x=>x.round===id);
      if(!r||typeof v41CircuitSvg!=='function')return;
      const span=document.createElement('span');span.className='v53-track-thumb';span.setAttribute('aria-hidden','true');
      span.innerHTML=v41CircuitSvg(r,'v53-thumb-svg');btn.appendChild(span);
    });
    const hero=document.querySelector('.main-tab>.hero .eyebrow');
    if(hero&&hero.textContent.includes('Version 3'))hero.textContent='PITWALL CAREER • BUILD YOUR LEGACY';
    document.querySelectorAll('.main-tab .micro').forEach(n=>{if(n.textContent.includes('CAREER SIMULATOR')&&n.textContent.includes('VERSION 3'))n.textContent=n.textContent.replace('VERSION 3','SEASON MODE');});
  }
  render=function(...args){const out=oldRender(...args);updateDesign();return out;};
  updateDesign();
})();
