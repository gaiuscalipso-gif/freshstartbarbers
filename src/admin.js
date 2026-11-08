import { supabase, bucket } from './supabase.js';
import { CATEGORIES, GALLERY_FILTERS } from './data.js';
import './admin.css';
import { showAds } from './ads.js';
const configs = {
 services: { label:'Services & prices', fields:{name:'Name',cat:CATEGORIES.filter(c=>c.id!=='all'),price:'Price (KSh)',mins:'Duration (minutes)',desc:'Description',tags:'Search tags',badge:'Badge (optional)',days:'Available weekdays (comma-separated 0–6; blank = all)',vip:'VIP service'} },
 staff: {label:'Barbers & massage staff',fields:{name:'Name',role:'Role (e.g. Barber or Massage Therapist)',img:'Photo URL',initials:'Initials',specialties:'Specialties (comma-separated)',note:'Biography'}},
 gallery: {label:'Gallery',fields:{title:'Title',cat:GALLERY_FILTERS.filter(c=>c.id!=='all'),src:'Image URL',detail:'Description',serviceId:'Related service ID (optional)'}}
};
function el(tag,text,props={}) {const e=document.createElement(tag);if(text)e.textContent=text;Object.assign(e,props);return e;}
function check(result) {if(result.error) throw result.error;return result.data;}
export function initAdmin() {
 const dialog=el('dialog',null,{className:'admin-dialog'});dialog.setAttribute('aria-label','Fresh Start administration');document.body.append(dialog);
 const header=el('header',null,{className:'admin-brandbar'});
 const brand=el('div',null,{className:'admin-brand'});brand.append(el('span','✂',{className:'admin-brand-icon'}));const wordmark=el('div');wordmark.append(el('small','FRESH START GROOMING LOUNGE'),el('h2','Behind the chair'));brand.append(wordmark);header.append(brand);
 const close=el('button','Close ✕',{type:'button',className:'admin-close'});close.onclick=()=>{if(canLeave())dialog.close();};header.append(close);dialog.append(header);
 const message=el('p',null,{className:'admin-message'});message.setAttribute('role','status');dialog.append(message);
 const body=el('div');dialog.append(body);
 let collection='dashboard';
 let dirty=false;
 function canLeave(){return (!dirty&&body.dataset.dirty!=='true')||confirm('You have unsaved changes. Discard them?');}
 dialog.addEventListener('cancel',e=>{if(!canLeave())e.preventDefault();});
 window.addEventListener('beforeunload',e=>{if(dirty||body.dataset.dirty==='true'){e.preventDefault();e.returnValue='';}});
 const run=async(fn)=>{message.textContent='Working…';dialog.setAttribute('aria-busy','true');try{await fn();message.textContent='';}catch(e){message.textContent=e.message || 'Something went wrong.';}finally{dialog.setAttribute('aria-busy','false');}};
 document.querySelector('#adminOpen').onclick=()=>{dialog.showModal();run(show);};
 async function show() {
  body.dataset.dirty='false';
  body.replaceChildren();
  const session=check(await supabase.auth.getSession())?.session;
  if(!session) return login();
  if(!check(await supabase.rpc('is_site_admin'))) {
   body.append(el('p','This account is not an administrator. Ask the project owner to grant access in Supabase.'));
   return logoutButton();
  }
  dirty=false;
 const toolbar=el('nav',null,{className:'admin-tabs',ariaLabel:'Admin sections'});
 const home=el('button','◈ Overview');home.classList.toggle('is-active',collection==='dashboard');home.onclick=()=>run(async()=>{collection='dashboard';await show();});toolbar.append(home);
  for(const [key,cfg] of Object.entries(configs)) {const b=el('button',cfg.label);b.classList.toggle('is-active',collection===key);b.onclick=()=>run(async()=>{collection=key;await show();});toolbar.append(b);}
  const media=el('button','Image library');media.onclick=()=>run(mediaLibrary);toolbar.append(media);
 const ads=el('button','↗ Google Ads');ads.onclick=()=>run(()=>showAds(body,run,async()=>{collection='dashboard';await show();}));toolbar.append(ads);body.append(toolbar);
  logoutButton();
  if(collection==='dashboard')return dashboard();
  body.append(el('h3',configs[collection].label));
  const add=el('button','+ Add new');add.onclick=()=>edit();body.append(add);
  const rows=check(await supabase.from('site_content').select('*').eq('collection',collection).order('sort_order'));
  const search=el('input',null,{type:'search',placeholder:'Search names, roles, categories…',className:'admin-search',ariaLabel:'Search records'});body.append(search);
  const list=el('div',null,{className:'admin-list'});
  if(!rows.length)list.append(el('p','A fresh canvas. Add your first record to get started.'));
  for(const row of rows){
   const item=el('div',null,{className:'admin-row'});
   const src=row.data.img||row.data.src;
   if(src&&/^(https:\/\/|\/img\/)/i.test(src))item.append(el('img',null,{src,alt:'',loading:'lazy'}));
   item.append(el('span',(row.data.name||row.data.title)+(collection==='services'?` · KSh ${row.data.price}`:'')));
   const editBtn=el('button','Edit');editBtn.onclick=()=>edit(row);
   const del=el('button','Delete');del.onclick=()=>{if(confirm('Delete this record? Its image stays in the library until you delete it there.'))run(async()=>{check(await supabase.from('site_content').delete().eq('collection',collection).eq('id',row.id));await show();});};
   del.className='admin-danger';
   const duplicate=el('button','Duplicate');duplicate.onclick=()=>edit({...row,id:null,data:{...row.data,name:row.data.name?row.data.name+' (copy)':undefined,title:row.data.title?row.data.title+' (copy)':undefined}});
   item.append(editBtn,duplicate,del);item.dataset.search=JSON.stringify(row.data).toLowerCase();list.append(item);
  }
  search.oninput=()=>{for(const item of list.children)if(item.dataset.search)item.hidden=!item.dataset.search.includes(search.value.toLowerCase());};
  body.append(list,el('p','Changes are saved immediately. Close this panel and reload the page to see the updated public site.'));
 }
 function logoutButton(){const b=el('button','Sign out',{className:'admin-signout'});b.onclick=()=>run(async()=>{check(await supabase.auth.signOut());await show();});body.append(b);}
 async function dashboard(){
  body.append(el('small','THE LOUNGE AT A GLANCE'),el('h3','A fresh start, every day.'),el('p','Keep the menu sharp, the team ready and your next campaign on point.'));
  const rows=check(await supabase.from('site_content').select('*'));
  const stats=el('div',null,{className:'admin-stats'});
  for(const [key,label] of [['services','Services on menu'],['staff','Team members'],['gallery','Gallery moments']]){
   const card=el('button',null,{className:'admin-stat'});card.append(el('small',label),el('strong',String(rows.filter(r=>r.collection===key).length)),el('span','Manage →'));card.onclick=()=>run(async()=>{collection=key;await show();});stats.append(card);
  }body.append(stats);
  const actions=el('div',null,{className:'admin-quick-actions'});
  for(const [key,label] of [['services','✂ Add a service'],['staff','♙ Add a team member'],['gallery','▧ Add a gallery moment']]){const b=el('button',label);b.onclick=()=>{collection=key;edit();};actions.append(b);}body.append(el('h4','Quick cuts'),actions);
  const backup=el('button','↓ Download content backup (.json)');backup.onclick=()=>{const a=el('a',null,{href:URL.createObjectURL(new Blob([JSON.stringify({exported_at:new Date().toISOString(),content:rows},null,2)],{type:'application/json'})),download:'fresh-start-content-backup.json'});a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};body.append(backup);
  const activity=el('div',null,{className:'admin-campaign'});activity.append(el('h4','Recently refined'));
  const recent=[...rows].sort((a,b)=>b.updated_at.localeCompare(a.updated_at)).slice(0,5);
  for(const r of recent)activity.append(el('p',`${r.data.name||r.data.title} · ${new Date(r.updated_at).toLocaleDateString('en-KE')}`));
  if(!recent.length)activity.append(el('p','Your latest content updates will appear here.'));body.append(activity);
  const reload=el('button','↻ Reload public website');reload.onclick=()=>location.reload();body.append(reload,el('p','Content changes appear on the public website after reload. Campaign records are private to administrators.'));
 }
 function login(){
  body.append(el('p','Sign in with an administrator email and password. No public signup or automatic admin access.'));
  body.append(el('div','✂',{className:'admin-login-emblem'}),el('h3','Your lounge. Your controls.'));
  const form=el('form',null,{className:'admin-login-form'});const email=el('input',null,{type:'email',placeholder:'Admin email',required:true,autocomplete:'username'});
  const password=el('input',null,{type:'password',placeholder:'Password',required:true,autocomplete:'current-password'});
  const toggle=el('button','Show password',{type:'button',className:'admin-subtle'});toggle.onclick=()=>{password.type=password.type==='password'?'text':'password';toggle.textContent=password.type==='password'?'Show password':'Hide password';};
  form.append(el('label','Email'),email,el('label','Password'),password,toggle,el('button','Unlock the lounge →',{type:'submit'}));
  form.onsubmit=e=>{e.preventDefault();run(async()=>{check(await supabase.auth.signInWithPassword({email:email.value,password:password.value}));await show();});};body.append(form);
 }
 function edit(row){
  dirty=false;
  body.replaceChildren(el('h3',row?'Edit record':'Add record'));
  const form=el('form',null,{className:'admin-edit-form'});form.addEventListener('input',()=>dirty=true);const inputs={};const original=row?.data||{};
  for(const [key,label] of Object.entries(configs[collection].fields)){
   const wrapper=el('label',Array.isArray(label)?'Category':label);
   let input;
   if(Array.isArray(label)) {input=el('select');for(const opt of label)input.append(el('option',opt.label,{value:opt.id}));}
   else input=el(['desc','detail','note'].includes(key)?'textarea':'input');
   if(['price','mins'].includes(key)){input.type='number';input.min=key==='price'?'0':'1';input.step='1';input.required=true;}
   if(key==='vip')input.type='checkbox';
   if(['name','title'].includes(key))input.required=true;
   if(key==='vip')input.checked=!!original[key];
   else input.value=Array.isArray(original[key])?original[key].join(', '):original[key]??(key==='mins'?30:key==='price'?0:'');
   inputs[key]=input;wrapper.append(input);form.append(wrapper);
  }
  const sort=el('input',null,{type:'number',value:row?.sort_order??100});const sortLabel=el('label','Display order');sortLabel.append(sort);form.append(sortLabel);
  const imageField=inputs.img||inputs.src;
  if(imageField){const preview=el('img',null,{className:'admin-image-preview',alt:'Image preview'});const refresh=()=>{const url=imageField.value;preview.hidden=!/^(https:\/\/|\/img\/)/i.test(url);if(!preview.hidden)preview.src=url;};imageField.addEventListener('input',refresh);imageField.addEventListener('change',refresh);refresh();form.append(preview);}
  if(imageField){
   const upload=el('input',null,{type:'file',accept:'image/jpeg,image/png,image/webp,image/avif'});
   const label=el('label','Upload replacement image (max 5 MB)');label.append(upload);form.append(label);
   upload.onchange=()=>run(async()=>{
    const f=upload.files[0];if(!f)return;
    if(f.size>5242880)throw Error('Image must be at most 5 MB.');
    const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif'}[f.type];if(!ext)throw Error('Choose JPEG, PNG, WebP or AVIF.');
    const path=`uploads/${crypto.randomUUID()}.${ext}`;
    check(await supabase.storage.from(bucket).upload(path,f,{contentType:f.type,upsert:false}));
    imageField.value=supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;imageField.dispatchEvent(new Event('change'));dirty=true;
   });
   form.append(el('p','Save this record to apply the uploaded image. The old image is kept safely; delete unused images in Image library.'));
  }
  const save=el('button','Save changes',{type:'submit'});const back=el('button','Back',{type:'button'});back.onclick=()=>{if(canLeave())run(show);};form.append(save,back);
  form.onsubmit=e=>{e.preventDefault();run(async()=>{
   save.disabled=true;
   try{
    const data={...original};
    for(const [k,input] of Object.entries(inputs))data[k]=k==='vip'?input.checked:['price','mins'].includes(k)?Number(input.value):['specialties','days'].includes(k)?input.value.split(',').map(v=>v.trim()).filter(Boolean).map(v=>k==='days'?Number(v):v):input.value.trim();
    if(data.days?.some(v=>!Number.isInteger(v)||v<0||v>6))throw Error('Weekdays must be integers from 0 to 6.');
    if(data.days?.length===0)delete data.days;
    if(imageField?.value && !/^(https:\/\/|\/img\/)/i.test(imageField.value))throw Error('Use an HTTPS image URL or /img/ path.');
    const id=row?.id||crypto.randomUUID();
    if(collection!=='gallery')data.id=id;
    if(collection==='gallery')data.catLabel=GALLERY_FILTERS.find(c=>c.id===data.cat)?.label||'';
    if(collection==='staff'&&!data.img)data.img=null;
    Object.keys(data).forEach(k=>{if(data[k]===undefined)delete data[k];});
    check(await supabase.from('site_content').upsert({collection,id,data,sort_order:Number(sort.value),updated_at:new Date().toISOString()}));dirty=false;await show();
   }finally{save.disabled=false;}
  });};body.append(form);
 }
 async function mediaLibrary(){
  body.replaceChildren(el('h3','Uploaded image library'));
  body.append(el('p','Delete old, unused uploads here. Images still linked to a service, staff member or gallery record cannot be deleted. Original /img/ website assets are not stored in Supabase.'));
  const back=el('button','Back');back.onclick=()=>run(show);body.append(back);
  const records=check(await supabase.from('site_content').select('data'));
  // Paginate to avoid silently overlooking old images.
  let offset=0;const files=[];
  while(true){const batch=check(await supabase.storage.from(bucket).list('uploads',{limit:100,offset,sortBy:{column:'created_at',order:'desc'}}));files.push(...batch);if(batch.length<100)break;offset+=100;}
  for(const f of files){
   const path=`uploads/${f.name}`;const url=supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
   const used=records.some(r=>Object.values(r.data).includes(url));
   const item=el('div',null,{className:'admin-row'});item.append(el('img',null,{src:url,alt:'Uploaded image',loading:'lazy'}),el('span',`${f.created_at?.slice(0,10)||''} · ${used?'In use':'Unused'}`));
   const del=el('button','Delete image',{disabled:used});del.onclick=()=>{if(confirm('Permanently delete this unused image?'))run(async()=>{
    const current=check(await supabase.from('site_content').select('data'));
    if(current.some(r=>Object.values(r.data).includes(url)))throw Error('This image is now in use. Refresh the library.');
    check(await supabase.storage.from(bucket).remove([path]));await mediaLibrary();
   });};item.append(del);body.append(item);
  }
 }
}
