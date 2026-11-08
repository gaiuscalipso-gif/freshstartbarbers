# Enable Fresh Start admin

1. Open https://supabase.com/dashboard/project/nhvokxemyaymmqruzpcp/sql/new
2. Paste and run **setup.sql** in full. It creates content tables, admin authorization, storage policies and seeds the existing services, staff and gallery. Running it again does not overwrite edits.
3. Open https://supabase.com/dashboard/project/nhvokxemyaymmqruzpcp/auth/users and choose **Add user**. Create your admin email and a strong password (confirm the account if needed).
4. In **grant-admin.sql**, replace `REPLACE_WITH_YOUR_ADMIN_EMAIL` with that email. Run it in the SQL Editor. Only someone with privileged SQL access can grant admin rights; a visitor cannot promote themselves.
5. Deploy the updated repository. Click **Admin login** at the bottom of the website and sign in.

## Admin features
- Create, read, update and delete services; change KSh prices, duration, category and weekday restrictions.
- Add/remove barbers, massage therapists and other staff, with roles, specialties and photos. They appear in the existing team/booking selection.
- Create, edit and delete gallery entries. Select a matching category and optional service ID.
- Upload JPG, PNG, WebP or AVIF images up to 5 MB. Save the record after upload to use it. Replacements do not delete the previous image automatically.
- Use Image library to delete unused uploads. Images still referenced by current content are protected in the UI. Original static `/img/` assets remain in the repository, not Supabase storage.
- Close the panel and reload to view saved changes publicly. This is content management; bookings continue to be sent to WhatsApp, not stored in Supabase.

## Security and configuration
Public visitors can read content and images. Only authenticated users listed in `site_admins` can change content or upload/delete images. The admin button is not authorization: row-level security enforces permissions in Supabase. Never expose a service-role/secret key.

The supplied public project URL and publishable key are configured in `src/supabase.js`. Optional deployment overrides: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (rebuild after changes). The publishable key is designed to be public; permissions depend on the SQL policies.

If the database has not been set up or the connection fails, the website displays its original bundled content. An empty configured collection intentionally displays no items. The current image library UI prevents deletion of referenced uploads; SQL-authorized admins still have direct storage access. It does not automatically purge by age or schedule cleanup.

Enable MFA for Supabase project owners and keep administrator passwords unique. Disable public Auth signup if it is not needed (only listed admins get editing privileges regardless).

## Barber-lounge admin upgrade + Google Ads planner

After the original setup, run **admin-upgrade.sql** in the SQL Editor. It adds a separate `ad_campaigns` table; campaign budgets, notes and results are readable/writable only by authenticated site administrators under RLS. Existing content tables and images are unchanged.

The refreshed admin includes a charcoal/forest-and-brass barber theme, mobile layouts, overview counts, quick-add actions, searchable content, duplication, photo previews, unsaved-change warnings, recent content updates and a downloadable JSON content backup (export only, not an automated backup or restore system).

**Google Ads is a manual planner, not an API connection.** Create and edit campaign plans, set a total budget in KSh, enter spend/clicks/conversions, set dates and planner statuses, keep audience/keyword notes, and link to your real Google Ads campaign. The dashboard derives CPC and cost per conversion from the values you enter and flags spend above the planned budget. Export campaign records as CSV. Changing status or deleting a record here never changes delivery or spends money on Google. Campaign schedules are planning dates, not automated launch/pause controls. Results are not synced or verified with Google.

Browser smoke test (mocked Supabase, no live writes): install `@playwright/test` without saving it, run `npx playwright install --with-deps chromium`, start Vite, and run `node tests/admin-smoke.mjs`. Test screenshots default to `/tmp`; set `ADMIN_SCREENSHOT_DIR` to change that directory.
