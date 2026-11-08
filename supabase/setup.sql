-- Fresh Start: run this entire file in the Supabase SQL Editor.
-- Rerunnable. Never put a service_role key in the website.
begin;
create table if not exists public.site_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.site_admins enable row level security;
revoke all on public.site_admins from anon, authenticated;
create or replace function public.is_site_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.site_admins where user_id = auth.uid()); $$;
revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to anon, authenticated;

create table if not exists public.site_content (
 collection text not null check (collection in ('services','staff','gallery')),
 id text not null,
 data jsonb not null check(jsonb_typeof(data) = 'object'),
 sort_order integer not null default 0,
 updated_at timestamptz not null default now(),
 primary key(collection,id),
 constraint valid_content check (
  (collection = 'services' and jsonb_typeof(data->'name') = 'string' and length(data->>'name') > 0
    and jsonb_typeof(data->'price') = 'number' and (data->>'price')::numeric >= 0
    and jsonb_typeof(data->'mins') = 'number' and (data->>'mins')::numeric > 0
    and data->>'cat' in ('signature','grooming','colour','face','hands','body','vip'))
  or (collection = 'staff' and jsonb_typeof(data->'name') = 'string' and length(data->>'name') > 0
    and jsonb_typeof(data->'specialties') = 'array')
  or (collection = 'gallery' and jsonb_typeof(data->'title') = 'string' and length(data->>'title') > 0
    and jsonb_typeof(data->'src') = 'string' and length(data->>'src') > 0
    and data->>'cat' in ('cuts','beard','face','body','lounge'))
 )
);
-- CHECK must reject NULL as well as false for required JSON fields.
alter table public.site_content drop constraint if exists required_content_fields;
alter table public.site_content add constraint required_content_fields check (
 case collection
 when 'services' then data ?& array['name','price','mins','cat','desc','tags','id']
 when 'staff' then data ?& array['name','role','specialties','note','initials','id']
 when 'gallery' then data ?& array['title','src','cat','catLabel','detail']
 else false end
);
alter table public.site_content enable row level security;
drop policy if exists "Public reads content" on public.site_content;
create policy "Public reads content" on public.site_content for select to anon, authenticated using (true);
drop policy if exists "Admins manage content" on public.site_content;
create policy "Admins manage content" on public.site_content for all to authenticated
 using (public.is_site_admin()) with check (public.is_site_admin());
