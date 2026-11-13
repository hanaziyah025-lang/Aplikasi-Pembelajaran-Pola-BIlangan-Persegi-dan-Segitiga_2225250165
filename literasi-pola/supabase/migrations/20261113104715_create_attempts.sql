create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kode text not null check (kode ~ '^[A-Za-z ]{2,20}$'),
  soal_id text not null,
  skor integer not null check (skor between 1 and 3),
  hint_dipakai integer not null check (hint_dipakai between 0 and 3),
  created_at timestamptz not null default now()
);

create index if not exists attempts_user_kode_idx
  on public.attempts (user_id, kode);

alter table public.attempts enable row level security;

revoke all on public.attempts from anon, authenticated;
grant select, insert on public.attempts to authenticated;

create policy "Users can read their own attempts"
  on public.attempts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own attempts"
  on public.attempts
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
