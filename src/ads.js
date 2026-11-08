import { supabase } from './supabase.js';
const el=(tag,text,props={})=>{const e=document.createElement(tag);if(text)e.textContent=text;Object.assign(e,props);return e;};
const check=r=>{if(r.error)throw r.error;return r.data;};
const cash=n=>`KSh ${Number(n).toLocaleString('en-KE',{maximumFractionDigits:2})}`;
export async function showAds(body,run,back){
 body.dataset.dirty='false';
 body.replaceChildren();
 const hero=el('div',null,{className:'admin-section-head'});hero.append(el('small','MARKETING WORKBENCH'),el('h3','Google Ads planner'),el('p','Plan the next full house. Budgets and results are entered manually—not synced with Google.'));body.append(hero);
 const toolbar=el('div',null,{className:'admin-actions'});
 const b=el('button','← Dashboard');b.onclick=()=>run(back);
 const add=el('button','+ Plan campaign');add.onclick=()=>edit();
 toolbar.append(b,add);body.append(toolbar);
 let rows;
 try{rows=check(await supabase.from('ad_campaigns').select('*').order('updated_at',{ascending:false}));}
 catch(e){if(e.code==='PGRST205'||e.code==='42P01')throw Error('Run supabase/admin-upgrade.sql in the Supabase SQL Editor to enable the private campaign planner.');throw e;}
 const stats=el('div',null,{className:'admin-stats'});
 const totals=rows.reduce((a,r)=>({budget:a.budget+Number(r.budget),spend:a.spend+Number(r.spend),clicks:a.clicks+r.clicks,conversions:a.conversions+r.conversions}),{budget:0,spend:0,clicks:0,conversions:0});
 for(const [name,value] of [['Planned budget',cash(totals.budget)],['Recorded spend',cash(totals.spend)],['Clicks',totals.clicks],['Conversions',totals.conversions]]){const c=el('div');c.append(el('small',name),el('strong',String(value)));stats.append(c);}body.append(stats);
 const filters=el('div',null,{className:'admin-actions'});const search=el('input',null,{type:'search',placeholder:'Search campaigns…','ariaLabel':'Search campaigns'});const status=el('select',null,{ariaLabel:'Filter status'});
 for(const s of ['all','draft','planned','active','paused','completed'])status.append(el('option',s,{value:s}));filters.append(search,status);body.append(filters);
 const list=el('div',null,{className:'admin-list'});body.append(list);
 const render=()=>{
 list.replaceChildren();const visible=rows.filter(r=>r.name.toLowerCase().includes(search.value.toLowerCase())&&(status.value==='all'||r.status===status.value));
 if(!visible.length)list.append(el('p','No campaigns yet. Plan an offer, set your budget, and track what brings people through the door.'));
 for(const r of visible){
  const item=el('article',null,{className:'admin-campaign'});const top=el('div',null,{className:'admin-actions'});top.append(el('h4',r.name),el('span',r.status,{className:`admin-badge status-${r.status}`}));item.append(top);
  item.append(el('p',`${r.starts_on||'No start date'} → ${r.ends_on||'Open-ended'} · Budget ${cash(r.budget)} · Spend ${cash(r.spend)}`));
  item.append(el('p',`${r.clicks} clicks · ${r.conversions} conversions · CPC ${r.clicks?cash(r.spend/r.clicks):'—'} · Cost / conversion ${r.conversions?cash(r.spend/r.conversions):'—'}`));
  if(Number(r.spend)>Number(r.budget))item.append(el('p','Over planned budget',{className:'admin-warning'}));
  const progress=el('progress',null,{max:Math.max(Number(r.budget),1),value:Number(r.spend)});progress.setAttribute('aria-label','Recorded spend against planned budget');item.append(progress);
  const actions=el('div',null,{className:'admin-actions'});const editBtn=el('button','Edit / log results');editBtn.onclick=()=>edit(r);actions.append(editBtn);
  if(/^https:\/\/([a-z0-9-]+\.)*google\.com(\/|$)/i.test(r.campaign_url))actions.append(el('a','Campaign ↗',{href:r.campaign_url,target:'_blank',rel:'noopener noreferrer',className:'admin-link'}));
  const del=el('button','Delete',{className:'admin-danger'});del.onclick=()=>{if(confirm(`Delete campaign “${r.name}” from the planner? This does NOT delete anything on Google.`))run(async()=>{check(await supabase.from('ad_campaigns').delete().eq('id',r.id));await showAds(body,run,back);});};actions.append(del);item.append(actions);list.append(item);
 }
 };search.oninput=render;status.onchange=render;render();
 const csv=el('button','↓ Export campaign report (.csv)');csv.onclick=()=>{
  const keys=['name','status','budget','spend','clicks','conversions','starts_on','ends_on','campaign_url','landing_url','notes'];
  const cell=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
  const blob=new Blob(['\uFEFF'+[keys,...rows.map(r=>keys.map(k=>r[k]))].map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv'});
  const a=el('a',null,{href:URL.createObjectURL(blob),download:'fresh-start-google-ads.csv'});a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 };body.append(csv);
 function edit(row={}){
  body.replaceChildren(el('small','GOOGLE ADS · MANUAL PLANNER'),el('h3',row.id?'Refine your campaign':'Plan a fresh campaign'));
  const form=el('form',null,{className:'admin-edit-form'});const inputs={};let dirty=false;
  const fields={name:'Campaign name',status:'Planner status',budget:'Total planned budget (KSh)',spend:'Actual spend to date (KSh)',clicks:'Recorded clicks',conversions:'Recorded conversions',starts_on:'Start date',ends_on:'End date',campaign_url:'Google Ads campaign URL',landing_url:'Landing page URL',notes:'Offer, audience, keywords & notes'};
  for(const [key,label] of Object.entries(fields)){
   const l=el('label',label);const i=el(key==='notes'?'textarea':key==='status'?'select':'input');
   if(key==='status')for(const s of ['draft','planned','active','paused','completed'])i.append(el('option',s,{value:s}));
   if(['budget','spend','clicks','conversions'].includes(key)){i.type='number';i.min='0';i.step=['clicks','conversions'].includes(key)?'1':'0.01';}
   if(key.endsWith('_on'))i.type='date';if(key.endsWith('_url'))i.type='url';if(key==='name')i.required=true;
   i.value=row[key]??(['budget','spend','clicks','conversions'].includes(key)?0:key==='status'?'draft':'');i.oninput=()=>{dirty=true;body.dataset.dirty='true';};l.append(i);form.append(l);inputs[key]=i;
  }
  const save=el('button','Save campaign',{type:'submit'}),cancel=el('button','Cancel',{type:'button'});
  cancel.onclick=()=>{if(!dirty||confirm('Discard unsaved campaign changes?'))run(()=>showAds(body,run,back));};form.append(save,cancel);
  form.onsubmit=e=>{e.preventDefault();run(async()=>{
   const data=Object.fromEntries(Object.entries(inputs).map(([k,i])=>[k,['budget','spend','clicks','conversions'].includes(k)?Number(i.value):k.endsWith('_on')?(i.value||null):i.value.trim()]));
   if(data.ends_on&&data.starts_on&&data.ends_on<data.starts_on)throw Error('End date cannot be before start date.');
   if(data.campaign_url&&!/^https:\/\/([a-z0-9-]+\.)*google\.com(\/|$)/i.test(data.campaign_url))throw Error('Use an HTTPS google.com campaign link.');
   if(data.landing_url&&!/^https:\/\//i.test(data.landing_url))throw Error('Landing page must use HTTPS.');
   save.disabled=true;try{check(await supabase.from('ad_campaigns').upsert({...data,id:row.id||crypto.randomUUID(),updated_at:new Date().toISOString()}));dirty=false;body.dataset.dirty='false';await showAds(body,run,back);}finally{save.disabled=false;}
  });};body.append(el('p','Saving here does not publish, pause or change a Google Ads campaign. Launch and manage delivery in Google Ads.'),form);
 }
}