grant select on public.site_content to anon, authenticated;
grant insert,update,delete on public.site_content to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('site-images','site-images',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Public views site images" on storage.objects;
create policy "Public views site images" on storage.objects for select to anon,authenticated using(bucket_id='site-images');
drop policy if exists "Admins upload site images" on storage.objects;
create policy "Admins upload site images" on storage.objects for insert to authenticated with check(bucket_id='site-images' and public.is_site_admin());
drop policy if exists "Admins update site images" on storage.objects;
create policy "Admins update site images" on storage.objects for update to authenticated using(bucket_id='site-images' and public.is_site_admin()) with check(bucket_id='site-images' and public.is_site_admin());
drop policy if exists "Admins delete site images" on storage.objects;
create policy "Admins delete site images" on storage.objects for delete to authenticated using(bucket_id='site-images' and public.is_site_admin());
insert into public.site_content(collection,id,data,sort_order) values ('services','gentleman','{"id":"gentleman","cat":"signature","name":"Gentleman''s Cut (Normal Shave)","mins":30,"price":1000,"desc":"Classic gentleman haircut with clean razor perimeter shave.","tags":"gentleman classic shave razor normal"}'::jsonb,0) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','junior','{"id":"junior","cat":"signature","name":"Young Gentleman''s Cut Under 10","mins":30,"price":1000,"desc":"Gentle, patient haircut crafted for junior gentlemen under 10 years.","tags":"kids children junior boy under 10"}'::jsonb,1) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','bespoke','{"id":"bespoke","cat":"signature","name":"Bespoke Haircut","mins":40,"price":1500,"desc":"Precision tailored haircut, scalp wash, hot towel finish & custom styling.","tags":"cut fade haircut wash style signature"}'::jsonb,2) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','caucasian','{"id":"caucasian","cat":"signature","name":"Caucasian Haircut","mins":45,"price":2500,"desc":"Specialized scissor-work, fine hair taper, texturing & refined styling.","tags":"scissor cut fine hair taper texture caucasian"}'::jsonb,3) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','grey','{"id":"grey","cat":"signature","name":"Haircut + Grey Reduction/Dye","mins":60,"price":2500,"desc":"Precision cut with subtle natural grey blending or full dye coverage.","tags":"grey dye colour color blend reduction"}'::jsonb,4) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','student','{"id":"student","cat":"signature","name":"The Mbogi Experience — 3 Student Haircuts","mins":90,"price":2500,"days":[1,2,3],"desc":"Three student haircuts for the crew — Monday to Wednesday only. Student ID optional; bring the mbogi, we handle the fresh.","tags":"student mbogi shave na mbogi group offer campus monday tuesday wednesday","badge":"Mon–Wed"}'::jsonb,5) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','group3','{"id":"group3","cat":"signature","name":"3-Person Haircut Package","mins":90,"price":3000,"desc":"Three haircuts in one relaxed 90-minute group session — brothers, friends or the whole crew.","tags":"group three friends brothers package cut"}'::jsonb,6) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','freefriend','{"id":"freefriend","cat":"signature","name":"Bring 2 Friends — Free Classic Shave","mins":90,"price":3000,"desc":"Referral treat: two friends enjoy Bespoke Haircuts (KSh 1,500 each) and the guest who brings them receives a complimentary Classic Shave in the same 90-minute visit.","tags":"referral offer free classic shave friends group promo","badge":"Referral"}'::jsonb,7) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','hairline','{"id":"hairline","cat":"grooming","name":"Hairline Shape Up","mins":20,"price":500,"desc":"Crisp razor contouring, temple line definition & neck cleanup.","tags":"line up shape hairline edge neck razor"}'::jsonb,8) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','beard','{"id":"beard","cat":"grooming","name":"Beard Trim","mins":20,"price":500,"desc":"Detailed beard sculpture, edge line up, conditioning oil & soothing balm.","tags":"beard sculpt trim oil balm edge"}'::jsonb,9) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','enhancement','{"id":"enhancement","cat":"grooming","name":"Enhancement/Dye Without Shave","mins":20,"price":1000,"desc":"Semi-permanent hairline or beard fiber dye enhancement without a haircut.","tags":"dye enhancement fiber beard hairline colour"}'::jsonb,10) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','texture','{"id":"texture","cat":"colour","name":"Texturing + Shave","mins":50,"price":2500,"desc":"Curl definition, wave texturing, or relaxing paired with signature shave.","tags":"texture waves curls relax perm shave"}'::jsonb,11) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','halfcolour','{"id":"halfcolour","cat":"colour","name":"Half Color + Shave","mins":60,"price":3500,"desc":"Creative partial tone dye or bleach artistry paired with a full shave.","tags":"colour color bleach dye shave half"}'::jsonb,12) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','fullcolour','{"id":"fullcolour","cat":"colour","name":"Full Color + Shave","mins":90,"price":5000,"desc":"Complete head color transformation paired with bespoke shave & finish.","tags":"colour color dye bleach full shave transformation"}'::jsonb,13) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','scrub','{"id":"scrub","cat":"face","name":"Face Scrub","mins":20,"price":1000,"desc":"Deep exfoliating scrub to unclog pores, remove dead cells & refresh skin.","tags":"scrub exfoliate skin face pores"}'::jsonb,14) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','halffacial','{"id":"halffacial","cat":"face","name":"Half Facial","mins":30,"price":2000,"desc":"Targeted express cleansing, warm ozone steam & hydration mask.","tags":"facial steam mask hydration express ozone"}'::jsonb,15) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','fullfacial','{"id":"fullfacial","cat":"face","name":"Full Facial","mins":45,"price":3000,"desc":"Comprehensive facial ritual with deep extraction, botanical mask & moisturizer.","tags":"facial extraction botanical mask moisturizer"}'::jsonb,16) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','manicure','{"id":"manicure","cat":"hands","name":"Manicure","mins":25,"price":1000,"desc":"Gentle hand exfoliation, nail trimming, cuticle grooming & buffing.","tags":"manicure hands nails cuticle buff"}'::jsonb,17) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','pedicure','{"id":"pedicure","cat":"hands","name":"Pedicure","mins":40,"price":2000,"desc":"Relaxing foot soak, scrub, callus treatment, nail shaping & cuticle care.","tags":"pedicure feet nails callus soak"}'::jsonb,18) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','halfmassage','{"id":"halfmassage","cat":"body","name":"Half Massage","mins":30,"price":2500,"desc":"Focused tension release for neck, shoulders, and upper back.","tags":"massage neck shoulders back tension"}'::jsonb,19) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','fullmassage','{"id":"fullmassage","cat":"body","name":"Full Body Massage","mins":60,"price":4000,"desc":"Full therapeutic relaxation massage with warm essential botanical oils.","tags":"massage full body oils relaxation therapy"}'::jsonb,20) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','vip1','{"id":"vip1","cat":"vip","name":"VIP Experience I: The Executive Grooming Ritual","mins":90,"price":7000,"vip":true,"desc":"Bespoke Shave + Pedicure + Manicure + Full Facial.","tags":"vip executive shave pedicure manicure facial"}'::jsonb,21) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','vip3','{"id":"vip3","cat":"vip","name":"VIP Experience III: The Renewal Ritual","mins":120,"price":10000,"vip":true,"desc":"Bespoke Shave + Manicure + Pedicure + Full Facial + Half Massage.","tags":"vip renewal ritual facial massage shave"}'::jsonb,22) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','vip2','{"id":"vip2","cat":"vip","name":"VIP Experience II: The Complete Gentleman","mins":120,"price":10500,"vip":true,"desc":"Bespoke Shave + Pedicure + Manicure + Full Facial + Full Body Massage.","tags":"vip complete gentleman massage facial shave"}'::jsonb,23) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('services','vip4','{"id":"vip4","cat":"vip","name":"VIP Experience IV: The Ultimate Fresh Start","mins":150,"price":13000,"vip":true,"desc":"Bespoke Shave + Pedicure + Manicure + Full Facial + Half Massage + Full Body Massage.","tags":"vip ultimate fresh start massage facial shave"}'::jsonb,24) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('staff','starkid','{"id":"starkid","name":"Starkid Bright","role":"Senior Barber","img":"/img/barber-starkid.jpg","initials":"SB","specialties":["Bespoke cuts","Line-ups","Beard sculpt"],"note":"Sharp, architectural fades finished with a razor line-up."}'::jsonb,0) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('staff','cossy','{"id":"cossy","name":"Cossy Romeo","role":"Grooming Specialist","img":"/img/barber-cossy.jpg","initials":"CR","specialties":["Textured afro","Hot towel shave","Styling"],"note":"Texture, movement and a shave that smells like the lounge."}'::jsonb,1) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('staff','alphie','{"id":"alphie","name":"Alphie The Barber","role":"Razor & Shave Artisan","img":"/img/barber-alphie.jpg","initials":"AB","specialties":["Straight razor","Clean shave","Skin fades"],"note":"The straight razor is the instrument. Patience is the method."}'::jsonb,2) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('staff','mike','{"id":"mike","name":"Mike will fade it","role":"Fade Specialist","img":"/img/barber-mike.jpg","initials":"MF","specialties":["Skin fades","Curl sponge","Kids cuts"],"note":"If it can be blended, it can be faded. Bring a reference."}'::jsonb,3) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('gallery','gallery-1','{"src":"/img/fade.jpg","cat":"cuts","catLabel":"Cuts & Fades","title":"Precision Skin Fade & Line-Up","detail":"Clipper-blended fade · razor temple line · 40 min","serviceId":"bespoke"}'::jsonb,0) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('gallery','gallery-2','{"src":"/img/vip.jpg","cat":"beard","catLabel":"Beard & Shave","title":"The Hot-Towel Ritual","detail":"Straight razor · hot towel · VIP Collection finish","serviceId":"vip1"}'::jsonb,1) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('gallery','gallery-3','{"src":"/img/beard.jpg","cat":"beard","catLabel":"Beard & Shave","title":"Beard Sculpture","detail":"Detailed sculpt · edge line-up · conditioning oil & balm","serviceId":"beard"}'::jsonb,2) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('gallery','gallery-4','{"src":"/img/facial.jpg","cat":"face","catLabel":"Face & Skin","title":"Full Facial Ritual","detail":"Deep cleansing · warm ozone steam · botanical mask","serviceId":"fullfacial"}'::jsonb,3) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('gallery','gallery-5','{"src":"/img/massage.jpg","cat":"body","catLabel":"Body & Hands","title":"Full Body Massage","detail":"Therapeutic relaxation · warm botanical oils · 60 min","serviceId":"fullmassage"}'::jsonb,4) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('gallery','gallery-6','{"src":"/img/hands.jpg","cat":"body","catLabel":"Body & Hands","title":"Manicure & Hand Care","detail":"Exfoliation · cuticle grooming · buff at the marble counter","serviceId":"manicure"}'::jsonb,5) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('gallery','gallery-7','{"src":"/img/hero.jpg","cat":"cuts","catLabel":"Cuts & Fades","title":"The Bespoke Chair","detail":"Tailored cut · scalp wash · custom styling","serviceId":"bespoke"}'::jsonb,6) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('gallery','gallery-8','{"src":"/img/lounge.jpg","cat":"lounge","catLabel":"The Lounge","title":"Coffee, Always On Us","detail":"Coffee · tea · light bites with every service","serviceId":null}'::jsonb,7) on conflict(collection,id) do nothing;
insert into public.site_content(collection,id,data,sort_order) values ('gallery','gallery-9','{"src":"/img/barber-starkid.jpg","cat":"lounge","catLabel":"The Lounge","title":"Starkid Bright — Senior Barber","detail":"Senior chair · Suite K-5, 4th floor","serviceId":null}'::jsonb,8) on conflict(collection,id) do nothing;
commit;
