import { supabase } from './supabase.js';
import { SERVICES, BARBERS, GALLERY } from './data.js';
// Existing site uses HTML templates: encode all database text before rendering.
const escape = value => typeof value === 'string' ? value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) : Array.isArray(value) ? value.map(escape) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k,v])=>[k,escape(v)])) : value;
const image = url => !url || /^(https:\/\/|\/img\/)/i.test(url) ? url : '';
export async function loadContent() {
 try {
  const { data, error } = await supabase.from('site_content').select('*').order('sort_order').abortSignal(AbortSignal.timeout(8000));
  if(error) throw error;
  const items = name => data.filter(r=>r.collection===name).map(r=>{
   const d = {...r.data};
   if ('img' in d) d.img=image(d.img);
   if ('src' in d) d.src=image(d.src);
   return escape(d);
  });
  SERVICES.splice(0,SERVICES.length,...items('services'));
  BARBERS.splice(1,BARBERS.length-1,...items('staff'));
  GALLERY.splice(0,GALLERY.length,...items('gallery'));
 } catch(error) { console.warn('Live content unavailable; using original menu.', error.message); }
}
