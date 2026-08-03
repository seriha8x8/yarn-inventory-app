-- 毛糸管理アプリ: 初期スキーマ
-- Supabase の SQL Editor で実行するか、`supabase db push` で適用してください。

create extension if not exists "pgcrypto";

-- ユーザーのプラン状態。将来の決済導線（Stripe等）を差し込むための拡張ポイント。
create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- 新規ユーザー登録時に user_profiles 行を自動作成する
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 毛糸
create table if not exists public.yarns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text,
  manufacturer text,
  material text,
  thickness text,
  stock_count integer not null default 0,
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists yarns_user_id_idx on public.yarns (user_id);

alter table public.yarns enable row level security;

create policy "Users can manage their own yarns"
  on public.yarns for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 作品メモ
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  made_on date,
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);

alter table public.projects enable row level security;

create policy "Users can manage their own projects"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 毛糸と作品メモの中間テーブル（多対多）
create table if not exists public.project_yarns (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  yarn_id uuid not null references public.yarns (id) on delete cascade,
  used_count integer not null default 0
);

create index if not exists project_yarns_project_id_idx on public.project_yarns (project_id);
create index if not exists project_yarns_yarn_id_idx on public.project_yarns (yarn_id);

alter table public.project_yarns enable row level security;

create policy "Users can manage project_yarns for their own projects"
  on public.project_yarns for all
  using (
    exists (
      select 1 from public.projects
      where public.projects.id = project_yarns.project_id
        and public.projects.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects
      where public.projects.id = project_yarns.project_id
        and public.projects.user_id = auth.uid()
    )
  );

-- Storage: 毛糸・作品メモの写真
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- 写真は `{user_id}/...` のパスで保存する運用とし、本人のフォルダのみ書き込み可能にする
create policy "Users can upload their own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own photos"
  on storage.objects for update
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own photos"
  on storage.objects for delete
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'photos');
