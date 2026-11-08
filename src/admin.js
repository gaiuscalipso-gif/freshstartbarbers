import { supabase, bucket } from './supabase.js';
import { CATEGORIES, GALLERY_FILTERS } from './data.js';
import './admin.css';
const configs = {
 services: { label:'Services & prices', fields:{name:'Name',cat:CATEGORIES.filter(c=>c.id!=='all'),price:'Price (KSh)',mins:'Duration (minutes)',desc:'Description',tags:'Search tags',badge:'Badge (optional)',days:'Available weekdays (comma-separated 0–6; blank = all)',vip:'VIP service'} },
 staff: {label:'Barbers & massage staff',fields:{name:'Name',role:'Role (e.g. Barber or Massage Therapist)',img:'Photo URL',initials:'Initials',specialties:'Specialties (comma-separated)',note:'Biography'}},
 gallery: {label:'Gallery',fields:{title:'Title',cat:GALLERY_FILTERS.filter(c=>c.id!=='all'),src:'Image URL',detail:'Description',serviceId:'Related service ID (optional)'}}
};
function el(tag,text,props={}) {const e=document.createElement(tag);if(text)e.textContent=text;Object.assign(e,props);return e;}
function check(result) {if(result.error) throw result.error;return result.data;}
export function initAdmin() {
 const dialog=el('dialog',null,{className:'admin-dialog'});document.body.append(dialog);
 const header=el('header');header.append(el('h2','Fresh Start · Admin'));
 const close=el('button','Close',{type:'button'});close.onclick=()=>dialog.close();header.append(close);dialog.append(header);
 const message=el('p',null,{className:'admin-message'});message.setAttribute('role','status');dialog.append(message);
 const body=el('div');dialog.append(body);
 let collection='services';
 const run=async(fn)=>{message.textContent='Working…';try{await fn();message.textContent='';}catch(e){message.textContent=e.message || 'Something went wrong.';}};
 document.querySelector('#adminOpen').onclick=()=>{dialog.showModal();run(show);};
 async function show() {
  body.replaceChildren();
  const session=check(await supabase.auth.getSession())?.session;
  if(!session) return login();
  if(!check(await supabase.rpc('is_site_admin'))) {
   body.append(el('p','This account is not an administrator. Ask the project owner to grant access in Supabase.'));
   return logoutButton();
  }
  const toolbar=el('nav');
  for(const [key,cfg] of Object.entries(configs)) {const b=el('button',cfg.label);b.onclick=()=>run(async()=>{collection=key;await show();});toolbar.append(b);}
  const media=el('button','Image library');media.onclick=()=>run(mediaLibrary);toolbar.append(media);body.append(toolbar);
  logoutButton();
  body.append(el('h3',configs[collection].label));
  const add=el('button','+ Add new');add.onclick=()=>edit();body.append(add);
  const rows=check(await supabase.from('site_content').select('*').eq('collection',collection).order('sort_order'));
  const list=el('div',null,{className:'admin-list'});
  for(const row of rows){
   const item=el('div',null,{className:'admin-row'});
   item.append(el('span',(row.data.name||row.data.title)+(collection==='services'?` · KSh ${row.data.price}`:'')));
   const editBtn=el('button','Edit');editBtn.onclick=()=>edit(row);
   const del=el('button','Delete');del.onclick=()=>{if(confirm('Delete this record? Its image stays in the library until you delete it there.'))run(async()=>{check(await supabase.from('site_content').delete().eq('collection',collection).eq('id',row.id));await show();});};
   item.append(editBtn,del);list.append(item);
  }
  body.append(list,el('p','Changes are saved immediately. Close this panel and reload the page to see the updated public site.'));
 }
 function logoutButton(){const b=el('button','Sign out');b.onclick=()=>run(async()=>{check(await supabase.auth.signOut());await show();});body.append(b);}
 function login(){
  body.append(el('p','Sign in with an administrator email and password. No public signup or automatic admin access.'));
  const form=el('form');const email=el('input',null,{type:'email',placeholder:'Admin email',required:true,autocomplete:'username'});
  const password=el('input',null,{type:'password',placeholder:'Password',required:true,autocomplete:'current-password'});
  form.append(el('label','Email'),email,el('label','Password'),password,el('button','Sign in',{type:'submit'}));
  form.onsubmit=e=>{e.preventDefault();run(async()=>{check(await supabase.auth.signInWithPassword({email:email.value,password:password.value}));await show();});};body.append(form);
 }
 function edit(row){
  body.replaceChildren(el('h3',row?'Edit record':'Add record'));
  const form=el('form');const inputs={};const original=row?.data||{};
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
  if(imageField){
   const upload=el('input',null,{type:'file',accept:'image/jpeg,image/png,image/webp,image/avif'});
   const label=el('label','Upload replacement image (max 5 MB)');label.append(upload);form.append(label);
   upload.onchange=()=>run(async()=>{
    const f=upload.files[0];if(!f)return;
    if(f.size>5242880)throw Error('Image must be at most 5 MB.');
    const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif'}[f.type];if(!ext)throw Error('Choose JPEG, PNG, WebP or AVIF.');
    const path=`uploads/${crypto.randomUUID()}.${ext}`;
    check(await supabase.storage.from(bucket).upload(path,f,{contentType:f.type,upsert:false}));
    imageField.value=supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
   });
   form.append(el('p','Save this record to apply the uploaded image. The old image is kept safely; delete unused images in Image library.'));
  }
  const save=el('button','Save changes',{type:'submit'});const back=el('button','Back',{type:'button'});back.onclick=()=>run(show);form.append(save,back);
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
    check(await supabase.from('site_content').upsert({collection,id,data,sort_order:Number(sort.value),updated_at:new Date().toISOString()}));await show();
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
