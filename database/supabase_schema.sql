-- プレス機管理システム - Supabaseスキーマ
-- マルチテナント対応（組織単位でのアクセス制御）

-- UUID拡張の有効化
create extension if not exists "uuid-ossp";

-- 組織テーブル（将来のマルチテナント対応）
create table if not exists orgs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

-- プロフィールテーブル（ユーザーと組織の関連付け）
-- Clerk認証使用のため、user_idはtext型（auth.usersへの参照なし）
create table if not exists profiles (
  user_id text primary key,  -- Clerk User ID（例: user_XXXXXXXXXX）
  org_id uuid references orgs(id) on delete set null,
  email text,
  full_name text,
  role text default 'viewer',  -- ロール: admin または viewer
  created_at timestamptz default now()
);

-- プレス機情報テーブル
create table if not exists press_machines (
  id bigserial primary key,                          -- 旧: db_id
  org_id uuid not null references orgs(id) on delete restrict,
  machine_number text not null,                      -- 機械番号（例: "100"）
  equipment_number text,                             -- 設備番号（例: "25"）
  manufacturer text,                                 -- メーカー
  model_type text,                                   -- 型式
  serial_number text,                                -- シリアル番号
  machine_type text not null default '圧造',         -- 種別（圧造/汎用）
  production_group int not null default 1,          -- 生産グループ（1,2,3）
  tonnage int,                                       -- トン数
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- ユニーク制約（同一組織内で機械番号は重複不可）
  unique(org_id, machine_number)
);

-- メンテナンス記録テーブル
create table if not exists maintenance_records (
  id bigserial primary key,                          -- 旧: maintenance_id
  org_id uuid not null references orgs(id) on delete restrict,
  press_id bigint not null references press_machines(id) on delete cascade, -- 旧: db_id
  maintenance_datetime timestamptz not null,         -- メンテナンス実施日時
  overall_judgment text not null default '良好',     -- 総合判定（良好/要注意/要修理/異常）
  clutch_valve_replacement text not null default '未実施', -- クラッチ弁交換（実施/未実施/不要）
  brake_valve_replacement text not null default '未実施',  -- ブレーキ弁交換（実施/未実施/不要）
  remarks text,                                      -- 備考
  created_at timestamptz default now()
);

-- 更新時刻自動更新トリガー
create or replace function set_updated_at() 
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- プレス機テーブル用トリガー
drop trigger if exists trg_press_machines_updated on press_machines;
create trigger trg_press_machines_updated 
  before update on press_machines
  for each row execute procedure set_updated_at();

-- インデックスの作成（パフォーマンス向上）
create index if not exists idx_press_machines_org_id on press_machines(org_id);
create index if not exists idx_press_machines_machine_number on press_machines(machine_number);
create index if not exists idx_maintenance_records_org_id on maintenance_records(org_id);
create index if not exists idx_maintenance_records_press_id on maintenance_records(press_id);
create index if not exists idx_maintenance_records_datetime on maintenance_records(maintenance_datetime desc);

-- Row Level Security (RLS) の有効化
alter table orgs enable row level security;
alter table profiles enable row level security;
alter table press_machines enable row level security;
alter table maintenance_records enable row level security;

-- RLSポリシー

-- プロフィール：自分のプロフィールのみアクセス可能
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = user_id);

create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = user_id);

-- プレス機：同一組織のデータのみアクセス可能
create policy "press_machines_select" on press_machines
  for select using (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() and p.org_id = press_machines.org_id
    )
  );

create policy "press_machines_insert" on press_machines
  for insert with check (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() and p.org_id = org_id
    )
  );

create policy "press_machines_update" on press_machines
  for update using (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() and p.org_id = press_machines.org_id
    )
  );

create policy "press_machines_delete" on press_machines
  for delete using (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() and p.org_id = press_machines.org_id
    )
  );

-- メンテナンス記録：同一組織のデータのみアクセス可能
create policy "maintenance_records_select" on maintenance_records
  for select using (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() and p.org_id = maintenance_records.org_id
    )
  );

create policy "maintenance_records_insert" on maintenance_records
  for insert with check (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() and p.org_id = org_id
    )
  );

create policy "maintenance_records_update" on maintenance_records
  for update using (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() and p.org_id = maintenance_records.org_id
    )
  );

create policy "maintenance_records_delete" on maintenance_records
  for delete using (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() and p.org_id = maintenance_records.org_id
    )
  );

-- ユーザー登録時に自動でプロフィールを作成する関数
create or replace function handle_new_user() 
returns trigger as $$
begin
  insert into profiles (user_id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- ユーザー登録時のトリガー
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- サンプルデータの挿入
-- デフォルト組織を作成
insert into orgs (id, name) 
values ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'デフォルト組織')
on conflict (id) do nothing;

-- 権限確認用のビュー（開発用）
create or replace view user_org_access as
select 
  p.user_id,
  p.email,
  p.full_name,
  o.id as org_id,
  o.name as org_name
from profiles p
left join orgs o on p.org_id = o.id;

comment on table orgs is '組織テーブル（マルチテナント対応）';
comment on table profiles is 'ユーザープロフィール（組織との関連付け）';
comment on table press_machines is 'プレス機マスタ';
comment on table maintenance_records is 'メンテナンス履歴';
comment on view user_org_access is 'ユーザーの組織アクセス権確認用ビュー';