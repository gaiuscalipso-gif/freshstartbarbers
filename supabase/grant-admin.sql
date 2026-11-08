-- FIRST: Supabase Dashboard > Authentication > Users > Add user.
-- Create your administrator with an email and a strong password.
-- THEN replace the email below and run this file in the SQL Editor.
do $$
declare
 admin_email text := 'REPLACE_WITH_YOUR_ADMIN_EMAIL';
 admin_id uuid;
begin
 select id into admin_id from auth.users where lower(email) = lower(admin_email);
 if admin_id is null then
  raise exception 'No Auth user found for %. Create the user first in Authentication > Users.', admin_email;
 end if;
 insert into public.site_admins(user_id) values(admin_id) on conflict do nothing;
end $$;

-- To revoke access later, run:
-- delete from public.site_admins where user_id =
--   (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
