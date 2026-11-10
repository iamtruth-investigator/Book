# All the Things I Never Told You

An anonymous, public, open-book website. Visitors can read published pages and submit their own anonymous words.

## Run locally
1. Install Node.js 18+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key.
4. In Supabase SQL Editor, run `supabase/schema.sql`.
5. Run `npm run dev`.

## Publish
Import this repository into Vercel. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel environment variables and deploy.

## Privacy and moderation
The app does not ask visitors for names, emails, or accounts. Do not collect identifying details in posts. This starter enables public anonymous submissions and public reading. Before a wide public launch, add a moderation queue, report button, rate limiting / CAPTCHA, spam filtering, and a way to remove harmful or identifying content. Never put a Supabase service-role key in frontend environment variables; use only the anon key.
