-- Run after setup.sql. Campaign details are PRIVATE to administrators.
begin;
create table if not exists public.ad_campaigns (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(trim(name)) > 0),
 status text not null default 'draft' check(status in ('draft','planned','active','paused','completed')),
 budget numeric(12,2) not null default 0 check(budget >= 0),
 spend numeric(12,2) not null default 0 check(spend >= 0),
 clicks integer not null default 0 check(clicks >= 0),
 conversions integer not null default 0 check(conversions >= 0),
 starts_on date,
 ends_on date,
 campaign_url text not null default '',
 landing_url text not null default '',
 notes text not null default '',
 updated_at timestamptz not null default now(),
 check(ends_on is null or starts_on is null or ends_on >= starts_on)
);
alter table public.ad_campaigns enable row level security;
revoke all on public.ad_campaigns from anon;
grant select,insert,update,delete on public.ad_campaigns to authenticated;
drop policy if exists "Admins manage ad campaigns" on public.ad_campaigns;
create policy "Admins manage ad campaigns" on public.ad_campaigns for all to authenticated
 using(public.is_site_admin()) with check(public.is_site_admin());
commit;
