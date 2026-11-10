-- Run this in Supabase SQL Editor to enable the shared public book.
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'A page without a title',
  body text not null check (char_length(body) between 1 and 5000),
  category text not null default 'Unsent words',
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.entries enable row level security;
-- Anyone can read published pages; anyone can submit an anonymous page.
create policy "Anyone can read published pages"
on public.entries for select to anon, authenticated
using (published = true);
create policy "Anyone can submit a page"
on public.entries for insert to anon, authenticated
with check (
  published = true
  and char_length(body) between 1 and 5000
  and char_length(title) <= 90
);
grant select, insert on public.entries to anon, authenticated;
